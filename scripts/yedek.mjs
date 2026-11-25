/**
 * Elle yedek: npm run yedek
 * Sunucu zaten her gün kendisi yedek alır (lib/yedek.mjs); bu komut güncelleme
 * ya da taşıma öncesinde anında yedek almak içindir.
 *
 * Geri yükleme (SQLite): sunucuyu durdur → data/akademi.sqlite dosyasını yedekle değiştir
 *   (yanındaki akademi.sqlite-wal ve -shm dosyalarını sil) → sunucuyu başlat.
 * Geri yükleme (PostgreSQL): gunzip -c akademi-TARİH.sql.gz | psql "$DATABASE_URL"  (boş veritabanına)
 */
import { openDb } from '../lib/db.mjs';
import { yedekAl } from '../lib/yedek.mjs';

const db = await openDb();
const r = await yedekAl(db);
console.log(`Yedek alındı: ${r.dosya} (${Math.round(r.boyut / 1024)} KB) · yeni kaynak dosyası: ${r.yeniKaynak} · silinen eski yedek: ${r.silinen}`);
await db.close?.();
