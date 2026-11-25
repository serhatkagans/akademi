/**
 * Çevirmen için İngilizce kaynak üretir: node scripts/ceviri-kaynak.mjs <klasör>
 *   <klasör>/arayuz.en.json  — arayüz metinleri { anahtar: metin } + gizlilik [[başlık, metin], …]
 *   <klasör>/icerik.en.json  — icerik/diller/<kod>.mjs ile AYNI yapıda, değerler İngilizce
 * Çevirmen değerleri çevirip aynı yapıyla dil dosyalarını yazar; denetim: scripts/ceviri-denetle.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { METIN } from '../client/src/dil.js';
import { GIZLILIK } from '../client/src/gizlilik-metin.js';
import { openDb } from '../lib/db.mjs';
import { icerikYukle, guncel } from '../lib/icerik.mjs';
import { ANKET, KANVAS } from '../icerik/modul.mjs';
/* Güncel içerik: yönetim ekranında kaydedilen (veritabanı), yoksa başlangıç içeriği. */
const _db = await openDb();
await icerikYukle(_db);
const { bolumler: BOLUMLER, test: TEST } = guncel();
import { SABLON } from '../lib/posta.mjs';

const en = m => (m && typeof m === 'object' && 'en' in m ? m.en : m);
const kl = process.argv[2] || 'ceviri';
mkdirSync(kl, { recursive: true });

writeFileSync(join(kl, 'arayuz.en.json'), JSON.stringify({ metin: METIN.en, gizlilik: GIZLILIK.en }, null, 1));

const bolumler = {};
for (const b of BOLUMLER) {
  const adimlar = {};
  for (const a of b.adimlar) {
    const x = { baslik: en(a.baslik) };
    if (a.govde) x.govde = en(a.govde);
    if (a.not) x.not = en(a.not);
    if (a.tur === 'ornek') { if (typeof a.kurulus === 'object') x.kurulus = en(a.kurulus); x.yer = en(a.yer); x.ders = en(a.ders); }
    if (a.tur === 'etkinlik') { x.soru = en(a.soru); x.ipucu = en(a.ipucu); }
    if (a.kartlar) x.kartlar = a.kartlar.map(k => ({ on: en(k.on), arka: en(k.arka) }));
    if (a.sorular) x.sorular = a.sorular.map(q => ({ soru: en(q.soru), ...(q.secenekler ? { secenekler: q.secenekler.map(en) } : {}), ...(q.aciklama ? { aciklama: en(q.aciklama) } : {}) }));
    adimlar[a.id] = x;
  }
  bolumler[b.id] = { baslik: en(b.baslik), ozet: en(b.ozet), hedefler: b.hedefler?.en || [], adimlar };
}
const icerik = {
  bolumler,
  test: TEST.map(q => ({ soru: en(q.soru), secenekler: q.secenekler.map(en) })),
  anket: Object.fromEntries(ANKET.map(m => [m.id, m.en])),
  kanvas: Object.fromEntries(KANVAS.map(k => [k.id, { ad: k.en, ip: k.ip.en }])),
  posta: { sertifika: SABLON.en.sertifika, hatirlatma: SABLON.en.hatirlatma, sifirlama: SABLON.en.sifirlama, alt: SABLON.en.alt },
};
writeFileSync(join(kl, 'icerik.en.json'), JSON.stringify(icerik, null, 1));
console.log('Yazıldı:', kl);
