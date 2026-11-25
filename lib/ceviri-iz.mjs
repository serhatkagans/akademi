import { createHash } from 'node:crypto';

/**
 * Çeviri izleri — ortak dili çevirisi "eskidi mi?"
 *
 * Çeviriler İngilizce metinden yapılır. Çeviri dosyası yazıldığında her bölümün,
 * adımın ve son testin İngilizce kaynağının kısa özeti (iz) `icerik/diller/<kod>.iz.json`
 * dosyasına kaydedilir (scripts/ceviri-iz.mjs). Yönetici sonradan İngilizce metni
 * değiştirirse güncel iz kayıtlıdan farklı olur: o adımın çevirisi ESKİ sayılır,
 * katılımcıya eskimiş çeviri yerine güncel İngilizce gösterilir ve yönetim ekranında
 * listelenir. Kaydı olmayan adım (sonradan eklenmiş) EKSİK sayılır, yine İngilizce görünür.
 */
const en = m => (m && typeof m === 'object' && 'en' in m ? m.en : m);
const iz = x => createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0, 12);

/** Bir adımın çevrilecek İngilizce alanları (çevirmene giden kaynakla aynı yapı). */
export function adimKaynagi(a) {
  const x = { baslik: en(a.baslik) };
  if (a.govde) x.govde = en(a.govde);
  if (a.not) x.not = en(a.not);
  if (a.tur === 'ornek') { if (typeof a.kurulus === 'object') x.kurulus = en(a.kurulus); x.yer = en(a.yer); x.ders = en(a.ders); }
  if (a.tur === 'etkinlik') { x.soru = en(a.soru); x.ipucu = en(a.ipucu); }
  if (a.kartlar) x.kartlar = a.kartlar.map(k => ({ on: en(k.on), arka: en(k.arka) }));
  if (a.sorular) {
    x.sorular = a.sorular.map(q => ({ soru: en(q.soru), ...(q.secenekler ? { secenekler: q.secenekler.map(en) } : {}),
      ...(q.aciklama ? { aciklama: en(q.aciklama) } : {}) }));
  }
  return x;
}
export const bolumKaynagi = b => ({ baslik: en(b.baslik), ozet: en(b.ozet), hedefler: b.hedefler?.en || [] });
export const testKaynagi = test => test.map(q => ({ soru: en(q.soru), secenekler: q.secenekler.map(en) }));

/** İçeriğin güncel izleri: { 'bolum': iz, 'bolum/adim': iz, test: iz } */
export function izler(icerik) {
  const o = {};
  for (const b of icerik.bolumler) {
    o[b.id] = iz(bolumKaynagi(b));
    for (const a of b.adimlar) o[`${b.id}/${a.id}`] = iz(adimKaynagi(a));
  }
  o.test = iz(testKaynagi(icerik.test));
  return o;
}
