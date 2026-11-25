import { useEffect, useState } from 'react';
import { useB, git } from '../baglam.js';
import { api } from '../api.js';
import Simge from '../bilesenler/Simge.jsx';
import { AdimIcerik, ADIM_SIMGE } from '../bilesenler/Adimlar.jsx';

/**
 * Ders oynatıcısı: #/bolum/<id>/<adım no>. Solda adım listesi (telefonda üstte ilerleme),
 * ortada tek adım, altta Önceki / Devam. Okuma, örnek ve kavram kartlarında "Devam"
 * adımı tamamlar; video, sına ve etkinlik kendi koşuluyla tamamlanır.
 */
export default function Bolum({ id, no }) {
  const { t, icerik, durum, setDurum } = useB();
  const [bekle, setBekle] = useState(false);
  const bi = icerik.bolumler.findIndex(b => b.id === id);
  const b = icerik.bolumler[bi];
  const d = durum?.bolumler.find(x => x.id === id);
  /* Adres adım içermiyorsa ilk tamamlanmamış adıma git. */
  const ilkEksik = b ? Math.max(0, b.adimlar.findIndex(a => !d?.adimlar[a.id]?.tamam)) : 0;
  const ai = no ? Math.min(Math.max(Number(no) - 1, 0), (b?.adimlar.length || 1) - 1) : ilkEksik;
  useEffect(() => { if (b && !no) git(`/bolum/${id}/${ilkEksik + 1}`); }, [id, no]); // eslint-disable-line
  if (!b || !d) return <div className="kap"><a href="#/pano">{t('genel.geri')}</a></div>;

  const a = b.adimlar[ai];
  const ad = d.adimlar[a.id] || {};
  const pasif = ['metin', 'ornek', 'kartlar'].includes(a.tur);
  const sonAdim = ai === b.adimlar.length - 1;
  const sonraki = icerik.bolumler[bi + 1];

  async function devam() {
    if (pasif && !ad.tamam) {
      setBekle(true);
      try { setDurum((await api(`ogren/adim/${b.id}/${a.id}/goruldu`, { method: 'POST', govde: {} })).durum); } finally { setBekle(false); }
    }
    if (!sonAdim) git(`/bolum/${b.id}/${ai + 2}`);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const gereken = !ad.tamam && !pasif ? t('adim.gerek.' + a.tur) : '';

  return (
    <article className={'ders renk-' + b.renk}>
      <header className="ders-bas">
        <div className="kap genis">
          <a className="geri" href="#/pano">{t('genel.geri')}</a>
          <div className="ders-bas-ic">
            <span className="bolum-bas-simge"><Simge ad={b.simge} boy={30} /></span>
            <div>
              <p className="ust-yazi">{t('pano.bolumNo', { n: bi + 1 })} · {t('dk', { n: b.dakika })}</p>
              <h1>{b.baslik}</h1>
            </div>
            <div className="ders-ilerleme" aria-label={t('adim.ilerleme', { n: d.biten, t: d.toplam })}>
              <span>{t('adim.ilerleme', { n: d.biten, t: d.toplam })}</span>
              <span className="mini-cubuk genis"><i style={{ width: `${(d.biten / d.toplam) * 100}%` }} /></span>
            </div>
          </div>
        </div>
      </header>

      <div className="kap genis ders-govde">
        <nav className="ders-liste" aria-label={t('adim.liste')}>
          {b.hedefler?.length > 0 && (
            <div className="hedefler">
              <b><Simge ad="hedef" boy={16} /> {t('adim.hedefler')}</b>
              <ul>{b.hedefler.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </div>
          )}
          <ol>
            {b.adimlar.map((x, k) => {
              const tamam = d.adimlar[x.id]?.tamam;
              return (
                <li key={x.id}>
                  <a href={`#/bolum/${b.id}/${k + 1}`} className={(k === ai ? 'su ' : '') + (tamam ? 'tamam' : '')} aria-current={k === ai ? 'step' : undefined}>
                    <span className="adim-durum">{tamam ? <Simge ad="tik" boy={14} /> : k + 1}</span>
                    <span className="adim-ad"><small>{t('adim.tur.' + x.tur)}</small>{x.baslik}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="ders-alan">
          <div className="kutu adim-kutu">
            <p className="adim-tur"><Simge ad={ADIM_SIMGE[a.tur]} boy={16} /> {t('adim.tur.' + a.tur)} · {t('adim.no', { n: ai + 1, t: b.adimlar.length })}</p>
            <h2 className="adim-baslik">{a.baslik}</h2>
            <AdimIcerik key={a.id} a={a} bolumId={b.id} d={ad} />
          </div>

          {d.tamam && sonAdim && (
            <div className="kutlama" role="status">
              <span className="kutlama-simge"><Simge ad="tik" boy={30} /></span>
              <h2>{t('bol.tamam')}</h2>
              <div className="eylemler">
                {sonraki
                  ? <a className="dugme" href={'#/bolum/' + sonraki.id}>{t('bol.sonraki')}: {sonraki.baslik} <Simge ad="ok" boy={18} /></a>
                  : <a className="dugme" href="#/test">{t('adim.test')} <Simge ad="ok" boy={18} /></a>}
                <a className="dugme ikincil" href="#/pano">{t('bol.panoya')}</a>
              </div>
            </div>
          )}

          <div className="ders-gezinme">
            {ai > 0
              ? <a className="dugme ikincil" href={`#/bolum/${b.id}/${ai}`}><Simge ad="oncekiOk" boy={18} /> {t('adim.onceki')}</a>
              : <span />}
            <div className="ders-gezinme-sag">
              {gereken && <small className="soluk">{gereken}</small>}
              {!(sonAdim && (ad.tamam || !pasif)) && (
                <button className="dugme" onClick={devam} disabled={bekle}>
                  {pasif && !ad.tamam ? t('adim.tamamla') : t('adim.devam')} <Simge ad="ok" boy={18} />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
