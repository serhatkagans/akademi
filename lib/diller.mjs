import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

/**
 * Diller. tr ve en içerik dosyalarının içindedir; ortak dilleri (it, ro, pt, da)
 * icerik/diller/<kod>.mjs dosyalarındadır ve bölüm/adım KİMLİKLERİNE göre içeriğe
 * bindirilir. Böylece yönetici Türkçe/İngilizce içeriği düzenlese de çeviriler
 * silinmez; çevirisi olmayan (ör. yeni eklenen) metin İngilizce görünür.
 * Çeviriler makine çevirisidir; her ülkeden bir ortağın gözden geçirmesi önerilir.
 */
export const DILLER = ['tr', 'en', 'it', 'ro', 'pt', 'da'];
export const ORTAK = ['it', 'ro', 'pt', 'da'];
export const gecerliDil = d => (DILLER.includes(d) ? d : 'en');

const klasor = join(dirname(fileURLToPath(import.meta.url)), '..', 'icerik', 'diller');
const yuklu = {};
const izKayitlari = {};
export async function dillerYukle() {
  for (const d of ORTAK) {
    const f = join(klasor, d + '.mjs');
    if (!existsSync(f)) continue;
    try { yuklu[d] = (await import(pathToFileURL(f).href)).default; } catch (e) { console.error(`Çeviri okunamadı (${d}):`, e.message); }
    /* Çevirinin yapıldığı İngilizce metnin izleri (lib/ceviri-iz.mjs); yoksa eskime denetlenmez. */
    const izf = join(klasor, d + '.iz.json');
    if (existsSync(izf)) try { izKayitlari[d] = JSON.parse(readFileSync(izf, 'utf8')); } catch (e) { console.error(`Çeviri izi okunamadı (${d}):`, e.message); }
  }
}
export const ceviri = d => yuklu[d] || null;
export const ceviriIzi = d => izKayitlari[d] || null;
export const yukluDiller = () => ['tr', 'en', ...ORTAK.filter(d => yuklu[d])];
