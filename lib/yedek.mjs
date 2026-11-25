import { mkdirSync, readdirSync, rmSync, existsSync, statSync, copyFileSync, createWriteStream } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';

/**
 * Günlük yedek. Veritabanı ve yüklenen kaynak dosyaları:
 *   SQLite     → <YEDEK_DIR>/akademi-YYYY-MM-DD.sqlite   (VACUUM INTO: çalışırken tutarlı kopya)
 *   PostgreSQL → <YEDEK_DIR>/akademi-YYYY-MM-DD.sql.gz   (pg_dump sunucuda kurulu olmalı)
 *   Kaynaklar  → <YEDEK_DIR>/kaynaklar/                  (eksik dosyalar eşitlenir)
 * Son YEDEK_GUN (varsayılan 14) günlük yedek tutulur, eskiler silinir.
 *
 * DİKKAT: yedek aynı diskte durur; disk arızasına karşı bu klasörün düzenli olarak
 * başka bir makineye de kopyalanması gerekir (README · Yedek).
 */
const veriKlasoru = () => resolve(process.env.DATA_DIR || './data');
export const yedekKlasoru = () => resolve(process.env.YEDEK_DIR || join(veriKlasoru(), 'yedek'));
const GUN = Number(process.env.YEDEK_GUN || 14);

function pgDump(url, hedef) {
  return new Promise((ok, hata) => {
    const p = spawn('pg_dump', ['--no-owner', '--no-privileges', url], { stdio: ['ignore', 'pipe', 'pipe'] });
    const cikti = createWriteStream(hedef);
    let hataMetni = '';
    p.stderr.on('data', d => { hataMetni += d; });
    p.on('error', e => hata(e));
    p.stdout.pipe(createGzip()).pipe(cikti);
    p.on('close', kod => (kod === 0 ? cikti.on('close', ok) : hata(new Error('pg_dump: ' + hataMetni.slice(0, 300)))));
  });
}

export async function yedekAl(db, simdi = new Date()) {
  const kl = yedekKlasoru();
  mkdirSync(kl, { recursive: true });
  const gun = simdi.toISOString().slice(0, 10);
  let dosya;
  if (db.kind === 'sqlite') {
    dosya = join(kl, `akademi-${gun}.sqlite`);
    rmSync(dosya, { force: true });                       // VACUUM INTO var olan dosyaya yazmaz
    await db.run(`VACUUM INTO '${dosya.replace(/'/g, "''")}'`);
  } else {
    dosya = join(kl, `akademi-${gun}.sql.gz`);
    await pgDump(process.env.DATABASE_URL, dosya);
  }
  /* Kaynak dosyaları: içerik değişmez (her yükleme yeni kimlik), yalnızca eksikler kopyalanır. */
  const kaynak = join(veriKlasoru(), 'kaynaklar');
  let dosyaSayisi = 0;
  if (existsSync(kaynak)) {
    mkdirSync(join(kl, 'kaynaklar'), { recursive: true });
    for (const f of readdirSync(kaynak)) {
      const h = join(kl, 'kaynaklar', f);
      if (!existsSync(h)) { copyFileSync(join(kaynak, f), h); dosyaSayisi++; }
    }
  }
  /* Saklama süresi: tarihli yedeklerden en yeni GUN tanesi kalır. */
  const tarihli = readdirSync(kl).filter(f => /^akademi-\d{4}-\d{2}-\d{2}\.(sqlite|sql\.gz)$/.test(f)).sort();
  const silinen = tarihli.slice(0, Math.max(0, tarihli.length - GUN));
  for (const f of silinen) rmSync(join(kl, f), { force: true });
  return { dosya, boyut: statSync(dosya).size, yeniKaynak: dosyaSayisi, silinen: silinen.length };
}

/** Sunucu içinde: açılıştan 5 dk sonra, sonra her 24 saatte bir. YEDEK=kapali ile kapanır. */
export function yedekZamanla(db) {
  if (process.env.YEDEK === 'kapali') return;
  const calis = () => yedekAl(db)
    .then(r => console.log(`Yedek: ${r.dosya} (${Math.round(r.boyut / 1024)} KB)`))
    .catch(e => console.error('Yedek alınamadı:', e.message));
  setTimeout(calis, 5 * 60000).unref();
  setInterval(calis, 24 * 3600000).unref();
}

/** Son yedeğin zamanı (yönetici ekranında gösterilir). */
export function sonYedek() {
  const kl = yedekKlasoru();
  if (!existsSync(kl)) return null;
  const f = readdirSync(kl).filter(x => /^akademi-.*\.(sqlite|sql\.gz)$/.test(x)).sort().pop();
  if (!f) return null;
  const s = statSync(join(kl, f));
  return { dosya: f, zaman: s.mtimeMs, boyut: s.size };
}
