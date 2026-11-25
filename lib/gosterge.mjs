import { ANKET, ULKELER } from '../icerik/modul.mjs';
import { yas } from './uye.mjs';
import { guncel } from './icerik.mjs';

/**
 * Yönetici göstergeleri — başvurudaki ölçütler (WP3 A-2): kayıtlı kullanıcı, tamamlanan
 * modül ve tamamlama oranı (hedef ≥ %70), giriş sayısı, modülde geçirilen süre,
 * değerlendirme tamamlama oranı, sertifika (≥ %65), modül sonu anketi ve yanıt oranı,
 * indirme sayıları; yaş (17–30) ve "daha az fırsat" (hedef %40) dağılımları.
 * Yönetici ekranı ve indirilen raporlar (Excel/PDF) aynı hesabı kullanır.
 *
 * SÜZGEÇ (rapor): { bas, bit, ulke }
 *  - bas/bit (YYYY-MM-DD): o dönemde KAYDOLAN katılımcılar (kohort); tamamlama, test ve
 *    sertifikalar dönem sonuna (bit) kadar olanlar sayılır.
 *  - ulke: yalnızca o ülkeden kaydolanlar.
 *  - Anket isimsizdir: kişiye ve ülkeye bağlanamaz; yalnızca tarih aralığıyla (ay) süzülür.
 *  - Giriş sayısı ve etkin süre kişi başına birikimli sayaçlardır (döneme bölünemez).
 */
export const oran = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
export const HEDEF = { tamamlama: 70, sertifika: 65, azFirsat: 40 };

const GUN = 86400000;
const tarihGecerli = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
export function suzgecCoz(q = {}) {
  const bas = tarihGecerli(q.bas) ? Date.parse(q.bas + 'T00:00:00Z') : null;
  const bit = tarihGecerli(q.bit) ? Date.parse(q.bit + 'T00:00:00Z') + GUN - 1 : null;
  const ulke = ULKELER.includes(q.ulke) ? q.ulke : null;
  return { bas, bit, ulke };
}
const gunMetni = z => new Date(z).toISOString().slice(0, 10);

export async function gostergeHesapla(db, suzgec = {}) {
  const { bas, bit, ulke } = suzgecCoz(suzgec);
  /* Kohort: yönetici olmayan, (varsa) ülkesi ve kayıt tarihi süzgece uyan katılımcılar. */
  const kosul = ['yonetici = 0'], kp = [];
  if (ulke) { kosul.push('ulke = ?'); kp.push(ulke); }
  if (bas) { kosul.push('olusturma >= ?'); kp.push(bas); }
  if (bit) { kosul.push('olusturma <= ?'); kp.push(bit); }
  const KOHORT = `SELECT id FROM uyeler WHERE ${kosul.join(' AND ')}`;
  const K = `uye_id IN (${KOHORT})`;
  const sonra = alan => (bit ? ` AND ${alan} <= ?` : '');
  const sp = bit ? [bit] : [];

  const BOLUMLER = guncel().bolumler;
  const ids = BOLUMLER.map(b => b.id);
  const yer = ids.map(() => '?').join(',') || "''";

  /* Kişi başına özet (ülke kırılımı ve oranlar bundan türetilir). */
  const kisiler = await db.all(`
    SELECT u.id, u.ulke, u.rol, u.dogum_yili, u.az_firsat, u.giris_sayisi, u.aktif_sn,
      (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL
         AND i.bolum IN (${yer})${sonra('i.tamam_at')}) AS bolum,
      (SELECT CAST(count(*) AS INTEGER) FROM denemeler d WHERE d.uye_id = u.id${sonra('d.zaman')}) AS deneme,
      (SELECT CAST(count(*) AS INTEGER) FROM denemeler d WHERE d.uye_id = u.id AND d.gecti = 1${sonra('d.zaman')}) AS gecti,
      (SELECT CAST(count(*) AS INTEGER) FROM sertifikalar s WHERE s.uye_id = u.id${sonra('s.zaman')}) AS sertifika
    FROM uyeler u WHERE u.id IN (${KOHORT})`, [...ids, ...sp, ...sp, ...sp, ...sp, ...kp]);
  const n = kisiler.length;
  const bitiren = k => ids.length > 0 && k.bolum === ids.length;

  const tamamlar = await db.all(`SELECT bolum, CAST(count(*) AS INTEGER) AS sayi FROM ilerleme
    WHERE tamam_at IS NOT NULL AND ${K}${sonra('tamam_at')} GROUP BY bolum`, [...kp, ...sp]);
  const tumunuBitiren = kisiler.filter(bitiren).length;
  const testeGiren = kisiler.filter(k => k.deneme > 0).length;
  const gecen = kisiler.filter(k => k.gecti > 0).length;
  const sertifika = kisiler.filter(k => k.sertifika > 0).length;

  /* Video izleme: izlenen saniye / süre (video adımları). İçerikteki süre önceliklidir. */
  const sureler = Object.fromEntries(BOLUMLER.flatMap(b => b.adimlar.filter(a => a.tur === 'video' && a.sure).map(a => [b.id + '/' + a.id, a.sure])));
  const video = (await db.all(`SELECT bolum, adim, veri FROM adim_ilerleme WHERE veri LIKE '%"sure"%' AND ${K}`, kp))
    .map(r => { const v = JSON.parse(r.veri); return { sn: v.sn || 0, sure: sureler[r.bolum + '/' + r.adim] || v.sure }; })
    .filter(v => v.sure > 0);

  /* Anket: isimsiz; yalnızca tarihle süzülür (satır zamanı ayın başına yuvarlıdır). */
  const ak = [], ap = [];
  if (bas) { const d = new Date(bas); ak.push('zaman >= ?'); ap.push(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
  if (bit) { ak.push('zaman <= ?'); ap.push(bit); }
  const anket = await db.all(`SELECT cevaplar FROM anket${ak.length ? ' WHERE ' + ak.join(' AND ') : ''}`, ap);
  const cev = anket.map(a => JSON.parse(a.cevaplar));
  const anketPuan = Object.fromEntries(ANKET.map(m => {
    const p = cev.map(c => c.puanlar?.[m.id]).filter(Boolean);
    return [m.id, p.length ? Math.round((p.reduce((a, b) => a + b, 0) / p.length) * 10) / 10 : null];
  }));
  const anketYanit = Object.fromEntries(ANKET.map(m => [m.id, cev.filter(c => c.puanlar?.[m.id]).length]));
  const yorumlar = cev.map(c => c.yorum).filter(Boolean).slice(-20).reverse();

  /* İndirmeler: toplam sayaç + (dönem verildiyse) günlük kayıtlardan dönem içi. */
  const kaynaklar = await db.all('SELECT id, tur, baslik_tr, baslik_en, dosya_adi, indirme, olusturma FROM kaynaklar ORDER BY olusturma');
  let donem = null;
  if (bas || bit) {
    const dk = [], dp = [];
    if (bas) { dk.push('gun >= ?'); dp.push(gunMetni(bas)); }
    if (bit) { dk.push('gun <= ?'); dp.push(gunMetni(bit)); }
    donem = Object.fromEntries((await db.all(`SELECT kaynak_id, CAST(SUM(sayi) AS INTEGER) AS sayi FROM kaynak_indirme
      WHERE ${dk.join(' AND ')} GROUP BY kaynak_id`, dp)).map(r => [r.kaynak_id, r.sayi]));
  }
  const indirmeler = kaynaklar.map(k => ({ id: k.id, tur: k.tur, baslik_tr: k.baslik_tr, baslik_en: k.baslik_en, dosya: k.dosya_adi,
    yuklenme: gunMetni(k.olusturma), toplam: k.indirme, donem: donem ? (donem[k.id] || 0) : null }));
  const indirme = donem ? indirmeler.reduce((a, k) => a + k.donem, 0) : indirmeler.reduce((a, k) => a + k.toplam, 0);
  const grup = (await db.get('SELECT CAST(count(*) AS INTEGER) AS sayi FROM gruplar'))?.sayi || 0;

  const say = (dizi, f) => dizi.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const yasGrubu = u => { if (!u.dogum_yili) return '?'; const y = yas(u.dogum_yili); return y < 17 ? '<17' : y <= 30 ? '17-30' : '>30'; };
  const azF = kisiler.filter(u => u.az_firsat).length;

  /* Ülke kırılımı (ortaklar kendi rakamlarını görsün). */
  const ulkeDokum = ULKELER.filter(u => !ulke || u === ulke).map(u => {
    const k = kisiler.filter(x => x.ulke === u);
    const b = k.filter(bitiren).length, s = k.filter(x => x.sertifika > 0).length, a = k.filter(x => x.az_firsat).length;
    return { ulke: u, kayitli: k.length, bitiren: b, tamamlamaOrani: oran(b, k.length), sertifika: s, sertifikaOrani: oran(s, k.length),
      azFirsat: a, azFirsatOrani: oran(a, k.length) };
  });

  return {
    suzgec: { bas: bas ? gunMetni(bas) : null, bit: bit ? gunMetni(bit) : null, ulke },
    kayitli: n,
    ulke: Object.fromEntries(ULKELER.map(u => [u, kisiler.filter(x => x.ulke === u).length])),
    ulkeDokum,
    rol: say(kisiler, u => u.rol),
    yas: say(kisiler, yasGrubu),
    azFirsat: { sayi: azF, oran: oran(azF, n) },
    giris: kisiler.reduce((a, u) => a + u.giris_sayisi, 0),
    ortSureDk: n ? Math.round(kisiler.reduce((a, u) => a + u.aktif_sn, 0) / n / 60) : 0,
    bolumler: BOLUMLER.map(b => ({ id: b.id, tamam: tamamlar.find(t => t.bolum === b.id)?.sayi || 0 })),
    tumunuBitiren, tamamlamaOrani: oran(tumunuBitiren, n),
    /* Değerlendirme: teste girme oranı = teste giren / modülü bitiren; geçme oranı = geçen / giren. */
    test: { giren: testeGiren, gecen, girmeOrani: oran(testeGiren, tumunuBitiren), gecmeOrani: oran(gecen, testeGiren) },
    sertifika, sertifikaOrani: oran(sertifika, n),
    videoOrtIzleme: video.length ? Math.round(video.reduce((a, v) => a + Math.min(1, v.sn / v.sure), 0) / video.length * 100) : 0,
    /* Anket yanıt oranı = yanıt / testi geçen (anket testten sonra açılır). Ülke süzgecinde
       hesaplanmaz: anket isimsiz olduğu için ülkeye bağlanamaz. */
    anket: { sayi: anket.length, puan: anketPuan, yanit: anketYanit, yorumlar, oran: ulke ? null : oran(anket.length, gecen) },
    indirme, indirmeler, grup,
  };
}
