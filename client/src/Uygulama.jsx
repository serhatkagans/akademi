import { useCallback, useEffect, useMemo, useState } from 'react';
import { Baglam, useAdres, git } from './baglam.js';
import { cevirmen } from './dil.js';
import { HAZIR_DILLER } from './diller/index.js';
import { api } from './api.js';
import { Ust, Alt, Yukleniyor } from './bilesenler/Kabuk.jsx';
import { RozetBildirimi } from './bilesenler/Rozetler.jsx';
import Tanitim from './sayfalar/Tanitim.jsx';
import { Giris, Kayit, Unuttum, ParolaSifirla } from './sayfalar/Hesap.jsx';
import Pano from './sayfalar/Pano.jsx';
import Bolum from './sayfalar/Bolum.jsx';
import Test from './sayfalar/Test.jsx';
import Anket from './sayfalar/Anket.jsx';
import Sertifika from './sayfalar/Sertifika.jsx';
import Dogrula from './sayfalar/Dogrula.jsx';
import Hesabim from './sayfalar/Hesabim.jsx';
import Yonetim from './sayfalar/Yonetim.jsx';
import Gizlilik from './sayfalar/Gizlilik.jsx';
import Fikrim from './sayfalar/Fikrim.jsx';
import Grup from './sayfalar/Grup.jsx';
import Kaynaklar from './sayfalar/Kaynaklar.jsx';

const ilkDil = () => {
  try { const d = localStorage.getItem('dil'); if (HAZIR_DILLER.has(d)) return d; } catch { /* yok */ }
  const t = (navigator.language || '').slice(0, 2).toLowerCase();
  return HAZIR_DILLER.has(t) ? t : 'en';
};

/* Oturum gerektiren sayfalar: oturum yoksa girişe yönlendirilir. */
const KORUMALI = new Set(['pano', 'bolum', 'test', 'anket', 'sertifika', 'hesap', 'yonetim', 'fikrim', 'grup']);

export default function Uygulama() {
  const adres = useAdres();
  const [dil, setDilDurum] = useState(ilkDil);
  const [uye, setUye] = useState(undefined);
  const [icerik, setIcerik] = useState(null);
  const [durum, setDurum] = useState(null);
  const t = useMemo(() => cevirmen(dil), [dil]);

  const yenile = useCallback(async () => {
    /* Durum üyeyle AYNI ANDA verilir: önce üye gelip durum boşken korumalı
       sayfalar (test, anket, sertifika) boş durumu okuyup çöküyordu. */
    const { uye } = await api('ben');
    const d = uye ? await api('ogren/durum') : null;
    setDurum(d);
    setUye(uye);
  }, []);

  const setDil = useCallback(d => {
    if (!HAZIR_DILLER.has(d)) return;
    setDilDurum(d);
    try { localStorage.setItem('dil', d); } catch { /* yok */ }
    if (uye) api('ben/dil', { method: 'POST', govde: { dil: d } }).catch(() => {});
  }, [uye]);

  useEffect(() => { yenile().catch(() => setUye(null)); }, [yenile]);
  useEffect(() => { setIcerik(null); api('icerik?dil=' + dil).then(setIcerik); }, [dil]);
  useEffect(() => { document.documentElement.lang = dil; }, [dil]);

  /* Etkin süre: sekme görünürken dakikada bir nabız (başvurudaki "time spent"). */
  useEffect(() => {
    if (!uye) return;
    const id = setInterval(() => { if (document.visibilityState === 'visible') api('nabiz', { method: 'POST' }).catch(() => {}); }, 60000);
    return () => clearInterval(id);
  }, [uye]);

  const [kok, ...parca] = adres.split('/').filter(Boolean);
  useEffect(() => { if (uye === null && KORUMALI.has(kok)) git('/giris'); }, [uye, kok]);

  const deger = { t, dil, setDil, uye, durum, setDurum, icerik, yenile };
  const hazir = uye !== undefined && icerik;

  let sayfa;
  if (!hazir || (KORUMALI.has(kok) && (!uye || !durum))) sayfa = <Yukleniyor />;
  else switch (kok) {
    case undefined: sayfa = <Tanitim />; break;
    case 'giris': sayfa = <Giris />; break;
    case 'kayit': sayfa = <Kayit />; break;
    case 'unuttum': sayfa = <Unuttum />; break;
    case 'parola': sayfa = <ParolaSifirla jeton={parca[0]} />; break;
    case 'pano': sayfa = <Pano />; break;
    case 'bolum': sayfa = <Bolum key={parca[0]} id={parca[0]} no={parca[1]} />; break;
    case 'test': sayfa = <Test />; break;
    case 'anket': sayfa = <Anket />; break;
    case 'sertifika': sayfa = <Sertifika />; break;
    case 'dogrula': sayfa = <Dogrula kod={parca[0]} />; break;
    case 'hesap': sayfa = <Hesabim />; break;
    case 'yonetim': sayfa = <Yonetim sekme={parca[0]} />; break;
    case 'fikrim': sayfa = <Fikrim />; break;
    case 'grup': sayfa = <Grup />; break;
    case 'kaynaklar': sayfa = <Kaynaklar />; break;
    case 'gizlilik': sayfa = <Gizlilik />; break;
    default: sayfa = <Tanitim />;
  }

  return (
    <Baglam.Provider value={deger}>
      <a className="atla" href="#icerik" onClick={e => { e.preventDefault(); document.getElementById('icerik')?.focus(); }}>
        {t('genel.atla')}
      </a>
      <Ust />
      <main id="icerik" tabIndex={-1} className={'sayfa-' + (kok || 'tanitim')}>{sayfa}</main>
      <Alt />
      {hazir && <RozetBildirimi />}
    </Baglam.Provider>
  );
}
