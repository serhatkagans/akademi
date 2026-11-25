import { useB } from '../baglam.js';
import { GIZLILIK } from '../gizlilik-metin.js';
import { GIZLILIK_ORTAK } from '../diller/index.js';

/**
 * Aydınlatma metni (KVKK md. 10 / GDPR md. 13) — TASLAK. Veri sorumlusu ve
 * iletişim bilgisi proje koordinatörü (HBV) ve BTE ile netleştirilip hukuk
 * gözden geçirmesinden sonra yayımlanmalıdır.
 */
export default function Gizlilik() {
  const { t, dil } = useB();
  return (
    <div className="kap dar">
      <h1>{t('giz.baslik')}</h1>
      <div className="kutu okuma">
        {(GIZLILIK[dil] || GIZLILIK_ORTAK[dil] || GIZLILIK.en).map(([b, m]) => <section key={b}><h2>{b}</h2><p>{m}</p></section>)}
      </div>
    </div>
  );
}
