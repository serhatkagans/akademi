import { Hata } from './http.mjs';
import { BOLUMLER, TEST, GECME, ANKET } from '../icerik/modul.mjs';
import { ceviri, ceviriIzi, ORTAK } from './diller.mjs';
import { izler } from './ceviri-iz.mjs';

/**
 * İçerik deposu. `icerik/modul.mjs` BAŞLANGIÇ içeriğidir; yönetici içerik ekranından
 * kaydettiğinde tamamı `ayarlar` tablosuna ('icerik' anahtarı) yazılır ve o geçerli olur.
 * Sunucu içeriği bellekte tutar; kayıtta tazelenir. Anket maddeleri (göstergeler
 * onlara bağlı) düzenlenmez, kodda kalır.
 *
 * Doğru cevaplar (`dogru`) yalnızca sunucuda kalır; istemciye `istemciIcerigi` gider.
 */
export const RENKLER = ['mavi', 'lacivert', 'yesil', 'mor', 'camgobegi', 'turuncu'];
export const SIMGELER = ['pusula', 'ampul', 'yaprak', 'eller', 'ekran', 'roket', 'kitap', 'test', 'sertifika', 'dunya'];

let guncelIcerik = { bolumler: BOLUMLER, test: TEST, gecme: GECME };
export const guncel = () => guncelIcerik;

export async function icerikYukle(db) {
  const r = await db.get("SELECT deger FROM ayarlar WHERE anahtar = 'icerik'");
  if (r) {
    try { guncelIcerik = icerikDenetle(JSON.parse(r.deger)); } catch (e) { console.error('Kayıtlı içerik okunamadı, başlangıç içeriği kullanılıyor:', e.message); }
  }
}

export async function icerikKaydet(db, veri) {
  const temiz = icerikDenetle(veri);
  const json = JSON.stringify(temiz);
  const varMi = await db.get("SELECT anahtar FROM ayarlar WHERE anahtar = 'icerik'");
  if (varMi) await db.run("UPDATE ayarlar SET deger = ?, guncelleme = ? WHERE anahtar = 'icerik'", [json, Date.now()]);
  else await db.run("INSERT INTO ayarlar (anahtar, deger, guncelleme) VALUES ('icerik', ?, ?)", [json, Date.now()]);
  guncelIcerik = temiz;
  return temiz;
}

/* Yönetici için TAM içerik (doğru cevaplar dahil). */
export const yoneticiIcerigi = () => ({ ...guncelIcerik, renkler: RENKLER, simgeler: SIMGELER });

/* Güncel içeriğin izleri: içerik değişince (kayıt) yeniden hesaplanır. */
let izOnbellek = { icerik: null, iz: null };
function guncelIzler() {
  if (izOnbellek.icerik !== guncelIcerik) izOnbellek = { icerik: guncelIcerik, iz: izler(guncelIcerik) };
  return izOnbellek.iz;
}
/** Bir parçanın (bölüm, 'bölüm/adım', 'test') çevirisi kullanılabilir mi? İz kaydı yoksa evet. */
function cevirisiGuncel(dil, anahtar) {
  const kayit = ceviriIzi(dil);
  return !kayit || kayit[anahtar] === guncelIzler()[anahtar];
}

/**
 * Yönetim ekranı için çeviri durumu: her ortak dilinde eskimiş ve eksik parçalar.
 * eski  = çeviri var ama İngilizce kaynak o günden beri değişti
 * eksik = çeviri hiç yok (sonradan eklenen adım/bölüm)
 */
export function ceviriDurumu() {
  const g = guncelIzler();
  return ORTAK.filter(d => ceviri(d)).map(d => {
    const T = ceviri(d), kayit = ceviriIzi(d);
    const eski = [], eksik = [];
    const bak = (anahtar, varMi, bilgi) => {
      if (!varMi) eksik.push(bilgi);
      else if (kayit && kayit[anahtar] !== g[anahtar]) eski.push(bilgi);
    };
    for (const b of guncelIcerik.bolumler) {
      const ad = b.baslik?.tr || b.baslik?.en || b.id;
      bak(b.id, !!T.bolumler?.[b.id]?.baslik, { bolum: b.id, bolumAd: ad });
      for (const a of b.adimlar) bak(`${b.id}/${a.id}`, !!T.bolumler?.[b.id]?.adimlar?.[a.id], { bolum: b.id, bolumAd: ad, adim: a.id, adimAd: a.baslik?.tr || a.baslik?.en || a.id });
    }
    bak('test', (T.test || []).length === guncelIcerik.test.length, { test: true });
    return { dil: d, izli: !!kayit, eski, eksik };
  });
}

/** İstemciye giden içerik: seçili dil (yoksa İngilizce), doğru cevaplar çıkarılmış. */
export function istemciIcerigi(dil) {
  /* c(çeviri, özgün): ortak dilinde çeviri dosyasındaki metin; yoksa özgünün o dili, o da yoksa İngilizcesi. */
  const s = m => (m && typeof m === 'object' && 'en' in m) ? (m[dil] || m.en) : m;
  const c = (cev, m) => (typeof cev === 'string' && cev.trim() ? cev : s(m));
  const T = ceviri(dil) || {};
  const { bolumler, test, gecme } = guncelIcerik;
  return {
    bolumler: bolumler.map(b => {
      const tum = T.bolumler?.[b.id] || {};
      /* Eskimiş çeviri gösterilmez: o parça güncel İngilizcesiyle görünür. */
      const tb = cevirisiGuncel(dil, b.id) ? tum : {};
      const hedefler = tb.hedefler?.length ? tb.hedefler : b.hedefler?.[dil]?.length ? b.hedefler[dil] : (b.hedefler?.en || []);
      return {
        id: b.id, renk: b.renk, simge: b.simge, dakika: b.dakika,
        baslik: c(tb.baslik, b.baslik), ozet: c(tb.ozet, b.ozet), hedefler,
        adimlar: b.adimlar.map(a => istemciAdimi(a, s, c, cevirisiGuncel(dil, `${b.id}/${a.id}`) ? (tum.adimlar?.[a.id] || {}) : {})),
      };
    }),
    test: test.map((q, i) => { const tt = cevirisiGuncel(dil, 'test') ? T.test?.[i] : null;
      return { soru: c(tt?.soru, q.soru), secenekler: q.secenekler.map((x, k) => c(tt?.secenekler?.[k], x)) }; }),
    gecme,
    anket: ANKET.map(m => ({ id: m.id, metin: c(T.anket?.[m.id], m) })),
  };
}

/* Bir adımın istemci biçimi: dil seçilmiş (ta = adımın çevirisi), doğru cevaplar ve açıklamalar çıkarılmış. */
function istemciAdimi(a, s, c, ta) {
  const o = { id: a.id, tur: a.tur, baslik: c(ta.baslik, a.baslik) };
  const soru = (q, i) => ({ ...(q.sn !== undefined ? { sn: q.sn } : {}), tur: q.tur || 'cs', soru: c(ta.sorular?.[i]?.soru, q.soru),
    secenekler: q.secenekler?.map((x, k) => c(ta.sorular?.[i]?.secenekler?.[k], x)) });
  if (a.tur === 'metin') o.govde = c(ta.govde, a.govde);
  if (a.tur === 'video') Object.assign(o, { youtube: a.youtube, kaynak: a.kaynak, not: c(ta.not, a.not), sorular: a.sorular.map(soru) });
  if (a.tur === 'ornek') Object.assign(o, { kurulus: c(ta.kurulus, a.kurulus), yer: c(ta.yer, a.yer), govde: c(ta.govde, a.govde), ders: c(ta.ders, a.ders) });
  if (a.tur === 'kartlar') o.kartlar = a.kartlar.map((k, i) => ({ on: c(ta.kartlar?.[i]?.on, k.on), arka: c(ta.kartlar?.[i]?.arka, k.arka) }));
  if (a.tur === 'sina') o.sorular = a.sorular.map(soru);
  if (a.tur === 'etkinlik') Object.assign(o, { soru: c(ta.soru, a.soru), ipucu: c(ta.ipucu, a.ipucu) });
  return o;
}

/* Sınamada doğru cevaptan sonra gönderilen açıklama, ortak dilinde çevrisiyle. */
export function aciklamaCevirisi(dil, bolumId, adimId, i) {
  if (!cevirisiGuncel(dil, `${bolumId}/${adimId}`)) return null;
  return ceviri(dil)?.bolumler?.[bolumId]?.adimlar?.[adimId]?.sorular?.[i]?.aciklama || null;
}

/* ---------------- Denetim ---------------- */

/**
 * Okuma metinleri için izinli HTML. Yönetici ekranından gelir ama yine de süzülür:
 * yalnızca biçim etiketleri kalır, öznitelik yok (bağlantıda yalnızca http(s) href).
 */
const IZINLI = new Set(['p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'h3', 'a']);
const kacir = s => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function temizHtml(girdi) {
  /* Yalnızca harfle başlayan gerçek etiketler ayrılır; "1 < 2" gibi düz yazı kaçışlanıp korunur. */
  return String(girdi ?? '').slice(0, 20000).split(/(<\/?[a-z][^>]*>)/i).map(p => {
    const m = p.match(/^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i);
    if (!m) return p.startsWith('<') ? '' : kacir(p);
    const ad = m[2].toLowerCase();
    if (!IZINLI.has(ad)) return '';
    if (m[1]) return ad === 'br' ? '' : `</${ad}>`;
    if (ad === 'br') return '<br>';
    if (ad === 'a') {
      const h = m[3].match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const href = (h?.[1] ?? h?.[2] ?? '').trim();
      return /^https?:\/\/[^\s"'<>]+$/i.test(href)
        ? `<a href="${href.replace(/&(?!amp;)/g, '&amp;')}" target="_blank" rel="noopener noreferrer">` : '<a>';
    }
    return `<${ad}>`;
  }).join('');
}

const metin = (v, en, alan) => {
  const s = String(v ?? '').trim();
  if (s.length > en) throw new Hata('icerik:' + alan);
  return s;
};
const ikiDil = (v, en, alan, zorunlu = true) => {
  const o = { tr: metin(v?.tr, en, alan), en: metin(v?.en, en, alan) };
  if (zorunlu && !o.tr && !o.en) throw new Hata('icerik:' + alan);
  return o;
};
const tamsayi = (v, en, ek, alan) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < en || n > ek) throw new Hata('icerik:' + alan);
  return n;
};
function secenekler(liste, alan) {
  if (!Array.isArray(liste) || liste.length < 2 || liste.length > 6) throw new Hata('icerik:' + alan);
  return liste.map(x => ikiDil(x, 300, alan));
}

export const ADIM_TURLERI = ['metin', 'video', 'ornek', 'kartlar', 'sina', 'etkinlik'];

function soruDenetle(q, yer, { sn = false } = {}) {
  const tur = q.tur === 'dy' ? 'dy' : 'cs';
  const sec = tur === 'cs' ? secenekler(q.secenekler, yer) : undefined;
  return {
    ...(sn ? { sn: tamsayi(q.sn, 0, 6 * 3600, yer) } : {}),
    tur, soru: ikiDil(q.soru, 500, yer),
    ...(sec ? { secenekler: sec } : {}),
    dogru: tamsayi(q.dogru, 0, tur === 'dy' ? 1 : sec.length - 1, yer),
    ...(q.aciklama ? { aciklama: ikiDil(q.aciklama, 600, yer, false) } : {}),
  };
}

function adimDenetle(a, id, yer) {
  if (!ADIM_TURLERI.includes(a.tur)) throw new Hata('icerik:' + yer + '.tur');
  const o = { id, tur: a.tur, baslik: ikiDil(a.baslik, 160, yer + '.baslik') };
  const html = v => ({ tr: temizHtml(v?.tr), en: temizHtml(v?.en) });
  if (a.tur === 'metin') o.govde = html(a.govde);
  if (a.tur === 'video') {
    const yt = String(a.youtube || '');
    if (!/^[\w-]{11}$/.test(yt)) throw new Hata('icerik:' + yer + '.video');
    Object.assign(o, {
      youtube: yt, kaynak: metin(a.kaynak, 120, yer + '.kaynak'), not: ikiDil(a.not, 300, yer + '.not', false),
      sorular: (Array.isArray(a.sorular) ? a.sorular : []).slice(0, 10).map((q, k) => soruDenetle(q, `${yer}.soru${k + 1}`, { sn: true })),
    });
  }
  if (a.tur === 'ornek') {
    const kurulus = typeof a.kurulus === 'object' ? ikiDil(a.kurulus, 120, yer + '.kurulus') : metin(a.kurulus, 120, yer + '.kurulus');
    Object.assign(o, { kurulus, yer: ikiDil(a.yer, 120, yer + '.yer', false), govde: html(a.govde), ders: ikiDil(a.ders, 400, yer + '.ders', false) });
  }
  if (a.tur === 'kartlar') {
    if (!Array.isArray(a.kartlar) || a.kartlar.length < 1 || a.kartlar.length > 12) throw new Hata('icerik:' + yer + '.kartlar');
    o.kartlar = a.kartlar.map((k, i) => ({ on: ikiDil(k.on, 80, `${yer}.kart${i + 1}`), arka: ikiDil(k.arka, 400, `${yer}.kart${i + 1}`) }));
  }
  if (a.tur === 'sina') {
    if (!Array.isArray(a.sorular) || a.sorular.length < 1 || a.sorular.length > 10) throw new Hata('icerik:' + yer + '.sorular');
    o.sorular = a.sorular.map((q, k) => soruDenetle(q, `${yer}.soru${k + 1}`));
  }
  if (a.tur === 'etkinlik') Object.assign(o, { soru: ikiDil(a.soru, 800, yer + '.soru'), ipucu: ikiDil(a.ipucu, 300, yer + '.ipucu', false) });
  return o;
}

/* İlk sürümün bölüm biçimi (okuma + tek video + görev) adımlara çevrilir. */
function eskidenAdimlar(b) {
  const a = [];
  if (b.okuma) a.push({ id: 'okuma', tur: 'metin', baslik: b.baslik, govde: b.okuma });
  if (b.video) a.push({ id: 'video', tur: 'video', baslik: b.video.baslik, youtube: b.video.youtube, kaynak: b.video.kaynak, not: b.video.not, sorular: b.video.sorular });
  if (b.gorev?.tr || b.gorev?.en) a.push({ id: 'gorev', tur: 'etkinlik', baslik: { tr: 'Dene', en: 'Try it' }, soru: b.gorev });
  return a;
}

export function icerikDenetle(v) {
  if (!v || !Array.isArray(v.bolumler) || v.bolumler.length < 1 || v.bolumler.length > 30) throw new Hata('icerik:bolumler');
  const idler = new Set();
  const bolumler = v.bolumler.map((b, i) => {
    const yer = `bolum${i + 1}`;
    const id = String(b.id || '');
    if (!/^[a-z0-9-]{2,30}$/.test(id) || idler.has(id)) throw new Hata('icerik:' + yer + '.id');
    idler.add(id);
    const adimlar = (Array.isArray(b.adimlar) ? b.adimlar : eskidenAdimlar(b)).slice(0, 30);
    if (!adimlar.length) throw new Hata('icerik:' + yer + '.adimlar');
    const adimIdler = new Set();
    const hedef = d => (Array.isArray(b.hedefler?.[d]) ? b.hedefler[d] : []).slice(0, 8).map(h => metin(h, 200, yer + '.hedef')).filter(Boolean);
    return {
      id, renk: RENKLER.includes(b.renk) ? b.renk : 'mavi', simge: SIMGELER.includes(b.simge) ? b.simge : 'kitap',
      dakika: tamsayi(b.dakika, 1, 240, yer + '.dakika'),
      baslik: ikiDil(b.baslik, 120, yer + '.baslik'), ozet: ikiDil(b.ozet, 400, yer + '.ozet'),
      hedefler: { tr: hedef('tr'), en: hedef('en') },
      adimlar: adimlar.map((a, k) => {
        const aYer = `${yer}.adim${k + 1}`;
        const aId = String(a.id || '');
        if (!/^[a-z0-9-]{2,40}$/.test(aId) || adimIdler.has(aId)) throw new Hata('icerik:' + aYer + '.id');
        adimIdler.add(aId);
        return adimDenetle(a, aId, aYer);
      }),
    };
  });
  if (!Array.isArray(v.test) || v.test.length < 1 || v.test.length > 50) throw new Hata('icerik:test');
  const test = v.test.map((q, i) => {
    const sec = secenekler(q.secenekler, `test${i + 1}`);
    return { soru: ikiDil(q.soru, 500, `test${i + 1}`), secenekler: sec, dogru: tamsayi(q.dogru, 0, sec.length - 1, `test${i + 1}`) };
  });
  const gecme = tamsayi(v.gecme, 1, test.length, 'gecme');
  return { bolumler, test, gecme };
}
