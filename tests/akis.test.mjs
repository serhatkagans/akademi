/* Uçtan uca API akışı: geçici veritabanıyla gerçek sunucuyu başlatır. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BOLUMLER, TEST, ANKET } from '../icerik/modul.mjs';

const PORT = 3190 + Math.floor(Math.random() * 500);
const ADRES = `http://localhost:${PORT}`;
const dir = mkdtempSync(join(tmpdir(), 'akademi-'));
let sunucu;

function istemci() {
  let cerez = '';
  return async (yol, { method = 'GET', govde } = {}) => {
    const r = await fetch(ADRES + '/api/' + yol, {
      method, headers: { 'Content-Type': 'application/json', Origin: ADRES, Cookie: cerez },
      body: govde ? JSON.stringify(govde) : undefined,
    });
    const c = r.headers.get('set-cookie');
    if (c) cerez = c.split(';')[0];
    return { durum: r.status, veri: await r.json().catch(() => null) };
  };
}
const kayit = (ek = {}) => ({ ad: 'Deneme Genç', eposta: `g${Math.random()}@ornek.test`, parola: 'gizli-parola-1',
  ulke: 'TR', dogumYili: 2004, rol: 'genc', onay: true, ...ek });

before(async () => {
  sunucu = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(PORT), DATA_DIR: dir, DATABASE_URL: '', VIDEO_HIZ: '1e9', YEDEK: 'kapali', HATIRLATMA: 'kapali', VIDEO_DENETIM: 'kapali' }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) {
    try { await fetch(ADRES + '/api/ben'); return; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  throw new Error('sunucu açılmadı');
});
/* Windows'ta SQLite dosyası süreç kapanana kadar kilitli: önce sunucunun çıkmasını bekle. */
after(async () => {
  const cikti = new Promise(r => sunucu.once('exit', r));
  sunucu.kill();
  await cikti;
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* geçici klasör; işletim sistemi temizler */ }
});

test('kayıt doğrulaması: onay, veli onayı, yaş', async () => {
  const a = istemci();
  assert.equal((await a('kayit', { method: 'POST', govde: kayit({ onay: false }) })).veri.hata, 'onay');
  assert.equal((await a('kayit', { method: 'POST', govde: kayit({ dogumYili: new Date().getFullYear() - 16 }) })).veri.hata, 'veli');
  assert.equal((await a('kayit', { method: 'POST', govde: kayit({ dogumYili: new Date().getFullYear() - 10 }) })).veri.hata, 'yas_kucuk');
  assert.equal((await a('kayit', { method: 'POST', govde: kayit({ dogumYili: new Date().getFullYear() - 16, veliOnayi: true }) })).durum, 201);
});

test('köken denetimi: başka siteden yazma 403', async () => {
  const r = await fetch(ADRES + '/api/giris', { method: 'POST', headers: { Origin: 'https://kotu.example' }, body: '{}' });
  assert.equal(r.status, 403);
});

test('tam akış: bölümler → test → anket → sertifika → doğrulama → silme', async () => {
  const a = istemci();
  const k = kayit();
  assert.equal((await a('kayit', { method: 'POST', govde: k })).durum, 201);
  assert.equal((await a('ben')).veri.uye.ad, 'Deneme Genç');

  // Bölümler bitmeden test kilitli.
  assert.equal((await a('ogren/test', { method: 'POST', govde: { cevaplar: TEST.map(() => 0) } })).durum, 403);

  // Her bölümün her adımını türüne göre tamamla; son adımdan önce bölüm tamam olmamalı.
  const bolumDurumu = d => d.bolumler.find(x => x.id === b.id);
  let b;
  for (b of BOLUMLER) {
    let d;
    for (const [k, adim] of b.adimlar.entries()) {
      const y = `ogren/adim/${b.id}/${adim.id}`;
      if (['metin', 'ornek', 'kartlar'].includes(adim.tur)) {
        d = (await a(y + '/goruldu', { method: 'POST', govde: {} })).veri.durum;
      } else if (adim.tur === 'video') {
        await a(y + '/video', { method: 'POST', govde: { sn: 0, sure: 9999 } });   // oynatma başladı
        await a(y + '/video', { method: 'POST', govde: { sn: 9999, sure: 9999 } }); // içerikteki süreyi aşamaz
        d = (await a(y + '/video', { method: 'POST', govde: { sn: 10, sure: 9999 } })).veri.durum; // geri gitmez
        assert.equal(bolumDurumu(d).adimlar[adim.id].sn, adim.sure, 'süre içerikten; tarayıcının bildirdiği süre yok sayılır');
        assert.equal(bolumDurumu(d).adimlar[adim.id].sure, adim.sure);
        if (adim.sorular.length) {
          assert.equal(bolumDurumu(d).adimlar[adim.id].tamam, false, 'ara sorular cevaplanmadan video adımı bitmez');
          const yanlis = await a(y + '/soru', { method: 'POST', govde: { soru: 0, cevap: adim.sorular[0].dogru === 0 ? 1 : 0 } });
          assert.equal(yanlis.veri.dogru, false);
        }
        for (const [i, q] of adim.sorular.entries()) d = (await a(y + '/soru', { method: 'POST', govde: { soru: i, cevap: q.dogru } })).veri.durum;
      } else if (adim.tur === 'sina') {
        for (const [i, q] of adim.sorular.entries()) {
          const r = await a(y + '/soru', { method: 'POST', govde: { soru: i, cevap: q.dogru } });
          assert.equal(r.veri.dogru, true);
          if (q.aciklama) assert.ok(r.veri.aciklama?.tr, 'açıklama cevaptan sonra gelir');
          d = r.veri.durum;
        }
      } else if (adim.tur === 'etkinlik') {
        assert.equal((await a('ogren/not', { method: 'POST', govde: { anahtar: `adim:${b.id}:${adim.id}`, metin: '' } })).durum, 200);
        d = (await a('ogren/not', { method: 'POST', govde: { anahtar: `adim:${b.id}:${adim.id}`, metin: 'Cevabım' } })).veri.durum;
      }
      assert.equal(bolumDurumu(d).adimlar[adim.id].tamam, true, `${b.id}/${adim.id}`);
      assert.equal(bolumDurumu(d).tamam, k === b.adimlar.length - 1, `${b.id} bölüm tamam durumu, adım ${k + 1}`);
    }
  }

  // Anket test geçilmeden kilitli; sertifika her şey bitmeden kilitli.
  assert.equal((await a('ogren/anket', { method: 'POST', govde: {} })).durum, 403);
  assert.equal((await a('ogren/sertifika', { method: 'POST', govde: {} })).durum, 403);

  const kotu = await a('ogren/test', { method: 'POST', govde: { cevaplar: TEST.map(() => 3) } });
  assert.equal(kotu.veri.gecti, false);
  const iyi = await a('ogren/test', { method: 'POST', govde: { cevaplar: TEST.map(q => q.dogru) } });
  assert.equal(iyi.veri.puan, TEST.length);
  assert.equal(iyi.veri.gecti, true);

  assert.equal((await a('ogren/anket', { method: 'POST', govde: { puanlar: { memnun: 5 } } })).veri.hata, 'anket_eksik');
  const puanlar = Object.fromEntries(ANKET.map(m => [m.id, 4]));
  assert.equal((await a('ogren/anket', { method: 'POST', govde: { puanlar, yorum: 'Güzeldi' } })).durum, 200);
  assert.equal((await a('ogren/anket', { method: 'POST', govde: { puanlar } })).durum, 409);

  const s = await a('ogren/sertifika', { method: 'POST', govde: {} });
  const kod = s.veri.durum.sertifika.kod;
  assert.match(kod, /^EYP-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  const d = await (await fetch(`${ADRES}/api/dogrula/${kod}`)).json();
  assert.deepEqual([d.gecerli, d.ad], [true, 'Deneme Genç']);
  assert.equal((await (await fetch(`${ADRES}/api/dogrula/EYP-AAAA-AAAA`)).json()).gecerli, false);

  // Yönetim: sıradan üye göremez.
  assert.equal((await a('yonetim/ozet')).durum, 403);

  // Hesap silme: yanlış parola reddedilir, doğru parolayla her şey silinir.
  assert.equal((await a('ben', { method: 'DELETE', govde: { parola: 'yanlis' } })).durum, 403);
  assert.equal((await a('ben', { method: 'DELETE', govde: { parola: k.parola } })).durum, 200);
  assert.equal((await (await fetch(`${ADRES}/api/dogrula/${kod}`)).json()).gecerli, false);
  const tekrar = istemci();
  assert.equal((await tekrar('giris', { method: 'POST', govde: { eposta: k.eposta, parola: k.parola } })).durum, 401);
});

test('yönetici göstergeleri', async () => {
  execFileSync(process.execPath, ['scripts/yonetici.mjs', 'ekle', 'yonetici@ornek.test', 'Yönetici'], { env: { ...process.env, DATA_DIR: dir, DATABASE_URL: '' } });
  const out = execFileSync(process.execPath, ['scripts/yonetici.mjs', 'parola', 'yonetici@ornek.test'], { env: { ...process.env, DATA_DIR: dir, DATABASE_URL: '' } }).toString();
  const parola = out.match(/Yeni parola: (\S+)/)[1];
  const y = istemci();
  assert.equal((await y('giris', { method: 'POST', govde: { eposta: 'yonetici@ornek.test', parola } })).durum, 200);
  const o = (await y('yonetim/ozet')).veri;
  assert.equal(typeof o.kayitli, 'number');
  assert.ok(o.kayitli >= 1, 'en az bir katılımcı (17 yaşındaki) kayıtlı');
  assert.equal(o.ulke.TR >= 1, true);
  const csv = await fetch(ADRES + '/api/yonetim/uyeler.csv', { headers: { Cookie: '' } });
  assert.equal(csv.status, 401);
});
