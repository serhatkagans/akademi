import { yerel } from '../dil.js';
import { useB } from '../baglam.js';
import Simge from '../bilesenler/Simge.jsx';
import { Halka } from '../bilesenler/Kabuk.jsx';
import Rozetler from '../bilesenler/Rozetler.jsx';

/* Bölümün durumu: tamam / devam (bir şey yapılmış) / yeni. */
export const bolumDurumu = d => d.tamam ? 'tamam' : d.biten > 0 ? 'devam' : 'yeni';

export default function Pano() {
  const { t, dil, uye, icerik, durum } = useB();
  if (!durum) return null;
  const bitenler = durum.bolumler.filter(b => b.tamam).length;
  /* Genel ilerleme ADIM bazında: bütün ders adımları + son test, anket, sertifika. */
  const adimSayisi = durum.bolumler.reduce((a, b) => a + b.toplam, 0) + 3;
  const biten = durum.bolumler.reduce((a, b) => a + b.biten, 0) + (durum.test.gecti ? 1 : 0) + (durum.anket ? 1 : 0) + (durum.sertifika ? 1 : 0);
  const siradaki = icerik.bolumler.find((b, i) => !durum.bolumler[i].tamam);
  const ilkAd = uye.ad.split(' ')[0];

  const adimlar = [
    { ad: 'test', simge: 'test', yol: '#/test', acik: durum.bolumlerTamam, tamam: durum.test.gecti, kilit: 'kilit.bolum' },
    { ad: 'anket', simge: 'anket', yol: '#/anket', acik: durum.test.gecti, tamam: durum.anket, kilit: 'kilit.test' },
    { ad: 'sert', simge: 'sertifika', yol: '#/sertifika', acik: durum.anket, tamam: !!durum.sertifika, kilit: 'kilit.anket' },
  ];

  return (
    <div className="kap">
      <section className="pano-ust">
        <div>
          <h1>{t('pano.merhaba', { ad: ilkAd })}</h1>
          <p className="soluk">{t('pano.alt')}</p>
          {siradaki ? (
            <a className="devam-kart" href={'#/bolum/' + siradaki.id}>
              <span className={'devam-simge renk-' + siradaki.renk}><Simge ad={siradaki.simge} boy={28} /></span>
              <span>
                <small>{bitenler ? t('pano.devam') : t('pano.baslat')}</small>
                <b>{siradaki.baslik}</b>
              </span>
              <Simge ad="ok" className="devam-ok" />
            </a>
          ) : !durum.sertifika && (
            <a className="devam-kart" href={adimlar.find(a => a.acik && !a.tamam)?.yol || '#/test'}>
              <span className="devam-simge renk-turuncu"><Simge ad="sertifika" boy={28} /></span>
              <span><small>{t('pano.son')}</small><b>{t(adimlar.find(a => a.acik && !a.tamam) ? 'adim.' + adimlar.find(a => a.acik && !a.tamam).ad : 'adim.test')}</b></span>
              <Simge ad="ok" className="devam-ok" />
            </a>
          )}
        </div>
        <Halka oran={biten / adimSayisi} boy={140} kalin={14}>
          <b>{new Intl.NumberFormat(yerel(dil), { style: 'percent' }).format(adimSayisi ? biten / adimSayisi : 0)}</b>
          <small>{t('pano.bolum', { n: bitenler, t: icerik.bolumler.length })}</small>
        </Halka>
      </section>

      <h2 className="ara-baslik">{t('pano.bolumler')}</h2>
      <ol className="bolum-izgara">
        {icerik.bolumler.map((b, i) => {
          const d = durum.bolumler[i];
          const st = bolumDurumu(d);
          return (
            <li key={b.id}>
              <a className={`bolum-kart renk-${b.renk} durum-${st}`} href={'#/bolum/' + b.id}>
                <span className="bolum-ust">
                  <span className="bolum-simge"><Simge ad={b.simge} boy={26} /></span>
                  <span className="bolum-etiket">{t('pano.bolumNo', { n: i + 1 })}</span>
                </span>
                <h3>{b.baslik}</h3>
                <p>{b.ozet}</p>
                <span className="bolum-cubuk" aria-hidden="true"><i style={{ width: `${(d.biten / d.toplam) * 100}%` }} /></span>
                <span className="bolum-alt">
                  <span className="etiketler">
                    <span><Simge ad="kitap" boy={15} /> {t('dk', { n: b.dakika })}</span>
                    <span><Simge ad="kartlar" boy={15} /> {t('adim.sayi', { n: b.adimlar.length })}</span>
                    {b.adimlar.some(x => x.tur === 'video') && <span><Simge ad="video" boy={15} /> {b.adimlar.filter(x => x.tur === 'video').length}</span>}
                  </span>
                  <span className={'durum-rozet ' + st}>
                    {st === 'tamam' && <Simge ad="tik" boy={14} />} {t('durum.' + st)}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      <Rozetler />

      <a className="fikir-kart" href="#/fikrim">
        <span className="devam-simge renk-turuncu"><Simge ad="roket" boy={26} /></span>
        <span><b>{t('pano.fikir')}</b><small>{t('pano.fikir.m')}</small></span>
        <Simge ad="ok" className="devam-ok" />
      </a>

      <h2 className="ara-baslik">{t('pano.son')}</h2>
      <ol className="son-adimlar">
        {adimlar.map(a => (
          <li key={a.ad}>
            {a.acik ? (
              <a className={'son-adim' + (a.tamam ? ' tamam' : '')} href={a.yol}>
                <span className="son-simge"><Simge ad={a.tamam ? 'tik' : a.simge} /></span>
                <span><b>{t('adim.' + a.ad)}</b><small>{a.ad === 'test' && durum.test.enIyi !== null
                  ? t('test.enIyi', { p: durum.test.enIyi, t: durum.test.toplam }) : t('adim.' + a.ad + '.m')}</small></span>
              </a>
            ) : (
              <div className="son-adim kilitli" aria-disabled="true">
                <span className="son-simge"><Simge ad="kilit" /></span>
                <span><b>{t('adim.' + a.ad)}</b><small>{t(a.kilit)}</small></span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
