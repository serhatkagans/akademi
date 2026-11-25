import { send, Hata } from '../lib/http.mjs';
import { ULKELER } from '../icerik/modul.mjs';
import { guncel, yoneticiIcerigi, icerikKaydet, ceviriDurumu } from '../lib/icerik.mjs';
import { govde } from '../lib/http.mjs';
import { randomBytes } from 'node:crypto';
import { parolaOzeti } from '../lib/uye.mjs';
import { smtpVar } from '../lib/posta.mjs';
import { hatirlatmalariGonder } from '../lib/hatirlatma.mjs';
import { gostergeHesapla } from '../lib/gosterge.mjs';
import { sonYedek } from '../lib/yedek.mjs';
import { videoDurumu } from '../lib/video-denetim.mjs';
import { raporXlsx } from '../lib/rapor.mjs';

/* Okunaklı rastgele parola (karışan 0/O, 1/l/I yok). */
const yeniParola = () => [...randomBytes(14)].map(x => 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 55]).join('');

/**
 * Yönetici göstergeleri — başvurudaki ölçütler (WP3 A-2):
 * kayıtlı kullanıcı, tamamlanan modül ve tamamlama oranı (hedef ≥ %70),
 * giriş sayısı, modülde geçirilen süre, değerlendirme tamamlama, sertifika
 * (≥ %65 katılımcı), modül sonu anketi. Yaş (17–30) ve "daha az fırsat"
 * (hedef %40) dağılımları da kayıttan türetilir.
 *
 * Kişi listesi CSV'si yalnızca yöneticiye; içinde parola özeti yok.
 */

export function yonetimRoutes({ db }) {
  return async function (req, res, yol, uye) {
    if (!yol.startsWith('/api/yonetim/')) return;
    if (!uye) throw new Hata('oturum', 401);
    if (!uye.yonetici) throw new Hata('yetki', 403);

    /* ---------------- Kullanıcılar (yönetici ekranı) ---------------- */
    if (yol === '/api/yonetim/uyeler' && req.method === 'GET') {
      const url = new URL(req.url, 'http://x');
      const ara = String(url.searchParams.get('ara') || '').trim().toLowerCase().slice(0, 80);
      const ids = guncel().bolumler.map(b => b.id);
      const satirlar = await db.all(`
        SELECT u.id, u.ad, u.eposta, u.ulke, u.rol, u.yonetici, u.olusturma, u.son_giris,
          (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL
             AND i.bolum IN (${ids.map(() => '?').join(',')})) AS bolum,
          (SELECT CAST(count(*) AS INTEGER) FROM sertifikalar s WHERE s.uye_id = u.id) AS sertifika
        FROM uyeler u
        WHERE (? = '' OR lower(u.ad) LIKE ? OR lower(u.eposta) LIKE ?)
        ORDER BY u.yonetici DESC, u.olusturma DESC LIMIT 200`, [...ids, ara, `%${ara}%`, `%${ara}%`]);
      const toplam = (await db.get('SELECT CAST(count(*) AS INTEGER) AS n FROM uyeler')).n;
      return send(res, 200, { uyeler: satirlar.map(r => ({ ...r, yonetici: !!r.yonetici, ben: r.id === uye.id })), toplam, bolumSayisi: ids.length });
    }

    /* Yönetici hesap açar (ör. eğitmen, ortak kurum personeli). Parola rastgele üretilir, BİR KEZ gösterilir. */
    if (yol === '/api/yonetim/uyeler' && req.method === 'POST') {
      const g = await govde(req);
      const eposta = String(g.eposta || '').trim().toLowerCase();
      if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(eposta)) throw new Hata('eposta');
      const ad = String(g.ad || '').trim().replace(/\s+/g, ' ');
      if (ad.length < 2 || ad.length > 100) throw new Hata('ad');
      const rol = ['genc', 'genclik', 'diger'].includes(g.rol) ? g.rol : 'genclik';
      const ulke = ULKELER.includes(g.ulke) ? g.ulke : 'TR';
      if (await db.get('SELECT id FROM uyeler WHERE eposta = ?', [eposta])) throw new Hata('eposta_var', 409);
      const parola = yeniParola();
      /* Doğum yılı bilinmiyor: 0 (göstergelerde "bilinmiyor" sayılır). */
      await db.insert(`INSERT INTO uyeler (eposta, parola, ad, ulke, dogum_yili, rol, dil, yonetici, olusturma)
        VALUES (?, ?, ?, ?, 0, ?, 'tr', ?, ?)`, [eposta, parolaOzeti(parola), ad, ulke, rol, g.yonetici === true ? 1 : 0, Date.now()]);
      return send(res, 201, { parola });
    }

    const um = yol.match(/^\/api\/yonetim\/uyeler\/(\d+)(\/parola|\/yetki)?$/);
    if (um) {
      const id = Number(um[1]);
      const hedef = await db.get('SELECT id, yonetici FROM uyeler WHERE id = ?', [id]);
      if (!hedef) throw new Hata('bulunamadi', 404);
      if (um[2] === '/parola' && req.method === 'POST') {
        const parola = yeniParola();
        await db.run('UPDATE uyeler SET parola = ? WHERE id = ?', [parolaOzeti(parola), id]);
        await db.run('DELETE FROM oturumlar WHERE uye_id = ?', [id]); // açık oturumlar kapanır
        return send(res, 200, { parola });
      }
      if (um[2] === '/yetki' && req.method === 'POST') {
        if (id === uye.id) throw new Hata('kendin');           // kendi yetkisini alıp kilitlenmesin
        const { yonetici } = await govde(req);
        await db.run('UPDATE uyeler SET yonetici = ? WHERE id = ?', [yonetici === true ? 1 : 0, id]);
        return send(res, 200, { ok: true });
      }
      if (!um[2] && req.method === 'DELETE') {
        if (id === uye.id) throw new Hata('kendin');
        await db.run('DELETE FROM postalar WHERE uye_id = ?', [id]);   // e-posta adresi kayıtta kalmasın
        await db.run('DELETE FROM uyeler WHERE id = ?', [id]);
        return send(res, 200, { ok: true });
      }
    }

    /* Giden e-postalar (son 100): gönderildi / beklemede (SMTP ayarı yok) / hata. */
    if (yol === '/api/yonetim/postalar' && req.method === 'GET') {
      const liste = await db.all('SELECT id, kime, tur, konu, durum, hata, zaman FROM postalar ORDER BY zaman DESC LIMIT 100');
      return send(res, 200, { smtp: smtpVar, liste });
    }
    if (yol === '/api/yonetim/hatirlatma' && req.method === 'POST') {
      return send(res, 200, { gonderilen: await hatirlatmalariGonder(db) });
    }

    /* ?bas=YYYY-MM-DD&bit=YYYY-MM-DD&ulke=TR — rapor süzgeci (bkz. lib/gosterge.mjs). */
    if (yol === '/api/yonetim/ozet' && req.method === 'GET') {
      const q = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      return send(res, 200, { ...await gostergeHesapla(db, q), yedek: sonYedek(), video: await videoDurumu(db) });
    }

    /* Ulusal Ajans raporu için gösterge özeti — Excel (?dil=tr|en). PDF: istemcideki yazdırılabilir rapor sayfası. */
    if (yol === '/api/yonetim/rapor.xlsx' && req.method === 'GET') {
      const q = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const { dosya, veri } = await raporXlsx(db, q.dil, q);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${dosya}"`, 'Content-Length': veri.length,
      });
      res.end(veri);
      return true;
    }

    /* Ortak dillerinde eskimiş / eksik çeviriler (içerik ekranının üstünde gösterilir). */
    if (yol === '/api/yonetim/ceviri' && req.method === 'GET') return send(res, 200, { diller: ceviriDurumu() });

    /* İçerik ekranı: tam içerik (doğru cevaplar dahil) okunur, bütünüyle kaydedilir. */
    if (yol === '/api/yonetim/icerik' && req.method === 'GET') return send(res, 200, yoneticiIcerigi());
    if (yol === '/api/yonetim/icerik' && req.method === 'PUT') {
      await icerikKaydet(db, await govde(req, 2_000_000));
      return send(res, 200, yoneticiIcerigi());
    }

    if (yol === '/api/yonetim/uyeler.csv' && req.method === 'GET') {
      const satirlar = await db.all(`
        SELECT u.ad, u.eposta, u.ulke, u.rol, u.dogum_yili, u.az_firsat, u.olusturma, u.son_giris, u.giris_sayisi, u.aktif_sn,
          (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL) AS bolum,
          (SELECT MAX(puan) FROM denemeler d WHERE d.uye_id = u.id) AS test,
          (SELECT kod FROM sertifikalar s WHERE s.uye_id = u.id) AS sertifika
        FROM uyeler u WHERE u.yonetici = 0 ORDER BY u.olusturma`);
      const tarih = t => (t ? new Date(Number(t)).toISOString().slice(0, 10) : '');
      const hucre = v => {
        let s = String(v ?? '');
        if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // CSV formül enjeksiyonu
        return /[";\n,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const baslik = ['Ad', 'E-posta', 'Ülke', 'Rol', 'Doğum yılı', 'Daha az fırsat', 'Kayıt', 'Son giriş', 'Giriş sayısı',
        'Süre (dk)', `Bölüm (/${guncel().bolumler.length})`, 'Test (en iyi)', 'Sertifika'];
      const govde = satirlar.map(r => [r.ad, r.eposta, r.ulke, r.rol, r.dogum_yili, r.az_firsat ? 'evet' : '', tarih(r.olusturma),
        tarih(r.son_giris), r.giris_sayisi, Math.round(r.aktif_sn / 60), r.bolum, r.test ?? '', r.sertifika ?? '']);
      const csv = '﻿' + [baslik, ...govde].map(s => s.map(hucre).join(';')).join('\r\n');
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="akademi-katilimcilar-${new Date().toISOString().slice(0, 10)}.csv"`,
      });
      res.end(csv);
      return true;
    }
  };
}
