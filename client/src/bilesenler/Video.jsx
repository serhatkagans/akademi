import { useEffect, useRef, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import Simge from './Simge.jsx';

/* Fisher–Yates: 0..n-1 sırasını karıştırır. */
export const karistir = n => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* YouTube IFrame API bir kez yüklenir. */
let ytSoz;
export function ytYukle() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  ytSoz ??= new Promise(coz => {
    const onceki = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { onceki?.(); coz(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return ytSoz;
}

/**
 * Takipli video: kim, ne kadar izledi (saniye), ileri sarma yok, ara sorular.
 * `izlenen` = baştan kesintisiz izlenen en uzak nokta. Geri sarmak serbest;
 * izlenenin ötesine atlamaya çalışan oraya geri döndürülür.
 */
export default function Video({ yol, video, d }) {
  const { t, dil, setDurum } = useB();
  const kutu = useRef(null);
  const oyn = useRef(null);
  const izlenen = useRef(d.sn || 0);
  const cevaplanan = useRef(new Set(d.cevaplar));
  const sonKayit = useRef(0);
  const [sure, setSure] = useState(d.sure || 0);
  const [goster, setGoster] = useState(d.sn || 0);
  const [soru, setSoru] = useState(null); // { i, q }
  const [secim, setSecim] = useState(null);
  const [sonuc, setSonuc] = useState(null); // 'dogru' | 'yanlis'
  const [uyari, setUyari] = useState(false);
  const soruAcik = useRef(false);

  async function kaydet(zorla = false) {
    const p = oyn.current;
    if (!p?.getDuration) return;
    const s = Math.round(p.getDuration());
    if (!s) return;
    if (!zorla && Date.now() - sonKayit.current < 10000) return;
    sonKayit.current = Date.now();
    try {
      const r = await api(`${yol}/video`, { method: 'POST', govde: { sn: Math.floor(izlenen.current), sure: s } });
      setDurum(r.durum);
    } catch { /* bir sonraki kayıtta tekrar denenir */ }
  }

  useEffect(() => {
    let iptal = false, zaman;
    ytYukle().then(YT => {
      if (iptal) return;
      oyn.current = new YT.Player(kutu.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId: video.youtube,
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1, hl: dil, cc_lang_pref: dil, cc_load_policy: 1, disablekb: 1 },
        events: {
          onReady: e => { setSure(Math.round(e.target.getDuration())); },
          onStateChange: e => {
            if (e.data === YT.PlayerState.PAUSED) kaydet(true);
            if (e.data === YT.PlayerState.ENDED) { izlenen.current = e.target.getDuration(); setGoster(izlenen.current); kaydet(true); }
          },
        },
      });
      zaman = setInterval(() => {
        const p = oyn.current;
        if (!p?.getCurrentTime || p.getPlayerState?.() !== YT.PlayerState.PLAYING) return;
        const an = p.getCurrentTime();
        if (an > izlenen.current + 2) { p.seekTo(izlenen.current, true); setUyari(true); setTimeout(() => setUyari(false), 3500); return; }
        izlenen.current = Math.max(izlenen.current, an);
        setGoster(izlenen.current);
        /* Ara soru zamanı geldiyse ve henüz doğru cevaplanmadıysa: durdur, sor. */
        const i = video.sorular.findIndex((q, k) => !cevaplanan.current.has(k) && an >= q.sn && an < q.sn + 3);
        if (i >= 0 && !soruAcik.current) {
          p.pauseVideo(); soruAcik.current = true;
          const q = video.sorular[i];
          setSoru({ i, q, sira: q.tur === 'dy' ? [0, 1] : karistir(q.secenekler.length) }); setSecim(null); setSonuc(null);
        }
        kaydet();
      }, 500);
    });
    return () => { iptal = true; clearInterval(zaman); kaydet(true); oyn.current?.destroy?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.youtube]);

  async function cevapla() {
    if (secim === null) return;
    const r = await api(`${yol}/soru`, { method: 'POST', govde: { soru: soru.i, cevap: secim } });
    setDurum(r.durum);
    setSonuc(r.dogru ? 'dogru' : 'yanlis');
    if (r.dogru) cevaplanan.current.add(soru.i);
  }
  function devam() {
    /* Soru doğru cevaplandı (cevaplanan kümesinde): bir daha sorulmaz, video kaldığı yerden sürer. */
    setSoru(null); soruAcik.current = false;
    oyn.current?.playVideo();
  }

  const oran = sure ? Math.min(1, goster / sure) : 0;
  const secenekler = soru?.q.tur === 'dy' ? [t('vid.dy0'), t('vid.dy1')] : soru?.q.secenekler || [];
  /* Çoktan seçmelide seçenekler soru her açıldığında karışır; seçim özgün sırayla gönderilir. */
  const sira = soru?.sira || secenekler.map((_, k) => k);

  return (
    <div className="video">
      <div className="video-cerceve">
        <div ref={kutu} />
        {soru && (
          <div className="video-soru" role="dialog" aria-modal="true" aria-labelledby="vsoru">
            <div className="video-soru-kart">
              <p className="rozet koyu">{t('vid.soru')} {soru.i + 1}/{video.sorular.length}</p>
              <h3 id="vsoru">{soru.q.soru}</h3>
              <div className="cevaplar">
                {sira.map(k => (
                  <label key={k} className={'cevap' + (secim === k ? ' secili' : '')}>
                    <input type="radio" name="vsoru" checked={secim === k} onChange={() => { setSecim(k); setSonuc(null); }}
                      disabled={sonuc === 'dogru'} />
                    {secenekler[k]}
                  </label>
                ))}
              </div>
              {sonuc && <p className={'geri-bildirim ' + sonuc} role="status">{t(sonuc === 'dogru' ? 'vid.dogru' : 'vid.yanlis')}</p>}
              {sonuc === 'dogru'
                ? <button className="dugme" onClick={devam} autoFocus>{t('vid.devam')} <Simge ad="oynat" boy={16} /></button>
                : <button className="dugme" onClick={cevapla} disabled={secim === null}>{t('vid.kontrol')}</button>}
            </div>
          </div>
        )}
      </div>
      <div className="video-alt">
        <div className="cubuk" role="progressbar" aria-label={t('video.izlenen')} aria-valuenow={Math.round(oran * 100)} aria-valuemin="0" aria-valuemax="100">
          <span style={{ width: `${oran * 100}%` }} />
          {sure > 0 && video.sorular.map((q, k) => (
            <i key={k} className={'cubuk-isaret' + (cevaplanan.current.has(k) ? ' tamam' : '')} style={{ left: `${(q.sn / sure) * 100}%` }} />
          ))}
        </div>
        <span className="soluk">{t('vid.izlendi', { n: Math.round(oran * 100) })}</span>
      </div>
      {uyari && <p className="bilgi" role="status">{t('vid.ileri')}</p>}
      <p className="video-not soluk">{video.not} · {t('vid.kaynak', { k: video.kaynak })}</p>
    </div>
  );
}
