import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Hata } from './http.mjs';
import { MIN_PAROLA } from './ayar.mjs';
import { ULKELER, ROLLER } from '../icerik/modul.mjs';
import { DILLER } from './diller.mjs';

/* Parola: scrypt + kayıt başına tuz; karşılaştırma sabit sürede. */
export function parolaOzeti(p) {
  const tuz = randomBytes(16).toString('hex');
  return tuz + ':' + scryptSync(p, tuz, 64).toString('hex');
}
export function parolaDogru(p, ozet) {
  const [tuz, anahtar] = String(ozet).split(':');
  if (!tuz || !/^[0-9a-f]{128}$/.test(anahtar || '')) return false;
  return timingSafeEqual(scryptSync(String(p), tuz, 64), Buffer.from(anahtar, 'hex'));
}

export const yas = dogumYili => new Date().getFullYear() - dogumYili;

/**
 * Kayıt formunun denetimi. Hata kodları istemcide çevrilir (dil.js · hata.*).
 * - 13 yaşından küçük kayıt olamaz; 18 yaş altı veli onayı ister (GDPR md. 8, KVKK).
 * - "Daha az fırsat" isteğe bağlı öz beyandır; yalnızca istatistik için.
 */
export function kayitDenetle(g) {
  const eposta = String(g.eposta || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(eposta)) throw new Hata('eposta');
  const parola = String(g.parola || '');
  if (parola.length < MIN_PAROLA || parola.length > 200) throw new Hata('parola');
  const ad = String(g.ad || '').trim().replace(/\s+/g, ' ');
  if (ad.length < 2 || ad.length > 100) throw new Hata('ad');
  if (!ULKELER.includes(g.ulke)) throw new Hata('ulke');
  if (!ROLLER.includes(g.rol)) throw new Hata('rol');
  const yil = Number(g.dogumYili);
  const buYil = new Date().getFullYear();
  if (!Number.isInteger(yil) || yil < buYil - 100 || yil > buYil) throw new Hata('dogum');
  if (yas(yil) < 13) throw new Hata('yas_kucuk');
  if (g.onay !== true) throw new Hata('onay');
  if (yas(yil) < 18 && g.veliOnayi !== true) throw new Hata('veli');
  return {
    eposta, parola, ad, ulke: g.ulke, rol: g.rol, dogumYili: yil,
    azFirsat: g.azFirsat === true ? 1 : 0,
    veliOnayi: g.veliOnayi === true ? 1 : 0,
    dil: DILLER.includes(g.dil) ? g.dil : 'tr',
  };
}
