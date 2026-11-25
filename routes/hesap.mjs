import { randomBytes, timingSafeEqual } from 'node:crypto';
import { imza, siteAdresi, uyeyeGonder } from '../lib/posta.mjs';
import { DILLER } from '../lib/diller.mjs';
import { send, govde, ozet, oturumCerezi, oturumJetonu, istemciAdresi, cokDeneme, denemeSifirla, Hata } from '../lib/http.mjs';
import { kayitDenetle, parolaOzeti, parolaDogru } from '../lib/uye.mjs';
import { OTURUM_GUN, MIN_PAROLA } from '../lib/ayar.mjs';

/**
 * Hesap uçları: kayıt, giriş, çıkış, ben, dil, hesabı silme.
 * Kayıt herkese açıktır (eğitim ücretsiz ve açık erişimli — başvuru taahhüdü).
 */
const SAHTE_OZET = parolaOzeti(randomBytes(16).toString('hex'));

export function hesapRoutes({ db }) {
  const sonNabiz = new Map();
  async function oturumAc(res, uyeId) {
    const token = randomBytes(32).toString('hex');
    await db.run('INSERT INTO oturumlar (token, uye_id, bitis) VALUES (?, ?, ?)',
      [ozet(token), uyeId, Date.now() + OTURUM_GUN * 86400000]);
    await db.run('UPDATE uyeler SET son_giris = ?, giris_sayisi = giris_sayisi + 1 WHERE id = ?', [Date.now(), uyeId]);
    res.setHeader('Set-Cookie', oturumCerezi(token));
  }

  return async function (req, res, yol, uye) {
    if (yol === '/api/kayit' && req.method === 'POST') {
      const ip = istemciAdresi(req);
      /* Aynı adresten 15 dk'da en çok 60 kayıt: bir sınıf (pilot: 24 kişi) aynı ağdan birlikte kaydolabilsin. */
      if (cokDeneme([['kayit:' + ip, Number(process.env.KAYIT_SINIR || 60)]])) throw new Hata('cok_deneme', 429);
      const k = kayitDenetle(await govde(req));
      if (await db.get('SELECT id FROM uyeler WHERE eposta = ?', [k.eposta])) throw new Hata('eposta_var', 409);
      const id = await db.insert(
        `INSERT INTO uyeler (eposta, parola, ad, ulke, dogum_yili, rol, az_firsat, veli_onayi, dil, olusturma)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [k.eposta, parolaOzeti(k.parola), k.ad, k.ulke, k.dogumYili, k.rol, k.azFirsat, k.veliOnayi, k.dil, Date.now()]);
      await oturumAc(res, id);
      return send(res, 201, { ok: true });
    }

    if (yol === '/api/giris' && req.method === 'POST') {
      const g = await govde(req);
      const eposta = String(g.eposta || '').trim().toLowerCase();
      const anahtarlar = [['giris:' + istemciAdresi(req) + ':' + eposta, 8], ['giris:' + istemciAdresi(req), 40]];
      if (cokDeneme(anahtarlar)) throw new Hata('cok_deneme', 429);
      const u = await db.get('SELECT id, parola FROM uyeler WHERE eposta = ?', [eposta]);
      /* Hesap yoksa da aynı scrypt işi yapılır: yanıt süresi hesabın varlığını ele vermesin. */
      if (!parolaDogru(g.parola, u?.parola || SAHTE_OZET) || !u) throw new Hata('giris', 401);
      denemeSifirla(anahtarlar.map(a => a[0]));
      await oturumAc(res, u.id);
      return send(res, 200, { ok: true });
    }

    if (yol === '/api/cikis' && req.method === 'POST') {
      const t = oturumJetonu(req);
      if (t) await db.run('DELETE FROM oturumlar WHERE token = ?', [ozet(t)]);
      res.setHeader('Set-Cookie', oturumCerezi('', true));
      return send(res, 200, { ok: true });
    }

    if (yol === '/api/ben' && req.method === 'GET') {
      if (!uye) return send(res, 200, { uye: null });
      return send(res, 200, { uye: { ad: uye.ad, eposta: uye.eposta, ulke: uye.ulke, rol: uye.rol, dil: uye.dil, yonetici: !!uye.yonetici, bildirim: !!uye.bildirim } });
    }

    /* Ad düzeltme (Hesabım). Sertifika varsa üstündeki ad da düzeltilir: amaç yazım hatasını gidermek;
       doğrulama sayfası her zaman güncel adı gösterir. */
    if (yol === '/api/ben/ad' && req.method === 'POST') {
      if (!uye) throw new Hata('oturum', 401);
      const ad = String((await govde(req)).ad || '').trim().replace(/\s+/g, ' ');
      if (ad.length < 2 || ad.length > 100) throw new Hata('ad');
      await db.run('UPDATE uyeler SET ad = ? WHERE id = ?', [ad, uye.id]);
      await db.run('UPDATE sertifikalar SET ad = ? WHERE uye_id = ?', [ad, uye.id]);
      return send(res, 200, { ok: true });
    }

    /* E-posta bildirimleri: Hesabım'daki anahtar. */
    if (yol === '/api/ben/bildirim' && req.method === 'POST') {
      if (!uye) throw new Hata('oturum', 401);
      const { acik } = await govde(req);
      await db.run('UPDATE uyeler SET bildirim = ? WHERE id = ?', [acik === true ? 1 : 0, uye.id]);
      return send(res, 200, { ok: true });
    }

    /* E-postadaki tek tıklık "bildirimleri kapat" bağlantısı (oturum gerekmez, HMAC imzalı). */
    if (yol === '/api/bildirim/kapat' && req.method === 'GET') {
      const url = new URL(req.url, 'http://x');
      const id = Number(url.searchParams.get('u'));
      const k = String(url.searchParams.get('k') || '');
      const gecerli = Number.isInteger(id) && k.length === 32 && timingSafeEqual(Buffer.from(k), Buffer.from(imza(id)));
      if (gecerli) await db.run('UPDATE uyeler SET bildirim = 0 WHERE id = ?', [id]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>E-YOUTHPRENEUR Academy</title>
<body style="font:16px system-ui;max-width:520px;margin:15vh auto;padding:0 16px;color:#0f1f33">
<h1 style="font-size:1.4rem">${gecerli ? 'E-posta bildirimleri kapatıldı · Email notifications turned off' : 'Bağlantı geçersiz · Invalid link'}</h1>
<p>${gecerli ? 'Artık hatırlatma e-postası almayacaksın. İstersen Hesabım sayfasından yeniden açabilirsin.<br>You will no longer receive reminder emails. You can turn them back on in My account.' : ''}</p>
<p><a href="${siteAdresi()}#/hesap">E-YOUTHPRENEUR Academy</a></p></body>`);
      return true;
    }

    if (yol === '/api/ben/dil' && req.method === 'POST') {
      if (!uye) throw new Hata('oturum', 401);
      const { dil } = await govde(req);
      if (!DILLER.includes(dil)) throw new Hata('istek_gecersiz');
      await db.run('UPDATE uyeler SET dil = ? WHERE id = ?', [dil, uye.id]);
      return send(res, 200, { ok: true });
    }

    /* Parola değiştirme (Hesabım): eski parola istenir; bu oturum dışındaki oturumlar kapanır. */
    if (yol === '/api/ben/parola' && req.method === 'POST') {
      if (!uye) throw new Hata('oturum', 401);
      const g = await govde(req);
      const anahtar = [['parola:' + uye.id, 8]];
      if (cokDeneme(anahtar)) throw new Hata('cok_deneme', 429);
      const u = await db.get('SELECT parola FROM uyeler WHERE id = ?', [uye.id]);
      if (!parolaDogru(g.eski, u.parola)) throw new Hata('parola_yanlis', 403);
      const yeni = String(g.yeni || '');
      if (yeni.length < MIN_PAROLA || yeni.length > 200) throw new Hata('parola');
      denemeSifirla(anahtar.map(a => a[0]));
      await db.run('UPDATE uyeler SET parola = ? WHERE id = ?', [parolaOzeti(yeni), uye.id]);
      await db.run('DELETE FROM oturumlar WHERE uye_id = ? AND token <> ?', [uye.id, ozet(oturumJetonu(req) || '')]);
      return send(res, 200, { ok: true });
    }

    /* Şifremi unuttum: e-postaya 1 saatlik, tek kullanımlık bağlantı. Hesap var mı yok mu
       yanıttan anlaşılmaz (her durumda aynı yanıt). Jetonun yalnızca özeti saklanır. */
    if (yol === '/api/parola/unuttum' && req.method === 'POST') {
      const g = await govde(req);
      const eposta = String(g.eposta || '').trim().toLowerCase();
      if (cokDeneme([['unuttum:' + istemciAdresi(req), 10], ['unuttum:' + eposta, 3]])) throw new Hata('cok_deneme', 429);
      const u = eposta && await db.get('SELECT * FROM uyeler WHERE eposta = ?', [eposta]);
      if (u) {
        const jeton = randomBytes(32).toString('hex');
        await db.run('DELETE FROM parola_jetonlari WHERE uye_id = ? OR bitis < ?', [u.id, Date.now()]);
        await db.run('INSERT INTO parola_jetonlari (ozet, uye_id, bitis) VALUES (?, ?, ?)', [ozet(jeton), u.id, Date.now() + 3600000]);
        await uyeyeGonder(db, u, 'sifirlama', { baglanti: `${siteAdresi()}#/parola/${jeton}` }, { zorunlu: true });
      }
      return send(res, 200, { ok: true });
    }

    if (yol === '/api/parola/sifirla' && req.method === 'POST') {
      const g = await govde(req);
      if (cokDeneme([['sifirla:' + istemciAdresi(req), 20]])) throw new Hata('cok_deneme', 429);
      const j = /^[0-9a-f]{64}$/.test(g.jeton || '') && await db.get('SELECT uye_id, bitis FROM parola_jetonlari WHERE ozet = ?', [ozet(g.jeton)]);
      if (!j || j.bitis < Date.now()) throw new Hata('jeton_gecersiz', 400);
      const yeni = String(g.parola || '');
      if (yeni.length < MIN_PAROLA || yeni.length > 200) throw new Hata('parola');
      await db.run('UPDATE uyeler SET parola = ? WHERE id = ?', [parolaOzeti(yeni), j.uye_id]);
      await db.run('DELETE FROM parola_jetonlari WHERE uye_id = ?', [j.uye_id]);
      await db.run('DELETE FROM oturumlar WHERE uye_id = ?', [j.uye_id]);   // eski oturumlar kapanır
      await oturumAc(res, j.uye_id);
      return send(res, 200, { ok: true });
    }

    /* GDPR md. 15/20 — erişim ve taşınabilirlik: kişinin bütün verisi tek JSON dosyasında.
       Parola özeti ve oturum jetonları dahil edilmez. Anket isimsiz olduğu için kişiye bağlı değildir. */
    if (yol === '/api/ben/veri.json' && req.method === 'GET') {
      if (!uye) throw new Hata('oturum', 401);
      const id = uye.id;
      const tarih = t => (t ? new Date(Number(t)).toISOString() : null);
      const h = await db.get(`SELECT ad, eposta, ulke, dogum_yili, rol, az_firsat, veli_onayi, dil, olusturma, son_giris,
        giris_sayisi, aktif_sn, anket_at, bildirim FROM uyeler WHERE id = ?`, [id]);
      const sert = await db.get('SELECT kod, ad, zaman FROM sertifikalar WHERE uye_id = ?', [id]);
      const veri = {
        aciklama: 'E-YOUTHPRENEUR Academy — kişisel verilerin / your personal data (GDPR art. 15, 20)',
        olusturma: new Date().toISOString(),
        hesap: { ...h, az_firsat: !!h.az_firsat, veli_onayi: !!h.veli_onayi, bildirim: !!h.bildirim,
          olusturma: tarih(h.olusturma), son_giris: tarih(h.son_giris), anket_at: tarih(h.anket_at) },
        bolumler: (await db.all('SELECT bolum, tamam_at FROM ilerleme WHERE uye_id = ? ORDER BY bolum', [id]))
          .map(r => ({ bolum: r.bolum, tamam: tarih(r.tamam_at) })),
        adimlar: (await db.all('SELECT bolum, adim, veri, tamam_at FROM adim_ilerleme WHERE uye_id = ? ORDER BY bolum, adim', [id]))
          .map(r => ({ bolum: r.bolum, adim: r.adim, tamam: tarih(r.tamam_at), veri: JSON.parse(r.veri || '{}') })),
        test_denemeleri: (await db.all('SELECT puan, toplam, gecti, zaman FROM denemeler WHERE uye_id = ? ORDER BY zaman', [id]))
          .map(r => ({ puan: r.puan, toplam: r.toplam, gecti: !!r.gecti, zaman: tarih(r.zaman) })),
        notlar: (await db.all('SELECT anahtar, metin, guncelleme FROM notlar WHERE uye_id = ? ORDER BY anahtar', [id]))
          .map(r => ({ anahtar: r.anahtar, metin: r.metin, guncelleme: tarih(r.guncelleme) })),
        sertifika: sert ? { ...sert, zaman: tarih(sert.zaman) } : null,
        gruplar: (await db.all('SELECT g.ad, g.kod, gu.katilma FROM grup_uyeleri gu JOIN gruplar g ON g.id = gu.grup_id WHERE gu.uye_id = ?', [id]))
          .map(r => ({ ad: r.ad, kod: r.kod, katilma: tarih(r.katilma) })),
        actigi_gruplar: (await db.all('SELECT ad, kod, olusturma FROM gruplar WHERE egitmen_id = ?', [id]))
          .map(r => ({ ad: r.ad, kod: r.kod, olusturma: tarih(r.olusturma) })),
        e_postalar: (await db.all('SELECT tur, konu, durum, zaman FROM postalar WHERE uye_id = ? ORDER BY zaman', [id]))
          .map(r => ({ ...r, zaman: tarih(r.zaman) })),
      };
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="akademi-verilerim-${new Date().toISOString().slice(0, 10)}.json"`,
      });
      res.end(JSON.stringify(veri, null, 2));
      return true;
    }

    /* GDPR/KVKK: kişi hesabını ve bütün kişisel verisini kendisi siler. */
    if (yol === '/api/ben' && req.method === 'DELETE') {
      if (!uye) throw new Hata('oturum', 401);
      const { parola } = await govde(req);
      const u = await db.get('SELECT parola FROM uyeler WHERE id = ?', [uye.id]);
      if (!parolaDogru(parola, u.parola)) throw new Hata('parola_yanlis', 403);
      await db.run('DELETE FROM postalar WHERE uye_id = ?', [uye.id]);   // e-posta adresi kayıtta kalmasın
      await db.run('DELETE FROM uyeler WHERE id = ?', [uye.id]);
      res.setHeader('Set-Cookie', oturumCerezi('', true));
      return send(res, 200, { ok: true });
    }

    /* Etkin süre (başvurudaki "time spent" göstergesi): sayfa görünürken dakikada bir. */
    if (yol === '/api/nabiz' && req.method === 'POST') {
      if (!uye) throw new Hata('oturum', 401);
      /* Dakikada en çok bir sayılır: art arda istekle süre şişirilemez. */
      const son = sonNabiz.get(uye.id) || 0;
      if (Date.now() - son < 50000) return send(res, 200, { ok: true });
      sonNabiz.set(uye.id, Date.now());
      await db.run('UPDATE uyeler SET aktif_sn = aktif_sn + 60 WHERE id = ?', [uye.id]);
      return send(res, 200, { ok: true });
    }
  };
}
