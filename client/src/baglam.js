import { createContext, useContext, useEffect, useState } from 'react';

/* Uygulama geneli: dil (t), oturumdaki üye, içerik, ilerleme durumu. */
export const Baglam = createContext(null);
export const useB = () => useContext(Baglam);

/* Adres: #/yol/parca — alt dizinde ve sunucu ayarı gerektirmeden çalışır. */
export function useAdres() {
  const oku = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
  const [adres, setAdres] = useState(oku);
  useEffect(() => {
    const f = () => { setAdres(oku()); window.scrollTo(0, 0); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return adres;
}
export const git = yol => { location.hash = '#' + yol; };
