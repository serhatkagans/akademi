import { yerel } from '../dil.js';
import { useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import Simge from '../bilesenler/Simge.jsx';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';

/**
 * Sertifika: A4 yatay kâğıt CSS ile çizilir, tarayıcının "PDF olarak kaydet"iyle
 * indirilir (sunucuda PDF kütüphanesi yok). Kimlik yönetim platformundaki belgeyle
 * aynı: proje logosu, üçlü resmî logo, AB sorumluluk reddi; doğrulama kodu ve adresi.
 */
export default function Sertifika() {
  const { t, dil, uye, durum, setDurum } = useB();
  const [hata, setHata] = useState('');
  const hazir = durum.bolumlerTamam && durum.test.gecti && durum.anket;

  if (!hazir) {
    return <div className="kap dar"><div className="kutu ortala"><Simge ad="kilit" boy={40} /><h1>{t('sert.baslik')}</h1>
      <p>{t(!durum.bolumlerTamam ? 'kilit.bolum' : !durum.test.gecti ? 'kilit.test' : 'kilit.anket')}</p>
      <a className="dugme" href="#/pano">{t('bol.panoya')}</a></div></div>;
  }
  async function olustur() {
    try { setDurum((await api('ogren/sertifika', { method: 'POST', govde: {} })).durum); } catch (x) { setHata(x.kod); }
  }
  if (!durum.sertifika) {
    return <div className="kap dar"><div className="kutu ortala"><Simge ad="sertifika" boy={48} /><h1>{t('sert.baslik')}</h1>
      <HataKutusu kod={hata} /><button className="dugme buyuk" onClick={olustur}>{t('sert.hazirla')}</button></div></div>;
  }

  const s = durum.sertifika;
  const tarih = new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'long' }).format(new Date(s.zaman));
  const dogrulamaAdresi = location.origin + location.pathname.replace(/[^/]*$/, '') + '#/dogrula/' + s.kod;

  return (
    <div className="kap sertifika-sayfa">
      <div className="ekran-yalniz sertifika-ust">
        <a className="geri" href="#/pano">{t('genel.geri')}</a>
        <h1>{t('sert.baslik')}</h1>
        <button className="dugme buyuk" onClick={() => window.print()}>{t('sert.yazdir')}</button>
        <p className="soluk">{t('sert.ipucu')}</p>
      </div>

      <div className="kagit-kap">
        <section className="kagit" aria-label={t('sert.baslik')}>
          <img className="kagit-filigran" src="belge-logo.png" alt="" />
          <img className="kagit-logo" src="belge-logo-tam.png" alt="E-YOUTHPRENEUR" />
          <p className="kagit-ust">{t('sert.ust')}</p>
          {/* Öbür dilde yazıldığı için lang verilir: büyük harfe çevirmede Türkçe "İ" kuralı İngilizceye uygulanmasın. */}
          <p className="kagit-ust2" lang={dil === 'en' ? 'tr' : 'en'}>{t('sert.ust2')}</p>
          <p className="kagit-belge">{t('sert.belge')}</p>
          <p className="kagit-ad">{uye.ad}</p>
          <p className="kagit-metin">{t('sert.metin')}</p>
          <p className="kagit-metin2">{t('sert.metin2')}</p>
          <p className="kagit-proje">E-YOUTHPRENEUR · Erasmus+ KA220-YOU Cooperation Partnership</p>
          <div className="kagit-alt-bilgi">
            <span><small>{t('sert.tarih')}</small>{tarih}</span>
            <span><small>{t('sert.kod')}</small>{s.kod}</span>
          </div>
          <p className="kagit-dogrula">{t('sert.dogrula')} {dogrulamaAdresi}</p>
          <div className="kagit-logolar">
            <img src="ab-baskanligi.png" alt="Dışişleri Bakanlığı Avrupa Birliği Başkanlığı" />
            <img src="ulusal-ajans.png" alt="Türkiye Ulusal Ajansı" />
            <img src="ab-ortak-finanse.png" alt="Co-funded by the European Union" />
          </div>
          <p className="kagit-ret">{t('sert.ret')}</p>
        </section>
      </div>
    </div>
  );
}
