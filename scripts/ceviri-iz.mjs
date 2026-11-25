/**
 * Çeviri izlerini kaydeder: node scripts/ceviri-iz.mjs it ro pt da
 * Bir dilin çeviri dosyası (icerik/diller/<kod>.mjs) GÜNCEL İngilizce içerikten
 * yapıldıktan / güncellendikten sonra çalıştırılır. O andaki İngilizce metnin izleri
 * icerik/diller/<kod>.iz.json dosyasına yazılır; sonradan değişen adımlar yönetim
 * ekranında "çevirisi eski" olarak görünür (lib/ceviri-iz.mjs).
 *
 * Güncel içerik = veritabanındaki (yönetim ekranında kaydedilen) içerik; yoksa başlangıç içeriği.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { openDb } from '../lib/db.mjs';
import { icerikYukle, guncel } from '../lib/icerik.mjs';
import { izler } from '../lib/ceviri-iz.mjs';

const diller = process.argv.slice(2);
if (!diller.length) { console.error('Kullanım: node scripts/ceviri-iz.mjs <kod> [...]'); process.exit(1); }
const db = await openDb();
await icerikYukle(db);
const iz = izler(guncel());
for (const d of diller) {
  if (!existsSync(`icerik/diller/${d}.mjs`)) { console.error(`${d}: çeviri dosyası yok`); continue; }
  writeFileSync(`icerik/diller/${d}.iz.json`, JSON.stringify(iz, null, 1) + '\n');
  console.log(`${d}: ${Object.keys(iz).length} iz kaydedildi`);
}
await db.close?.();
