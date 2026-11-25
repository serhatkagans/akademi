import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';
import { boyutYaz } from './Kaynaklar.jsx';

const TURLER = ['ekitap', 'format', 'arac', 'rapor', 'diger'];

/* Yönetici: kaynak yükle / sil. Dosya ham gövdeyle, künye başlıklarda (URL kodlu). */
export default function YonetimKaynak() {
  const { t } = useB();
  const [liste, setListe] = useState([]);
  const [hata, setHata] = useState('');
  const [tamam, setTamam] = useState(false);
  const [bekle, setBekle] = useState(false);
  const yukle = () => api('kaynaklar').then(setListe);
  useEffect(() => { yukle(); }, []);

  async function gonder(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const dosya = f.get('dosya');
    setHata(''); setTamam(false);
    if (!dosya?.size) { setHata('kaynak_bos'); return; }
    setBekle(true);
    const k = v => encodeURIComponent(String(v || ''));
    try {
      const r = await fetch('api/yonetim/kaynak', {
        method: 'POST', credentials: 'same-origin', body: dosya,
        headers: { 'x-dosya': k(dosya.name), 'x-tur': k(f.get('tur')), 'x-baslik-tr': k(f.get('btr')), 'x-baslik-en': k(f.get('ben')),
          'x-aciklama-tr': k(f.get('atr')), 'x-aciklama-en': k(f.get('aen')) },
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).hata || 'sunucu');
      e.target.reset(); setTamam(true); yukle();
    } catch (x) { setHata(x.message); } finally { setBekle(false); }
  }
  async function sil(id) { await api('yonetim/kaynak/' + id, { method: 'DELETE' }); yukle(); }

  return (
    <div className="yonetim-izgara">
      <form className="kutu form" onSubmit={gonder}>
        <h2>{t('yk.yukle')}</h2>
        <label>{t('yk.dosya')}<input type="file" name="dosya" accept=".pdf,.epub,.docx,.pptx,.xlsx,.zip,.png,.jpg,.jpeg" required /></label>
        <label>{t('yk.tur')}<select name="tur">{TURLER.map(x => <option key={x} value={x}>{t('kay.t.' + x)}</option>)}</select></label>
        <div className="iki">
          <label>{t('yk.btr')}<input name="btr" maxLength={200} /></label>
          <label>{t('yk.ben')}<input name="ben" maxLength={200} /></label>
        </div>
        <div className="iki">
          <label>{t('yk.atr')}<textarea name="atr" rows="3" maxLength={600} /></label>
          <label>{t('yk.aen')}<textarea name="aen" rows="3" maxLength={600} /></label>
        </div>
        <HataKutusu kod={hata} />
        {tamam && <p className="tamam-satir">{t('yk.yuklendi')}</p>}
        <button className="dugme" disabled={bekle}>{t('yk.gonder')}</button>
      </form>
      <section className="kutu">
        <h2>{t('kay.baslik')} ({liste.length})</h2>
        <ul className="kaynak-liste">
          {liste.map(k => (
            <li key={k.id}>
              <span><b>{k.baslik_tr}</b><small className="soluk">{t('kay.t.' + k.tur)} · {boyutYaz(k.boyut)} · {t('kay.indirme', { n: k.indirme })}</small></span>
              <button className="bag tehlike-yazi" onClick={() => sil(k.id)}>{t('yk.sil')}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
