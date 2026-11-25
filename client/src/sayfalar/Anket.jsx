import { useState } from 'react';
import { useB, git } from '../baglam.js';
import { api } from '../api.js';
import Simge from '../bilesenler/Simge.jsx';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';

export default function Anket() {
  const { t, uye, icerik, durum, setDurum } = useB();
  /* Gençlik çalışanlarına ek maddeler (başvurudaki modül göstergeleri); diğerleri yalnızca ortak maddeleri görür. */
  const maddeler = icerik.anket.filter(m => !m.rol || m.rol === uye.rol);
  const [puan, setPuan] = useState({});
  const [hata, setHata] = useState('');
  const [bekle, setBekle] = useState(false);

  if (!durum.test.gecti) {
    return <div className="kap dar"><div className="kutu ortala"><Simge ad="kilit" boy={40} /><h1>{t('anket.baslik')}</h1><p>{t('kilit.test')}</p><a className="dugme" href="#/pano">{t('bol.panoya')}</a></div></div>;
  }
  if (durum.anket) {
    return <div className="kap dar"><div className="kutu ortala"><Simge ad="tik" boy={40} /><h1>{t('anket.baslik')}</h1><p>{t('anket.tesekkur')}</p><a className="dugme" href="#/sertifika">{t('adim.sert')} <Simge ad="ok" boy={18} /></a></div></div>;
  }

  async function gonder(e) {
    e.preventDefault();
    if (maddeler.some(m => !puan[m.id])) { setHata('anket'); return; }
    setBekle(true);
    try {
      const r = await api('ogren/anket', { method: 'POST', govde: { puanlar: puan, yorum: new FormData(e.target).get('yorum') } });
      setDurum(r.durum); git('/sertifika');
    } catch (x) { setHata(x.kod); } finally { setBekle(false); }
  }

  return (
    <div className="kap dar">
      <a className="geri" href="#/pano">{t('genel.geri')}</a>
      <h1>{t('anket.baslik')}</h1>
      <p className="soluk">{t('anket.alt')}</p>
      <form onSubmit={gonder} className="anket">
        {maddeler.map(m => (
          <fieldset key={m.id} className="kutu olcek">
            <legend>{m.metin}</legend>
            <div className="olcek-satir">
              <span className="olcek-uc">{t('anket.o1')}</span>
              {[1, 2, 3, 4, 5].map(v => (
                <label key={v} className={'olcek-nokta' + (puan[m.id] === v ? ' secili' : '')}>
                  <input type="radio" name={m.id} value={v} checked={puan[m.id] === v} onChange={() => setPuan({ ...puan, [m.id]: v })} />
                  <span>{v}</span>
                </label>
              ))}
              <span className="olcek-uc">{t('anket.o5')}</span>
            </div>
          </fieldset>
        ))}
        <label className="kutu yorum">{t('anket.yorum')}<textarea name="yorum" rows="4" maxLength="2000" /></label>
        {hata === 'anket' ? <p className="hata" role="alert">{t('anket.eksik')}</p> : <HataKutusu kod={hata} />}
        <button className="dugme buyuk" disabled={bekle}>{t('anket.gonder')}</button>
      </form>
    </div>
  );
}
