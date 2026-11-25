import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { Yukleniyor } from '../bilesenler/Kabuk.jsx';
import Simge from '../bilesenler/Simge.jsx';

export const boyutYaz = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const SIMGE = { ekitap: 'kitap', format: 'test', arac: 'kalem', rapor: 'kitap', diger: 'dunya' };
const RENK = { ekitap: 'yesil', format: 'mavi', arac: 'turuncu', rapor: 'lacivert', diger: 'mor' };

/* Herkese açık kütüphane: projenin açık erişimli çıktıları. */
export default function Kaynaklar() {
  const { t, dil } = useB();
  const [liste, setListe] = useState(null);
  useEffect(() => { api('kaynaklar').then(setListe); }, []);
  if (!liste) return <Yukleniyor />;
  return (
    <div className="kap">
      <h1>{t('kay.baslik')}</h1>
      <p className="soluk">{t('kay.alt')}</p>
      {liste.length ? (
        <ul className="kaynak-izgara">
          {liste.map(k => (
            <li key={k.id} className={'kaynak-kart renk-' + RENK[k.tur]}>
              <span className="bolum-simge"><Simge ad={SIMGE[k.tur]} boy={26} /></span>
              <span className="rozet koyu">{t('kay.t.' + k.tur)}</span>
              <h3>{dil === 'tr' ? k.baslik_tr : k.baslik_en}</h3>
              <p>{dil === 'tr' ? k.aciklama_tr : k.aciklama_en}</p>
              <div className="kaynak-alt">
                <span className="soluk">{k.dosya_adi.split('.').pop().toUpperCase()} · {boyutYaz(k.boyut)} · {t('kay.indirme', { n: k.indirme })}</span>
                <a className="dugme kucuk" href={`api/kaynak/${k.id}/indir`}>{t('kay.indir')}</a>
              </div>
            </li>
          ))}
        </ul>
      ) : <div className="kutu ortala"><Simge ad="kitap" boy={40} /><p>{t('kay.bos')}</p></div>}
    </div>
  );
}
