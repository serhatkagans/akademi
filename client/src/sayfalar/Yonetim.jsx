import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { yerel } from '../dil.js';
import { Yukleniyor } from '../bilesenler/Kabuk.jsx';
import YonetimIcerik from './YonetimIcerik.jsx';
import YonetimKaynak from './YonetimKaynak.jsx';
import YonetimUyeler, { YonetimPosta } from './YonetimUyeler.jsx';
import YonetimRapor from './YonetimRapor.jsx';

/* Başvurudaki göstergeler, hedefleriyle yan yana. Tek sayfa. */
function Kart({ baslik, deger, alt, hedef, oran }) {
  return (
    <div className={'gosterge' + (hedef !== undefined ? (oran >= hedef ? ' iyi' : ' dusuk') : '')}>
      <small>{baslik}</small>
      <b>{deger}</b>
      {alt && <span>{alt}</span>}
    </div>
  );
}

function Cubuklar({ baslik, veri, etiket }) {
  const enCok = Math.max(1, ...Object.values(veri));
  return (
    <section className="kutu">
      <h2>{baslik}</h2>
      <ul className="cubuklar">
        {Object.entries(veri).map(([k, v]) => (
          <li key={k}><span>{etiket(k)}</span><span className="cubuk-yatay"><i style={{ width: `${(v / enCok) * 100}%` }} /></span><b>{v}</b></li>
        ))}
      </ul>
    </section>
  );
}

export default function Yonetim({ sekme = 'gosterge' }) {
  const { t, uye } = useB();
  if (!uye.yonetici) return <div className="kap"><p>{t('hata.kilitli')}</p></div>;
  return (
    <div className="kap">
      <nav className="sekmeler ekran-yalniz" aria-label={t('nav.yonetim')}>
        {['gosterge', 'rapor', 'icerik', 'kaynak', 'uyeler', 'posta'].map(s => <a key={s} href={'#/yonetim/' + s} className={sekme === s ? 'secili' : ''}>{t('yon.sekme.' + s)}</a>)}
      </nav>
      {sekme === 'icerik' ? <YonetimIcerik /> : sekme === 'kaynak' ? <YonetimKaynak /> : sekme === 'uyeler' ? <YonetimUyeler /> : sekme === 'posta' ? <YonetimPosta /> : sekme === 'rapor' ? <YonetimRapor /> : <Gostergeler />}
    </div>
  );
}

function Gostergeler() {
  const { t, dil, uye, icerik } = useB();
  const [o, setO] = useState(null);
  useEffect(() => { if (uye.yonetici) api('yonetim/ozet').then(setO); }, [uye]);
  if (!o) return <Yukleniyor />;
  const adi = id => icerik.bolumler.find(b => b.id === id)?.baslik || id;

  return (
    <div>
      <div className="yonetim-ust">
        <div><h1>{t('yon.baslik')}</h1><p className="soluk">{t('yon.alt')}</p>
          <p className="soluk yedek-satir">{o.yedek ? t('yon.yedek', { z: new Date(o.yedek.zaman).toLocaleString(yerel(dil)) }) : t('yon.yedek.yok')}</p></div>
        <div className="rap-dugmeler"><a className="dugme ikincil" href="api/yonetim/uyeler.csv">{t('yon.csv')}</a><a className="dugme" href="#/yonetim/rapor">{t('rap.baslik')}</a></div>
      </div>

      {o.video?.bozuk?.length > 0 && (
        <div className="video-uyari" role="alert">
          <b>{t('yon.video.bozuk', { n: o.video.bozuk.length })}</b> <span>{t('yon.video.m')}</span>
          <ul>{o.video.bozuk.map(v => <li key={v.bolum + v.adim}><a href={'#/yonetim/icerik'}>{v.bolumAd} › {v.baslik}</a> <small>({v.youtube} · {t('yon.video.' + v.durum)})</small></li>)}</ul>
        </div>
      )}
      <div className="gostergeler">
        <Kart baslik={t('yon.kayitli')} deger={o.kayitli} />
        <Kart baslik={t('yon.tamamlama')} deger={`%${o.tamamlamaOrani}`} alt={`${o.tumunuBitiren} · ${t('yon.hedef', { h: '≥%70' })}`} hedef={70} oran={o.tamamlamaOrani} />
        <Kart baslik={t('yon.sertifika')} deger={o.sertifika} alt={`%${o.sertifikaOrani} · ${t('yon.hedef', { h: '≥%65' })}`} hedef={65} oran={o.sertifikaOrani} />
        <Kart baslik={t('yon.azfirsat')} deger={`%${o.azFirsat.oran}`} alt={`${o.azFirsat.sayi} · ${t('yon.hedef', { h: '%40' })}`} hedef={40} oran={o.azFirsat.oran} />
        <Kart baslik={t('yon.test')} deger={`${o.test.giren} / ${o.test.gecen}`} alt={t('yon.test.oran', { g: o.test.girmeOrani, p: o.test.gecmeOrani })} />
        <Kart baslik={t('rap.anketSayi')} deger={o.anket.sayi} alt={t('yon.anket.oran', { o: o.anket.oran ?? 0 })} />
        <Kart baslik={t('yon.giris')} deger={o.giris} />
        <Kart baslik={t('yon.sure')} deger={t('dk', { n: o.ortSureDk })} />
        <Kart baslik={t('yon.video')} deger={`%${o.videoOrtIzleme}`} />
        <Kart baslik={t('yon.indirme')} deger={o.indirme} />
        <Kart baslik={t('yon.grup')} deger={o.grup} />
      </div>

      <div className="yonetim-izgara">
        <Cubuklar baslik={t('yon.bolumler')} veri={Object.fromEntries(o.bolumler.map(b => [b.id, b.tamam]))} etiket={adi} />
        <Cubuklar baslik={t('yon.ulke')} veri={o.ulke} etiket={k => t('ulke.' + k)} />
        <Cubuklar baslik={t('yon.yas')} veri={o.yas} etiket={k => k} />
        <Cubuklar baslik={t('yon.rol')} veri={o.rol} etiket={k => t('rol.' + k)} />
        <section className="kutu">
          <h2>{t('yon.anket', { n: o.anket.sayi })}</h2>
          <ul className="cubuklar">
            {icerik.anket.map(m => (
              <li key={m.id}><span>{m.metin}</span><span className="cubuk-yatay"><i style={{ width: `${((o.anket.puan[m.id] || 0) / 5) * 100}%` }} /></span><b>{o.anket.puan[m.id] ?? '–'}</b></li>
            ))}
          </ul>
        </section>
        <section className="kutu">
          <h2>{t('yon.yorumlar')}</h2>
          {o.anket.yorumlar.length ? <ul className="yorumlar">{o.anket.yorumlar.map((y, i) => <li key={i}>“{y}”</li>)}</ul> : <p className="soluk">—</p>}
        </section>
      </div>
    </div>
  );
}
