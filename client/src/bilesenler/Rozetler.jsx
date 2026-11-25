import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import Simge from './Simge.jsx';

/* Rozet tanımları: kimlik → simge. Kazanılanlar sunucudan (durum.rozetler) gelir. */
export function rozetListesi(icerik) {
  return [
    { id: 'ilk-adim', simge: 'pusula' },
    ...icerik.bolumler.map(b => ({ id: 'bolum:' + b.id, simge: b.simge, renk: b.renk, bolum: b.baslik })),
    { id: 'izleyici', simge: 'video' },
    { id: 'bilgi-avcisi', simge: 'test' },
    { id: 'dusunur', simge: 'kalem' },
    { id: 'fikir-sahibi', simge: 'ampul' },
    { id: 'kusursuz', simge: 'hedef' },
    { id: 'takim', simge: 'eller' },
    { id: 'sertifikali', simge: 'sertifika' },
  ];
}
export const rozetAdi = (t, r) => r.bolum ? t('rozet.bolum', { b: r.bolum }) : t('rozet.' + r.id);

/** Panodaki rozet ızgarası. */
export default function Rozetler() {
  const { t, icerik, durum } = useB();
  const kazanilan = new Set(durum.rozetler || []);
  const liste = rozetListesi(icerik);
  return (
    <section className="rozetler">
      <div className="rozetler-bas">
        <h2 className="ara-baslik">{t('rozet.baslik')}</h2>
        <span className="soluk">{t('rozet.sayi', { n: kazanilan.size, t: liste.length })}</span>
      </div>
      <ul className="rozet-izgara">
        {liste.map(r => {
          const var_ = kazanilan.has(r.id);
          return (
            <li key={r.id} className={'rozet-kart' + (var_ ? ' kazanildi' : '') + (r.renk ? ' renk-' + r.renk : '')} title={t(r.bolum ? 'rozet.bolum.m' : 'rozet.' + r.id + '.m')}>
              <span className="rozet-simge"><Simge ad={var_ ? r.simge : 'kilit'} boy={22} /></span>
              <b>{rozetAdi(t, r)}</b>
              <small>{t(r.bolum ? 'rozet.bolum.m' : 'rozet.' + r.id + '.m')}</small>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Yeni kazanılan rozet için kısa bildirim. Görülen rozetler kişinin tarayıcısında
 * tutulur; ilk açılışta var olanlar "görüldü" sayılır (eski rozetler için bildirim yağmasın).
 */
export function RozetBildirimi() {
  const { t, uye, icerik, durum } = useB();
  const [yeni, setYeni] = useState(null);
  useEffect(() => {
    if (!uye || !durum?.rozetler) return;
    const anahtar = 'rozet:' + uye.eposta;
    let gorulen;
    try { gorulen = JSON.parse(localStorage.getItem(anahtar) || 'null'); } catch { gorulen = null; }
    if (gorulen === null) { try { localStorage.setItem(anahtar, JSON.stringify(durum.rozetler)); } catch { /* yok */ } return; }
    const fark = durum.rozetler.filter(r => !gorulen.includes(r));
    if (!fark.length) return;
    try { localStorage.setItem(anahtar, JSON.stringify(durum.rozetler)); } catch { /* yok */ }
    const r = rozetListesi(icerik).find(x => x.id === fark[fark.length - 1]);
    if (!r) return;
    setYeni(r);
    const z = setTimeout(() => setYeni(null), 5000);
    return () => clearTimeout(z);
  }, [durum?.rozetler?.join(','), uye?.eposta]); // eslint-disable-line
  if (!yeni) return null;
  return (
    <div className="rozet-bildirim" role="status">
      <span className="rozet-simge"><Simge ad={yeni.simge} boy={22} /></span>
      <span><small>{t('rozet.yeni')}</small><b>{rozetAdi(t, yeni)}</b></span>
      <button className="bag" onClick={() => setYeni(null)} aria-label="×">✕</button>
    </div>
  );
}
