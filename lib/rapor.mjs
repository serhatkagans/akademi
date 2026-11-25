import { xlsxYaz } from './xlsx.mjs';
import { gostergeHesapla, HEDEF, suzgecCoz } from './gosterge.mjs';
import { ANKET } from '../icerik/modul.mjs';
import { guncel } from './icerik.mjs';
import { yas } from './uye.mjs';

/**
 * Ulusal Ajans / ara-son rapor için gösterge özeti — Excel (.xlsx).
 * Sayfalar: Özet (gösterge · değer · hedef · durum), Bölümler, Ülke, Yaş, Rol, Anket,
 * Ülkeler (ülke kırılımı), Kaynaklar (indirmeler), Katılımcılar (ANONİM: ad/e-posta yok, sıra numarası).
 * Süzgeç: dönem (bas–bit) ve ülke — bkz. lib/gosterge.mjs.
 * Dil: tr | en (Türk Ulusal Ajansı Türkçe, ortaklar İngilizce okur).
 */
const M = {
  tr: {
    dosya: 'akademi-gosterge-raporu', baslik: 'E-YOUTHPRENEUR Akademi — gösterge raporu',
    alt: 'WP3 A-2 · GSD Girişimcilik Çevrim İçi Eğitim Modülü · Erasmus+ KA220-YOU', olusturma: 'Oluşturma',
    notu: 'Yönetici hesapları katılımcı sayılmaz. Oranlar kayıtlı katılımcıya göre hesaplanır.',
    ozet: 'Özet', gosterge: 'Gösterge', deger: 'Değer', hedef: 'Hedef', durum: 'Durum', aciklama: 'Açıklama',
    ulasti: 'Ulaşıldı', altinda: 'Hedefin altında',
    g: {
      kayitli: ['Kayıtlı katılımcı', 'Hesap açan gençler ve gençlik çalışanları'],
      tumunu: ['Bütün modülü tamamlayan', 'Tüm bölümleri bitiren kişi sayısı'],
      tamamlama: ['Tamamlama oranı', 'Bütün modülü tamamlayan / kayıtlı'],
      testGiren: ['Son teste giren', 'En az bir deneme yapan'],
      testGecen: ['Son testi geçen', '10 sorudan en az 7 doğru'],
      sertifika: ['Sertifika alan', 'Test + anket sonrası doğrulama kodlu sertifika'],
      sertifikaOrani: ['Sertifika oranı', 'Sertifika alan / kayıtlı'],
      azFirsat: ['Daha az fırsata sahip katılımcı', 'İsteğe bağlı öz beyan'],
      azFirsatOrani: ['Daha az fırsat oranı', 'Öz beyan / kayıtlı'],
      giris: ['Toplam giriş', 'Oturum açma sayısı'],
      sure: ['Ortalama etkin süre (dk)', 'Sekme açıkken ölçülen süre, kişi başı'],
      video: ['Ortalama video izleme', 'İzlenen süre / video süresi'],
      anket: ['Memnuniyet anketi yanıtı', 'Modül sonu anketi (isimsiz)'],
      indirme: ['Kaynak indirme', 'Kaynaklar sayfasındaki dosyalar'],
      grup: ['Grup (sınıf)', 'Gençlik çalışanlarının açtığı gruplar'],
      testGirme: ['Değerlendirme tamamlama oranı', 'Son teste giren / modülü bitiren'],
      testGecme: ['Test geçme oranı', 'Testi geçen / teste giren'],
      anketOrani: ['Anket yanıt oranı', 'Anket yanıtı / testi geçen (ülke süzgecinde hesaplanmaz: anket isimsiz)'],
    },
    donem: 'Dönem', donemTum: 'Başlangıçtan bugüne', donemNot: 'Dönem: o tarihlerde kaydolan katılımcılar; tamamlama, test ve sertifika dönem sonuna kadar. Anket yalnızca tarihle, indirmeler dönem içinde sayılır. Giriş ve süre birikimlidir.',
    ulkeSuz: 'Ülke', tumUlkeler: 'Tüm ülkeler',
    ulkeler: 'Ülkeler', bitiren: 'Modülü bitiren', tamOran: 'Tamamlama oranı', sertOran: 'Sertifika oranı', azOran: 'Daha az fırsat oranı',
    kaynaklar: 'Kaynaklar', kaynak: 'Kaynak', dosya: 'Dosya', yuklenme: 'Yüklenme', indToplam: 'İndirme (toplam)', indDonem: 'İndirme (dönem)',
    yanit: 'Yanıt', yalnizGenclik: '(yalnızca gençlik çalışanları)',
    bolumler: 'Bölümler', bolum: 'Bölüm', tamamlayan: 'Tamamlayan', oran: 'Oran',
    ulke: 'Ülke', yas: 'Yaş', yasGrubu: 'Yaş grubu', rol: 'Rol', sayi: 'Kişi',
    bilinmiyor: 'Bilinmiyor',
    anketSayfa: 'Anket', madde: 'Madde', ortalama: 'Ortalama (1–5)', yorum: 'Yorumlar (son 20)',
    katilimcilar: 'Katılımcılar', no: 'No', kayit: 'Kayıt', azF: 'Daha az fırsat', girisS: 'Giriş', sureDk: 'Süre (dk)',
    bolumS: 'Bölüm', test: 'Test (en iyi)', sert: 'Sertifika', anketY: 'Anket', evet: 'Evet', hayir: '',
    ulkeAd: { TR: 'Türkiye', IT: 'İtalya', RO: 'Romanya', NL: 'Hollanda Krallığı', PT: 'Portekiz', DK: 'Danimarka', DIGER: 'Diğer' },
    rolAd: { genc: 'Genç', genclik: 'Gençlik çalışanı', diger: 'Diğer' },
  },
  en: {
    dosya: 'academy-indicator-report', baslik: 'E-YOUTHPRENEUR Academy — indicator report',
    alt: 'WP3 A-2 · GSD Entrepreneurship Online Training Module · Erasmus+ KA220-YOU', olusturma: 'Generated',
    notu: 'Administrator accounts are not counted as participants. Rates are relative to registered participants.',
    ozet: 'Summary', gosterge: 'Indicator', deger: 'Value', hedef: 'Target', durum: 'Status', aciklama: 'Note',
    ulasti: 'Reached', altinda: 'Below target',
    g: {
      kayitli: ['Registered participants', 'Young people and youth workers with an account'],
      tumunu: ['Completed the whole module', 'Finished every part'],
      tamamlama: ['Completion rate', 'Completed whole module / registered'],
      testGiren: ['Took the final test', 'At least one attempt'],
      testGecen: ['Passed the final test', 'At least 7 of 10 correct'],
      sertifika: ['Certificates issued', 'After test + survey, with verification code'],
      sertifikaOrani: ['Certification rate', 'Certificates / registered'],
      azFirsat: ['Participants with fewer opportunities', 'Optional self-declaration'],
      azFirsatOrani: ['Fewer-opportunities rate', 'Self-declared / registered'],
      giris: ['Total logins', 'Number of sign-ins'],
      sure: ['Average active time (min)', 'Measured while the tab is visible, per person'],
      video: ['Average video watched', 'Watched time / video length'],
      anket: ['Satisfaction survey responses', 'End-of-module survey (anonymous)'],
      indirme: ['Resource downloads', 'Files on the Resources page'],
      grup: ['Groups (classes)', 'Groups created by youth workers'],
      testGirme: ['Assessment completion rate', 'Took the final test / completed the module'],
      testGecme: ['Test pass rate', 'Passed / took the test'],
      anketOrani: ['Survey response rate', 'Survey responses / passed the test (not computed with a country filter: the survey is anonymous)'],
    },
    donem: 'Period', donemTum: 'From the start until today', donemNot: 'Period: participants who registered in these dates; completion, test and certificates until the end of the period. The survey is filtered by date only; downloads are counted within the period. Logins and time are cumulative.',
    ulkeSuz: 'Country', tumUlkeler: 'All countries',
    ulkeler: 'Countries', bitiren: 'Completed the module', tamOran: 'Completion rate', sertOran: 'Certification rate', azOran: 'Fewer-opportunities rate',
    kaynaklar: 'Resources', kaynak: 'Resource', dosya: 'File', yuklenme: 'Uploaded', indToplam: 'Downloads (total)', indDonem: 'Downloads (period)',
    yanit: 'Responses', yalnizGenclik: '(youth workers only)',
    bolumler: 'Parts', bolum: 'Part', tamamlayan: 'Completed', oran: 'Rate',
    ulke: 'Country', yas: 'Age', yasGrubu: 'Age group', rol: 'Role', sayi: 'People',
    bilinmiyor: 'Unknown',
    anketSayfa: 'Survey', madde: 'Item', ortalama: 'Average (1–5)', yorum: 'Comments (last 20)',
    katilimcilar: 'Participants', no: 'No', kayit: 'Registered', azF: 'Fewer opportunities', girisS: 'Logins', sureDk: 'Time (min)',
    bolumS: 'Parts', test: 'Test (best)', sert: 'Certificate', anketY: 'Survey', evet: 'Yes', hayir: '',
    ulkeAd: { TR: 'Türkiye', IT: 'Italy', RO: 'Romania', NL: 'Kingdom of the Netherlands', PT: 'Portugal', DK: 'Denmark', DIGER: 'Other' },
    rolAd: { genc: 'Young person', genclik: 'Youth worker', diger: 'Other' },
  },
};

export const raporDili = d => (d === 'en' ? 'en' : 'tr');
const gun = t => (t ? new Date(Number(t)).toISOString().slice(0, 10) : '');
const yasGrubu = y => { if (!y) return '?'; const a = yas(y); return a < 17 ? '<17' : a <= 30 ? '17-30' : '>30'; };

export async function raporXlsx(db, dilIstek, suzgec = {}, simdi = new Date()) {
  const dil = raporDili(dilIstek);
  const m = M[dil];
  const o = await gostergeHesapla(db, suzgec);
  const S = o.suzgec;
  const donemMetni = S.bas || S.bit ? `${S.bas || '…'} – ${S.bit || '…'}` : m.donemTum;
  const ust = [m.baslik, m.alt, `${m.donem}: ${donemMetni} · ${m.ulkeSuz}: ${S.ulke ? (m.ulkeAd[S.ulke] || S.ulke) : m.tumUlkeler}`,
    `${m.olusturma}: ${simdi.toISOString().slice(0, 16).replace('T', ' ')} UTC`, m.notu, ...(S.bas || S.bit ? [m.donemNot] : [])];
  const y = v => v / 100; // yüzde hücresi 0–1 ister
  const durum = (deger, hedef) => (deger >= hedef ? m.ulasti : m.altinda);

  const ozet = [
    ['kayitli', o.kayitli, '', ''],
    ['tumunu', o.tumunuBitiren, '', ''],
    ['tamamlama', y(o.tamamlamaOrani), `≥ ${HEDEF.tamamlama}%`, durum(o.tamamlamaOrani, HEDEF.tamamlama)],
    ['testGiren', o.test.giren, '', ''],
    ['testGecen', o.test.gecen, '', ''],
    ['testGirme', y(o.test.girmeOrani), '', ''],
    ['testGecme', y(o.test.gecmeOrani), '', ''],
    ['sertifika', o.sertifika, '', ''],
    ['sertifikaOrani', y(o.sertifikaOrani), `≥ ${HEDEF.sertifika}%`, durum(o.sertifikaOrani, HEDEF.sertifika)],
    ['azFirsat', o.azFirsat.sayi, '', ''],
    ['azFirsatOrani', y(o.azFirsat.oran), `${HEDEF.azFirsat}%`, durum(o.azFirsat.oran, HEDEF.azFirsat)],
    ['giris', o.giris, '', ''],
    ['sure', o.ortSureDk, '', ''],
    ['video', y(o.videoOrtIzleme), '', ''],
    ['anket', o.anket.sayi, '', ''],
    ...(o.anket.oran === null ? [] : [['anketOrani', y(o.anket.oran), '', '']]),
    ['indirme', o.indirme, '', ''],
    ['grup', o.grup, '', ''],
  ];
  const yuzdeli = new Set(['tamamlama', 'sertifikaOrani', 'azFirsatOrani', 'video', 'testGirme', 'testGecme', 'anketOrani']);

  const bolumler = guncel().bolumler;
  const bAd = id => { const b = bolumler.find(x => x.id === id); return b ? (b.baslik[dil] || b.baslik.en) : id; };
  const n = o.kayitli;

  /* Katılımcılar sayfası göstergelerle aynı kohortu listeler (dönem ve ülke süzgeci). */
  const { bas, bit, ulke } = suzgecCoz(suzgec);
  const kohortSql = (ulke ? ' AND u.ulke = ?' : '') + (bas ? ' AND u.olusturma >= ?' : '') + (bit ? ' AND u.olusturma <= ?' : '');
  const kohortP = [ulke, bas, bit].filter(v => v !== null);
  const kisiler = await db.all(`
    SELECT u.olusturma, u.ulke, u.rol, u.dogum_yili, u.az_firsat, u.giris_sayisi, u.aktif_sn, u.anket_at,
      (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL
         AND i.bolum IN (${bolumler.map(() => '?').join(',') || "''"})) AS bolum,
      (SELECT MAX(puan) FROM denemeler d WHERE d.uye_id = u.id) AS test,
      (SELECT CAST(count(*) AS INTEGER) FROM sertifikalar s WHERE s.uye_id = u.id) AS sertifika
    FROM uyeler u WHERE u.yonetici = 0${kohortSql} ORDER BY u.olusturma`, [...bolumler.map(b => b.id), ...kohortP]);

  const dagilim = (baslik, veri, ad) => {
    const toplam = Object.values(veri).reduce((a, b) => a + b, 0);
    return { sutunlar: [[baslik, 30], [m.sayi, 12], [m.oran, 12]], bicimler: ['metin', 'sayi', 'yuzde'],
      satirlar: Object.entries(veri).map(([k, v]) => [ad(k), v, toplam ? v / toplam : 0]) };
  };

  return {
    dosya: `${m.dosya}-${simdi.toISOString().slice(0, 10)}.xlsx`,
    veri: xlsxYaz([
      { ad: m.ozet, ust, sutunlar: [[m.gosterge, 42], [m.deger, 14], [m.hedef, 12], [m.durum, 18], [m.aciklama, 52]],
        bicimler: ['metin', 'sayi', 'metin', 'metin', 'metin'],
        satirlar: ozet.map(([k, v, h, d]) => [m.g[k][0], yuzdeli.has(k) ? { v, b: 'yuzde' } : v, h, d, m.g[k][1]]) },
      { ad: m.bolumler, ust: [m.bolumler, `${m.g.kayitli[0]}: ${n}`], sutunlar: [['#', 6], [m.bolum, 46], [m.tamamlayan, 14], [m.oran, 12]],
        bicimler: ['sayi', 'metin', 'sayi', 'yuzde'],
        satirlar: o.bolumler.map((b, i) => [i + 1, bAd(b.id), b.tamam, n ? b.tamam / n : 0]) },
      { ad: m.ulke, ...dagilim(m.ulke, o.ulke, k => m.ulkeAd[k] || k) },
      { ad: m.yas, ...dagilim(m.yasGrubu, o.yas, k => (k === '?' ? m.bilinmiyor : k)) },
      { ad: m.rol, ...dagilim(m.rol, o.rol, k => m.rolAd[k] || k) },
      { ad: m.anketSayfa, ust: [m.anketSayfa, `${m.g.anket[0]}: ${o.anket.sayi}`],
        sutunlar: [[m.madde, 70], [m.ortalama, 14], [m.yanit, 10]], bicimler: ['metin', 'sayi', 'sayi'],
        satirlar: [...ANKET.map(a => [(a[dil] || a.en) + (a.rol ? ' ' + m.yalnizGenclik : ''), o.anket.puan[a.id] ?? '', o.anket.yanit[a.id] ?? 0]),
          ['', '', ''], [m.yorum, '', ''], ...o.anket.yorumlar.map(c => [c, '', ''])] },
      { ad: m.ulkeler, ust: [m.ulkeler],
        sutunlar: [[m.ulke, 26], [m.sayi, 10], [m.bitiren, 14], [m.tamOran, 14], [m.sert, 11], [m.sertOran, 14], [m.azF, 14], [m.azOran, 16]],
        bicimler: ['metin', 'sayi', 'sayi', 'yuzde', 'sayi', 'yuzde', 'sayi', 'yuzde'],
        satirlar: o.ulkeDokum.map(u => [m.ulkeAd[u.ulke] || u.ulke, u.kayitli, u.bitiren, u.tamamlamaOrani / 100, u.sertifika, u.sertifikaOrani / 100, u.azFirsat, u.azFirsatOrani / 100]) },
      { ad: m.kaynaklar, ust: [m.kaynaklar],
        sutunlar: [[m.kaynak, 50], [m.dosya, 34], [m.yuklenme, 12], [m.indToplam, 16], ...(S.bas || S.bit ? [[m.indDonem, 16]] : [])],
        bicimler: ['metin', 'metin', 'metin', 'sayi', 'sayi'],
        satirlar: o.indirmeler.map(k => [(dil === 'tr' ? k.baslik_tr : k.baslik_en) || k.baslik_tr, k.dosya, k.yuklenme, k.toplam, ...(S.bas || S.bit ? [k.donem] : [])]) },
      { ad: m.katilimcilar,
        sutunlar: [[m.no, 7], [m.kayit, 12], [m.ulke, 22], [m.rol, 18], [m.yasGrubu, 11], [m.azF, 14], [m.girisS, 9], [m.sureDk, 10],
          [`${m.bolumS} (/${bolumler.length})`, 11], [m.test, 12], [m.anketY, 9], [m.sert, 11]],
        bicimler: ['sayi', 'metin', 'metin', 'metin', 'metin', 'metin', 'sayi', 'sayi', 'sayi', 'sayi', 'metin', 'metin'],
        satirlar: kisiler.map((k, i) => [i + 1, gun(k.olusturma), m.ulkeAd[k.ulke] || k.ulke, m.rolAd[k.rol] || k.rol,
          yasGrubu(k.dogum_yili) === '?' ? m.bilinmiyor : yasGrubu(k.dogum_yili), k.az_firsat ? m.evet : m.hayir, k.giris_sayisi,
          Math.round(k.aktif_sn / 60), k.bolum, k.test ?? '', k.anket_at ? m.evet : m.hayir, k.sertifika ? m.evet : m.hayir]) },
    ], simdi),
  };
}
