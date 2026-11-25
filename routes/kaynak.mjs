import { mkdirSync, createReadStream, existsSync, unlinkSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { send, Hata } from '../lib/http.mjs';

/**
 * Kaynaklar kütüphanesi — projenin açık erişimli çıktıları (İyi Uygulamalar E-Kitabı,
 * proje formatı, araç seti…). Liste ve indirme HERKESE AÇIK (başvuru: "open access,
 * free of charge"); yükleme ve silme yalnızca yönetici. İndirme sayısı tutulur
 * (başvurudaki "download counts" göstergesi).
 *
 * Dosyalar diskte DATA_DIR/kaynaklar/<id><uzantı>; veritabanında yalnızca künye.
 */
const TURLER = ['ekitap', 'format', 'arac', 'rapor', 'diger'];
const MIME = {
  '.pdf': 'application/pdf', '.epub': 'application/epub+zip', '.zip': 'application/zip',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
};
const SINIR = 60 * 1024 * 1024;

const baslik = (req, ad) => { try { return decodeURIComponent(String(req.headers[ad] || '')).trim(); } catch { return ''; } };

export function kaynakRoutes({ db }) {
  const klasor = resolve(process.env.DATA_DIR || './data', 'kaynaklar');
  mkdirSync(klasor, { recursive: true });
  const yolu = k => join(klasor, k.id + extname(k.dosya_adi).toLowerCase());

  return async function (req, res, yol, uye) {
    if (yol === '/api/kaynaklar' && req.method === 'GET') {
      return send(res, 200, await db.all(
        'SELECT id, tur, baslik_tr, baslik_en, aciklama_tr, aciklama_en, dosya_adi, boyut, indirme, olusturma FROM kaynaklar ORDER BY olusturma DESC'));
    }

    const indir = yol.match(/^\/api\/kaynak\/(\d+)\/indir$/);
    if (indir && req.method === 'GET') {
      const k = await db.get('SELECT * FROM kaynaklar WHERE id = ?', [Number(indir[1])]);
      if (!k || !existsSync(yolu(k))) throw new Hata('bulunamadi', 404);
      await db.run('UPDATE kaynaklar SET indirme = indirme + 1 WHERE id = ?', [k.id]);
      const ascii = k.dosya_adi.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
      res.writeHead(200, {
        'Content-Type': k.mime, 'Content-Length': k.boyut, 'Cache-Control': 'no-store', 'Content-Security-Policy': 'sandbox',
        'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(k.dosya_adi)}`,
      });
      createReadStream(yolu(k)).pipe(res);
      return true;
    }

    if (yol === '/api/yonetim/kaynak' && req.method === 'POST') {
      if (!uye?.yonetici) throw new Hata(uye ? 'yetki' : 'oturum', uye ? 403 : 401);
      const dosyaAdi = baslik(req, 'x-dosya').replace(/[/\\]/g, '_').slice(0, 150);
      const uzanti = extname(dosyaAdi).toLowerCase();
      if (!MIME[uzanti]) throw new Hata('kaynak_tur');
      const tur = TURLER.includes(baslik(req, 'x-tur')) ? baslik(req, 'x-tur') : 'diger';
      const btr = baslik(req, 'x-baslik-tr').slice(0, 200), ben = baslik(req, 'x-baslik-en').slice(0, 200);
      if (!btr && !ben) throw new Hata('kaynak_baslik');
      const parcalar = []; let boyut = 0;
      for await (const p of req) { boyut += p.length; if (boyut > SINIR) throw new Hata('kaynak_buyuk', 413); parcalar.push(p); }
      if (!boyut) throw new Hata('kaynak_bos');
      const id = await db.insert(
        `INSERT INTO kaynaklar (tur, baslik_tr, baslik_en, aciklama_tr, aciklama_en, dosya_adi, mime, boyut, olusturma)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tur, btr || ben, ben || btr, baslik(req, 'x-aciklama-tr').slice(0, 600), baslik(req, 'x-aciklama-en').slice(0, 600),
          dosyaAdi, MIME[uzanti], boyut, Date.now()]);
      await writeFile(join(klasor, id + uzanti), Buffer.concat(parcalar));
      return send(res, 201, { id });
    }

    const sil = yol.match(/^\/api\/yonetim\/kaynak\/(\d+)$/);
    if (sil && req.method === 'DELETE') {
      if (!uye?.yonetici) throw new Hata(uye ? 'yetki' : 'oturum', uye ? 403 : 401);
      const k = await db.get('SELECT * FROM kaynaklar WHERE id = ?', [Number(sil[1])]);
      if (!k) throw new Hata('bulunamadi', 404);
      await db.run('DELETE FROM kaynaklar WHERE id = ?', [k.id]);
      try { unlinkSync(yolu(k)); } catch { /* dosya zaten yoksa */ }
      return send(res, 200, { ok: true });
    }
  };
}
