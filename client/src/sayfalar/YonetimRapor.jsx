import { useEffect, useState } from 'react';
import { useB } from '../baglam.js';
import { api } from '../api.js';
import { yerel, yuzde as yuzdeBicim } from '../dil.js';
import { Yukleniyor } from '../bilesenler/Kabuk.jsx';
import Simge from '../bilesenler/Simge.jsx';

/**
 * Ulusal Ajans raporu için gösterge özeti.
 *  - Süzgeç: dönem (o tarihlerde kaydolanlar) ve ülke. Boş bırakılırsa başlangıçtan bugüne, tüm ülkeler.
 *  - Excel: sunucuda üretilir (/api/yonetim/rapor.xlsx, Türkçe ya da İngilizce, aynı süzgeçle).
 *  - PDF: bu sayfa A4 belge olarak yazdırılır (tarayıcıda "PDF olarak kaydet").
 * Kişisel veri yok: yalnızca sayılar, oranlar ve isimsiz anket yorumları.
 */
const HEDEF = { tamamlama: 70, sertifika: 65, azFirsat: 40 };
const ULKELER = ['TR', 'IT', 'RO', 'NL', 'PT', 'DK', 'DIGER'];

export default function YonetimRapor() {
  const { t, dil, icerik } = useB();
  const [s, setS] = useState({ bas: '', bit: '', ulke: '' });
  const [o, setO] = useState(null);
  const sorgu = new URLSearchParams(Object.entries(s).filter(([, v]) => v)).toString();
  useEffect(() => { setO(null); api('yonetim/ozet' + (sorgu ? '?' + sorgu : '')).then(setO); }, [sorgu]);

  const simdi = new Intl.DateTimeFormat(yerel(dil), { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const yz = n => yuzdeBicim(dil, n);
  const yuzde = (a, b) => (b ? yz(Math.round((a / b) * 1000) / 10) : '–');
  const durum = (deger, hedef) => (deger >= hedef
    ? <span className="rap-durum iyi">{t('rap.ulasti')}</span>
    : <span className="rap-durum dusuk">{t('rap.altinda')}</span>);
  const adi = id => icerik.bolumler.find(b => b.id === id)?.baslik || id;
  const ek = (dil2) => `api/yonetim/rapor.xlsx?dil=${dil2}${sorgu ? '&' + sorgu : ''}`;

  const filtre = (
    <form className="rap-suzgec ekran-yalniz" onSubmit={e => e.preventDefault()}>
      <label>{t('rap.bas')}<input type="date" value={s.bas} onChange={e => setS({ ...s, bas: e.target.value })} /></label>
      <label>{t('rap.bit')}<input type="date" value={s.bit} onChange={e => setS({ ...s, bit: e.target.value })} /></label>
      <label>{t('rap.ulke')}
        <select value={s.ulke} onChange={e => setS({ ...s, ulke: e.target.value })}>
          <option value="">{t('rap.tumUlkeler')}</option>
          {ULKELER.map(u => <option key={u} value={u}>{t('ulke.' + u)}</option>)}
        </select>
      </label>
      {sorgu && <button type="button" className="bag" onClick={() => setS({ bas: '', bit: '', ulke: '' })}>{t('rap.temizle')}</button>}
    </form>
  );

  const ust = (
    <div className="yonetim-ust ekran-yalniz">
      <div><h1>{t('rap.baslik')}</h1><p className="soluk">{t('rap.alt')}</p></div>
      <div className="rap-dugmeler">
        <a className="dugme ikincil" href={ek('tr')}><Simge ad="kartlar" boy={18} /> {t('rap.excel', { dil: 'Türkçe' })}</a>
        <a className="dugme ikincil" href={ek('en')}><Simge ad="kartlar" boy={18} /> {t('rap.excel', { dil: 'English' })}</a>
        <button className="dugme" onClick={() => window.print()} disabled={!o}><Simge ad="test" boy={18} /> {t('rap.pdf')}</button>
      </div>
    </div>
  );
  if (!o) return <div className="rapor-sayfa">{ust}{filtre}<Yukleniyor /></div>;

  const n = o.kayitli;
  const S = o.suzgec;
  const donemli = S.bas || S.bit;
  const satirlar = [
    [t('yon.kayitli'), n],
    [t('rap.tumu'), o.tumunuBitiren],
    [t('yon.tamamlama'), `${yz(o.tamamlamaOrani)}`, '≥ ' + yz(HEDEF.tamamlama), durum(o.tamamlamaOrani, HEDEF.tamamlama)],
    [t('rap.testGiren'), `${o.test.giren} (${yz(o.test.girmeOrani)})`, '', '', t('rap.testGirme.n')],
    [t('rap.testGecen'), `${o.test.gecen} (${yz(o.test.gecmeOrani)})`, '', '', t('rap.testGecme.n')],
    [t('yon.sertifika'), `${o.sertifika} (${yz(o.sertifikaOrani)})`, '≥ ' + yz(HEDEF.sertifika), durum(o.sertifikaOrani, HEDEF.sertifika)],
    [t('yon.azfirsat'), `${o.azFirsat.sayi} (${yz(o.azFirsat.oran)})`, yz(HEDEF.azFirsat), durum(o.azFirsat.oran, HEDEF.azFirsat)],
    [t('yon.giris'), o.giris],
    [t('yon.sure'), t('dk', { n: o.ortSureDk })],
    [t('yon.video'), `${yz(o.videoOrtIzleme)}`],
    [t('rap.anketSayi'), o.anket.oran === null ? o.anket.sayi : `${o.anket.sayi} (${yz(o.anket.oran)})`, '', '', t('rap.anketOrani.n')],
    [t('yon.indirme'), o.indirme],
    [t('yon.grup'), o.grup],
  ];

  const Dagilim = ({ baslik, veri, etiket }) => {
    const toplam = Object.values(veri).reduce((a, b) => a + b, 0);
    return (
      <table className="rap-tablo">
        <thead><tr><th>{baslik}</th><th>{t('rap.kisi')}</th><th>{t('rap.oran')}</th></tr></thead>
        <tbody>{Object.entries(veri).map(([k, v]) => <tr key={k}><td>{etiket(k)}</td><td>{v}</td><td>{yuzde(v, toplam)}</td></tr>)}</tbody>
      </table>
    );
  };

  return (
    <div className="rapor-sayfa">
      {ust}
      {filtre}
      <p className="soluk ekran-yalniz rap-ipucu">{t('rap.ipucu')}</p>

      <article className="rap-kagit">
        <header className="rap-bas">
          <img src="belge-logo-tam.png" alt="E-YOUTHPRENEUR" />
          <div>
            <h2>{t('rap.belge')}</h2>
            <p>Erasmus+ KA220-YOU · {t('rap.tarih')}: {simdi}</p>
            <p>{t('rap.donem')}: {donemli ? `${S.bas || '…'} – ${S.bit || '…'}` : t('rap.donemTum')} · {t('rap.ulke')}: {S.ulke ? t('ulke.' + S.ulke) : t('rap.tumUlkeler')}</p>
          </div>
        </header>
        {donemli && <p className="rap-not">{t('rap.donemNot')}</p>}

        <h3>{t('rap.gostergeler')}</h3>
        <table className="rap-tablo">
          <thead><tr><th>{t('rap.gosterge')}</th><th>{t('rap.deger')}</th><th>{t('rap.hedef')}</th><th>{t('rap.durum')}</th></tr></thead>
          <tbody>{satirlar.map(([a, d, h, st, not]) => (
            <tr key={a}><td>{a}{not && <small className="rap-alt-not">{not}</small>}</td><td><b>{d}</b></td><td>{h || ''}</td><td>{st || ''}</td></tr>
          ))}</tbody>
        </table>

        <h3>{t('yon.bolumler')}</h3>
        <table className="rap-tablo">
          <thead><tr><th>#</th><th>{t('rap.bolum')}</th><th>{t('rap.kisi')}</th><th>{t('rap.oran')}</th></tr></thead>
          <tbody>{o.bolumler.map((b, i) => <tr key={b.id}><td>{i + 1}</td><td>{adi(b.id)}</td><td>{b.tamam}</td><td>{yuzde(b.tamam, n)}</td></tr>)}</tbody>
        </table>

        <h3>{t('rap.ulkeler')}</h3>
        <div className="tablo-kap" tabIndex={0} role="region" aria-label={t('genel.tablo')}>
          <table className="rap-tablo">
            <thead><tr><th>{t('rap.ulke')}</th><th>{t('rap.kisi')}</th><th>{t('rap.tumu')}</th><th>{t('rap.oran')}</th><th>{t('yon.sertifika')}</th><th>{t('rap.oran')}</th><th>{t('yon.azfirsat')}</th></tr></thead>
            <tbody>{o.ulkeDokum.map(u => (
              <tr key={u.ulke}><td>{t('ulke.' + u.ulke)}</td><td>{u.kayitli}</td><td>{u.bitiren}</td><td>{yz(u.tamamlamaOrani)}</td><td>{u.sertifika}</td><td>{yz(u.sertifikaOrani)}</td><td>{u.azFirsat} ({yz(u.azFirsatOrani)})</td></tr>
            ))}</tbody>
          </table>
        </div>

        <h3>{t('rap.dagilim')}</h3>
        <div className="rap-uclu">
          <Dagilim baslik={t('yon.yas')} veri={o.yas} etiket={k => (k === '?' ? t('rap.bilinmiyor') : k)} />
          <Dagilim baslik={t('yon.rol')} veri={o.rol} etiket={k => t('rol.' + k)} />
        </div>

        <h3>{t('yon.anket', { n: o.anket.sayi })}</h3>
        {S.ulke && <p className="rap-not">{t('rap.anketUlke')}</p>}
        <table className="rap-tablo">
          <thead><tr><th>{t('rap.madde')}</th><th>{t('rap.ortalama')}</th><th>{t('rap.yanit')}</th></tr></thead>
          <tbody>{icerik.anket.map(m => (
            <tr key={m.id}><td>{m.metin}{m.rol && <small className="rap-alt-not">{t('rap.yalnizGenclik')}</small>}</td><td>{o.anket.puan[m.id] ?? '–'}</td><td>{o.anket.yanit?.[m.id] ?? 0}</td></tr>
          ))}</tbody>
        </table>
        {o.anket.yorumlar.length > 0 && <>
          <h3>{t('yon.yorumlar')}</h3>
          <ul className="rap-yorumlar">{o.anket.yorumlar.map((y, i) => <li key={i}>“{y}”</li>)}</ul>
        </>}

        {o.indirmeler.length > 0 && <>
          <h3>{t('rap.kaynaklar')}</h3>
          <table className="rap-tablo">
            <thead><tr><th>{t('rap.kaynak')}</th><th>{t('rap.indToplam')}</th>{donemli && <th>{t('rap.indDonem')}</th>}</tr></thead>
            <tbody>{o.indirmeler.map(k => (
              <tr key={k.id}><td>{(dil === 'tr' ? k.baslik_tr : k.baslik_en) || k.baslik_tr}<small className="rap-alt-not">{k.dosya} · {k.yuklenme}</small></td><td>{k.toplam}</td>{donemli && <td>{k.donem}</td>}</tr>
            ))}</tbody>
          </table>
        </>}

        <footer className="rap-alt">
          <p>{t('rap.not')}</p>
          <p>{t('alt.ret')}</p>
        </footer>
      </article>
    </div>
  );
}
