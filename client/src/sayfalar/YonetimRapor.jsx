import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { yerel } from '../dil.js';
import { Yukleniyor } from '../bilesenler/Kabuk.jsx';
import Simge from '../bilesenler/Simge.jsx';

/**
 * Ulusal Ajans raporu için gösterge özeti.
 *  - Excel: sunucuda üretilir (/api/yonetim/rapor.xlsx, Türkçe ya da İngilizce, 7 sayfa).
 *  - PDF: bu sayfa A4 belge olarak yazdırılır (tarayıcıda "PDF olarak kaydet").
 * Kişisel veri yok: yalnızca sayılar, oranlar ve isimsiz anket yorumları.
 */
const HEDEF = { tamamlama: 70, sertifika: 65, azFirsat: 40 };

export default function YonetimRapor() {
  const { t, dil, icerik } = useB();
  const [o, setO] = useState(null);
  useEffect(() => { api('yonetim/ozet').then(setO); }, []);
  if (!o) return <Yukleniyor />;

  const simdi = new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const n = o.kayitli;
  const yuzde = (a, b) => (b ? `%${Math.round((a / b) * 1000) / 10}` : '–');
  const durum = (deger, hedef) => (deger >= hedef
    ? <span className="rap-durum iyi">{t('rap.ulasti')}</span>
    : <span className="rap-durum dusuk">{t('rap.altinda')}</span>);
  const adi = id => icerik.bolumler.find(b => b.id === id)?.baslik || id;

  const satirlar = [
    [t('yon.kayitli'), n],
    [t('rap.tumu'), o.tumunuBitiren],
    [t('yon.tamamlama'), `%${o.tamamlamaOrani}`, '≥ %' + HEDEF.tamamlama, durum(o.tamamlamaOrani, HEDEF.tamamlama)],
    [t('rap.testGiren'), o.test.giren],
    [t('rap.testGecen'), o.test.gecen],
    [t('yon.sertifika'), `${o.sertifika} (%${o.sertifikaOrani})`, '≥ %' + HEDEF.sertifika, durum(o.sertifikaOrani, HEDEF.sertifika)],
    [t('yon.azfirsat'), `${o.azFirsat.sayi} (%${o.azFirsat.oran})`, '%' + HEDEF.azFirsat, durum(o.azFirsat.oran, HEDEF.azFirsat)],
    [t('yon.giris'), o.giris],
    [t('yon.sure'), t('dk', { n: o.ortSureDk })],
    [t('yon.video'), `%${o.videoOrtIzleme}`],
    [t('rap.anketSayi'), o.anket.sayi],
    [t('yon.indirme'), o.indirme],
    [t('yon.grup'), o.grup],
  ];

  const Dagilim = ({ baslik, veri, etiket }) => {
    const toplam = Object.values(veri).reduce((a, b) => a + b, 0);
    return (
      <table className="rap-tablo">
        <thead><tr><th>{baslik}</th><th>{t('rap.kisi')}</th><th>{t('rap.oran')}</th></tr></thead>
        <tbody>{Object.entries(veri).map(([k, v]) => <tr key={k}><td>{etiket(k)}</td><td>{v}</td><td>{yuzde(v, toplam)}</td></tr>)}</tbody>
      </table>
    );
  };

  return (
    <div className="rapor-sayfa">
      <div className="yonetim-ust ekran-yalniz">
        <div><h1>{t('rap.baslik')}</h1><p className="soluk">{t('rap.alt')}</p></div>
        <div className="rap-dugmeler">
          <a className="dugme ikincil" href="api/yonetim/rapor.xlsx?dil=tr"><Simge ad="kartlar" boy={18} /> {t('rap.excel', { dil: 'Türkçe' })}</a>
          <a className="dugme ikincil" href="api/yonetim/rapor.xlsx?dil=en"><Simge ad="kartlar" boy={18} /> {t('rap.excel', { dil: 'English' })}</a>
          <button className="dugme" onClick={() => window.print()}><Simge ad="test" boy={18} /> {t('rap.pdf')}</button>
        </div>
      </div>
      <p className="soluk ekran-yalniz rap-ipucu">{t('rap.ipucu')}</p>

      <article className="rap-kagit">
        <header className="rap-bas">
          <img src="belge-logo-tam.png" alt="E-YOUTHPRENEUR" />
          <div>
            <h2>{t('rap.belge')}</h2>
            <p>Erasmus+ KA220-YOU · {t('rap.tarih')}: {simdi}</p>
          </div>
        </header>

        <h3>{t('rap.gostergeler')}</h3>
        <table className="rap-tablo">
          <thead><tr><th>{t('rap.gosterge')}</th><th>{t('rap.deger')}</th><th>{t('rap.hedef')}</th><th>{t('rap.durum')}</th></tr></thead>
          <tbody>{satirlar.map(([a, d, h, s]) => <tr key={a}><td>{a}</td><td><b>{d}</b></td><td>{h || ''}</td><td>{s || ''}</td></tr>)}</tbody>
        </table>

        <h3>{t('yon.bolumler')}</h3>
        <table className="rap-tablo">
          <thead><tr><th>#</th><th>{t('rap.bolum')}</th><th>{t('rap.kisi')}</th><th>{t('rap.oran')}</th></tr></thead>
          <tbody>{o.bolumler.map((b, i) => <tr key={b.id}><td>{i + 1}</td><td>{adi(b.id)}</td><td>{b.tamam}</td><td>{yuzde(b.tamam, n)}</td></tr>)}</tbody>
        </table>

        <h3>{t('rap.dagilim')}</h3>
        <div className="rap-uclu">
          <Dagilim baslik={t('yon.ulke')} veri={o.ulke} etiket={k => t('ulke.' + k)} />
          <Dagilim baslik={t('yon.yas')} veri={o.yas} etiket={k => (k === '?' ? t('rap.bilinmiyor') : k)} />
          <Dagilim baslik={t('yon.rol')} veri={o.rol} etiket={k => t('rol.' + k)} />
        </div>

        <h3>{t('yon.anket', { n: o.anket.sayi })}</h3>
        <table className="rap-tablo">
          <thead><tr><th>{t('rap.madde')}</th><th>{t('rap.ortalama')}</th></tr></thead>
          <tbody>{icerik.anket.map(m => <tr key={m.id}><td>{m.metin}</td><td>{o.anket.puan[m.id] ?? '–'}</td></tr>)}</tbody>
        </table>
        {o.anket.yorumlar.length > 0 && <>
          <h3>{t('yon.yorumlar')}</h3>
          <ul className="rap-yorumlar">{o.anket.yorumlar.map((y, i) => <li key={i}>“{y}”</li>)}</ul>
        </>}

        <footer className="rap-alt">
          <p>{t('rap.not')}</p>
          <p>{t('alt.ret')}</p>
        </footer>
      </article>
    </div>
  );
}
