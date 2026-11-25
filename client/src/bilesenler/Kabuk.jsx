import { useState } from 'react';
import { useB, git, useAdres } from '../baglam.js';
import { DILLER } from '../dil.js';
import { HAZIR_DILLER } from '../diller/index.js';
import { api } from '../api.js';
import Simge from './Simge.jsx';
import { notlariUnut } from './Not.jsx';

/* Üst bant: logo, (oturum varsa) Panom, dil, hesap. Telefonda tek menü düğmesi. */
export function Ust() {
  const { t, dil, setDil, uye, yenile } = useB();
  const [acik, setAcik] = useState(false);
  const kok = useAdres().split('/')[1] || '';
  /* Bulunulan sayfa menüde işaretlenir. */
  const L = (yol, metin) => <a href={'#/' + yol} className={kok === yol.split('/')[0] ? 'etkin' : undefined} aria-current={kok === yol.split('/')[0] ? 'page' : undefined}>{metin}</a>;
  const cik = async () => { await api('cikis', { method: 'POST' }); notlariUnut(); await yenile(); git('/'); };
  const kapat = () => setAcik(false);
  /* İkinci tema (yeşil): seçim tarayıcıda saklanır, html[data-tema] ile uygulanır. */
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema || 'lacivert');
  const temaDegistir = () => {
    const y = tema === 'yesil' ? 'lacivert' : 'yesil';
    setTema(y);
    if (y === 'yesil') document.documentElement.dataset.tema = 'yesil'; else delete document.documentElement.dataset.tema;
    try { localStorage.setItem('tema', y); } catch { /* yok */ }
  };
  return (
    <header className="ust">
      <div className="ust-ic">
        <a className="marka" href="#/" onClick={kapat}>
          <img src="logo.png" alt="" width="40" height="40" />
          <span><b>E-YOUTHPRENEUR</b><small>Academy</small></span>
        </a>
        <button className="menu-dugme" aria-expanded={acik} aria-label={t('nav.menu')} onClick={() => setAcik(!acik)}>
          <Simge ad={acik ? 'kapat' : 'menu'} />
        </button>
        <nav className={'ust-nav' + (acik ? ' acik' : '')} onClick={e => e.target.closest('a,button:not(select)') && kapat()}>
          <button type="button" className="tema-dugme" onClick={temaDegistir} title={t('tema.degistir')} aria-label={t('tema.degistir')}>
            <i aria-hidden="true" /><span className="yalniz-telefon">{t('tema.degistir')}</span>
          </button>
          <label className="dil-sec">
            <Simge ad="dunya" boy={18} />
            <select value={dil} onChange={e => setDil(e.target.value)} aria-label="Dil / Language">
              {DILLER.filter(d => HAZIR_DILLER.has(d.kod)).map(d => <option key={d.kod} value={d.kod}>{d.ad}</option>)}
            </select>
          </label>
          {uye ? <>
            {L('pano', t('nav.pano'))}
            {L('fikrim', t('nav.fikrim'))}
            {L('kaynaklar', t('nav.kaynaklar'))}
            {(uye.rol === 'genclik' || uye.yonetici) && L('grup', t('nav.grup'))}
            {uye.yonetici && L('yonetim', t('nav.yonetim'))}
            {L('hesap', t('nav.hesap'))}
            <button className="bag" onClick={cik}>{t('nav.cikis')}</button>
          </> : <>
            {L('kaynaklar', t('nav.kaynaklar'))}
            {L('giris', t('nav.giris'))}
            <a className="dugme kucuk" href="#/kayit">{t('nav.kayit')}</a>
          </>}
        </nav>
      </div>
    </header>
  );
}

/* Erasmus+ görünürlük kuralı: AB amblemi + ibare + sorumluluk reddi her sayfada. */
export function Alt() {
  const { t } = useB();
  return (
    <footer className="alt">
      <div className="alt-ic">
        <div className="alt-logolar">
          {/* Resmî sıra (yönetim platformundaki belgeyle aynı): AB Başkanlığı, Ulusal Ajans, AB eş finansman. */}
          <img src="ab-baskanligi.png" alt="Dışişleri Bakanlığı Avrupa Birliği Başkanlığı" height="44" />
          <img src="ulusal-ajans.png" alt="Türkiye Ulusal Ajansı" height="44" />
          <img src="ab-ortak-finanse.png" alt={t('alt.finans')} height="44" />
        </div>
        <p className="alt-ret">{t('alt.ret')}</p>
        <p className="alt-bag">
          <a href="#/dogrula">{t('alt.dogrula')}</a> · <a href="#/gizlilik">{t('alt.gizlilik')}</a> · E-YOUTHPRENEUR · Erasmus+ KA220-YOU
        </p>
      </div>
    </footer>
  );
}

export function Yukleniyor() {
  const { t } = useB();
  return <div className="yukleniyor" role="status"><span className="donen" />{t('genel.yukleniyor')}</div>;
}

/* Hata kutusu: sunucunun kodunu çevirir. */
export function HataKutusu({ kod }) {
  const { t } = useB();
  if (!kod) return null;
  return <p className="hata" role="alert">{t('hata.' + kod)}</p>;
}

/* Halka ilerleme göstergesi. */
export function Halka({ oran, boy = 120, kalin = 12, children }) {
  const r = (boy - kalin) / 2, c = 2 * Math.PI * r;
  return (
    <div className="halka" style={{ width: boy, height: boy }}>
      <svg width={boy} height={boy} aria-hidden="true">
        <circle cx={boy / 2} cy={boy / 2} r={r} stroke="var(--cizgi)" strokeWidth={kalin} fill="none" />
        <circle cx={boy / 2} cy={boy / 2} r={r} stroke="url(#halkaRenk)" strokeWidth={kalin} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - oran)}
          transform={`rotate(-90 ${boy / 2} ${boy / 2})`} style={{ transition: 'stroke-dashoffset .6s ease' }} />
        <defs><linearGradient id="halkaRenk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#46aa76" /><stop offset="1" stopColor="#1084c2" /></linearGradient></defs>
      </svg>
      <div className="halka-ic">{children}</div>
    </div>
  );
}
