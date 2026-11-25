import { ANKET, ULKELER } from '../icerik/modul.mjs';
import { yas } from './uye.mjs';
import { guncel } from './icerik.mjs';

/**
 * Yönetici göstergeleri — başvurudaki ölçütler (WP3 A-2): kayıtlı kullanıcı, tamamlanan
 * modül ve tamamlama oranı (hedef ≥ %70), giriş sayısı, modülde geçirilen süre,
 * değerlendirme, sertifika (≥ %65), modül sonu anketi; yaş (17–30) ve "daha az fırsat"
 * (hedef %40) dağılımları. Yönetici ekranı ve indirilen raporlar (Excel/PDF) aynı hesabı kullanır.
 */
export const oran = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
export const HEDEF = { tamamlama: 70, sertifika: 65, azFirsat: 40 };

export async function gostergeHesapla(db) {
  const uyeler = await db.all('SELECT id, ulke, rol, dogum_yili, az_firsat, giris_sayisi, aktif_sn, anket_at, yonetici FROM uyeler WHERE yonetici = 0');
  const n = uyeler.length;
  /* Yönetici hesapları katılımcı sayılmaz. */
  const K = 'uye_id IN (SELECT id FROM uyeler WHERE yonetici = 0)';
  const tamamlar = await db.all(`SELECT bolum, CAST(count(*) AS INTEGER) AS sayi FROM ilerleme WHERE tamam_at IS NOT NULL AND ${K} GROUP BY bolum`);
  /* "Bütün modülü bitiren": GÜNCEL bölümlerin hepsini tamamlayan (silinmiş bölümler sayılmaz). */
  const BOLUMLER = guncel().bolumler;
  const tumunuBitiren = (await db.get(
    `SELECT CAST(count(*) AS INTEGER) AS sayi FROM (SELECT uye_id FROM ilerleme WHERE tamam_at IS NOT NULL AND ${K}
     AND bolum IN (${BOLUMLER.map(() => '?').join(',')}) GROUP BY uye_id HAVING count(*) = ?) t`,
    [...BOLUMLER.map(b => b.id), BOLUMLER.length]))?.sayi || 0;
  const indirme = (await db.get('SELECT CAST(COALESCE(SUM(indirme), 0) AS INTEGER) AS sayi FROM kaynaklar'))?.sayi || 0;
  const grup = (await db.get('SELECT CAST(count(*) AS INTEGER) AS sayi FROM gruplar'))?.sayi || 0;
  const testeGiren = (await db.get(`SELECT CAST(count(DISTINCT uye_id) AS INTEGER) AS sayi FROM denemeler WHERE ${K}`))?.sayi || 0;
  const gecen = (await db.get(`SELECT CAST(count(DISTINCT uye_id) AS INTEGER) AS sayi FROM denemeler WHERE gecti = 1 AND ${K}`))?.sayi || 0;
  const sertifika = (await db.get(`SELECT CAST(count(*) AS INTEGER) AS sayi FROM sertifikalar WHERE ${K}`))?.sayi || 0;
  /* Video izleme: adım verisindeki izlenen saniye / süre (video adımları). */
  const video = (await db.all(`SELECT veri FROM adim_ilerleme WHERE veri LIKE '%"sure"%' AND ${K}`))
    .map(r => JSON.parse(r.veri)).filter(v => v.sure > 0).map(v => ({ video_sn: v.sn || 0, video_sure: v.sure }));
  const anket = await db.all('SELECT cevaplar FROM anket');

  const say = (dizi, f) => dizi.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const yasGrubu = u => { if (!u.dogum_yili) return '?'; const y = yas(u.dogum_yili); return y < 17 ? '<17' : y <= 30 ? '17-30' : '>30'; };
  const anketPuan = Object.fromEntries(ANKET.map(m => {
    const p = anket.map(a => JSON.parse(a.cevaplar).puanlar?.[m.id]).filter(Boolean);
    return [m.id, p.length ? Math.round((p.reduce((a, b) => a + b, 0) / p.length) * 10) / 10 : null];
  }));
  const yorumlar = anket.map(a => JSON.parse(a.cevaplar).yorum).filter(Boolean).slice(-20).reverse();

  return {
    kayitli: n,
    ulke: Object.fromEntries(ULKELER.map(u => [u, uyeler.filter(x => x.ulke === u).length])),
    rol: say(uyeler, u => u.rol),
    yas: say(uyeler, yasGrubu),
    azFirsat: { sayi: uyeler.filter(u => u.az_firsat).length, oran: oran(uyeler.filter(u => u.az_firsat).length, n) },
    giris: uyeler.reduce((a, u) => a + u.giris_sayisi, 0),
    ortSureDk: n ? Math.round(uyeler.reduce((a, u) => a + u.aktif_sn, 0) / n / 60) : 0,
    bolumler: BOLUMLER.map(b => ({ id: b.id, tamam: tamamlar.find(t => t.bolum === b.id)?.sayi || 0 })),
    tumunuBitiren, tamamlamaOrani: oran(tumunuBitiren, n),
    test: { giren: testeGiren, gecen },
    sertifika, sertifikaOrani: oran(sertifika, n),
    videoOrtIzleme: video.length ? Math.round(video.reduce((a, v) => a + Math.min(1, v.video_sn / v.video_sure), 0) / video.length * 100) : 0,
    anket: { sayi: anket.length, puan: anketPuan, yorumlar },
    indirme, grup,
  };
}
