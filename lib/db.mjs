import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Veritabanı: DATABASE_URL varsa PostgreSQL (sunucu), yoksa SQLite dosyası (yerel).
 * Sorgular tek biçimde yazılır: yer tutucu `?`, yeni kimlik `RETURNING id`,
 * sayımlar `CAST(count(*) AS INTEGER)`. Şema her açılışta IF NOT EXISTS ile çalışır.
 *
 * KİŞİSEL VERİ: yalnızca eğitim ve göstergeler için gerekenler tutulur. Hesap
 * silinince ilerleme, denemeler ve sertifika da silinir (ON DELETE CASCADE);
 * anket cevapları zaten kişiye bağlı değildir.
 */
const LEHCE = {
  sqlite: { kimlik: 'INTEGER PRIMARY KEY', buyuk: 'INTEGER' },
  postgres: { kimlik: 'SERIAL PRIMARY KEY', buyuk: 'BIGINT' },
};

export function sema(l) {
  const { kimlik, buyuk } = LEHCE[l];
  return `
    CREATE TABLE IF NOT EXISTS uyeler (
      id ${kimlik},
      eposta TEXT UNIQUE NOT NULL,
      parola TEXT NOT NULL,
      ad TEXT NOT NULL,
      ulke TEXT NOT NULL,
      dogum_yili INTEGER NOT NULL,
      rol TEXT NOT NULL,
      az_firsat INTEGER NOT NULL DEFAULT 0,
      veli_onayi INTEGER NOT NULL DEFAULT 0,
      dil TEXT NOT NULL DEFAULT 'tr',
      yonetici INTEGER NOT NULL DEFAULT 0,
      olusturma ${buyuk} NOT NULL,
      son_giris ${buyuk},
      giris_sayisi INTEGER NOT NULL DEFAULT 0,
      aktif_sn INTEGER NOT NULL DEFAULT 0,
      anket_at ${buyuk});
    CREATE TABLE IF NOT EXISTS oturumlar (
      token TEXT PRIMARY KEY,
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      bitis ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS ilerleme (
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      bolum TEXT NOT NULL,
      okundu_at ${buyuk},
      video_sn INTEGER NOT NULL DEFAULT 0,
      video_sure INTEGER NOT NULL DEFAULT 0,
      sorular TEXT NOT NULL DEFAULT '[]',
      tamam_at ${buyuk},
      PRIMARY KEY (uye_id, bolum));
    CREATE TABLE IF NOT EXISTS denemeler (
      id ${kimlik},
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      puan INTEGER NOT NULL,
      toplam INTEGER NOT NULL,
      gecti INTEGER NOT NULL,
      zaman ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS anket (
      id ${kimlik},
      dil TEXT NOT NULL,
      ulke TEXT NOT NULL,
      cevaplar TEXT NOT NULL,
      zaman ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS sertifikalar (
      id ${kimlik},
      uye_id INTEGER UNIQUE NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      kod TEXT UNIQUE NOT NULL,
      ad TEXT NOT NULL,
      zaman ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS adim_ilerleme (
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      bolum TEXT NOT NULL,
      adim TEXT NOT NULL,
      veri TEXT NOT NULL DEFAULT '{}',
      tamam_at ${buyuk},
      PRIMARY KEY (uye_id, bolum, adim));
    CREATE TABLE IF NOT EXISTS postalar (
      id ${kimlik},
      uye_id INTEGER REFERENCES uyeler(id) ON DELETE SET NULL,
      kime TEXT NOT NULL,
      tur TEXT NOT NULL,
      konu TEXT NOT NULL,
      durum TEXT NOT NULL,
      hata TEXT NOT NULL DEFAULT '',
      zaman ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS notlar (
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      anahtar TEXT NOT NULL,
      metin TEXT NOT NULL,
      guncelleme ${buyuk} NOT NULL,
      PRIMARY KEY (uye_id, anahtar));
    CREATE TABLE IF NOT EXISTS gruplar (
      id ${kimlik},
      kod TEXT UNIQUE NOT NULL,
      ad TEXT NOT NULL,
      egitmen_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      olusturma ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS grup_uyeleri (
      grup_id INTEGER NOT NULL REFERENCES gruplar(id) ON DELETE CASCADE,
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      katilma ${buyuk} NOT NULL,
      PRIMARY KEY (grup_id, uye_id));
    CREATE TABLE IF NOT EXISTS ayarlar (
      anahtar TEXT PRIMARY KEY,
      deger TEXT NOT NULL,
      guncelleme ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS kaynaklar (
      id ${kimlik},
      tur TEXT NOT NULL,
      baslik_tr TEXT NOT NULL,
      baslik_en TEXT NOT NULL,
      aciklama_tr TEXT NOT NULL DEFAULT '',
      aciklama_en TEXT NOT NULL DEFAULT '',
      dosya_adi TEXT NOT NULL,
      mime TEXT NOT NULL,
      boyut INTEGER NOT NULL,
      indirme INTEGER NOT NULL DEFAULT 0,
      olusturma ${buyuk} NOT NULL);
    CREATE TABLE IF NOT EXISTS parola_jetonlari (
      ozet TEXT PRIMARY KEY,
      uye_id INTEGER NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
      bitis ${buyuk} NOT NULL);
    CREATE INDEX IF NOT EXISTS oturum_uye ON oturumlar(uye_id);
    CREATE INDEX IF NOT EXISTS deneme_uye ON denemeler(uye_id);
    CREATE INDEX IF NOT EXISTS grup_uye ON grup_uyeleri(uye_id);
  `;
}

export async function openDb({ url = process.env.DATABASE_URL, dir = process.env.DATA_DIR || './data' } = {}) {
  const db = url ? await openPostgres(url) : await openSqlite(dir);
  await goc(db);
  return db;
}

/* Var olan tablolara sonradan eklenen sütunlar. Sütun zaten varsa hata yutulur. */
const SUTUNLAR = [
  ['uyeler', 'bildirim', 'INTEGER NOT NULL DEFAULT 1'],      // e-posta bildirimleri açık mı
  ['uyeler', 'son_hatirlatma', 'BIGINT'],
  ['uyeler', 'hatirlatma_sayisi', 'INTEGER NOT NULL DEFAULT 0'],
];
async function goc(db) {
  for (const [tablo, sutun, tur] of SUTUNLAR) {
    try {
      await db.run(db.kind === 'postgres'
        ? `ALTER TABLE ${tablo} ADD COLUMN IF NOT EXISTS ${sutun} ${tur}`
        : `ALTER TABLE ${tablo} ADD COLUMN ${sutun} ${tur.replace('BIGINT', 'INTEGER')}`);
    } catch (e) { if (!/duplicate column/i.test(e.message)) throw e; }
  }
}

async function openSqlite(dir) {
  const { DatabaseSync } = await import('node:sqlite');
  const dosya = dir === ':memory:' ? ':memory:' : (mkdirSync(resolve(dir), { recursive: true }), resolve(dir, 'akademi.sqlite'));
  const db = new DatabaseSync(dosya);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  db.exec(sema('sqlite'));
  return {
    kind: 'sqlite',
    all: async (sql, a = []) => db.prepare(sql).all(...a),
    get: async (sql, a = []) => db.prepare(sql).get(...a),
    run: async (sql, a = []) => { db.prepare(sql).run(...a); },
    insert: async (sql, a = []) => db.prepare(sql + ' RETURNING id').get(...a).id,
    close: async () => db.close(),
  };
}

async function openPostgres(url) {
  const { default: pg } = await import('pg');
  /* BIGINT (zaman damgaları) metin değil sayı dönsün. */
  pg.types.setTypeParser(20, v => Number(v));
  const pool = new pg.Pool({ connectionString: url, max: 8 });
  await pool.query(sema('postgres'));
  const cevir = sql => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };
  const q = async (sql, a) => (await pool.query(cevir(sql), a)).rows;
  return {
    kind: 'postgres',
    all: q,
    get: async (sql, a = []) => (await q(sql, a))[0],
    run: async (sql, a = []) => { await q(sql, a); },
    insert: async (sql, a = []) => (await q(sql + ' RETURNING id', a))[0].id,
    close: () => pool.end(),
  };
}
