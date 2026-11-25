import { yerel } from '../dil.js';
import { useEffect, useState } from 'react';
import { useB, git } from '../baglam.js';
import { api } from '../api.js';
import Simge from '../bilesenler/Simge.jsx';

/* Herkese açık: işverenler ve kurumlar sertifikayı koduyla doğrular. */
export default function Dogrula({ kod }) {
  const { t, dil } = useB();
  const [deger, setDeger] = useState(kod || '');
  const [sonuc, setSonuc] = useState(null);

  useEffect(() => {
    setSonuc(null);
    if (!kod) return;
    if (!/^EYP-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(kod)) { setSonuc({ gecerli: false }); return; }
    api('dogrula/' + kod).then(setSonuc).catch(() => setSonuc({ gecerli: false }));
  }, [kod]);

  const tarih = z => new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'long' }).format(new Date(z));
  return (
    <div className="form-sayfa">
      <div className="form-kart">
        <span className="form-simge"><Simge ad="kalkan" boy={40} /></span>
        <h1>{t('dog.baslik')}</h1>
        <p className="soluk">{t('dog.alt')}</p>
        <form className="form" onSubmit={e => { e.preventDefault(); git('/dogrula/' + deger.trim().toUpperCase()); }}>
          <input value={deger} onChange={e => setDeger(e.target.value)} placeholder="EYP-XXXX-XXXX" aria-label={t('sert.kod')} className="kod-girdi" />
          <button className="dugme tam">{t('dog.dugme')}</button>
        </form>
        {sonuc && (sonuc.gecerli
          ? <div className="dogrulama gecerli" role="status"><Simge ad="tik" /><b>{t('dog.gecerli')}</b><span>{t('dog.gecerli.m', { ad: sonuc.ad, tarih: tarih(sonuc.zaman) })}</span></div>
          : <div className="dogrulama gecersiz" role="status">{t('dog.gecersiz')}</div>)}
      </div>
    </div>
  );
}
