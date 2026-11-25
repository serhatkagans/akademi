import { useMemo, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import Simge from './Simge.jsx';
import Video, { karistir } from './Video.jsx';
import NotAlani from './Not.jsx';

/* Adım türlerinin simgeleri ve etiketleri (liste ve başlıkta). */
export const ADIM_SIMGE = { metin: 'kitap', video: 'video', ornek: 'dunya', kartlar: 'kartlar', sina: 'test', etkinlik: 'kalem' };

/** Konu anlatımı. */
function Metin({ a }) {
  return <div className="okuma" dangerouslySetInnerHTML={{ __html: a.govde }} />;
}

/** Gerçek bir girişimin hikâyesi. */
function Ornek({ a }) {
  const { t } = useB();
  return (
    <div className="ornek">
      <div className="ornek-bas">
        <span className="ornek-harf" aria-hidden="true">{String(a.kurulus).slice(0, 1)}</span>
        <div><b>{a.kurulus}</b><small>{a.yer}</small></div>
      </div>
      <div className="okuma" dangerouslySetInnerHTML={{ __html: a.govde }} />
      {a.ders && <aside className="ornek-ders"><Simge ad="ampul" boy={20} /><div><b>{t('adim.ders')}</b><p>{a.ders}</p></div></aside>}
    </div>
  );
}

/** Anahtar kavram kartları: dokununca/tıklayınca çevrilir. */
function Kartlar({ a }) {
  const { t } = useB();
  const [acik, setAcik] = useState({});
  return (
    <>
      <p className="soluk">{t('adim.kartlar.ipucu')}</p>
      <div className="kartlar">
        {a.kartlar.map((k, i) => (
          <button key={i} className={'kavram' + (acik[i] ? ' cevrik' : '')} aria-pressed={!!acik[i]} onClick={() => setAcik({ ...acik, [i]: !acik[i] })}>
            <span className="kavram-on"><b>{k.on}</b><small>{t('adim.kartlar.cevir')}</small></span>
            <span className="kavram-arka"><b>{k.on}</b><span>{k.arka}</span></span>
          </button>
        ))}
      </div>
    </>
  );
}

/** Bilgini sına: her soru anında denetlenir, açıklama cevaptan sonra gelir. */
function Sina({ a, yol, d }) {
  const { t, setDurum } = useB();
  const [secim, setSecim] = useState({});
  /* Seçenekler karışık gösterilir; sunucuya özgün sıra gider. */
  const sira = useMemo(() => a.sorular.map(q => karistir(q.secenekler.length)), [a]);
  const [sonuc, setSonuc] = useState(() => Object.fromEntries((d.cevaplar || []).map(i => [i, { dogru: true }])));
  async function denetle(i) {
    const r = await api(yol + '/soru', { method: 'POST', govde: { soru: i, cevap: secim[i] } });
    setSonuc({ ...sonuc, [i]: { dogru: r.dogru, aciklama: r.aciklama } });
    setDurum(r.durum);
  }
  return (
    <ol className="sina">
      {a.sorular.map((q, i) => {
        const s = sonuc[i];
        return (
          <li key={i} className={'sina-soru' + (s ? (s.dogru ? ' dogru' : ' yanlis') : '')}>
            <p className="sina-metin"><span className="soru-no">{i + 1}</span>{q.soru}</p>
            <div className="cevaplar">
              {sira[i].map(k => (
                <label key={k} className={'cevap' + (secim[i] === k ? ' secili' : '')}>
                  <input type="radio" name={`s${a.id}${i}`} checked={secim[i] === k} disabled={s?.dogru}
                    onChange={() => { setSecim({ ...secim, [i]: k }); if (s && !s.dogru) setSonuc({ ...sonuc, [i]: undefined }); }} />
                  {q.secenekler[k]}
                </label>
              ))}
            </div>
            {s ? (
              <div className={'geri-bildirim ' + (s.dogru ? 'dogru' : 'yanlis')} role="status">
                <b>{t(s.dogru ? 'adim.sina.dogru' : 'adim.sina.yanlis')}</b>
                {s.dogru && s.aciklama && <p>{s.aciklama[document.documentElement.lang] || s.aciklama.en || s.aciklama.tr}</p>}
              </div>
            ) : (
              <button className="dugme ikincil kucuk" disabled={secim[i] === undefined} onClick={() => denetle(i)}>{t('vid.kontrol')}</button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Etkinlik: yazılı görev; cevap deftere kaydedilir ve adımı tamamlar. */
function Etkinlik({ a, bolumId }) {
  const { t, setDurum } = useB();
  return (
    <div className="etkinlik">
      <p className="etkinlik-soru">{a.soru}</p>
      <NotAlani anahtar={`adim:${bolumId}:${a.id}`} ip={a.ipucu} onKayit={r => r?.durum && setDurum(r.durum)} />
      <p className="soluk kucuk-yazi">{t('bol.gorev.not')} <a href="#/fikrim">{t('nav.fikrim')} →</a></p>
    </div>
  );
}

/** Adımı türüne göre çizer. */
export function AdimIcerik({ a, bolumId, d }) {
  const yol = `ogren/adim/${bolumId}/${a.id}`;
  switch (a.tur) {
    case 'metin': return <Metin a={a} />;
    case 'ornek': return <Ornek a={a} />;
    case 'kartlar': return <Kartlar a={a} />;
    case 'sina': return <Sina a={a} yol={yol} d={d} />;
    case 'etkinlik': return <Etkinlik a={a} bolumId={bolumId} />;
    case 'video': return <Video yol={yol} video={a} d={d} />;
    default: return null;
  }
}
