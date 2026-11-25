/**
 * Erişilebilirlik taraması (WCAG 2.1 A/AA, axe-core): görünmez Chrome sayfaları açar,
 * axe-core'u enjekte eder, ihlalleri listeler.
 *   node scripts/erisim.mjs <eposta> <parola> [#/yol ...]      (TEMA=yesil, DIL=it ile de denenir)
 * Yalnızca yerel geliştirme sunucusu (localhost) içindir. Otomatik tarama sorunların bir
 * kısmını bulur; klavye ve ekran okuyucuyla elle deneme yine gerekir.
 */
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const [eposta, parola, ...yollar] = process.argv.slice(2);
const ADRES = process.env.ADRES || 'http://localhost:3120';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'erisim-'))}`, 'about:blank'], { stdio: 'ignore' });
const bekle = ms => new Promise(r => setTimeout(r, ms));
let hedef;
for (let i = 0; i < 50 && !hedef; i++) {
  try { hedef = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { await bekle(200); }
}
const ws = new WebSocket(hedef.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let sira = 0; const bekleyen = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); bekleyen.get(m.id)?.(m); bekleyen.delete(m.id); });
const cdp = (method, params = {}) => new Promise(r => { const id = ++sira; bekleyen.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const degerlendir = async ifade => (await cdp('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true })).result.result.value;

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
if (process.env.TEMA) await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('tema',${JSON.stringify(process.env.TEMA)})}catch(e){}` });
if (process.env.DIL) await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('dil',${JSON.stringify(process.env.DIL)})}catch(e){}` });
if (eposta && eposta !== '-') {
  const g = await fetch(`${ADRES}/api/giris`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ADRES }, body: JSON.stringify({ eposta, parola }) });
  const c = g.headers.get('set-cookie')?.split(';')[0].split('=');
  if (c) await cdp('Network.setCookie', { name: c[0], value: c[1], url: ADRES });
}

let toplam = 0;
for (const [ad, w, h, mobil] of [['masaüstü', 1366, 900, false], ['telefon', 390, 844, true]]) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mobil });
  for (const yol of yollar.length ? yollar : ['#/']) {
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${ADRES}/${yol}` });
    await bekle(2500);
    await degerlendir(AXE + ';0');
    const sonuc = await degerlendir(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] },
      exclude: [['iframe']] }).then(r => r.violations.map(v => ({ id: v.id, etki: v.impact, yardim: v.help,
      ornek: v.nodes.slice(0, 3).map(n => n.target.join(' ') + (n.any[0]?.message ? ' — ' + n.any[0].message : '')), sayi: v.nodes.length })))`);
    console.log(`\n== ${yol} (${ad}): ${sonuc.length ? sonuc.length + ' kural ihlali' : 'TEMİZ'}`);
    for (const v of sonuc) {
      console.log(`  [${v.etki}] ${v.id} (${v.sayi}) — ${v.yardim}`);
      v.ornek.forEach(o => console.log('      · ' + o.slice(0, 220)));
    }
    toplam += sonuc.length;
  }
}
ws.close(); chrome.kill();
process.exit(toplam ? 1 : 0);
