import { guncel } from './icerik.mjs';

/**
 * Video denetimi: içerikteki YouTube videoları hâlâ yayında ve gömülebilir mi?
 * Videolar başka kurumların kanallarında; biri silinir ya da gömülmesi kapatılırsa o adım
 * tamamlanamaz, dolayısıyla bölüm ve sertifika da kilitlenir.
 *
 * YouTube'un herkese açık oEmbed adresi kullanılır (resmî, anahtar gerektirmez):
 *   200 → açık ve gömülebilir · 401/403 → gömülmesi kapalı · 404/400 → silinmiş ya da özel.
 * Sonuç `ayarlar` tablosunda ('video_durum') tutulur; yönetici ekranı bozuk olanları gösterir.
 * Haftada bir çalışır (açılıştan 10 dk sonra ilk kez). VIDEO_DENETIM=kapali ile kapanır.
 */
const HAFTA = 7 * 86400000;

async function tekVideo(id) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`,
      { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'E-YOUTHPRENEUR-Academy/1.0' } });
    if (r.ok) return 'acik';
    if (r.status === 401 || r.status === 403) return 'gomulemez';
    if (r.status === 404 || r.status === 400) return 'yok';
    return 'bilinmiyor';
  } catch { return 'bilinmiyor'; }   // ağ hatası: bozuk sayılmaz
}

export async function videolariDenetle(db, simdi = Date.now()) {
  const videolar = guncel().bolumler.flatMap(b => b.adimlar.filter(a => a.tur === 'video' && a.youtube)
    .map(a => ({ bolum: b.id, adim: a.id, youtube: a.youtube, baslik: a.baslik?.tr || a.baslik?.en || a.id, bolumAd: b.baslik?.tr || b.baslik?.en || b.id })));
  const sonuc = [];
  for (const v of videolar) sonuc.push({ ...v, durum: await tekVideo(v.youtube) });
  const kayit = JSON.stringify({ zaman: simdi, videolar: sonuc });
  if (await db.get("SELECT 1 AS x FROM ayarlar WHERE anahtar = 'video_durum'")) {
    await db.run("UPDATE ayarlar SET deger = ?, guncelleme = ? WHERE anahtar = 'video_durum'", [kayit, simdi]);
  } else {
    await db.run("INSERT INTO ayarlar (anahtar, deger, guncelleme) VALUES ('video_durum', ?, ?)", [kayit, simdi]);
  }
  return sonuc;
}

/** Son denetim: { zaman, bozuk: [...] } — yalnızca kesin bozuk olanlar (yok / gömülemez). */
export async function videoDurumu(db) {
  const r = await db.get("SELECT deger FROM ayarlar WHERE anahtar = 'video_durum'");
  if (!r) return null;
  const d = JSON.parse(r.deger);
  /* İçerikten çıkarılmış videolar artık sorun değildir. */
  const simdiki = new Set(guncel().bolumler.flatMap(b => b.adimlar.filter(a => a.tur === 'video').map(a => a.youtube)));
  return { zaman: d.zaman, toplam: d.videolar.length, bozuk: d.videolar.filter(v => ['yok', 'gomulemez'].includes(v.durum) && simdiki.has(v.youtube)) };
}

export function videoDenetimZamanla(db) {
  if (process.env.VIDEO_DENETIM === 'kapali') return;
  const calis = () => videolariDenetle(db)
    .then(s => { const b = s.filter(v => ['yok', 'gomulemez'].includes(v.durum)); if (b.length) console.warn('Bozuk video:', b.map(v => v.youtube).join(', ')); })
    .catch(e => console.error('Video denetimi:', e.message));
  setTimeout(calis, 10 * 60000).unref();
  setInterval(calis, HAFTA).unref();
}
