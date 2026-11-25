import { yerel } from '../dil.js';
import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { HataKutusu, Yukleniyor } from '../bilesenler/Kabuk.jsx';

/**
 * Kullanıcılar: ara, hesap aç (ör. eğitmen, ortak kurum personeli), parola sıfırla,
 * yöneticilik ver/al, sil. Yeni parola yalnızca BİR KEZ gösterilir; kişiye güvenli
 * bir yoldan iletilir. Yönetici kendi yetkisini alamaz, kendini silemez.
 */
export default function YonetimUyeler() {
  const { t, dil } = useB();
  const [v, setV] = useState(null);
  const [ara, setAra] = useState('');
  const [hata, setHata] = useState('');
  const [parola, setParola] = useState(null); // { kime, parola }
  const [onay, setOnay] = useState(null);     // silinecek kişi
  const yukle = (q = ara) => api('yonetim/uyeler?ara=' + encodeURIComponent(q)).then(setV);
  useEffect(() => { const z = setTimeout(() => yukle(ara), 250); return () => clearTimeout(z); }, [ara]); // eslint-disable-line
  if (!v) return <Yukleniyor />;
  const tarih = z => z ? new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'medium' }).format(new Date(z)) : '—';

  async function ac(e) {
    e.preventDefault(); setHata('');
    const f = new FormData(e.target);
    try {
      const r = await api('yonetim/uyeler', { method: 'POST', govde: { ad: f.get('ad'), eposta: f.get('eposta'), rol: f.get('rol'), ulke: f.get('ulke'), yonetici: f.get('yonetici') === 'on' } });
      setParola({ kime: f.get('eposta'), parola: r.parola, yeni: true }); e.target.reset(); yukle();
    } catch (x) { setHata(x.kod); }
  }
  async function sifirla(u) { const r = await api(`yonetim/uyeler/${u.id}/parola`, { method: 'POST', govde: {} }); setParola({ kime: u.eposta, parola: r.parola }); }
  async function yetki(u) { await api(`yonetim/uyeler/${u.id}/yetki`, { method: 'POST', govde: { yonetici: !u.yonetici } }); yukle(); }
  async function sil(u) { await api(`yonetim/uyeler/${u.id}`, { method: 'DELETE' }); setOnay(null); yukle(); }

  return (
    <div className="yonetim-uyeler">
      <form className="kutu form ku-yeni" onSubmit={ac}>
        <h2>{t('ku.yeni')}</h2>
        <div className="iki">
          <label>{t('alan.ad')}<input name="ad" required minLength={2} maxLength={100} /></label>
          <label>{t('alan.eposta')}<input name="eposta" type="email" required /></label>
        </div>
        <div className="iki">
          <label>{t('alan.rol')}<select name="rol" defaultValue="genclik">{['genclik', 'genc', 'diger'].map(r => <option key={r} value={r}>{t('rol.' + r)}</option>)}</select></label>
          <label>{t('alan.ulke')}<select name="ulke" defaultValue="TR">{['TR', 'IT', 'RO', 'NL', 'PT', 'DK', 'DIGER'].map(u => <option key={u} value={u}>{t('ulke.' + u)}</option>)}</select></label>
        </div>
        <label className="onay"><input type="checkbox" name="yonetici" /> <span>{t('ku.yonetici.ver')}</span></label>
        <HataKutusu kod={hata} />
        <button className="dugme">{t('ku.olustur')}</button>
      </form>

      {parola && (
        <div className="parola-kutu" role="alert">
          <div>
            <b>{t(parola.yeni ? 'ku.olusturuldu' : 'ku.parola.yeni', { e: parola.kime })}</b>
            <code>{parola.parola}</code>
            <small>{t('ku.parola.not')}</small>
          </div>
          <button className="dugme ikincil kucuk" onClick={() => setParola(null)}>{t('ku.tamam')}</button>
        </div>
      )}

      <section className="kutu">
        <div className="ku-ust">
          <h2>{t('ku.baslik')} ({v.toplam})</h2>
          <input type="search" value={ara} onChange={e => setAra(e.target.value)} placeholder={t('ku.ara')} aria-label={t('ku.ara')} />
        </div>
        <div className="tablo-kap" tabIndex={0} role="region" aria-label={t('genel.tablo')}>
          <table className="tablo">
            <thead><tr><th>{t('grup.s.ad')}</th><th>{t('alan.eposta')}</th><th>{t('yon.rol')}</th><th>{t('grup.s.bolum')}</th><th>{t('grup.s.son')}</th><th /></tr></thead>
            <tbody>
              {v.uyeler.map(u => (
                <tr key={u.id}>
                  <td>{u.ad} {u.yonetici && <span className="rozet koyu kucuk-rozet">{t('nav.yonetim')}</span>} {u.ben && <small className="soluk">({t('ku.kendin')})</small>}</td>
                  <td>{u.eposta}</td>
                  <td>{t('rol.' + u.rol)}</td>
                  <td>{u.bolum}/{v.bolumSayisi}{u.sertifika ? ' ✓' : ''}</td>
                  <td>{tarih(u.son_giris)}</td>
                  <td className="ku-eylem">
                    {onay === u.id ? <>
                      <span>{t('ku.sil.onay')}</span>
                      <button className="dugme tehlikeli kucuk" onClick={() => sil(u)}>{t('ku.sil')}</button>
                      <button className="bag" onClick={() => setOnay(null)}>{t('genel.vazgec')}</button>
                    </> : <>
                      <button className="bag" onClick={() => sifirla(u)}>{t('ku.parola')}</button>
                      {!u.ben && <button className="bag" onClick={() => yetki(u)}>{t(u.yonetici ? 'ku.yetki.al' : 'ku.yetki.ver')}</button>}
                      {!u.ben && <button className="bag tehlike-yazi" onClick={() => setOnay(u.id)}>{t('ku.sil')}</button>}
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!v.uyeler.length && <p className="bos-not">{t('ku.bos')}</p>}
      </section>
    </div>
  );
}

/** Giden e-postalar ve hatırlatmayı elle çalıştırma. */
export function YonetimPosta() {
  const { t, dil } = useB();
  const [v, setV] = useState(null);
  const [mesaj, setMesaj] = useState('');
  const yukle = () => api('yonetim/postalar').then(setV);
  useEffect(() => { yukle(); }, []);
  if (!v) return <Yukleniyor />;
  const zaman = z => new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(z));
  async function calistir() { const r = await api('yonetim/hatirlatma', { method: 'POST', govde: {} }); setMesaj(t('po.calisti', { n: r.gonderilen })); yukle(); }
  return (
    <div className="yonetim-posta">
      <div className={'smtp-durum ' + (v.smtp ? 'var' : 'yok')}>
        <b>{t(v.smtp ? 'po.smtp.var' : 'po.smtp.yok')}</b>
        <p>{t(v.smtp ? 'po.smtp.var.m' : 'po.smtp.yok.m')}</p>
      </div>
      <section className="kutu">
        <div className="ku-ust">
          <div><h2>{t('po.baslik')}</h2><p className="soluk">{t('po.alt')}</p></div>
          <button className="dugme ikincil" onClick={calistir}>{t('po.hatirlat')}</button>
        </div>
        {mesaj && <p className="tamam-satir">{mesaj}</p>}
        <div className="tablo-kap" tabIndex={0} role="region" aria-label={t('genel.tablo')}>
          <table className="tablo">
            <thead><tr><th>{t('po.zaman')}</th><th>{t('po.kime')}</th><th>{t('po.tur')}</th><th>{t('po.konu')}</th><th>{t('po.durum')}</th></tr></thead>
            <tbody>
              {v.liste.map(p => (
                <tr key={p.id}><td>{zaman(p.zaman)}</td><td>{p.kime}</td><td>{t('po.t.' + p.tur)}</td><td>{p.konu}</td>
                  <td><span className={'durum-rozet ' + (p.durum === 'gonderildi' ? 'tamam' : p.durum === 'hata' ? 'hata' : 'devam')} title={p.hata}>{t('po.d.' + p.durum)}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {!v.liste.length && <p className="bos-not">{t('po.bos')}</p>}
      </section>
    </div>
  );
}
