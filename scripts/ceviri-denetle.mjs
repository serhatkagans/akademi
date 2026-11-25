/**
 * Çeviri denetimi: node scripts/ceviri-denetle.mjs <it|ro|pt|da> [...]
 * İngilizce kaynakla karşılaştırır:
 *   - arayüz (client/src/diller/<kod>.js): her anahtar var ve boş değil; {yer tutucular} aynı;
 *     HTML etiketleri aynı; gizlilik bölüm sayısı aynı
 *   - içerik (icerik/diller/<kod>.mjs): her bölüm/adım/alan var; dizi uzunlukları aynı
 *     (hedefler, sorular, seçenekler, kartlar); HTML etiket dizisi aynı; test, anket, kanvas, posta tam
 * Hata yoksa 0, varsa 1 ile çıkar.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { METIN } from '../client/src/dil.js';
import { GIZLILIK } from '../client/src/gizlilik-metin.js';
import { openDb } from '../lib/db.mjs';
import { icerikYukle, guncel } from '../lib/icerik.mjs';
import { ANKET, KANVAS } from '../icerik/modul.mjs';
/* Güncel içerik: yönetim ekranında kaydedilen (veritabanı), yoksa başlangıç içeriği. */
const _db = await openDb();
await icerikYukle(_db);
const { bolumler: BOLUMLER, test: TEST } = guncel();
import { SABLON } from '../lib/posta.mjs';

const yer = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
const etiket = s => [...String(s).matchAll(/<\/?([a-z0-9]+)/gi)].map(m => m[0].toLowerCase()).join('');
const en = m => (m && typeof m === 'object' && 'en' in m ? m.en : m);

let toplamHata = 0;
for (const kod of process.argv.slice(2)) {
  const h = [];
  const bak = (yol, kaynak, hedef, { html = false } = {}) => {
    if (typeof hedef !== 'string' || !hedef.trim()) { if (String(kaynak ?? '').trim()) h.push(`${yol}: eksik`); return; }
    if (yer(kaynak) !== yer(hedef)) h.push(`${yol}: yer tutucular farklı (${yer(kaynak)} ≠ ${yer(hedef)})`);
    if (html && etiket(kaynak) !== etiket(hedef)) h.push(`${yol}: HTML etiketleri farklı`);
    if (!html && /<[a-z]/i.test(kaynak) && etiket(kaynak) !== etiket(hedef)) h.push(`${yol}: HTML etiketleri farklı`);
  };

  /* Arayüz */
  let ui;
  try { ui = await import(pathToFileURL(resolve(`client/src/diller/${kod}.js`)).href); } catch (e) { h.push('arayüz dosyası: ' + e.message); }
  if (ui) {
    for (const [k, v] of Object.entries(METIN.en)) bak('arayüz.' + k, v, ui.default?.[k]);
    for (const k of Object.keys(ui.default || {})) if (!(k in METIN.en)) h.push(`arayüz.${k}: kaynakta olmayan anahtar`);
    if (!Array.isArray(ui.gizlilik) || ui.gizlilik.length !== GIZLILIK.en.length) h.push(`gizlilik: ${GIZLILIK.en.length} bölüm olmalı`);
    else ui.gizlilik.forEach((b, i) => { bak(`gizlilik.${i}.baslik`, GIZLILIK.en[i][0], b?.[0]); bak(`gizlilik.${i}.metin`, GIZLILIK.en[i][1], b?.[1]); });
  }

  /* İçerik */
  let ic;
  try { ic = (await import(pathToFileURL(resolve(`icerik/diller/${kod}.mjs`)).href)).default; } catch (e) { h.push('içerik dosyası: ' + e.message); }
  if (ic) {
    for (const b of BOLUMLER) {
      const tb = ic.bolumler?.[b.id];
      const y = `bolum.${b.id}`;
      if (!tb) { h.push(`${y}: eksik`); continue; }
      bak(y + '.baslik', en(b.baslik), tb.baslik); bak(y + '.ozet', en(b.ozet), tb.ozet);
      if ((tb.hedefler || []).length !== (b.hedefler?.en || []).length) h.push(`${y}.hedefler: ${b.hedefler.en.length} madde olmalı`);
      (b.hedefler?.en || []).forEach((x, i) => bak(`${y}.hedefler.${i}`, x, tb.hedefler?.[i]));
      for (const a of b.adimlar) {
        const ta = tb.adimlar?.[a.id];
        const ay = `${y}.${a.id}`;
        if (!ta) { h.push(`${ay}: eksik`); continue; }
        bak(ay + '.baslik', en(a.baslik), ta.baslik);
        if (a.govde) bak(ay + '.govde', en(a.govde), ta.govde, { html: true });
        if (a.not) bak(ay + '.not', en(a.not), ta.not);
        if (a.tur === 'ornek') { if (typeof a.kurulus === 'object') bak(ay + '.kurulus', en(a.kurulus), ta.kurulus); bak(ay + '.yer', en(a.yer), ta.yer); bak(ay + '.ders', en(a.ders), ta.ders); }
        if (a.tur === 'etkinlik') { bak(ay + '.soru', en(a.soru), ta.soru); bak(ay + '.ipucu', en(a.ipucu), ta.ipucu); }
        if (a.kartlar) {
          if ((ta.kartlar || []).length !== a.kartlar.length) h.push(`${ay}.kartlar: ${a.kartlar.length} kart olmalı`);
          a.kartlar.forEach((k, i) => { bak(`${ay}.kartlar.${i}.on`, en(k.on), ta.kartlar?.[i]?.on); bak(`${ay}.kartlar.${i}.arka`, en(k.arka), ta.kartlar?.[i]?.arka); });
        }
        if (a.sorular) {
          if ((ta.sorular || []).length !== a.sorular.length) h.push(`${ay}.sorular: ${a.sorular.length} soru olmalı`);
          a.sorular.forEach((q, i) => {
            const tq = ta.sorular?.[i] || {};
            bak(`${ay}.sorular.${i}.soru`, en(q.soru), tq.soru);
            if (q.aciklama) bak(`${ay}.sorular.${i}.aciklama`, en(q.aciklama), tq.aciklama);
            if (q.secenekler) {
              if ((tq.secenekler || []).length !== q.secenekler.length) h.push(`${ay}.sorular.${i}.secenekler: ${q.secenekler.length} seçenek olmalı`);
              q.secenekler.forEach((s, k) => bak(`${ay}.sorular.${i}.secenekler.${k}`, en(s), tq.secenekler?.[k]));
            }
          });
        }
      }
    }
    if ((ic.test || []).length !== TEST.length) h.push(`test: ${TEST.length} soru olmalı`);
    TEST.forEach((q, i) => {
      bak(`test.${i}.soru`, en(q.soru), ic.test?.[i]?.soru);
      if ((ic.test?.[i]?.secenekler || []).length !== q.secenekler.length) h.push(`test.${i}.secenekler: ${q.secenekler.length} olmalı`);
      q.secenekler.forEach((s, k) => bak(`test.${i}.secenekler.${k}`, en(s), ic.test?.[i]?.secenekler?.[k]));
    });
    for (const m of ANKET) bak('anket.' + m.id, m.en, ic.anket?.[m.id]);
    for (const k of KANVAS) { bak(`kanvas.${k.id}.ad`, k.en, ic.kanvas?.[k.id]?.ad); bak(`kanvas.${k.id}.ip`, k.ip.en, ic.kanvas?.[k.id]?.ip); }
    for (const t of ['sertifika', 'hatirlatma', 'sifirlama']) {
      bak(`posta.${t}.konu`, SABLON.en[t].konu, ic.posta?.[t]?.konu);
      bak(`posta.${t}.metin`, SABLON.en[t].metin, ic.posta?.[t]?.metin);
    }
    bak('posta.hatirlatma.siradaki', SABLON.en.hatirlatma.siradaki, ic.posta?.hatirlatma?.siradaki);
    bak('posta.alt', SABLON.en.alt, ic.posta?.alt);
  }

  console.log(`\n== ${kod}: ${h.length ? h.length + ' sorun' : 'TAMAM'}`);
  h.slice(0, 60).forEach(x => console.log('  - ' + x));
  if (h.length > 60) console.log(`  … ve ${h.length - 60} sorun daha`);
  toplamHata += h.length;
}
process.exit(toplamHata ? 1 : 0);
