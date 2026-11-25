import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { openDb } from './lib/db.mjs';
import { send, ozet, oturumJetonu, ayniKoken, Hata } from './lib/http.mjs';
import { port, basePath } from './lib/ayar.mjs';
import { ULKELER, KANVAS } from './icerik/modul.mjs';
import { istemciIcerigi, icerikYukle } from './lib/icerik.mjs';
import { grupRoutes } from './routes/grup.mjs';
import { gizliYukle } from './lib/posta.mjs';
import { dillerYukle, gecerliDil, ceviri, yukluDiller } from './lib/diller.mjs';
import { hatirlatmalariGonder } from './lib/hatirlatma.mjs';
import { yedekZamanla } from './lib/yedek.mjs';
import { kaynakRoutes } from './routes/kaynak.mjs';
import { hesapRoutes } from './routes/hesap.mjs';
import { ogrenmeRoutes, dogrulaRoutes } from './routes/ogrenme.mjs';
import { yonetimRoutes } from './routes/yonetim.mjs';

/**
 * E-YOUTHPRENEUR Akademi sunucusu. Yönetim platformundan (erasmusreact) BAĞIMSIZDIR:
 * ayrı veritabanı, ayrı hesaplar. Arayüz `dist/` altındaki tek sayfalık React
 * uygulamasıdır; sayfalar adresin # kısmıyla seçilir, bu yüzden sunucu yalnızca
 * index.html'i ve varlıkları sunar.
 */
const db = await openDb();
await icerikYukle(db);
await dillerYukle();
await gizliYukle(db);
/* "Kaldığın yerden devam et" hatırlatmaları saatte bir (ilk tur açılıştan 1 dk sonra). */
const hatirlat = () => hatirlatmalariGonder(db).catch(e => console.error('Hatırlatma:', e.message));
if (process.env.HATIRLATMA !== 'kapali') { setTimeout(hatirlat, 60000).unref(); setInterval(hatirlat, 3600000).unref(); }
yedekZamanla(db);
const zincir = [hesapRoutes({ db }), ogrenmeRoutes({ db }), dogrulaRoutes({ db }), grupRoutes({ db }), kaynakRoutes({ db }), yonetimRoutes({ db })];
const DIST = resolve('dist');

const TURLER = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.json': 'application/json',
};

/* YouTube oynatıcısı: gizlilik odaklı alan adı (youtube-nocookie) ve IFrame API betiği. */
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.youtube.com https://s.ytimg.com",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "img-src 'self' data: https://i.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

async function uyeBul(req) {
  const t = oturumJetonu(req);
  if (!t) return null;
  const u = await db.get(
    `SELECT u.* FROM oturumlar o JOIN uyeler u ON u.id = o.uye_id WHERE o.token = ? AND o.bitis > ?`, [ozet(t), Date.now()]);
  return u || null;
}

async function statik(req, res, yol) {
  let dosya = yol === '/' ? '/index.html' : yol;
  const tam = normalize(join(DIST, dosya));
  if (!tam.startsWith(DIST) || !existsSync(tam) || !statSync(tam).isFile()) dosya = '/index.html';
  const hedef = dosya === '/index.html' ? join(DIST, 'index.html') : tam;
  if (!existsSync(hedef)) { res.writeHead(503); res.end('Arayüz derlenmemiş: npm run build'); return; }
  const veri = await readFile(hedef);
  const uzun = hedef.includes(`${join(DIST, 'assets')}`);
  res.writeHead(200, {
    'Content-Type': TURLER[extname(hedef)] || 'application/octet-stream',
    'Cache-Control': uzun ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  res.end(req.method === 'HEAD' ? undefined : veri);
}

createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  try {
    const url = new URL('http://x' + (req.url.startsWith('/') ? req.url : '/' + req.url)); // "//" gibi adresler 500 vermesin
    let yol = decodeURIComponent(url.pathname);
    /* Vekil öneki soymadan iletirse (ör. /akademi/api/... → 127.0.0.1) önek burada atılır. */
    if (basePath && (yol === basePath || yol.startsWith(basePath + '/'))) yol = yol.slice(basePath.length) || '/';

    if (yol.startsWith('/api/')) {
      if (!['GET', 'HEAD'].includes(req.method) && !ayniKoken(req)) throw new Hata('koken', 403);
      if (yol === '/api/icerik' && req.method === 'GET') {
        const dil = gecerliDil(url.searchParams.get('dil'));
        const TK = ceviri(dil)?.kanvas || {};
        return send(res, 200, { ...istemciIcerigi(dil), ulkeler: ULKELER, diller: yukluDiller(),
          kanvas: KANVAS.map(k => ({ id: k.id, ad: TK[k.id]?.ad || k[dil] || k.en, ip: TK[k.id]?.ip || k.ip[dil] || k.ip.en, kisa: !!k.kisa })) });
      }
      const uye = await uyeBul(req);
      for (const r of zincir) if (await r(req, res, yol, uye)) return;
      return send(res, 404, { hata: 'bulunamadi' });
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    await statik(req, res, yol);
  } catch (e) {
    if (e instanceof Hata) return send(res, e.durum, { hata: e.kod });
    console.error(e);
    if (!res.headersSent) send(res, 500, { hata: 'sunucu' });
  }
}).listen(port, () => console.log(`Akademi: http://localhost:${port}`));
