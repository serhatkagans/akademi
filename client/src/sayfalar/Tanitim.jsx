import { useB } from '../baglam.js';
import Simge from '../bilesenler/Simge.jsx';

const ORTAKLAR = [
  ['Ankara Hacı Bayram Veli Üniversitesi', 'TR'], ['Bilişim Teknolojileri Eğitimcileri Derneği', 'TR'],
  ['Università del Salento', 'IT'], ['Asociația GEO CLUB', 'RO'], ['Caribbean Education and Culture Foundation', 'NL'],
  ['EducPro', 'PT'], ['People of 2050', 'DK'],
];

export default function Tanitim() {
  const { t, uye, icerik } = useB();
  const dakika = icerik.bolumler.reduce((a, b) => a + b.dakika, 0) + 15;
  return (
    <>
      <section className="kahraman">
        <div className="kahraman-ic">
          <div className="kahraman-metin">
            <p className="rozet">{t('tan.ust')}</p>
            <h1>{t('tan.baslik')}</h1>
            <p className="kahraman-alt">{t('tan.alt')}</p>
            <div className="kahraman-eylem">
              {uye
                ? <a className="dugme buyuk" href="#/pano">{t('tan.devam')} <Simge ad="ok" boy={20} /></a>
                : <>
                  <a className="dugme buyuk" href="#/kayit">{t('tan.basla')} <Simge ad="ok" boy={20} /></a>
                  <a className="bag-acik" href="#/giris">{t('tan.zaten')} {t('nav.giris')}</a>
                </>}
            </div>
            <dl className="kunye">
              <div><dt>{icerik.bolumler.length}</dt><dd>{t('tan.k1')}</dd></div>
              <div><dt>~{Math.round(dakika / 10) * 10}</dt><dd>{t('tan.k2')}</dd></div>
              <div><dt>{t('tan.k3d')}</dt><dd>{t('tan.k3')}</dd></div>
              <div><dt><Simge ad="sertifika" boy={26} /></dt><dd>{t('tan.k4')}</dd></div>
            </dl>
          </div>
          <div className="kahraman-gorsel" aria-hidden="true">
            <div className="yorunge">
              {[['yesil', 'yaprak'], ['sosyal', 'eller'], ['dijital', 'ekran']].map(([k, sm], i) => (
                <span key={k} className={'gezegen y' + (i + 1)}>
                  <i><Simge ad={sm} boy={22} /></i>{t('tan.' + k)}
                </span>
              ))}
              <img src="logo.png" alt="" className="merkez" />
            </div>
          </div>
        </div>
      </section>

      <section className="bolge">
        <h2>{t('tan.uc')}</h2>
        <div className="uclu">
          {[['yesil', 'yaprak'], ['sosyal', 'eller'], ['dijital', 'ekran']].map(([k, s]) => (
            <article key={k} className={'yol-kart renk-' + (k === 'yesil' ? 'yesil' : k === 'sosyal' ? 'mor' : 'camgobegi')}>
              <span className="yol-simge"><Simge ad={s} boy={28} /></span>
              <h3>{t('tan.' + k)}</h3>
              <p>{t('tan.' + k + '.m')}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bolge acik-zemin">
        <h2>{t('tan.nasil')}</h2>
        <ol className="adimlar">
          {['a1', 'a2', 'a3', 'a4'].map((a, i) => (
            <li key={a}><span className="adim-no">{i + 1}</span><h3>{t('tan.' + a)}</h3><p>{t('tan.' + a + '.m')}</p></li>
          ))}
        </ol>
      </section>

      <section className="bolge">
        <div className="iki-sutun">
          <div>
            <h2>{t('tan.kimler')}</h2>
            <p className="genis-metin">{t('tan.kimler.m')}</p>
            {!uye && <a className="dugme" href="#/kayit">{t('nav.kayit')}</a>}
          </div>
          <div>
            <h2>{t('tan.ortak')}</h2>
            <ul className="ortaklar">
              {ORTAKLAR.map(([ad, ulke]) => <li key={ad}><span className="ulke-kod">{ulke}</span>{ad}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
