import { useMemo, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import Simge from '../bilesenler/Simge.jsx';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';

/* Seçenekler her denemede karıştırılır; sunucuya seçeneğin ÖZGÜN sırası gider. */
const karistir = n => {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export default function Test() {
  const { t, icerik, durum, setDurum } = useB();
  const [deneme, setDeneme] = useState(0);
  const sira = useMemo(() => icerik.test.map(q => karistir(q.secenekler.length)), [icerik, deneme]);
  const [cevap, setCevap] = useState({});
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState('');
  const toplam = icerik.test.length;
  const n = Object.keys(cevap).length;

  if (!durum.bolumlerTamam) {
    return <div className="kap dar"><div className="kutu ortala"><Simge ad="kilit" boy={40} /><h1>{t('adim.test')}</h1><p>{t('kilit.bolum')}</p><a className="dugme" href="#/pano">{t('bol.panoya')}</a></div></div>;
  }

  async function gonder(e) {
    e.preventDefault();
    if (n < toplam) { setHata(''); return; }
    try {
      const r = await api('ogren/test', { method: 'POST', govde: { cevaplar: icerik.test.map((_, i) => cevap[i]) } });
      setSonuc(r); setDurum(r.durum); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x) { setHata(x.kod); }
  }
  function tekrar() { setCevap({}); setSonuc(null); setDeneme(deneme + 1); window.scrollTo(0, 0); }

  return (
    <div className="kap dar">
      <a className="geri" href="#/pano">{t('genel.geri')}</a>
      <h1>{t('test.baslik')}</h1>
      <p className="soluk">{t('test.alt', { t: toplam, g: icerik.gecme })}</p>

      {sonuc && (
        <div className={'sonuc-kart ' + (sonuc.gecti ? 'gecti' : 'kaldi')} role="status">
          <span className="sonuc-puan">{sonuc.puan}<small>/{sonuc.toplam}</small></span>
          <p>{sonuc.gecti ? t('test.gecti', { p: sonuc.puan, t: sonuc.toplam }) : t('test.kaldi', { p: sonuc.puan, t: sonuc.toplam, g: icerik.gecme })}</p>
          {sonuc.gecti
            ? <a className="dugme" href="#/anket">{t('test.ankete')} <Simge ad="ok" boy={18} /></a>
            : <button className="dugme" onClick={tekrar}>{t('test.tekrar')}</button>}
        </div>
      )}

      <form onSubmit={gonder}>
        <ol className="sorular">
          {icerik.test.map((q, i) => (
            <li key={i} className={'kutu soru' + (sonuc ? (sonuc.sonuc[i] ? ' dogru' : ' yanlis') : '')}>
              <fieldset disabled={!!sonuc}>
                <legend><span className="soru-no">{i + 1}</span>{q.soru}</legend>
                {sira[i].map(k => (
                  <label key={k} className={'cevap' + (cevap[i] === k ? ' secili' : '')}>
                    <input type="radio" name={'s' + i} checked={cevap[i] === k} onChange={() => setCevap({ ...cevap, [i]: k })} />
                    {q.secenekler[k]}
                  </label>
                ))}
              </fieldset>
            </li>
          ))}
        </ol>
        {!sonuc && <>
          <HataKutusu kod={hata} />
          <div className="test-alt">
            <span className="soluk">{n < toplam ? t('test.eksik', { n, t: toplam }) : ''}</span>
            <button className="dugme buyuk" disabled={n < toplam}>{t('test.gonder')}</button>
          </div>
        </>}
      </form>
    </div>
  );
}
