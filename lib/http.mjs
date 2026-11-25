import { createHash } from 'node:crypto';
import { origin, basePath, secure, trustProxy, OTURUM_GUN } from './ayar.mjs';

/**
 * HTTP katmanının ortak parçaları. `send` DOĞRU döner: bir route işleyicisi
 * isteği karşıladığını `return send(...)` ile bildirir; karşılamazsa hiçbir
 * şey döndürmez ve sıra bir sonrakine geçer (server.mjs).
 */
export class Hata extends Error {
  constructor(kod, durum = 400) { super(kod); this.kod = kod; this.durum = durum; }
}

export const send = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
  return true;
};

export const ozet = token => createHash('sha256').update(token).digest('hex');

const CEREZ = 'akademi';
export const oturumCerezi = (token, sil = false) =>
  `${CEREZ}=${sil ? '' : token}; HttpOnly; SameSite=Lax; Path=${basePath || '/'}; Max-Age=${sil ? 0 : OTURUM_GUN * 86400}${secure ? '; Secure' : ''}`;

export const oturumJetonu = req =>
  (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(CEREZ + '='))?.slice(CEREZ.length + 1) || '';

/* Vekil adresi X-Forwarded-For zincirinin SONUNA ekler; baştakini istemci yazmış olabilir. */
export function istemciAdresi(req) {
  if (!trustProxy) return req.socket.remoteAddress || '?';
  const zincir = String(req.headers['x-forwarded-for'] || '').split(',').map(x => x.trim()).filter(Boolean);
  return zincir.at(-1) || req.socket.remoteAddress || '?';
}

/* CSRF: yazma isteklerinde Origin başlığı bu sitenin kendisi olmalı. */
export function ayniKoken(req) {
  const kaynak = req.headers.origin;
  if (!kaynak) return false;
  if (kaynak === origin) return true;
  try { return !!req.headers.host && new URL(kaynak).host === req.headers.host; } catch { return false; }
}

export async function govde(req, sinir = 32000) {
  let veri = '';
  for await (const parca of req) {
    veri += parca;
    if (Buffer.byteLength(veri) > sinir) throw new Hata('istek_buyuk', 413);
  }
  try {
    const j = JSON.parse(veri || '{}');
    if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error();
    return j;
  } catch { throw new Hata('istek_gecersiz'); }
}

/* Sabit pencereli deneme sayacı (giriş, kayıt). Süreç içi bellekte. */
const denemeler = new Map();
export function cokDeneme(anahtarlar) {
  const simdi = Date.now();
  for (const [k, v] of denemeler) if (v.bitis < simdi) denemeler.delete(k);
  for (const [k, sinir] of anahtarlar) {
    const kayit = denemeler.get(k) || { sayi: 0, bitis: simdi + 15 * 60 * 1000 };
    if (kayit.sayi >= sinir) return true;
    kayit.sayi++; denemeler.set(k, kayit);
  }
  return false;
}
export const denemeSifirla = anahtarlar => { for (const k of anahtarlar) denemeler.delete(k); };
