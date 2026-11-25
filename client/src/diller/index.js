/**
 * Ortak dilleri (it, ro, pt, da) — arayüz metinleri. Her dil kendi dosyasında
 * (diller/<kod>.js: varsayılan dışa aktarım = anahtar → metin, `gizlilik` = aydınlatma metni).
 * Dosyası olmayan dil seçicide "…" ile görünür ve seçilemez. Eksik anahtar İngilizceye düşer.
 */
import { METIN } from '../dil.js';

const dosyalar = import.meta.glob('./[a-z][a-z].js', { eager: true });
export const GIZLILIK_ORTAK = {};
export const HAZIR_DILLER = new Set(['tr', 'en']);
for (const [yol, mod] of Object.entries(dosyalar)) {
  const kod = yol.slice(2, 4);
  METIN[kod] = mod.default;
  if (mod.gizlilik) GIZLILIK_ORTAK[kod] = mod.gizlilik;
  HAZIR_DILLER.add(kod);
}
