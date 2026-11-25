import { useEffect, useRef, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';

/* Notlar bir kez çekilir, sayfalar arasında paylaşılır; kaydedilen değer önbelleğe de yazılır. */
let onbellek = null;
export function notlariGetir(yenidenCek = false) {
  if (!onbellek || yenidenCek) onbellek = api('ogren/notlar').catch(() => ({}));
  return onbellek;
}
export const notlariUnut = () => { onbellek = null; };

/**
 * Otomatik kaydeden yazı alanı (proje fikri defteri). Yazmayı bırakınca 0,8 sn sonra
 * kaydeder; sayfadan çıkarken bekleyen kayıt hemen gönderilir.
 */
export default function NotAlani({ anahtar, ip, kisa = false, etiket, onDegis, onKayit }) {
  const { t } = useB();
  const [deger, setDeger] = useState('');
  const [durum, setDurum] = useState('');
  const zaman = useRef(null);
  const bekleyen = useRef(null);

  useEffect(() => {
    let iptal = false;
    notlariGetir().then(n => { if (!iptal) { setDeger(n[anahtar]?.metin || ''); onDegis?.(n[anahtar]?.metin || ''); } });
    return () => { iptal = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anahtar]);

  async function kaydet(metin) {
    bekleyen.current = null;
    setDurum('kaydediliyor');
    try {
      const r = await api('ogren/not', { method: 'POST', govde: { anahtar, metin } });
      onKayit?.(r);
      const n = await notlariGetir();
      n[anahtar] = { metin, guncelleme: Date.now() };
      setDurum('kaydedildi');
    } catch { setDurum(''); }
  }
  useEffect(() => () => { clearTimeout(zaman.current); if (bekleyen.current !== null) kaydet(bekleyen.current); }, []); // eslint-disable-line

  function degisti(e) {
    const v = e.target.value;
    setDeger(v); onDegis?.(v); setDurum('');
    bekleyen.current = v;
    clearTimeout(zaman.current);
    zaman.current = setTimeout(() => kaydet(v), 800);
  }

  const Alan = kisa ? 'input' : 'textarea';
  return (
    <label className="not-alani">
      {etiket && <span className="not-etiket">{etiket}</span>}
      <Alan value={deger} onChange={degisti} placeholder={ip || t('not.ip')} maxLength={3000} rows={kisa ? undefined : 4} />
      <small className="not-durum" aria-live="polite">{durum ? t('not.' + durum) : ' '}</small>
    </label>
  );
}
