import { randomBytes } from 'node:crypto';
import { send, govde, Hata } from '../lib/http.mjs';
import { ANKET, KANVAS } from '../icerik/modul.mjs';
import { guncel, aciklamaCevirisi } from '../lib/icerik.mjs';
import { uyeyeGonder } from '../lib/posta.mjs';

/**
 * Öğrenme uçları. Kurallar SUNUCUDA:
 * - Adım tamamlama: metin/örnek/kartlar → "devam" ile; video → en az %90 izlendi ve ara
 *   soruların hepsi doğru; sına → soruların hepsi doğru cevaplandı (tekrar denenebilir);
 *   etkinlik → deftere (Fikrim) boş olmayan bir cevap yazıldı.
 * - Bölüm tamam: bütün adımları tamam. `ilerleme.tamam_at` bölüm düzeyinde tutulur
 *   (göstergeler ve grup ekranı onu okur) ve bir kez yazılınca silinmez.
 * - Son test altı bölüm bitince; anket test geçilince; sertifika üçü birden tamamsa.
 */
const VIDEO_ORAN = 0.9;

const json = (v, varsayilan) => { try { return JSON.parse(v); } catch { return varsayilan; } };

function adimTamamMi(a, veri) {
  if (a.tur === 'video') {
    return veri.sure > 0 && veri.sn >= veri.sure * VIDEO_ORAN && a.sorular.every((_, i) => (veri.cevaplar || []).includes(i));
  }
  if (a.tur === 'sina') return a.sorular.every((_, i) => (veri.cevaplar || []).includes(i));
  if (a.tur === 'etkinlik') return !!veri.yazildi;
  return !!veri.goruldu;
}

export async function durumHesapla(db, uyeId) {
  const satirlar = await db.all('SELECT bolum, tamam_at FROM ilerleme WHERE uye_id = ?', [uyeId]);
  const s = new Map(satirlar.map(r => [r.bolum, r]));
  const adimSatir = await db.all('SELECT bolum, adim, veri, tamam_at FROM adim_ilerleme WHERE uye_id = ?', [uyeId]);
  const A = new Map(adimSatir.map(r => [r.bolum + '/' + r.adim, r]));
  const { bolumler: B, test: T, gecme } = guncel();
  const bolumler = B.map(b => {
    const adimlar = Object.fromEntries(b.adimlar.map(a => {
      const r = A.get(b.id + '/' + a.id);
      const v = json(r?.veri, {});
      return [a.id, { tamam: !!r?.tamam_at, ...(a.tur === 'video' ? { sn: v.sn || 0, sure: v.sure || 0, cevaplar: v.cevaplar || [] } : {}),
        ...(a.tur === 'sina' ? { cevaplar: v.cevaplar || [] } : {}) }];
    }));
    const biten = Object.values(adimlar).filter(x => x.tamam).length;
    return { id: b.id, tamam: !!s.get(b.id)?.tamam_at, biten, toplam: b.adimlar.length, adimlar };
  });
  const enIyi = await db.get('SELECT MAX(puan) AS puan, MAX(gecti) AS gecti, CAST(count(*) AS INTEGER) AS sayi FROM denemeler WHERE uye_id = ?', [uyeId]);
  const uye = await db.get('SELECT anket_at FROM uyeler WHERE id = ?', [uyeId]);
  const sert = await db.get('SELECT kod, zaman FROM sertifikalar WHERE uye_id = ?', [uyeId]);
  const kanvas = await db.get(`SELECT CAST(count(*) AS INTEGER) AS n FROM notlar WHERE uye_id = ? AND anahtar LIKE 'kanva:%'`, [uyeId]);
  const grupta = await db.get('SELECT 1 AS x FROM grup_uyeleri WHERE uye_id = ?', [uyeId]);

  /* Rozetler: ilerlemeden TÜRETİLİR (ayrı kayıt yok); içerik değişse de tutarlı kalır. */
  const turTamam = tur => {
    const hepsi = B.flatMap(b => b.adimlar.filter(a => a.tur === tur).map(a => bolumler.find(x => x.id === b.id).adimlar[a.id].tamam));
    return hepsi.length > 0 && hepsi.every(Boolean);
  };
  const rozetler = [
    bolumler.some(b => b.biten > 0) && 'ilk-adim',
    ...bolumler.filter(b => b.tamam).map(b => 'bolum:' + b.id),
    turTamam('video') && 'izleyici',
    turTamam('sina') && 'bilgi-avcisi',
    turTamam('etkinlik') && 'dusunur',
    kanvas?.n >= KANVAS.length && 'fikir-sahibi',
    enIyi?.puan === T.length && 'kusursuz',
    !!grupta && 'takim',
    !!sert && 'sertifikali',
  ].filter(Boolean);

  return {
    bolumler,
    bolumlerTamam: bolumler.every(b => b.tamam),
    test: { enIyi: enIyi?.puan ?? null, gecti: !!enIyi?.gecti, deneme: enIyi?.sayi || 0, toplam: T.length, gecme },
    anket: !!uye?.anket_at,
    sertifika: sert ? { kod: sert.kod, zaman: sert.zaman } : null,
    rozetler,
  };
}

export function ogrenmeRoutes({ db }) {
  const yoksaEkle = db.kind === 'postgres' ? 'ON CONFLICT DO NOTHING' : '';
  const ekle = db.kind === 'postgres' ? 'INSERT INTO' : 'INSERT OR IGNORE INTO';

  /* Adımın verisini okur, değiştirir, tamamlanmayı denetler; bölüm bittiyse onu da işaretler. */
  async function adimGuncelle(uyeId, b, a, degistir) {
    await db.run(`${ekle} adim_ilerleme (uye_id, bolum, adim) VALUES (?, ?, ?) ${yoksaEkle}`, [uyeId, b.id, a.id]);
    const r = await db.get('SELECT veri, tamam_at FROM adim_ilerleme WHERE uye_id = ? AND bolum = ? AND adim = ?', [uyeId, b.id, a.id]);
    const veri = degistir(json(r.veri, {}));
    const tamam = r.tamam_at || (adimTamamMi(a, veri) ? Date.now() : null);
    await db.run('UPDATE adim_ilerleme SET veri = ?, tamam_at = ? WHERE uye_id = ? AND bolum = ? AND adim = ?',
      [JSON.stringify(veri), tamam, uyeId, b.id, a.id]);
    if (tamam) {
      const say = await db.get(`SELECT CAST(count(*) AS INTEGER) AS n FROM adim_ilerleme WHERE uye_id = ? AND bolum = ? AND tamam_at IS NOT NULL
        AND adim IN (${b.adimlar.map(() => '?').join(',')})`, [uyeId, b.id, ...b.adimlar.map(x => x.id)]);
      if (say.n === b.adimlar.length) {
        await db.run(`${ekle} ilerleme (uye_id, bolum) VALUES (?, ?) ${yoksaEkle}`, [uyeId, b.id]);
        await db.run('UPDATE ilerleme SET tamam_at = ? WHERE uye_id = ? AND bolum = ? AND tamam_at IS NULL', [Date.now(), uyeId, b.id]);
      }
    }
  }
  const adimBul = (bId, aId) => {
    const b = guncel().bolumler.find(x => x.id === bId);
    const a = b?.adimlar.find(x => x.id === aId);
    if (!a) throw new Hata('bulunamadi', 404);
    return { b, a };
  };

  return async function (req, res, yol, uye) {
    if (!yol.startsWith('/api/ogren/')) return;
    if (!uye) throw new Hata('oturum', 401);

    if (yol === '/api/ogren/durum' && req.method === 'GET') {
      return send(res, 200, await durumHesapla(db, uye.id));
    }

    /* Proje fikri defteri: etkinliklere ve kanvasa yazılanlar (yalnızca kişinin kendisi okur).
       Anahtarlar: 'adim:<bölüm>:<adım>' (etkinlik adımı) ve 'kanva:<alan>'. */
    if (yol === '/api/ogren/notlar' && req.method === 'GET') {
      const satirlar = await db.all('SELECT anahtar, metin, guncelleme FROM notlar WHERE uye_id = ?', [uye.id]);
      return send(res, 200, Object.fromEntries(satirlar.map(r => [r.anahtar, { metin: r.metin, guncelleme: r.guncelleme }])));
    }
    if (yol === '/api/ogren/not' && req.method === 'POST') {
      const g = await govde(req, 16000);
      const anahtar = String(g.anahtar || '');
      const ak = anahtar.match(/^adim:([a-z0-9-]+):([a-z0-9-]+)$/);
      const etkinlik = ak && guncel().bolumler.find(b => b.id === ak[1])?.adimlar.find(a => a.id === ak[2] && a.tur === 'etkinlik');
      const gecerli = etkinlik || (anahtar.startsWith('kanva:') && KANVAS.some(k => 'kanva:' + k.id === anahtar));
      if (!gecerli) throw new Hata('istek_gecersiz');
      const metin = String(g.metin ?? '').slice(0, 3000);
      if (etkinlik && metin.trim()) {
        const { b, a } = adimBul(ak[1], ak[2]);
        await adimGuncelle(uye.id, b, a, v => ({ ...v, yazildi: true }));
      }
      if (!metin.trim()) {
        await db.run('DELETE FROM notlar WHERE uye_id = ? AND anahtar = ?', [uye.id, anahtar]);
      } else if (await db.get('SELECT 1 AS x FROM notlar WHERE uye_id = ? AND anahtar = ?', [uye.id, anahtar])) {
        await db.run('UPDATE notlar SET metin = ?, guncelleme = ? WHERE uye_id = ? AND anahtar = ?', [metin, Date.now(), uye.id, anahtar]);
      } else {
        await db.run('INSERT INTO notlar (uye_id, anahtar, metin, guncelleme) VALUES (?, ?, ?, ?)', [uye.id, anahtar, metin, Date.now()]);
      }
      return send(res, 200, { ok: true, durum: etkinlik && metin.trim() ? await durumHesapla(db, uye.id) : undefined });
    }

    /* /api/ogren/adim/<bölüm>/<adım>/(goruldu|video|soru) */
    const m = yol.match(/^\/api\/ogren\/adim\/([a-z0-9-]+)\/([a-z0-9-]+)\/(goruldu|video|soru)$/);
    if (m && req.method === 'POST') {
      const { b, a } = adimBul(m[1], m[2]);
      const g = await govde(req);
      let cevap = { ok: true };

      if (m[3] === 'goruldu') {
        if (!['metin', 'ornek', 'kartlar'].includes(a.tur)) throw new Hata('istek_gecersiz');
        await adimGuncelle(uye.id, b, a, v => ({ ...v, goruldu: true }));
      } else if (m[3] === 'video') {
        if (a.tur !== 'video') throw new Hata('istek_gecersiz');
        const sure = Math.round(Number(g.sure)), sn = Math.round(Number(g.sn));
        if (!(sure > 0 && sure < 6 * 3600) || !(sn >= 0)) throw new Hata('istek_gecersiz');
        /* İzlenen süre yalnızca artar ve süreyi aşamaz. */
        await adimGuncelle(uye.id, b, a, v => ({ ...v, sure, sn: Math.min(sure, Math.max(v.sn || 0, sn)) }));
      } else {
        if (!['video', 'sina'].includes(a.tur)) throw new Hata('istek_gecersiz');
        const i = Number(g.soru), sec = Number(g.cevap);
        const q = a.sorular[i];
        if (!q || !Number.isInteger(sec)) throw new Hata('istek_gecersiz');
        const dogru = sec === q.dogru;
        if (dogru) await adimGuncelle(uye.id, b, a, v => ({ ...v, cevaplar: [...new Set([...(v.cevaplar || []), i])].sort() }));
        /* Açıklama cevaptan SONRA gönderilir (önceden gönderilse doğru cevabı ele verirdi). */
        const cev = aciklamaCevirisi(uye.dil, b.id, a.id, i);
        cevap = { dogru, aciklama: q.aciklama ? { ...q.aciklama, ...(cev ? { [uye.dil]: cev } : {}) } : null };
      }
      return send(res, 200, { ...cevap, durum: await durumHesapla(db, uye.id) });
    }

    if (yol === '/api/ogren/test' && req.method === 'POST') {
      const d = await durumHesapla(db, uye.id);
      if (!d.bolumlerTamam) throw new Hata('kilitli', 403);
      const { cevaplar } = await govde(req);
      const { test: TEST, gecme: GECME } = guncel();
      if (!Array.isArray(cevaplar) || cevaplar.length !== TEST.length) throw new Hata('istek_gecersiz');
      const sonuc = TEST.map((q, i) => cevaplar[i] === q.dogru);
      const puan = sonuc.filter(Boolean).length;
      const gecti = puan >= GECME;
      await db.insert('INSERT INTO denemeler (uye_id, puan, toplam, gecti, zaman) VALUES (?, ?, ?, ?, ?)',
        [uye.id, puan, TEST.length, gecti ? 1 : 0, Date.now()]);
      return send(res, 200, { puan, toplam: TEST.length, gecti, sonuc, durum: await durumHesapla(db, uye.id) });
    }

    /* İsimsiz anket: cevap satırı kişiye bağlanmaz; kişide yalnızca "doldurdu" işareti kalır. */
    if (yol === '/api/ogren/anket' && req.method === 'POST') {
      const d = await durumHesapla(db, uye.id);
      if (!d.test.gecti) throw new Hata('kilitli', 403);
      if (d.anket) throw new Hata('anket_var', 409);
      const g = await govde(req);
      const puanlar = {};
      for (const m of ANKET) {
        const v = Number(g.puanlar?.[m.id]);
        if (!Number.isInteger(v) || v < 1 || v > 5) throw new Hata('anket_eksik');
        puanlar[m.id] = v;
      }
      const yorum = String(g.yorum || '').trim().slice(0, 2000);
      await db.insert('INSERT INTO anket (dil, ulke, cevaplar, zaman) VALUES (?, ?, ?, ?)',
        [uye.dil, uye.ulke, JSON.stringify({ puanlar, yorum }), Date.now()]);
      await db.run('UPDATE uyeler SET anket_at = ? WHERE id = ?', [Date.now(), uye.id]);
      return send(res, 200, { ok: true, durum: await durumHesapla(db, uye.id) });
    }

    if (yol === '/api/ogren/sertifika' && req.method === 'POST') {
      const d = await durumHesapla(db, uye.id);
      if (d.sertifika) return send(res, 200, { ok: true, durum: d });
      if (!d.bolumlerTamam || !d.test.gecti || !d.anket) throw new Hata('kilitli', 403);
      /* Okunaklı doğrulama kodu: karışan harfler (0/O, 1/I/L) yok. */
      const ab = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      const kod = 'EYP-' + [...randomBytes(8)].map(x => ab[x % ab.length]).join('').replace(/(.{4})(.{4})/, '$1-$2');
      await db.insert('INSERT INTO sertifikalar (uye_id, kod, ad, zaman) VALUES (?, ?, ?, ?)', [uye.id, kod, uye.ad, Date.now()]);
      /* "Sertifikan hazır" e-postası (bildirimleri açıksa). Gönderilemese de sertifika düzenlenmiştir. */
      await uyeyeGonder(db, uye, 'sertifika', { kod }).catch(e => console.error('Sertifika e-postası:', e.message));
      return send(res, 200, { ok: true, durum: await durumHesapla(db, uye.id) });
    }
  };
}

/* Herkese açık doğrulama: yalnızca ad ve tarih döner. */
export function dogrulaRoutes({ db }) {
  return async function (req, res, yol) {
    const m = yol.match(/^\/api\/dogrula\/(EYP-[A-Z0-9]{4}-[A-Z0-9]{4})$/);
    if (!m || req.method !== 'GET') return;
    const s = await db.get('SELECT ad, zaman FROM sertifikalar WHERE kod = ?', [m[1]]);
    return send(res, 200, s ? { gecerli: true, ad: s.ad, zaman: s.zaman } : { gecerli: false });
  };
}
