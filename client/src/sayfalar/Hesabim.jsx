import { useEffect, useState } from 'react';
import { useB, git } from '../baglam.js';
import { api } from '../api.js';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';

export default function Hesabim() {
  const { t, uye, yenile } = useB();
  const [hata, setHata] = useState('');
  const [acik, setAcik] = useState(false);
  const [grup, setGrup] = useState(null);
  const [bildirim, setBildirim] = useState(uye.bildirim !== false);
  async function bildirimDegis(acik) { setBildirim(acik); await api('ben/bildirim', { method: 'POST', govde: { acik } }); }
  const [gHata, setGHata] = useState('');
  const [gMesaj, setGMesaj] = useState('');
  const grupYukle = () => api('grup').then(setGrup);
  useEffect(() => { grupYukle(); }, []);
  async function katil(e) {
    e.preventDefault(); setGHata(''); setGMesaj('');
    try { const r = await api('grup/katil', { method: 'POST', govde: { kod: new FormData(e.target).get('kod') } }); setGMesaj(t('grup.katildin', { ad: r.ad })); e.target.reset(); grupYukle(); }
    catch (x) { setGHata(x.kod); }
  }
  async function ayril() { await api('grup/ayril', { method: 'POST' }); setGMesaj(''); grupYukle(); }

  const [adAcik, setAdAcik] = useState(false);
  const [adHata, setAdHata] = useState('');
  async function adKaydet(e) {
    e.preventDefault(); setAdHata('');
    try { await api('ben/ad', { method: 'POST', govde: { ad: new FormData(e.target).get('ad') } }); await yenile(); setAdAcik(false); }
    catch (x) { setAdHata(x.kod); }
  }
  const [pHata, setPHata] = useState('');
  const [pTamam, setPTamam] = useState(false);
  async function parolaDegistir(e) {
    e.preventDefault(); setPHata(''); setPTamam(false);
    const f = new FormData(e.target);
    if (f.get('yeni') !== f.get('tekrar')) { setPHata('eslesmiyor'); return; }
    try { await api('ben/parola', { method: 'POST', govde: { eski: f.get('eski'), yeni: f.get('yeni') } }); setPTamam(true); e.target.reset(); }
    catch (x) { setPHata(x.kod); }
  }

  async function sil(e) {
    e.preventDefault();
    try {
      await api('ben', { method: 'DELETE', govde: { parola: new FormData(e.target).get('parola') } });
      await yenile(); git('/');
    } catch (x) { setHata(x.kod); }
  }

  return (
    <div className="kap dar">
      <a className="geri" href="#/pano">{t('genel.geri')}</a>
      <h1>{t('hesap.baslik')}</h1>
      <dl className="kutu bilgiler">
        <div><dt>{t('alan.ad')}</dt><dd>
          {adAcik ? (
            <form className="satir-form ad-form" onSubmit={adKaydet}>
              <input name="ad" defaultValue={uye.ad} required minLength={2} maxLength={100} autoComplete="name" aria-label={t('alan.ad')} autoFocus />
              <button className="dugme kucuk">{t('hesap.ad.kaydet')}</button>
              <button type="button" className="bag" onClick={() => setAdAcik(false)}>{t('genel.vazgec')}</button>
              <small className="soluk ad-not">{t('hesap.ad.not')}</small>
              <HataKutusu kod={adHata} />
            </form>
          ) : <>{uye.ad} <button className="bag kucuk-yazi" onClick={() => setAdAcik(true)}>{t('hesap.ad.duzenle')}</button></>}
        </dd></div>
        <div><dt>{t('alan.eposta')}</dt><dd>{uye.eposta}</dd></div>
        <div><dt>{t('alan.ulke')}</dt><dd>{t('ulke.' + uye.ulke)}</dd></div>
        <div><dt>{t('alan.rol')}</dt><dd>{t('rol.' + uye.rol)}</dd></div>
      </dl>
      <section className="kutu">
        <h2>{grup?.benim ? t('grup.benim') : t('grup.katil')}</h2>
        {grup?.benim && <p>{t('grup.benim.m', { ad: grup.benim.ad, e: grup.benim.egitmen })} <button className="bag soluk" onClick={ayril}>{t('grup.ayril')}</button></p>}
        {gMesaj && <p className="tamam-satir">{gMesaj}</p>}
        <form className="satir-form" onSubmit={katil}>
          <input name="kod" required maxLength={6} placeholder={t('alan.grup.ip')} className="kod-girdi kucuk-kod" aria-label={t('grup.kod')} />
          <button className="dugme">{t('grup.katil')}</button>
        </form>
        <HataKutusu kod={gHata} />
      </section>
      <section className="kutu">
        <h2>{t('bil.baslik')}</h2>
        <p className="soluk">{t('bil.m')}</p>
        <label className="onay">
          <input type="checkbox" checked={bildirim} onChange={e => bildirimDegis(e.target.checked)} />
          <span>{t(bildirim ? 'bil.acik' : 'bil.kapali')}</span>
        </label>
      </section>
      <section className="kutu">
        <h2>{t('parola.baslik')}</h2>
        <p className="soluk">{t('parola.m')}</p>
        <form className="form" onSubmit={parolaDegistir}>
          <label>{t('alan.parola.eski')}<input name="eski" type="password" autoComplete="current-password" required /></label>
          <label>{t('alan.parola.yeni')}<input name="yeni" type="password" autoComplete="new-password" required minLength={8} placeholder={t('alan.parola.ip')} /></label>
          <label>{t('alan.parola.tekrar')}<input name="tekrar" type="password" autoComplete="new-password" required minLength={8} /></label>
          <HataKutusu kod={pHata} />
          {pTamam && <p className="tamam-satir" role="status">{t('parola.tamam')}</p>}
          <div className="eylemler"><button className="dugme">{t('parola.dugme')}</button></div>
        </form>
      </section>
      <section className="kutu">
        <h2>{t('veri.baslik')}</h2>
        <p className="soluk">{t('veri.m')}</p>
        <a className="dugme ikincil" href="api/ben/veri.json" download>{t('veri.dugme')}</a>
      </section>
      <section className="kutu tehlike">
        <h2>{t('hesap.sil')}</h2>
        <p>{t('hesap.sil.m')}</p>
        {acik ? (
          <form className="form" onSubmit={sil}>
            <label>{t('hesap.sil.onay')}<input name="parola" type="password" autoComplete="current-password" required /></label>
            <HataKutusu kod={hata} />
            <div className="eylemler">
              <button className="dugme tehlikeli">{t('hesap.sil')}</button>
              <button type="button" className="dugme ikincil" onClick={() => setAcik(false)}>{t('genel.vazgec')}</button>
            </div>
          </form>
        ) : <button className="dugme ikincil" onClick={() => setAcik(true)}>{t('hesap.sil')}…</button>}
      </section>
    </div>
  );
}
