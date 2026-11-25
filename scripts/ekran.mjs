/**
 * Ekran görüntüleri (gözden geçirme için): görünmez Chrome'u DevTools protokolüyle
 * sürer, test hesabıyla giriş yapar, sayfaları masaüstü ve telefon genişliğinde çeker.
 *   node scripts/ekran.mjs <çıktı-klasörü> <eposta> <parola> [#/yol ...]
 * Yalnızca yerel geliştirme sunucusu (localhost) içindir.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [cikti, eposta, parola, ...yollar] = process.argv.slice(2);
const ADRES = process.env.ADRES || 'http://localhost:3120';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
mkdirSync(cikti, { recursive: true });

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--hide-scrollbars',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ekran-'))}`, 'about:blank'], { stdio: 'ignore' });
const bekle = ms => new Promise(r => setTimeout(r, ms));

let hedef;
for (let i = 0; i < 50 && !hedef; i++) {
  try { hedef = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { await bekle(200); }
}
const ws = new WebSocket(hedef.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let sira = 0; const bekleyen = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') console.error('SAYFA HATASI:', m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.error('KONSOL:', m.params.args.map(a => a.value ?? a.description).join(' '));
  bekleyen.get(m.id)?.(m); bekleyen.delete(m.id);
});
const cdp = (method, params = {}) => new Promise(r => { const id = ++sira; bekleyen.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

/* Giriş: API'den oturum çerezi alınıp tarayıcıya yazılır. */
const g = await fetch(`${ADRES}/api/giris`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ADRES }, body: JSON.stringify({ eposta, parola }) });
const cerez = g.headers.get('set-cookie')?.split(';')[0].split('=');
await cdp('Network.enable');
/* TEMA=yesil ile ikinci tema denenir (seçim tarayıcıda saklandığı gibi). */
await cdp('Page.enable');
if (process.env.TEMA) await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('tema',${JSON.stringify(process.env.TEMA)})}catch(e){}` });
/* DIL=it gibi: arayüz dili (tarayıcıda saklandığı gibi). */
if (process.env.DIL) await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('dil',${JSON.stringify(process.env.DIL)})}catch(e){}` });
await cdp('Runtime.enable');
if (cerez) await cdp('Network.setCookie', { name: cerez[0], value: cerez[1], url: ADRES });

const GENISLIK = { masaustu: [1366, 900, false], telefon: [390, 844, true] };
for (const yol of yollar.length ? yollar : ['#/']) {
  for (const [ad, [w, h, mobil]] of Object.entries(GENISLIK)) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mobil });
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${ADRES}/${yol}` });
    await bekle(2500);
    const { result } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: w, height: Math.min(4000, (await cdp('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result.result.value), scale: 1 } });
    const dosya = join(cikti, `${yol.replace(/[#/]+/g, '_').replace(/^_|_$/g, '') || 'tanitim'}-${ad}.png`);
    writeFileSync(dosya, Buffer.from(result.data, 'base64'));
    console.log(dosya);
  }
}
ws.close(); chrome.kill();
