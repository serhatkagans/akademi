import { xlsxYaz } from './xlsx.mjs';
import { gostergeHesapla, HEDEF } from './gosterge.mjs';
import { ANKET } from '../icerik/modul.mjs';
import { guncel } from './icerik.mjs';
import { yas } from './uye.mjs';

/**
 * Ulusal Ajans / ara-son rapor için gösterge özeti — Excel (.xlsx).
 * Sayfalar: Özet (gösterge · değer · hedef · durum), Bölümler, Ülke, Yaş, Rol,
 * Anket, Katılımcılar (ANONİM: ad/e-posta yok, sıra numarası verilir).
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
    },
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
    },
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

export async function raporXlsx(db, dilIstek, simdi = new Date()) {
  const dil = raporDili(dilIstek);
  const m = M[dil];
  const o = await gostergeHesapla(db);
  const ust = [m.baslik, m.alt, `${m.olusturma}: ${simdi.toISOString().slice(0, 16).replace('T', ' ')} UTC`, m.notu];
  const y = v => v / 100; // yüzde hücresi 0–1 ister
  const durum = (deger, hedef) => (deger >= hedef ? m.ulasti : m.altinda);

  const ozet = [
    ['kayitli', o.kayitli, '', ''],
    ['tumunu', o.tumunuBitiren, '', ''],
    ['tamamlama', y(o.tamamlamaOrani), `≥ ${HEDEF.tamamlama}%`, durum(o.tamamlamaOrani, HEDEF.tamamlama)],
    ['testGiren', o.test.giren, '', ''],
    ['testGecen', o.test.gecen, '', ''],
    ['sertifika', o.sertifika, '', ''],
    ['sertifikaOrani', y(o.sertifikaOrani), `≥ ${HEDEF.sertifika}%`, durum(o.sertifikaOrani, HEDEF.sertifika)],
    ['azFirsat', o.azFirsat.sayi, '', ''],
    ['azFirsatOrani', y(o.azFirsat.oran), `${HEDEF.azFirsat}%`, durum(o.azFirsat.oran, HEDEF.azFirsat)],
    ['giris', o.giris, '', ''],
    ['sure', o.ortSureDk, '', ''],
    ['video', y(o.videoOrtIzleme), '', ''],
    ['anket', o.anket.sayi, '', ''],
    ['indirme', o.indirme, '', ''],
    ['grup', o.grup, '', ''],
  ];
  const yuzdeli = new Set(['tamamlama', 'sertifikaOrani', 'azFirsatOrani', 'video']);

  const bolumler = guncel().bolumler;
  const bAd = id => { const b = bolumler.find(x => x.id === id); return b ? (b.baslik[dil] || b.baslik.en) : id; };
  const n = o.kayitli;

  const kisiler = await db.all(`
    SELECT u.olusturma, u.ulke, u.rol, u.dogum_yili, u.az_firsat, u.giris_sayisi, u.aktif_sn, u.anket_at,
      (SELECT CAST(count(*) AS INTEGER) FROM ilerleme i WHERE i.uye_id = u.id AND i.tamam_at IS NOT NULL
         AND i.bolum IN (${bolumler.map(() => '?').join(',') || "''"})) AS bolum,
      (SELECT MAX(puan) FROM denemeler d WHERE d.uye_id = u.id) AS test,
      (SELECT CAST(count(*) AS INTEGER) FROM sertifikalar s WHERE s.uye_id = u.id) AS sertifika
    FROM uyeler u WHERE u.yonetici = 0 ORDER BY u.olusturma`, bolumler.map(b => b.id));

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
        sutunlar: [[m.madde, 64], [m.ortalama, 16]], bicimler: ['metin', 'sayi'],
        satirlar: [...ANKET.map(a => [a[dil] || a.en, o.anket.puan[a.id] ?? '']), ['', ''], [m.yorum, ''], ...o.anket.yorumlar.map(c => [c, ''])] },
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
