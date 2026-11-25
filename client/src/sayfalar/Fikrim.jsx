import { yerel } from '../dil.js';
import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import NotAlani, { notlariGetir } from '../bilesenler/Not.jsx';
import Simge from '../bilesenler/Simge.jsx';

/**
 * Proje fikri defteri: kanvas (fikrin adı + altı soru) ve bölüm görevlerine yazılanlar.
 * "PDF olarak kaydet" yalnızca planı A4 dikey yazdırır.
 */
export default function Fikrim() {
  const { t, uye, icerik, dil } = useB();
  const [degerler, setDegerler] = useState({});
  const [gorevler, setGorevler] = useState({});
  useEffect(() => { notlariGetir(true).then(n => setGorevler(n)); }, []);

  const kanvas = icerik.kanvas;
  const dolu = kanvas.filter(k => (degerler[k.id] || '').trim()).length;
  const ad = (degerler.ad || '').trim();
  const tarih = new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'long' }).format(new Date());

  return (
    <div className="kap">
      <div className="ekran-yalniz">
        <a className="geri" href="#/pano">{t('genel.geri')}</a>
        <div className="fikir-ust">
          <div>
            <h1>{t('fikir.baslik')}</h1>
            <p className="soluk">{t('fikir.alt')}</p>
          </div>
          <div className="fikir-eylem">
            <span className="rozet koyu renk-turuncu">{t('fikir.dolu', { n: dolu, t: kanvas.length })}</span>
            <button className="dugme" onClick={() => window.print()} disabled={!dolu}>{t('fikir.yazdir')}</button>
          </div>
        </div>

        <h2 className="ara-baslik">{t('fikir.kanvas')}</h2>
        <div className="kanvas">
          {kanvas.map((k, i) => (
            <div key={k.id} className={'kanvas-kutu' + (k.kisa ? ' genis' : '')}>
              {!k.kisa && <span className="kanvas-no">{i}</span>}
              <NotAlani anahtar={'kanva:' + k.id} etiket={k.ad} ip={k.ip} kisa={k.kisa}
                onDegis={v => setDegerler(d => ({ ...d, [k.id]: v }))} />
            </div>
          ))}
        </div>

        <h2 className="ara-baslik">{t('fikir.gorevler')}</h2>
        <div className="gorev-listesi">
          {/* Bütün bölümlerdeki etkinlik adımları ve kişinin bunlara yazdıkları. */}
          {icerik.bolumler.flatMap(b => b.adimlar.map((a, k) => ({ b, a, k })).filter(x => x.a.tur === 'etkinlik')).map(({ b, a, k }) => {
            const m = gorevler[`adim:${b.id}:${a.id}`]?.metin;
            return (
              <a key={b.id + a.id} className={'gorev-satir renk-' + b.renk} href={`#/bolum/${b.id}/${k + 1}`}>
                <span className="bolum-simge"><Simge ad={b.simge} boy={22} /></span>
                <span><b>{b.baslik} · {a.baslik}</b><small>{a.soru}</small>{m ? <p>{m}</p> : <em className="soluk">{t('fikir.bos')}</em>}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Yazdırma: tek sayfalık plan. */}
      <section className="plan-kagit yazdir-yalniz">
        <header>
          <img src="belge-logo-tam.png" alt="E-YOUTHPRENEUR" />
          <div><small>{t('fikir.belge')}</small><h1>{ad || '—'}</h1><p>{uye.ad} · {tarih}</p></div>
        </header>
        <div className="plan-izgara">
          {kanvas.filter(k => !k.kisa).map(k => (
            <div key={k.id}><h3>{k.ad}</h3><p>{degerler[k.id] || ''}</p></div>
          ))}
        </div>
        <footer>E-YOUTHPRENEUR Academy · Erasmus+ KA220-YOU · Co-funded by the European Union</footer>
      </section>
    </div>
  );
}
