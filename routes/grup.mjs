import { randomBytes } from 'node:crypto';
import { send, govde, Hata } from '../lib/http.mjs';
import { guncel } from '../lib/icerik.mjs';
import { csvGonder, tarih } from '../lib/csv.mjs';

/**
 * Gruplar: gençlik çalışanı (rol 'genclik') ya da yönetici bir grup açar, kodu gençlerle
 * paylaşır; gençler kodla katılır. Eğitmen YALNIZCA kendi grubundakilerin ilerlemesini
 * görür: ad, tamamlanan bölüm, test, sertifika, son giriş. E-posta ve defter notları görünmez.
 * Pilotlama (WP4, 24 katılımcı) ve çoğaltıcı etkinlikler için.
 * Bir genç aynı anda tek gruptadır; yeni koda katılınca eskisinden çıkar.
 */
const AB = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const yeniKod = () => [...randomBytes(6)].map(x => AB[x % AB.length]).join('');

export function grupRoutes({ db }) {
  const egitmenMi = u => u.rol === 'genclik' || !!u.yonetici;

  async function uyeleri(grupId) {
    const ids = guncel().bolumler.map(b => b.id);
    return db.all(`
      SELECT u.ad, u.son_giris,
        (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL
           AND i.bolum IN (${ids.map(() => '?').join(',')})) AS bolum,
        (SELECT MAX(puan) FROM denemeler d WHERE d.uye_id = u.id) AS test,
        (SELECT CAST(count(*) AS INTEGER) FROM sertifikalar s WHERE s.uye_id = u.id) AS sertifika
      FROM grup_uyeleri g JOIN uyeler u ON u.id = g.uye_id WHERE g.grup_id = ? ORDER BY u.ad`, [...ids, grupId]);
  }

  return async function (req, res, yol, uye) {
    if (!yol.startsWith('/api/grup')) return;
    if (!uye) throw new Hata('oturum', 401);

    if (yol === '/api/grup' && req.method === 'GET') {
      const benim = await db.get(`SELECT g.ad, g.kod, e.ad AS egitmen FROM grup_uyeleri x JOIN gruplar g ON g.id = x.grup_id
        JOIN uyeler e ON e.id = g.egitmen_id WHERE x.uye_id = ?`, [uye.id]);
      let gruplar = [];
      if (egitmenMi(uye)) {
        gruplar = await db.all('SELECT id, kod, ad, olusturma FROM gruplar WHERE egitmen_id = ? ORDER BY olusturma DESC', [uye.id]);
        for (const g of gruplar) g.uyeler = await uyeleri(g.id);
      }
      return send(res, 200, { egitmen: egitmenMi(uye), benim: benim || null, gruplar, bolumSayisi: guncel().bolumler.length, gecme: guncel().gecme });
    }

    if (yol === '/api/grup' && req.method === 'POST') {
      if (!egitmenMi(uye)) throw new Hata('yetki', 403);
      const ad = String((await govde(req)).ad || '').trim().replace(/\s+/g, ' ');
      if (ad.length < 2 || ad.length > 80) throw new Hata('grup_ad');
      const say = await db.get('SELECT CAST(count(*) AS INTEGER) AS n FROM gruplar WHERE egitmen_id = ?', [uye.id]);
      if (say.n >= 30) throw new Hata('grup_cok');
      let kod;
      do { kod = yeniKod(); } while (await db.get('SELECT 1 AS x FROM gruplar WHERE kod = ?', [kod]));
      await db.insert('INSERT INTO gruplar (kod, ad, egitmen_id, olusturma) VALUES (?, ?, ?, ?)', [kod, ad, uye.id, Date.now()]);
      return send(res, 201, { kod });
    }

    /* Eğitmen kendi grubunun listesini indirir (pilot ve çoğaltıcı etkinlik raporları için). */
    const csv = yol.match(/^\/api\/grup\/(\d+)\/liste\.csv$/);
    if (csv && req.method === 'GET') {
      const g = await db.get('SELECT id, ad, egitmen_id FROM gruplar WHERE id = ?', [Number(csv[1])]);
      if (!g || (g.egitmen_id !== uye.id && !uye.yonetici)) throw new Hata('bulunamadi', 404);
      const n = guncel().bolumler.length;
      const satirlar = (await uyeleri(g.id)).map(u => [u.ad, `${u.bolum}/${n}`, u.test ?? '', u.sertifika ? 'evet' : '', tarih(u.son_giris)]);
      return csvGonder(res, `grup-${g.ad}.csv`, ['Ad', 'Bölüm', 'Test (en iyi)', 'Sertifika', 'Son giriş'], satirlar);
    }

    const sil = yol.match(/^\/api\/grup\/(\d+)$/);
    if (sil && req.method === 'DELETE') {
      const g = await db.get('SELECT egitmen_id FROM gruplar WHERE id = ?', [Number(sil[1])]);
      if (!g || g.egitmen_id !== uye.id) throw new Hata('bulunamadi', 404);
      await db.run('DELETE FROM gruplar WHERE id = ?', [Number(sil[1])]);
      return send(res, 200, { ok: true });
    }

    if (yol === '/api/grup/katil' && req.method === 'POST') {
      const kod = String((await govde(req)).kod || '').trim().toUpperCase();
      const g = await db.get('SELECT id, ad FROM gruplar WHERE kod = ?', [kod]);
      if (!g) throw new Hata('grup_kod', 404);
      await db.run('DELETE FROM grup_uyeleri WHERE uye_id = ?', [uye.id]);
      await db.run('INSERT INTO grup_uyeleri (grup_id, uye_id, katilma) VALUES (?, ?, ?)', [g.id, uye.id, Date.now()]);
      return send(res, 200, { ad: g.ad });
    }

    if (yol === '/api/grup/ayril' && req.method === 'POST') {
      await db.run('DELETE FROM grup_uyeleri WHERE uye_id = ?', [uye.id]);
      return send(res, 200, { ok: true });
    }
  };
}
