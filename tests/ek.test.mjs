/* İkinci tur: defter, gruplar, içerik ekranı, kaynaklar. Geçici veritabanıyla gerçek sunucu. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { temizHtml } from '../lib/icerik.mjs';
import { BOLUMLER } from '../icerik/modul.mjs';

/* Bir bölümün bütün adımlarını türüne göre tamamlar. */
async function bolumuBitir(a, id) {
  const b = BOLUMLER.find(x => x.id === id);
  for (const s of b.adimlar) {
    const y = `ogren/adim/${b.id}/${s.id}`;
    if (s.tur === 'video') { await a(y + '/video', { method: 'POST', govde: { sn: 500, sure: 500 } }); for (const [i, q] of s.sorular.entries()) await a(y + '/soru', { method: 'POST', govde: { soru: i, cevap: q.dogru } }); }
    else if (s.tur === 'sina') for (const [i, q] of s.sorular.entries()) await a(y + '/soru', { method: 'POST', govde: { soru: i, cevap: q.dogru } });
    else if (s.tur === 'etkinlik') await a('ogren/not', { method: 'POST', govde: { anahtar: `adim:${b.id}:${s.id}`, metin: 'x' } });
    else await a(y + '/goruldu', { method: 'POST', govde: {} });
  }
}

const PORT = 3700 + Math.floor(Math.random() * 500);
const ADRES = `http://localhost:${PORT}`;
const dir = mkdtempSync(join(tmpdir(), 'akademi-ek-'));
const ortam = { ...process.env, DATA_DIR: dir, DATABASE_URL: '', HATIRLATMA: 'kapali', YEDEK: 'kapali', SMTP_HOST: '', KAYIT_SINIR: '1000' };
let sunucu;

function istemci() {
  let cerez = '';
  const f = async (yol, { method = 'GET', govde, ham, basliklar = {} } = {}) => {
    const r = await fetch(ADRES + '/api/' + yol, {
      method, headers: { ...(ham ? {} : { 'Content-Type': 'application/json' }), Origin: ADRES, Cookie: cerez, ...basliklar },
      body: ham ?? (govde ? JSON.stringify(govde) : undefined),
    });
    const c = r.headers.get('set-cookie');
    if (c) cerez = c.split(';')[0];
    const tur = r.headers.get('content-type') || '';
    return { durum: r.status, veri: tur.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
  };
  return f;
}
async function kaydol(ek = {}) {
  const a = istemci();
  const r = await a('kayit', { method: 'POST', govde: { ad: 'Kişi ' + Math.random().toString(36).slice(2, 6), eposta: `k${Math.random()}@ornek.test`,
    parola: 'gizli-parola-1', ulke: 'TR', dogumYili: 2000, rol: 'genc', onay: true, ...ek } });
  assert.equal(r.durum, 201);
  return a;
}
async function yonetici() {
  const e = `y${Math.random()}@ornek.test`;
  const out = execFileSync(process.execPath, ['scripts/yonetici.mjs', 'ekle', e, 'Yönetici'], { env: ortam }).toString();
  const a = istemci();
  assert.equal((await a('giris', { method: 'POST', govde: { eposta: e, parola: out.match(/Parola: (\S+)/)[1] } })).durum, 200);
  return a;
}

before(async () => {
  sunucu = spawn(process.execPath, ['server.mjs'], { env: { ...ortam, PORT: String(PORT) }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) { try { await fetch(ADRES + '/api/ben'); return; } catch { await new Promise(r => setTimeout(r, 100)); } }
  throw new Error('sunucu açılmadı');
});
after(async () => {
  const c = new Promise(r => sunucu.once('exit', r)); sunucu.kill(); await c;
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* geçici */ }
});

test('HTML süzgeci: betik ve öznitelikler gider, biçim kalır', () => {
  assert.equal(temizHtml('<p onclick="x()">a<script>alert(1)</script><strong>b</strong></p>'), '<p>aalert(1)<strong>b</strong></p>');
  assert.equal(temizHtml('<a href="javascript:alert(1)">x</a>'), '<a>x</a>');
  assert.equal(temizHtml('<a href="https://ec.europa.eu">x</a>'), '<a href="https://ec.europa.eu" target="_blank" rel="noopener noreferrer">x</a>');
  assert.equal(temizHtml('1 < 2 & <img src=x onerror=y>'), '1 &lt; 2 &amp; ');
});

test('proje fikri defteri: kaydet, oku, sil; başkası göremez', async () => {
  const a = await kaydol(), b = await kaydol();
  assert.equal((await a('ogren/not', { method: 'POST', govde: { anahtar: 'kanva:sorun', metin: 'Plastik atık' } })).durum, 200);
  assert.equal((await a('ogren/not', { method: 'POST', govde: { anahtar: 'adim:yesil:yesil-etkinlik', metin: 'Şişeler' } })).durum, 200);
  assert.equal((await a('ogren/not', { method: 'POST', govde: { anahtar: 'baska:sey', metin: 'x' } })).durum, 400);
  const n = (await a('ogren/notlar')).veri;
  assert.equal(n['kanva:sorun'].metin, 'Plastik atık');
  assert.deepEqual((await b('ogren/notlar')).veri, {});
  await a('ogren/not', { method: 'POST', govde: { anahtar: 'kanva:sorun', metin: '' } });
  assert.equal((await a('ogren/notlar')).veri['kanva:sorun'], undefined);
});

test('gruplar: yalnızca eğitmen açar, genç kodla katılır, eğitmen e-posta görmez', async () => {
  const genc = await kaydol();
  assert.equal((await genc('grup', { method: 'POST', govde: { ad: 'Deneme' } })).durum, 403);
  const egitmen = await kaydol({ rol: 'genclik' });
  assert.equal((await egitmen('grup', { method: 'POST', govde: { ad: 'Ankara pilot' } })).durum, 201);
  const g = (await egitmen('grup')).veri.gruplar[0];
  assert.match(g.kod, /^[A-Z0-9]{6}$/);
  assert.equal((await genc('grup/katil', { method: 'POST', govde: { kod: 'YANLIS' } })).durum, 404);
  assert.equal((await genc('grup/katil', { method: 'POST', govde: { kod: g.kod.toLowerCase() } })).veri.ad, 'Ankara pilot');
  await bolumuBitir(genc, 'baslarken');
  const uyeler = (await egitmen('grup')).veri.gruplar[0].uyeler;
  assert.equal(uyeler.length, 1);
  assert.equal(uyeler[0].bolum, 1);
  assert.equal('eposta' in uyeler[0], false);
  assert.equal((await genc('grup')).veri.benim.ad, 'Ankara pilot');
  await genc('grup/ayril', { method: 'POST' });
  assert.equal((await egitmen('grup')).veri.gruplar[0].uyeler.length, 0);
});

test('içerik ekranı: yalnızca yönetici; kaydedilen içerik hemen geçerli; bozuk içerik reddedilir', async () => {
  const genc = await kaydol();
  assert.equal((await genc('yonetim/icerik')).durum, 403);
  const y = await yonetici();
  const ic = (await y('yonetim/icerik')).veri;
  assert.equal(ic.test[0].dogru, 0, 'yönetici doğru cevapları görür');
  ic.bolumler[0].baslik.tr = 'Hoş geldin';
  ic.bolumler[0].adimlar[0].govde.tr = '<p>Merhaba<script>x</script></p>';
  ic.bolumler.push({ id: 'yeni-bolum', renk: 'mor', simge: 'roket', dakika: 5, baslik: { tr: 'Yeni', en: 'New' }, ozet: { tr: 'a', en: 'a' },
    okuma: { tr: '<p>x</p>', en: '' }, gorev: { tr: '', en: '' }, video: null });
  assert.equal((await y('yonetim/icerik', { method: 'PUT', govde: ic })).durum, 200);
  const istemciye = (await (await fetch(ADRES + '/api/icerik?dil=tr')).json());
  assert.equal(istemciye.bolumler[0].baslik, 'Hoş geldin');
  assert.equal(istemciye.bolumler[0].adimlar[0].govde, '<p>Merhabax</p>');
  assert.deepEqual(istemciye.bolumler[6].adimlar.map(x => x.tur), ['metin'], 'eski biçimdeki bölüm adımlara çevrilir');
  assert.equal(JSON.stringify(istemciye.bolumler).includes('"dogru"'), false, 'adım sorularının doğru cevabı da gitmez');
  assert.equal(istemciye.bolumler.length, 7);
  assert.equal('dogru' in istemciye.test[0], false, 'istemciye doğru cevap gitmez');
  // Yeni bölüm eklenince eski "tamam" durumları yeni bölümü kapsamaz.
  assert.equal((await genc('ogren/durum')).veri.bolumler.length, 7);
  const bozuk = { ...ic, gecme: 99 };
  assert.equal((await y('yonetim/icerik', { method: 'PUT', govde: bozuk })).veri.hata, 'icerik:gecme');
});

test('kaynaklar: yönetici yükler, herkes listeler ve indirir, sayaç artar', async () => {
  const genc = await kaydol();
  const pdf = Buffer.from('%PDF-1.4\n% deneme\n');
  const bas = { 'x-dosya': encodeURIComponent('E-Kitap İyi Uygulamalar.pdf'), 'x-tur': 'ekitap', 'x-baslik-tr': encodeURIComponent('İyi Uygulamalar E-Kitabı'), 'x-baslik-en': 'Good Practices E-Book' };
  assert.equal((await genc('yonetim/kaynak', { method: 'POST', ham: pdf, basliklar: bas })).durum, 403);
  const y = await yonetici();
  assert.equal((await y('yonetim/kaynak', { method: 'POST', ham: pdf, basliklar: { ...bas, 'x-dosya': 'kotu.exe' } })).veri.hata, 'kaynak_tur');
  const { veri: { id } } = await y('yonetim/kaynak', { method: 'POST', ham: pdf, basliklar: bas });
  const liste = await (await fetch(ADRES + '/api/kaynaklar')).json();
  assert.equal(liste[0].baslik_tr, 'İyi Uygulamalar E-Kitabı');
  const indir = await fetch(`${ADRES}/api/kaynak/${id}/indir`);
  assert.equal(indir.status, 200);
  assert.match(indir.headers.get('content-disposition'), /attachment/);
  assert.deepEqual(Buffer.from(await indir.arrayBuffer()), pdf);
  assert.equal((await (await fetch(ADRES + '/api/kaynaklar')).json())[0].indirme, 1);
  assert.equal((await y('yonetim/ozet')).veri.indirme, 1);
  assert.equal((await y('yonetim/kaynak/' + id, { method: 'DELETE' })).durum, 200);
  assert.equal((await fetch(`${ADRES}/api/kaynak/${id}/indir`)).status, 404);
});

test('yönetici kullanıcı ekranı: hesap aç, parola sıfırla, yetki; kendini silemez', async () => {
  const y = await yonetici();
  const e = `egitmen${Math.random()}@ornek.test`;
  const { veri: { parola } } = await y('yonetim/uyeler', { method: 'POST', govde: { ad: 'Eğitmen Kişi', eposta: e, rol: 'genclik', ulke: 'IT' } });
  assert.match(parola, /^[A-Za-z0-9]{14}$/);
  assert.equal((await y('yonetim/uyeler', { method: 'POST', govde: { ad: 'Tekrar', eposta: e } })).veri.hata, 'eposta_var');
  const kisi = istemci();
  assert.equal((await kisi('giris', { method: 'POST', govde: { eposta: e, parola } })).durum, 200);
  const liste = (await y('yonetim/uyeler?ara=' + encodeURIComponent('eğitmen kişi'))).veri.uyeler;
  const u = liste.find(x => x.eposta === e);
  assert.ok(u, 'aramayla bulunur');
  const yeni = (await y(`yonetim/uyeler/${u.id}/parola`, { method: 'POST', govde: {} })).veri.parola;
  assert.equal((await kisi('ben')).veri.uye, null, 'parola sıfırlanınca açık oturum kapanır');
  assert.equal((await kisi('giris', { method: 'POST', govde: { eposta: e, parola: yeni } })).durum, 200);
  await y(`yonetim/uyeler/${u.id}/yetki`, { method: 'POST', govde: { yonetici: true } });
  assert.equal((await kisi('yonetim/ozet')).durum, 200, 'yetki verildi');
  const ben = (await y('yonetim/uyeler')).veri.uyeler.find(x => x.ben);
  assert.equal((await y(`yonetim/uyeler/${ben.id}`, { method: 'DELETE' })).veri.hata, 'kendin');
  assert.equal((await y(`yonetim/uyeler/${ben.id}/yetki`, { method: 'POST', govde: { yonetici: false } })).veri.hata, 'kendin');
  assert.equal((await y(`yonetim/uyeler/${u.id}`, { method: 'DELETE' })).durum, 200);
  assert.equal((await kisi('ben')).veri.uye, null);
});

test('grup listesi CSV: yalnızca eğitmeni indirir', async () => {
  const egitmen = await kaydol({ rol: 'genclik' }), genc = await kaydol(), baska = await kaydol({ rol: 'genclik' });
  await egitmen('grup', { method: 'POST', govde: { ad: 'Lizbon pilot' } });
  const g = (await egitmen('grup')).veri.gruplar[0];
  await genc('grup/katil', { method: 'POST', govde: { kod: g.kod } });
  const r = await egitmen(`grup/${g.id}/liste.csv`);
  assert.equal(r.durum, 200);
  const metin = r.veri.toString('utf8');
  assert.match(metin, /^﻿Ad;Bölüm;/);
  assert.equal(metin.split('\r\n').length, 2, 'başlık + bir katılımcı');
  assert.equal((await baska(`grup/${g.id}/liste.csv`)).durum, 404);
});

test('rozetler ilerlemeden türetilir', async () => {
  const a = await kaydol();
  assert.deepEqual((await a('ogren/durum')).veri.rozetler, []);
  await a('ogren/adim/baslarken/hosgeldin/goruldu', { method: 'POST', govde: {} });
  assert.deepEqual((await a('ogren/durum')).veri.rozetler, ['ilk-adim']);
  await bolumuBitir(a, 'baslarken');
  for (const k of ['ad', 'sorun', 'insanlar', 'cozum', 'deger', 'kaynak', 'deneme']) await a('ogren/not', { method: 'POST', govde: { anahtar: 'kanva:' + k, metin: 'x' } });
  const r = (await a('ogren/durum')).veri.rozetler;
  assert.ok(r.includes('bolum:baslarken') && r.includes('fikir-sahibi'), r.join(','));
});

test('e-posta: SMTP yokken "beklemede" kaydedilir; imzalı bağlantıyla bildirim kapanır; hatırlatma haftada bir', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(join(dir, 'akademi.sqlite'));
  const y = await yonetici();
  const a = await kaydol();
  const eposta = (await a('ben')).veri.uye.eposta;
  const id = db.prepare('SELECT id FROM uyeler WHERE eposta = ?').get(eposta).id;
  // 10 gün önce kaydolmuş, 5 gündür girmemiş gibi:
  db.prepare('UPDATE uyeler SET olusturma = ?, son_giris = ? WHERE id = ?').run(Date.now() - 10 * 864e5, Date.now() - 5 * 864e5, id);
  assert.ok((await y('yonetim/hatirlatma', { method: 'POST', govde: {} })).veri.gonderilen >= 1);
  assert.equal((await y('yonetim/hatirlatma', { method: 'POST', govde: {} })).veri.gonderilen, 0, 'aynı hafta ikinci kez gitmez');
  const p = (await y('yonetim/postalar')).veri;
  assert.equal(p.smtp, false);
  const benim = p.liste.find(x => x.kime === eposta);
  assert.equal(benim.durum, 'beklemede');
  assert.equal(benim.tur, 'hatirlatma');
  // İmzasız / yanlış imzalı bağlantı bir şey değiştirmez; doğru imza bildirimi kapatır.
  await fetch(`${ADRES}/api/bildirim/kapat?u=${id}&k=${'0'.repeat(32)}`);
  assert.equal(db.prepare('SELECT bildirim FROM uyeler WHERE id = ?').get(id).bildirim, 1);
  const { createHmac } = await import('node:crypto');
  const gizli = db.prepare("SELECT deger FROM ayarlar WHERE anahtar = 'imza'").get().deger;
  const k = createHmac('sha256', gizli).update('bildirim:' + id).digest('hex').slice(0, 32);
  assert.equal((await fetch(`${ADRES}/api/bildirim/kapat?u=${id}&k=${k}`)).status, 200);
  assert.equal(db.prepare('SELECT bildirim FROM uyeler WHERE id = ?').get(id).bildirim, 0);
  assert.equal((await a('ben')).veri.uye.bildirim, false);
  db.close();
});

test('rapor: yalnızca yönetici; Excel (tr/en) geçerli bir ZIP/XLSX olarak iner', async () => {
  const genc = await kaydol();
  assert.equal((await genc('yonetim/rapor.xlsx')).durum, 403);
  const y = await yonetici();
  for (const dil of ['tr', 'en']) {
    const { durum, veri } = await y('yonetim/rapor.xlsx?dil=' + dil);
    assert.equal(durum, 200);
    assert.equal(veri.subarray(0, 4).toString('hex'), '504b0304', 'ZIP imzası');
    assert.ok(veri.includes(Buffer.from('xl/worksheets/sheet7.xml')), '7 sayfa');
  }
});

test('ortak dilleri: içerik it/ro/pt/da olarak gelir, doğru cevap sızmaz', async () => {
  for (const dil of ['it', 'ro', 'pt', 'da']) {
    const r = await fetch(ADRES + '/api/icerik?dil=' + dil).then(x => x.json());
    assert.ok(r.diller.includes(dil), dil + ' yüklü');
    assert.notEqual(r.bolumler[0].baslik, 'Getting started', dil + ' başlığı çevrilmiş');
    assert.ok(!JSON.stringify(r).includes('"dogru"'), 'doğru cevap yok');
  }
  const genc = await kaydol({ dil: 'da' });
  assert.equal((await genc('ben')).veri.uye.dil, 'da');
});

test('parola: değiştirme eski parolayı ister, diğer oturumları kapatır', async () => {
  const e = `p${Math.random()}@ornek.test`;
  const a = await kaydol({ eposta: e });
  const b = istemci();
  assert.equal((await b('giris', { method: 'POST', govde: { eposta: e, parola: 'gizli-parola-1' } })).durum, 200);
  assert.equal((await a('ben/parola', { method: 'POST', govde: { eski: 'yanlis', yeni: 'yeni-parola-22' } })).veri.hata, 'parola_yanlis');
  assert.equal((await a('ben/parola', { method: 'POST', govde: { eski: 'gizli-parola-1', yeni: 'kisa' } })).veri.hata, 'parola');
  assert.equal((await a('ben/parola', { method: 'POST', govde: { eski: 'gizli-parola-1', yeni: 'yeni-parola-22' } })).durum, 200);
  assert.ok((await a('ben')).veri.uye, 'bu oturum açık kalır');
  assert.equal((await b('ben')).veri.uye, null, 'öbür cihaz çıkış yapar');
  assert.equal((await istemci()('giris', { method: 'POST', govde: { eposta: e, parola: 'yeni-parola-22' } })).durum, 200);
});

test('şifremi unuttum: hesap varlığı sızmaz; jeton tek kullanımlık, süreli', async () => {
  const e = `u${Math.random()}@ornek.test`;
  await kaydol({ eposta: e });
  const x = istemci();
  assert.equal((await x('parola/unuttum', { method: 'POST', govde: { eposta: 'yok@ornek.test' } })).durum, 200);
  assert.equal((await x('parola/unuttum', { method: 'POST', govde: { eposta: e } })).durum, 200);
  const y = await yonetici();
  const posta = (await y('yonetim/postalar')).veri.liste.find(p => p.kime === e);
  assert.equal(posta.tur, 'sifirlama');
  assert.equal((await x('parola/sifirla', { method: 'POST', govde: { jeton: 'a'.repeat(64), parola: 'baska-parola-3' } })).veri.hata, 'jeton_gecersiz');
  /* Gerçek jeton e-postada; testte bilinen bir jeton doğrudan veritabanına yazılır. */
  const { DatabaseSync } = await import('node:sqlite');
  const { createHash } = await import('node:crypto');
  const jeton = 'b'.repeat(64);
  const vt = new DatabaseSync(join(dir, 'akademi.sqlite'));
  const id = vt.prepare('SELECT id FROM uyeler WHERE eposta = ?').get(e).id;
  vt.prepare('INSERT INTO parola_jetonlari (ozet, uye_id, bitis) VALUES (?, ?, ?)').run(createHash('sha256').update(jeton).digest('hex'), id, Date.now() + 60000);
  vt.close();
  const z = istemci();
  assert.equal((await z('parola/sifirla', { method: 'POST', govde: { jeton, parola: 'baska-parola-3' } })).durum, 200);
  assert.ok((await z('ben')).veri.uye, 'sıfırlayınca oturum açılır');
  assert.equal((await z('parola/sifirla', { method: 'POST', govde: { jeton, parola: 'ucuncu-parola-4' } })).veri.hata, 'jeton_gecersiz', 'ikinci kez kullanılamaz');
  assert.equal((await istemci()('giris', { method: 'POST', govde: { eposta: e, parola: 'baska-parola-3' } })).durum, 200);
});

test('verilerimi indir: kişinin verisi gelir, parola özeti gelmez', async () => {
  const a = await kaydol();
  await a('ogren/not', { method: 'POST', govde: { anahtar: 'kanva:ad', metin: 'Tamir kafesi' } });
  const { durum, veri } = await a('ben/veri.json');
  assert.equal(durum, 200);
  assert.ok(veri.hesap.eposta.endsWith('@ornek.test'));
  assert.equal(veri.notlar[0].metin, 'Tamir kafesi');
  assert.ok(!JSON.stringify(veri).includes('parola'), 'parola alanı yok');
  assert.equal((await istemci()('ben/veri.json')).durum, 401);
});

test('yedek: npm run yedek tutarlı bir SQLite kopyası alır', async () => {
  const out = execFileSync(process.execPath, ['scripts/yedek.mjs'], { env: ortam }).toString();
  assert.match(out, /Yedek alındı/);
  const { DatabaseSync } = await import('node:sqlite');
  const gun = new Date().toISOString().slice(0, 10);
  const vt = new DatabaseSync(join(dir, 'yedek', `akademi-${gun}.sqlite`));
  assert.equal(vt.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.ok(vt.prepare('SELECT count(*) AS n FROM uyeler').get().n > 0);
  vt.close();
});

test('çeviri eskimesi: İngilizcesi değişen adım ortak dilinde İngilizce görünür ve listelenir', async () => {
  const y = await yonetici();
  const once = await fetch(ADRES + '/api/icerik?dil=it').then(r => r.json());
  const ic = (await y('yonetim/icerik')).veri;
  const b = ic.bolumler[0], a = b.adimlar[0];
  a.baslik = { ...a.baslik, en: a.baslik.en + ' (updated)' };
  assert.equal((await y('yonetim/icerik', { method: 'PUT', govde: { bolumler: ic.bolumler, test: ic.test, gecme: ic.gecme } })).durum, 200);
  const sonra = await fetch(ADRES + '/api/icerik?dil=it').then(r => r.json());
  assert.equal(sonra.bolumler[0].adimlar[0].baslik, a.baslik.en, 'eskiyen adım İngilizce');
  assert.equal(sonra.bolumler[0].adimlar[1].baslik, once.bolumler[0].adimlar[1].baslik, 'diğer adımlar çeviride kalır');
  const it = (await y('yonetim/ceviri')).veri.diller.find(d => d.dil === 'it');
  assert.ok(it.eski.some(o => o.bolum === b.id && o.adim === a.id));
});
