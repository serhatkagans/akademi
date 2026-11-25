import { yerel } from '../dil.js';
import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { HataKutusu, Yukleniyor } from '../bilesenler/Kabuk.jsx';
import Simge from '../bilesenler/Simge.jsx';

/* Eğitmen ekranı: grup aç, kodu paylaş, grubun ilerlemesini izle. Tek sayfa. */
export default function Grup() {
  const { t, dil } = useB();
  const [v, setV] = useState(null);
  const [hata, setHata] = useState('');
  const [silinecek, setSilinecek] = useState(null);
  const yukle = () => api('grup').then(setV);
  useEffect(() => { yukle(); }, []);
  if (!v) return <Yukleniyor />;
  if (!v.egitmen) return <div className="kap dar"><div className="kutu ortala"><Simge ad="kilit" boy={40} /><p>{t('grup.yok')}</p></div></div>;

  async function ac(e) {
    e.preventDefault();
    setHata('');
    try {
      await api('grup', { method: 'POST', govde: { ad: new FormData(e.target).get('ad') } });
      e.target.reset(); yukle();
    } catch (x) { setHata(x.kod); }
  }
  async function sil(id) { await api('grup/' + id, { method: 'DELETE' }); setSilinecek(null); yukle(); }
  const tarih = z => z ? new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'medium' }).format(new Date(z)) : '—';

  return (
    <div className="kap">
      <h1>{t('grup.baslik')}</h1>
      <p className="soluk">{t('grup.alt')}</p>

      <form className="kutu grup-yeni" onSubmit={ac}>
        <label>{t('grup.ad')}<input name="ad" required minLength={2} maxLength={80} placeholder={t('grup.ad.ip')} /></label>
        <button className="dugme">{t('grup.ac')}</button>
        <HataKutusu kod={hata} />
      </form>

      {v.gruplar.map(g => {
        const bitiren = g.uyeler.filter(u => u.bolum >= v.bolumSayisi).length;
        const sert = g.uyeler.filter(u => u.sertifika).length;
        return (
          <section key={g.id} className="kutu grup-kart">
            <div className="grup-bas">
              <div>
                <h2>{g.ad}</h2>
                <p className="soluk">{t('grup.uyeler', { n: g.uyeler.length })} · {t('grup.ozet', { b: bitiren, s: sert })}</p>
              </div>
              <div className="grup-kod">
                <small>{t('grup.kod')}</small>
                <b>{g.kod}</b>
              </div>
            </div>
            <p className="soluk kucuk-yazi">{t('grup.paylas')}</p>
            {g.uyeler.length ? (
              <div className="tablo-kap" tabIndex={0} role="region" aria-label={t('genel.tablo')}>
                <table className="tablo">
                  <thead><tr><th>{t('grup.s.ad')}</th><th>{t('grup.s.bolum')}</th><th>{t('grup.s.test')}</th><th>{t('grup.s.sert')}</th><th>{t('grup.s.son')}</th></tr></thead>
                  <tbody>
                    {g.uyeler.map((u, i) => (
                      <tr key={i}>
                        <td>{u.ad}</td>
                        <td><span className="mini-cubuk"><i style={{ width: `${(u.bolum / v.bolumSayisi) * 100}%` }} /></span> {u.bolum}/{v.bolumSayisi}</td>
                        <td>{u.test ?? '—'}</td>
                        <td>{u.sertifika ? <Simge ad="tik" boy={18} className="yesil-yazi" /> : '—'}</td>
                        <td>{tarih(u.son_giris)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="bos-not">{t('grup.bos')}</p>}
            <div className="grup-alt">
              {g.uyeler.length > 0 && <a className="dugme ikincil kucuk" href={`api/grup/${g.id}/liste.csv`}>{t('grup.csv')}</a>}
              {silinecek === g.id
                ? <><span>{t('grup.sil.onay')}</span><button className="dugme tehlikeli kucuk" onClick={() => sil(g.id)}>{t('grup.sil')}</button>
                  <button className="dugme ikincil kucuk" onClick={() => setSilinecek(null)}>{t('genel.vazgec')}</button></>
                : <button className="bag soluk" onClick={() => setSilinecek(g.id)}>{t('grup.sil')}</button>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
