import { useEffect, useRef, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { Yukleniyor } from '../bilesenler/Kabuk.jsx';
import Simge from '../bilesenler/Simge.jsx';
import { ytYukle } from '../bilesenler/Video.jsx';

/* ---- Okuma metni: HTML <-> sade yazı (editör HTML bilmek zorunda kalmasın) ---- */
export function htmlMetne(html = '') {
  return html
    .replace(/<ul>([\s\S]*?)<\/ul>/g, (_, x) => '\n\n' + x.replace(/<li>([\s\S]*?)<\/li>/g, '- $1\n').trim() + '\n\n')
    .replace(/<ol>([\s\S]*?)<\/ol>/g, (_, x) => { let i = 0; return '\n\n' + x.replace(/<li>([\s\S]*?)<\/li>/g, (__, y) => `${++i}. ${y}\n`).trim() + '\n\n'; })
    .replace(/<h3>([\s\S]*?)<\/h3>/g, '\n\n### $1\n\n')
    .replace(/<\/p>\s*<p>/g, '\n\n').replace(/<\/?p>/g, '\n\n').replace(/<br>/g, '\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}
export function metniHtmle(metin = '') {
  return metin.trim().split(/\n\s*\n/).map(blok => {
    const satirlar = blok.split('\n').map(s => s.trim()).filter(Boolean);
    if (satirlar.length === 1 && satirlar[0].startsWith('### ')) return '<h3>' + satirlar[0].slice(4) + '</h3>';
    if (satirlar.length && satirlar.every(s => s.startsWith('- '))) return '<ul>' + satirlar.map(s => `<li>${s.slice(2)}</li>`).join('') + '</ul>';
    if (satirlar.length && satirlar.every(s => /^\d+\.\s/.test(s))) return '<ol>' + satirlar.map(s => `<li>${s.replace(/^\d+\.\s/, '')}</li>`).join('') + '</ol>';
    return '<p>' + satirlar.join('<br>') + '</p>';
  }).join('');
}
const ytKimlik = s => (String(s).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(s).match(/^([\w-]{11})$/))?.[1] || '';
const kopya = o => JSON.parse(JSON.stringify(o));
const bos2 = () => ({ tr: '', en: '' });

/* İki dilli alan: TR ve EN yan yana. */
function IkiDil({ etiket, deger, degis, cok, satir = 3, not }) {
  const { t } = useB();
  const Alan = cok ? 'textarea' : 'input';
  return (
    <fieldset className="iki-dil">
      <legend>{etiket}</legend>
      {not && <small className="soluk">{not}</small>}
      <div className="iki-dil-ic">
        {['tr', 'en'].map(d => (
          <label key={d}><span lang={d}>{t('ic.' + d)}</span>
            <Alan value={deger?.[d] ?? ''} rows={cok ? satir : undefined} onChange={e => degis({ ...deger, [d]: e.target.value })} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* Seçenekli soru: soru + seçenekler + doğru cevap. */
function SoruDuzen({ q, degis, sil, no, turSec, ek }) {
  const { t } = useB();
  const secenekler = q.tur === 'dy' ? null : q.secenekler;
  return (
    <div className="soru-duzen">
      <div className="soru-duzen-bas">
        <b>{t('ic.soru')} {no}</b>
        {turSec}
        <button type="button" className="bag tehlike-yazi" onClick={sil}>{t('ic.sil.kisa')}</button>
      </div>
      <IkiDil etiket={t('ic.soru')} deger={q.soru} degis={v => degis({ ...q, soru: v })} />
      {secenekler ? (
        <div className="secenek-duzen">
          {secenekler.map((s, k) => (
            <div key={k} className="secenek-satir">
              <label className="dogru-sec" title={t('ic.soru.dogru')}>
                <input type="radio" checked={q.dogru === k} onChange={() => degis({ ...q, dogru: k })} />
              </label>
              <input value={s.tr} placeholder={`${t('ic.secenek')} ${k + 1} — TR`} onChange={e => { const y = kopya(secenekler); y[k].tr = e.target.value; degis({ ...q, secenekler: y }); }} />
              <input value={s.en} placeholder={`${t('ic.secenek')} ${k + 1} — EN`} onChange={e => { const y = kopya(secenekler); y[k].en = e.target.value; degis({ ...q, secenekler: y }); }} />
              {secenekler.length > 2 && <button type="button" className="bag" aria-label={t('ic.sil.kisa')}
                onClick={() => { const y = secenekler.filter((_, i) => i !== k); degis({ ...q, secenekler: y, dogru: q.dogru === k ? 0 : q.dogru > k ? q.dogru - 1 : q.dogru }); }}>✕</button>}
            </div>
          ))}
          {secenekler.length < 6 && <button type="button" className="bag" onClick={() => degis({ ...q, secenekler: [...secenekler, bos2()] })}>{t('ic.secenek.ekle')}</button>}
          <small className="soluk">◉ = {t('ic.soru.dogru')}</small>
        </div>
      ) : (
        <div className="secenek-satir">
          <span>{t('ic.soru.dogru')}:</span>
          {[0, 1].map(k => <label key={k} className="secenek-kucuk"><input type="radio" checked={q.dogru === k} onChange={() => degis({ ...q, dogru: k })} /> {k === 0 ? t('vid.dy0') : t('vid.dy1')}</label>)}
        </div>
      )}
      {ek}
    </div>
  );
}

/**
 * İçerik ekibi için: videoyu burada izle, uygun anda "Bu saniyede soru ekle" — soru o
 * saniyeye konur, metni aşağıda yazılır. (Ara sorular videonun gerçek içeriğine dayansın diye.)
 */
function VideoOnizleme({ youtube, soruEkle }) {
  const { t } = useB();
  const kutu = useRef(null);
  const oyn = useRef(null);
  const [an, setAn] = useState(0);
  useEffect(() => {
    let iptal = false, z;
    ytYukle().then(YT => {
      if (iptal) return;
      oyn.current = new YT.Player(kutu.current, { host: 'https://www.youtube-nocookie.com', videoId: youtube, playerVars: { rel: 0, playsinline: 1 } });
      z = setInterval(() => { const s = oyn.current?.getCurrentTime?.(); if (s !== undefined) setAn(Math.floor(s)); }, 500);
    });
    return () => { iptal = true; clearInterval(z); oyn.current?.destroy?.(); };
  }, [youtube]);
  const dk = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="video-onizle">
      <div className="video-cerceve"><div ref={kutu} /></div>
      <div className="video-onizle-alt">
        <span className="soluk">{t('ic.video.izle')}</span>
        <button type="button" className="dugme kucuk" onClick={() => soruEkle(an)}>{t('ic.video.buradaSoru', { s: dk(an) })}</button>
      </div>
    </div>
  );
}

/* HTML alanı sade yazıyla düzenlenir (boş satır = paragraf, "- " = madde, "### " = ara başlık). */
function MetinAlani({ etiket, deger, degis, satir = 10 }) {
  const { t } = useB();
  const [yazi, setYazi] = useState({ tr: htmlMetne(deger?.tr), en: htmlMetne(deger?.en) });
  return <IkiDil etiket={etiket} not={t('ic.okuma.not')} deger={yazi} cok satir={satir}
    degis={x => { setYazi(x); degis({ tr: metniHtmle(x.tr), en: metniHtmle(x.en) }); }} />;
}

const YENI_ADIM = {
  metin: () => ({ govde: bos2() }),
  video: () => ({ youtube: '', kaynak: '', not: bos2(), sorular: [] }),
  ornek: () => ({ kurulus: '', yer: bos2(), govde: bos2(), ders: bos2() }),
  kartlar: () => ({ kartlar: [{ on: bos2(), arka: bos2() }] }),
  sina: () => ({ sorular: [{ tur: 'cs', soru: bos2(), secenekler: [bos2(), bos2(), bos2()], dogru: 0, aciklama: bos2() }] }),
  etkinlik: () => ({ soru: bos2(), ipucu: bos2() }),
};
const TURLER = Object.keys(YENI_ADIM);

/* Tek adımın türüne göre alanları. */
function AdimAlanlari({ a, degis }) {
  const { t } = useB();
  const d = x => degis({ ...a, ...x });
  if (a.tur === 'metin') return <MetinAlani etiket={t('ic.govde')} deger={a.govde} degis={v => d({ govde: v })} satir={14} />;
  if (a.tur === 'etkinlik') return <>
    <IkiDil etiket={t('ic.etkinlik.soru')} deger={a.soru} degis={v => d({ soru: v })} cok satir={3} />
    <IkiDil etiket={t('ic.etkinlik.ipucu')} deger={a.ipucu} degis={v => d({ ipucu: v })} />
  </>;
  if (a.tur === 'ornek') return <>
    <div className="uclu-alan">
      <label>{t('ic.ornek.kurulus')}<input value={typeof a.kurulus === 'object' ? a.kurulus.tr : a.kurulus} onChange={e => d({ kurulus: e.target.value })} /></label>
    </div>
    <IkiDil etiket={t('ic.ornek.yer')} deger={a.yer} degis={v => d({ yer: v })} />
    <MetinAlani etiket={t('ic.govde')} deger={a.govde} degis={v => d({ govde: v })} satir={6} />
    <IkiDil etiket={t('adim.ders')} deger={a.ders} degis={v => d({ ders: v })} cok satir={2} />
  </>;
  if (a.tur === 'kartlar') return <>
    {a.kartlar.map((k, i) => (
      <div key={i} className="soru-duzen">
        <div className="soru-duzen-bas"><b>{t('ic.kart')} {i + 1}</b>
          {a.kartlar.length > 1 && <button type="button" className="bag tehlike-yazi" onClick={() => d({ kartlar: a.kartlar.filter((_, j) => j !== i) })}>{t('ic.sil.kisa')}</button>}
        </div>
        <IkiDil etiket={t('ic.kart.on')} deger={k.on} degis={v => d({ kartlar: a.kartlar.map((x, j) => j === i ? { ...x, on: v } : x) })} />
        <IkiDil etiket={t('ic.kart.arka')} deger={k.arka} degis={v => d({ kartlar: a.kartlar.map((x, j) => j === i ? { ...x, arka: v } : x) })} cok satir={2} />
      </div>
    ))}
    {a.kartlar.length < 12 && <button type="button" className="dugme ikincil kucuk" onClick={() => d({ kartlar: [...a.kartlar, { on: bos2(), arka: bos2() }] })}>{t('ic.kart.ekle')}</button>}
  </>;
  if (a.tur === 'sina') return <>
    {a.sorular.map((q, i) => (
      <SoruDuzen key={i} no={i + 1} q={{ ...q, tur: 'cs' }}
        degis={y => d({ sorular: a.sorular.map((x, j) => j === i ? { ...y, tur: 'cs' } : x) })}
        sil={() => a.sorular.length > 1 && d({ sorular: a.sorular.filter((_, j) => j !== i) })}
        ek={<IkiDil etiket={t('ic.aciklama')} deger={q.aciklama} degis={v => d({ sorular: a.sorular.map((x, j) => j === i ? { ...x, aciklama: v } : x) })} cok satir={2} />} />
    ))}
    {a.sorular.length < 10 && <button type="button" className="dugme ikincil kucuk"
      onClick={() => d({ sorular: [...a.sorular, { tur: 'cs', soru: bos2(), secenekler: [bos2(), bos2(), bos2()], dogru: 0, aciklama: bos2() }] })}>{t('ic.soru.ekle')}</button>}
  </>;
  if (a.tur === 'video') return <>
    <div className="uclu-alan">
      <label>{t('ic.video.adres')}
        <input defaultValue={a.youtube ? 'https://www.youtube.com/watch?v=' + a.youtube : ''} placeholder="https://www.youtube.com/watch?v=…"
          onChange={e => d({ youtube: ytKimlik(e.target.value) })} />
      </label>
      <label>{t('ic.video.kaynak')}<input value={a.kaynak} onChange={e => d({ kaynak: e.target.value })} /></label>
    </div>
    <IkiDil etiket={t('ic.video.not')} deger={a.not} degis={v => d({ not: v })} />
    {a.youtube && <VideoOnizleme youtube={a.youtube}
      soruEkle={sn => d({ sorular: [...a.sorular, { sn, tur: 'cs', soru: bos2(), secenekler: [bos2(), bos2(), bos2()], dogru: 0 }].sort((x, y) => x.sn - y.sn) })} />}
    {a.sorular.map((q, i) => (
      <SoruDuzen key={i} q={q} no={i + 1}
        degis={y => d({ sorular: a.sorular.map((x, k) => k === i ? y : x) })}
        sil={() => d({ sorular: a.sorular.filter((_, k) => k !== i) })}
        turSec={<>
          <label className="satir-ici">{t('ic.soru.sn')} <input type="number" min="0" value={q.sn} onChange={e => d({ sorular: a.sorular.map((x, k) => k === i ? { ...x, sn: Number(e.target.value) } : x) })} /></label>
          <select value={q.tur} onChange={e => d({ sorular: a.sorular.map((x, k) => k === i
            ? (e.target.value === 'dy' ? { sn: x.sn, tur: 'dy', soru: x.soru, dogru: 0 } : { sn: x.sn, tur: 'cs', soru: x.soru, secenekler: [bos2(), bos2()], dogru: 0 }) : x) })}>
            <option value="dy">{t('ic.soru.dy')}</option><option value="cs">{t('ic.soru.cs')}</option>
          </select>
        </>} />
    ))}
    <button type="button" className="dugme ikincil kucuk" onClick={() => d({ sorular: [...a.sorular, { sn: 30, tur: 'dy', soru: bos2(), dogru: 0 }] })}>{t('ic.soru.ekle')}</button>
  </>;
  return null;
}

function BolumDuzen({ b, degis, meta }) {
  const { t, dil } = useB();
  const [acik, setAcik] = useState(null);
  const [yeniTur, setYeniTur] = useState('metin');
  const adimlar = b.adimlar || [];
  const adimDegis = (i, a) => degis({ ...b, adimlar: adimlar.map((x, k) => k === i ? a : x) });
  function tasi(i, yon) {
    const y = [...adimlar]; const j = i + yon;
    if (j < 0 || j >= y.length) return;
    [y[i], y[j]] = [y[j], y[i]]; degis({ ...b, adimlar: y }); setAcik(j);
  }
  function ekle() {
    const id = yeniTur + '-' + Math.random().toString(36).slice(2, 6);
    degis({ ...b, adimlar: [...adimlar, { id, tur: yeniTur, baslik: { tr: t('adim.tur.' + yeniTur), en: '' }, ...YENI_ADIM[yeniTur]() }] });
    setAcik(adimlar.length);
  }
  const hedefMetin = d => (b.hedefler?.[d] || []).join('\n');
  return (
    <div className="duzen-govde">
      <IkiDil etiket={t('ic.baslik')} deger={b.baslik} degis={x => degis({ ...b, baslik: x })} />
      <IkiDil etiket={t('ic.ozet')} deger={b.ozet} degis={x => degis({ ...b, ozet: x })} cok satir={2} />
      <IkiDil etiket={t('ic.hedefler')} not={t('ic.hedefler.not')} cok satir={3}
        deger={{ tr: hedefMetin('tr'), en: hedefMetin('en') }}
        degis={x => degis({ ...b, hedefler: { tr: x.tr.split('\n'), en: x.en.split('\n') } })} />
      <div className="uclu-alan">
        <label>{t('ic.dakika')}<input type="number" min="1" max="240" value={b.dakika} onChange={e => degis({ ...b, dakika: Number(e.target.value) })} /></label>
        <label>{t('ic.renk')}<select value={b.renk} onChange={e => degis({ ...b, renk: e.target.value })}>{meta.renkler.map(r => <option key={r}>{r}</option>)}</select></label>
        <label>{t('ic.simge')}
          <span className="simge-sec">
            <span className={'bolum-simge renk-' + b.renk}><Simge ad={b.simge} boy={20} /></span>
            <select value={b.simge} onChange={e => degis({ ...b, simge: e.target.value })}>{meta.simgeler.map(s => <option key={s}>{s}</option>)}</select>
          </span>
        </label>
      </div>

      <h3 className="adim-duzen-baslik">{t('ic.adimlar')} ({adimlar.length})</h3>
      <ol className="adim-duzen-liste">
        {adimlar.map((a, i) => (
          <li key={a.id} className={'adim-duzen' + (acik === i ? ' acik' : '')}>
            <div className="adim-duzen-bas">
              <button type="button" className="adim-duzen-ac" onClick={() => setAcik(acik === i ? null : i)} aria-expanded={acik === i}>
                <span className="adim-durum">{i + 1}</span>
                <span><small>{t('adim.tur.' + a.tur)}</small>{a.baslik?.[dil] || a.baslik?.tr || '—'}</span>
              </button>
              <span className="eylemler">
                <button type="button" className="bag" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label={t('ic.yukari')}>↑</button>
                <button type="button" className="bag" onClick={() => tasi(i, 1)} disabled={i === adimlar.length - 1} aria-label={t('ic.asagi')}>↓</button>
                <button type="button" className="bag tehlike-yazi" disabled={adimlar.length <= 1}
                  onClick={() => { degis({ ...b, adimlar: adimlar.filter((_, k) => k !== i) }); setAcik(null); }}>{t('ic.sil.kisa')}</button>
              </span>
            </div>
            {acik === i && (
              <div className="adim-duzen-govde">
                <IkiDil etiket={t('ic.adim.baslik')} deger={a.baslik} degis={x => adimDegis(i, { ...a, baslik: x })} />
                <AdimAlanlari a={a} degis={y => adimDegis(i, y)} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className="satir-form">
        <select value={yeniTur} onChange={e => setYeniTur(e.target.value)} aria-label={t('ic.adim.tur')}>
          {TURLER.map(x => <option key={x} value={x}>{t('adim.tur.' + x)}</option>)}
        </select>
        <button type="button" className="dugme ikincil" onClick={ekle}>{t('ic.adim.ekle')}</button>
      </div>
    </div>
  );
}
/* Ortak dillerinin çeviri durumu: içerik değişince ilgili adımın çevirisi eskir ve
   katılımcıya o adımın İngilizcesi gösterilir (lib/ceviri-iz.mjs). */
const DIL_AD = { it: 'Italiano', ro: 'Română', pt: 'Português', da: 'Dansk' };
function CeviriDurumu({ surum }) {
  const { t } = useB();
  const [d, setD] = useState(null);
  useEffect(() => { api('yonetim/ceviri').then(r => setD(r.diller)).catch(() => setD([])); }, [surum]);
  if (!d?.length) return null;
  const sorunlu = d.filter(x => x.eski.length || x.eksik.length);
  const etiket = o => o.test ? t('cev.test') : o.adim ? `${o.bolumAd} › ${o.adimAd}` : `${o.bolumAd} · ${t('cev.bolum')}`;
  return (
    <section className={'kutu ceviri-durumu' + (sorunlu.length ? ' uyari' : '')} aria-live="polite">
      <div className="ceviri-bas">
        <h2>{t('cev.baslik')}</h2>
        <ul className="ceviri-ciplar">
          {d.map(x => (
            <li key={x.dil} className={x.eski.length || x.eksik.length ? 'sorun' : 'iyi'}>
              <b>{DIL_AD[x.dil] || x.dil}</b>{' '}
              {x.eski.length || x.eksik.length
                ? [x.eski.length ? t('cev.eski', { n: x.eski.length }) : '', x.eksik.length ? t('cev.eksik', { n: x.eksik.length }) : ''].filter(Boolean).join(' · ')
                : t('cev.guncel')}
            </li>
          ))}
        </ul>
      </div>
      {sorunlu.length > 0 && <>
        <p className="soluk">{t('cev.m')}</p>
        {sorunlu.map(x => (
          <details key={x.dil}>
            <summary>{DIL_AD[x.dil] || x.dil}</summary>
            <ul>
              {x.eski.map((o, i) => <li key={'e' + i}><span className="cev-etiket eski">{t('cev.eski.k')}</span> {etiket(o)}</li>)}
              {x.eksik.map((o, i) => <li key={'k' + i}><span className="cev-etiket eksik">{t('cev.eksik.k')}</span> {etiket(o)}</li>)}
            </ul>
          </details>
        ))}
      </>}
    </section>
  );
}

export default function YonetimIcerik() {
  const { t, dil, yenile } = useB();
  const [veri, setVeri] = useState(null);
  const [secili, setSecili] = useState(0); // bölüm sırası ya da 'test'
  const [degisti, setDegisti] = useState(false);
  const [mesaj, setMesaj] = useState(null);
  const [surum, setSurum] = useState(0);
  useEffect(() => { api('yonetim/icerik').then(setVeri); }, []);
  useEffect(() => {
    const uyar = e => { if (degisti) { e.preventDefault(); e.returnValue = ''; } };
    addEventListener('beforeunload', uyar);
    return () => removeEventListener('beforeunload', uyar);
  }, [degisti]);
  if (!veri) return <Yukleniyor />;

  const guncelle = y => { setVeri(y); setDegisti(true); setMesaj(null); };
  const bolumDegis = (i, b) => guncelle({ ...veri, bolumler: veri.bolumler.map((x, k) => k === i ? b : x) });
  function ekle() {
    const id = 'bolum-' + Math.random().toString(36).slice(2, 7);
    guncelle({ ...veri, bolumler: [...veri.bolumler, { id, renk: 'mavi', simge: 'kitap', dakika: 10, baslik: { tr: t('ic.yeni'), en: 'New part' }, ozet: bos2(), hedefler: { tr: [], en: [] },
      adimlar: [{ id: 'giris', tur: 'metin', baslik: { tr: t('adim.tur.metin'), en: 'Lesson' }, govde: bos2() }] }] });
    setSecili(veri.bolumler.length);
  }
  function tasi(i, yon) {
    const b = [...veri.bolumler]; const j = i + yon;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]]; guncelle({ ...veri, bolumler: b }); setSecili(j);
  }
  function sil(i) {
    if (veri.bolumler.length <= 1) return;
    guncelle({ ...veri, bolumler: veri.bolumler.filter((_, k) => k !== i) }); setSecili(Math.max(0, i - 1));
  }
  async function kaydet() {
    try {
      const y = await api('yonetim/icerik', { method: 'PUT', govde: { bolumler: veri.bolumler, test: veri.test, gecme: veri.gecme } });
      setVeri(y); setDegisti(false); setMesaj({ tur: 'ok', metin: t('ic.kaydedildi') }); setSurum(s => s + 1);
      yenile();
    } catch (x) {
      setMesaj({ tur: 'hata', metin: x.kod.startsWith('icerik:') ? `⚠ ${x.kod.slice(7)}` : t('hata.' + x.kod) });
    }
  }
  const ad = b => b.baslik?.[dil] || b.baslik?.tr || b.baslik?.en || b.id;
  const b = secili === 'test' ? null : veri.bolumler[secili];

  return (
    <>
    <CeviriDurumu surum={surum} />
    <div className="icerik-duzen">
      <aside className="duzen-liste">
        <h2>{t('ic.bolumler')}</h2>
        <ol>
          {veri.bolumler.map((x, i) => (
            <li key={x.id}>
              <button className={'duzen-oge renk-' + x.renk + (secili === i ? ' secili' : '')} onClick={() => setSecili(i)}>
                <span className="bolum-simge"><Simge ad={x.simge} boy={18} /></span><span>{i + 1}. {ad(x)}</span>
                <small className="soluk">{x.adimlar?.length}</small>
              </button>
            </li>
          ))}
        </ol>
        <button className="bag" onClick={ekle}>{t('ic.ekle')}</button>
        <button className={'duzen-oge test-oge' + (secili === 'test' ? ' secili' : '')} onClick={() => setSecili('test')}>
          <span className="bolum-simge"><Simge ad="test" boy={18} /></span><span>{t('ic.test')} ({veri.test.length})</span>
        </button>
      </aside>

      <section className="kutu duzen-alan">
        {b ? <>
          <div className="duzen-bas">
            <h2>{secili + 1}. {ad(b)}</h2>
            <div className="eylemler">
              <button className="bag" onClick={() => tasi(secili, -1)} disabled={secili === 0}>↑ {t('ic.yukari')}</button>
              <button className="bag" onClick={() => tasi(secili, 1)} disabled={secili === veri.bolumler.length - 1}>↓ {t('ic.asagi')}</button>
              <button className="bag tehlike-yazi" onClick={() => sil(secili)} disabled={veri.bolumler.length <= 1}>{t('ic.sil')}</button>
            </div>
          </div>
          <BolumDuzen key={b.id} b={b} meta={veri} degis={y => bolumDegis(secili, y)} />
        </> : <>
          <div className="duzen-bas">
            <h2>{t('ic.test')}</h2>
            <label className="satir-ici">{t('ic.gecme')}
              <input type="number" min="1" max={veri.test.length} value={veri.gecme} onChange={e => guncelle({ ...veri, gecme: Number(e.target.value) })} />
              / {veri.test.length}
            </label>
          </div>
          {veri.test.map((q, i) => (
            <SoruDuzen key={i} no={i + 1} q={{ ...q, tur: 'cs' }}
              degis={y => guncelle({ ...veri, test: veri.test.map((x, k) => k === i ? { soru: y.soru, secenekler: y.secenekler, dogru: y.dogru } : x) })}
              sil={() => veri.test.length > 1 && guncelle({ ...veri, test: veri.test.filter((_, k) => k !== i), gecme: Math.min(veri.gecme, veri.test.length - 1) })} />
          ))}
          <button className="dugme ikincil kucuk" onClick={() => guncelle({ ...veri, test: [...veri.test, { soru: bos2(), secenekler: [bos2(), bos2(), bos2(), bos2()], dogru: 0 }] })}>{t('ic.test.ekle')}</button>
        </>}
      </section>

      <div className={'kaydet-cubugu' + (degisti ? ' gorunur' : '')}>
        <span>{mesaj ? <b className={mesaj.tur === 'ok' ? 'yesil-yazi' : 'tehlike-yazi'}>{mesaj.metin}</b> : degisti ? t('ic.degisti') : ''}</span>
        <button className="dugme" onClick={kaydet} disabled={!degisti}>{t('ic.kaydet')}</button>
      </div>
    </div>
    </>
  );
}
