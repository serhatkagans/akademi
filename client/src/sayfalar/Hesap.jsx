import { useState } from 'react';
import { useB, git } from '../baglam.js';
import { api } from '../api.js';
import { HataKutusu } from '../bilesenler/Kabuk.jsx';

function Kart({ baslik, alt, children }) {
  return (
    <div className="form-sayfa">
      <div className="form-kart">
        <img src="logo.png" alt="" width="56" height="56" className="form-logo" />
        <h1>{baslik}</h1>
        <p className="soluk">{alt}</p>
        {children}
      </div>
    </div>
  );
}

export function Giris() {
  const { t, yenile } = useB();
  const [hata, setHata] = useState('');
  const [bekle, setBekle] = useState(false);
  async function gonder(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setBekle(true); setHata('');
    try {
      await api('giris', { method: 'POST', govde: { eposta: f.get('eposta'), parola: f.get('parola') } });
      await yenile(); git('/pano');
    } catch (x) { setHata(x.kod); } finally { setBekle(false); }
  }
  return (
    <Kart baslik={t('giris.baslik')} alt={t('giris.alt')}>
      <form onSubmit={gonder} className="form">
        <label>{t('alan.eposta')}<input name="eposta" type="email" autoComplete="email" required /></label>
        <label>{t('alan.parola')}<input name="parola" type="password" autoComplete="current-password" required /></label>
        <p className="form-unuttum"><a href="#/unuttum">{t('giris.unuttum')}</a></p>
        <HataKutusu kod={hata} />
        <button className="dugme tam" disabled={bekle}>{t('giris.dugme')}</button>
      </form>
      <p className="form-alt">{t('giris.yok')} <a href="#/kayit">{t('nav.kayit')}</a></p>
    </Kart>
  );
}

export function Kayit() {
  const { t, dil, yenile, icerik } = useB();
  const [hata, setHata] = useState('');
  const [bekle, setBekle] = useState(false);
  const [yil, setYil] = useState('');
  const buYil = new Date().getFullYear();
  const kucuk = yil && buYil - Number(yil) < 18;

  async function gonder(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setBekle(true); setHata('');
    try {
      await api('kayit', {
        method: 'POST', govde: {
          ad: f.get('ad'), eposta: f.get('eposta'), parola: f.get('parola'), ulke: f.get('ulke'),
          dogumYili: Number(f.get('dogumYili')), rol: f.get('rol'), azFirsat: f.get('azFirsat') === 'on',
          onay: f.get('onay') === 'on', veliOnayi: f.get('veliOnayi') === 'on', dil,
        },
      });
      /* Grup kodu yazıldıysa kayıttan hemen sonra gruba katılınır (hatalı kod kaydı engellemez). */
      const kod = String(f.get('grup') || '').trim();
      if (kod) await api('grup/katil', { method: 'POST', govde: { kod } }).catch(() => {});
      await yenile(); git('/pano');
    } catch (x) { setHata(x.kod); } finally { setBekle(false); }
  }

  return (
    <Kart baslik={t('kayit.baslik')} alt={t('kayit.alt')}>
      <form onSubmit={gonder} className="form">
        <label>{t('alan.ad')}<input name="ad" autoComplete="name" placeholder={t('alan.ad.ip')} required minLength={2} maxLength={100} /></label>
        <label>{t('alan.eposta')}<input name="eposta" type="email" autoComplete="email" required /></label>
        <label>{t('alan.parola')}<input name="parola" type="password" autoComplete="new-password" placeholder={t('alan.parola.ip')} required minLength={8} /></label>
        <div className="iki">
          <label>{t('alan.ulke')}
            <select name="ulke" required defaultValue="">
              <option value="" disabled>—</option>
              {icerik.ulkeler.map(u => <option key={u} value={u}>{t('ulke.' + u)}</option>)}
            </select>
          </label>
          <label>{t('alan.dogum')}
            <input name="dogumYili" type="number" inputMode="numeric" min={buYil - 100} max={buYil - 13} required
              value={yil} onChange={e => setYil(e.target.value)} />
          </label>
        </div>
        <fieldset className="secenekler">
          <legend>{t('alan.rol')}</legend>
          {['genc', 'genclik', 'diger'].map(r => (
            <label key={r} className="secenek"><input type="radio" name="rol" value={r} required /> {t('rol.' + r)}</label>
          ))}
        </fieldset>
        <label>{t('alan.grup')}<input name="grup" maxLength={6} placeholder={t('alan.grup.ip')} className="kod-girdi kucuk-kod" defaultValue={new URLSearchParams(location.hash.split('?')[1] || '').get('grup') || ''} /></label>
        <label className="onay">
          <input type="checkbox" name="azFirsat" />
          <span>{t('alan.azfirsat')}<small>{t('alan.azfirsat.not')}</small></span>
        </label>
        <label className="onay">
          <input type="checkbox" name="onay" required />
          <span dangerouslySetInnerHTML={{ __html: t('alan.onay') }} />
        </label>
        {kucuk && (
          <label className="onay vurgulu">
            <input type="checkbox" name="veliOnayi" required />
            <span>{t('alan.veli')}</span>
          </label>
        )}
        <HataKutusu kod={hata} />
        <button className="dugme tam" disabled={bekle}>{t('kayit.dugme')}</button>
      </form>
      <p className="form-alt">{t('kayit.var')} <a href="#/giris">{t('nav.giris')}</a></p>
    </Kart>
  );
}

/* Şifremi unuttum: hesap var mı yok mu söylenmez; her durumda aynı mesaj. */
export function Unuttum() {
  const { t } = useB();
  const [hata, setHata] = useState('');
  const [gitti, setGitti] = useState(false);
  const [bekle, setBekle] = useState(false);
  async function gonder(e) {
    e.preventDefault();
    setBekle(true); setHata('');
    try { await api('parola/unuttum', { method: 'POST', govde: { eposta: new FormData(e.target).get('eposta') } }); setGitti(true); }
    catch (x) { setHata(x.kod); } finally { setBekle(false); }
  }
  return (
    <Kart baslik={t('unut.baslik')} alt={gitti ? '' : t('unut.alt')}>
      {gitti ? (
        <div className="form" role="status">
          <p className="bilgi-kutu">{t('unut.gonderildi')}</p>
          <p className="soluk">{t('unut.yardim')}</p>
        </div>
      ) : (
        <form onSubmit={gonder} className="form">
          <label>{t('alan.eposta')}<input name="eposta" type="email" autoComplete="email" required /></label>
          <HataKutusu kod={hata} />
          <button className="dugme tam" disabled={bekle}>{t('unut.dugme')}</button>
        </form>
      )}
      <p className="form-alt"><a href="#/giris">{t('genel.geri')}</a></p>
    </Kart>
  );
}

/* E-postadaki bağlantı: #/parola/<jeton>. Başarılıysa oturum açılır, panoya gider. */
export function ParolaSifirla({ jeton }) {
  const { t, yenile } = useB();
  const [hata, setHata] = useState('');
  const [bekle, setBekle] = useState(false);
  async function gonder(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get('parola') !== f.get('tekrar')) { setHata('eslesmiyor'); return; }
    setBekle(true); setHata('');
    try {
      await api('parola/sifirla', { method: 'POST', govde: { jeton, parola: f.get('parola') } });
      await yenile(); git('/pano');
    } catch (x) { setHata(x.kod); } finally { setBekle(false); }
  }
  return (
    <Kart baslik={t('sifirla.baslik')} alt={t('alan.parola.ip')}>
      <form onSubmit={gonder} className="form">
        <label>{t('alan.parola.yeni')}<input name="parola" type="password" autoComplete="new-password" required minLength={8} /></label>
        <label>{t('alan.parola.tekrar')}<input name="tekrar" type="password" autoComplete="new-password" required minLength={8} /></label>
        <HataKutusu kod={hata} />
        <button className="dugme tam" disabled={bekle}>{t('sifirla.dugme')}</button>
      </form>
      {hata === 'jeton_gecersiz' && <p className="form-alt"><a href="#/unuttum">{t('unut.dugme')}</a></p>}
    </Kart>
  );
}
