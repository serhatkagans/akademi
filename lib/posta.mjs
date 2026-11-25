import { createHmac, randomBytes } from 'node:crypto';
import { origin, basePath } from './ayar.mjs';

/**
 * E-posta: sertifika bildirimi ve "kaldığın yerden devam et" hatırlatması.
 *
 * Gönderim SMTP ayarına bağlıdır (.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
 * Ayar yoksa hiçbir şey dışarı GİTMEZ: e-posta `postalar` tablosuna "beklemede" olarak
 * yazılır ve yönetici ekranında görünür. Böylece ayar girilmeden ne gideceği denetlenebilir.
 *
 * Kişi bildirimleri Hesabım'dan ya da e-postadaki tek tıklık bağlantıyla kapatır
 * (bağlantı HMAC imzalıdır; başkasının bildirimini kapatmak için tahmin edilemez).
 */
const SMTP = process.env.SMTP_HOST ? {
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
} : null;
const GONDEREN = process.env.SMTP_FROM || 'E-YOUTHPRENEUR Academy <no-reply@localhost>';
export const smtpVar = !!SMTP;

let tasiyici;
async function tasiyiciAl() {
  if (!SMTP) return null;
  tasiyici ??= (await import('nodemailer')).default.createTransport(SMTP);
  return tasiyici;
}

/* İmza anahtarı: ortamdan ya da ilk açılışta üretilip `ayarlar`da saklanır. */
let gizli = process.env.AKADEMI_SIR || '';
export async function gizliYukle(db) {
  if (gizli) return;
  const r = await db.get("SELECT deger FROM ayarlar WHERE anahtar = 'imza'");
  if (r) { gizli = r.deger; return; }
  gizli = randomBytes(32).toString('hex');
  await db.run("INSERT INTO ayarlar (anahtar, deger, guncelleme) VALUES ('imza', ?, ?)", [gizli, Date.now()]);
}
export const imza = uyeId => createHmac('sha256', gizli).update('bildirim:' + uyeId).digest('hex').slice(0, 32);

export const siteAdresi = () => origin + (basePath || '') + '/';

/**
 * Şablonlar: {ad} {kod} {site} {biten} {toplam} {siradaki} {link} {baglanti} yer tutucuları.
 * Ortak dilleri (it, ro, pt, da) icerik/diller/<dil>.mjs · posta altındadır.
 */
export const SABLON = {
  tr: {
    sertifika: { konu: 'Sertifikan hazır — E-YOUTHPRENEUR Academy',
      metin: 'Merhaba {ad},\n\nTebrikler! Yeşil, Sosyal ve Dijital Girişimcilik eğitimini tamamladın. Sertifikan hazır:\n{site}#/sertifika\n\nDoğrulama kodu: {kod}\nKodla doğrulama: {site}#/dogrula/{kod}\n\nProje fikri defterin ve planın da hesabında duruyor. Başarılar!' },
    hatirlatma: { konu: 'Kaldığın yerden devam et — E-YOUTHPRENEUR Academy',
      metin: 'Merhaba {ad},\n\nGirişimcilik eğitiminde {biten}/{toplam} adımı tamamladın.{siradaki}\nBirkaç dakikan varsa kaldığın yerden devam et:\n{site}#/pano',
      siradaki: ' Sıradaki bölüm: {siradaki}.' },
    sifirlama: { konu: 'Parola sıfırlama — E-YOUTHPRENEUR Academy',
      metin: 'Merhaba {ad},\n\nParolanı sıfırlamak için bu bağlantıyı aç (1 saat geçerli, bir kez kullanılır):\n{baglanti}\n\nBu isteği sen yapmadıysan bu e-postayı yok say; parolan değişmez.' },
    alt: '\n\n—\nE-YOUTHPRENEUR Academy · Erasmus+ KA220-YOU · Avrupa Birliği tarafından eş finanse edilmektedir.\nBu e-postaları almak istemiyorsan: {link}',
  },
  en: {
    sertifika: { konu: 'Your certificate is ready — E-YOUTHPRENEUR Academy',
      metin: 'Hi {ad},\n\nCongratulations! You have completed the Green, Social & Digital Entrepreneurship training. Your certificate is ready:\n{site}#/sertifika\n\nVerification code: {kod}\nVerify: {site}#/dogrula/{kod}\n\nYour idea notebook and plan are still in your account. Good luck!' },
    hatirlatma: { konu: 'Pick up where you left off — E-YOUTHPRENEUR Academy',
      metin: 'Hi {ad},\n\nYou have completed {biten}/{toplam} steps of the entrepreneurship training.{siradaki}\nIf you have a few minutes, continue where you left off:\n{site}#/pano',
      siradaki: ' Next part: {siradaki}.' },
    sifirlama: { konu: 'Password reset — E-YOUTHPRENEUR Academy',
      metin: 'Hi {ad},\n\nOpen this link to reset your password (valid for 1 hour, single use):\n{baglanti}\n\nIf you did not ask for this, ignore this email; your password will not change.' },
    alt: '\n\n—\nE-YOUTHPRENEUR Academy · Erasmus+ KA220-YOU · Co-funded by the European Union.\nTo stop these emails: {link}',
  },
};
const doldur = (k, p) => String(k).replace(/\{(\w+)\}/g, (_, x) => p[x] ?? '');

/* Dilin şablonu: tr/en burada; ortak dilleri çeviri dosyasından (yoksa İngilizce). */
async function postaSablonu(dil) {
  if (SABLON[dil]) return SABLON[dil];
  const { ceviri } = await import('./diller.mjs');
  return ceviri(dil)?.posta || null;
}

/**
 * Bir üyeye şablonlu e-posta: bildirimleri kapalıysa hiç oluşturulmaz.
 * `zorunlu` (parola sıfırlama gibi işlem e-postaları): bildirim ayarına bakılmaz,
 * alt bilgide "bildirimleri kapat" satırı olmaz.
 */
export async function uyeyeGonder(db, uye, tur, ek = {}, { zorunlu = false } = {}) {
  if (!uye.bildirim && !zorunlu) return null;
  const S = (await postaSablonu(uye.dil)) || SABLON.en;
  const kapat = `${origin}${basePath || ''}/api/bildirim/kapat?u=${uye.id}&k=${imza(uye.id)}`;
  const p = { ad: uye.ad.split(' ')[0], site: siteAdresi(), link: kapat, ...ek };
  p.siradaki = ek.siradaki ? doldur(S.hatirlatma.siradaki || SABLON.en.hatirlatma.siradaki, ek) : '';
  const sab = S[tur] || SABLON.en[tur];
  const konu = doldur(sab.konu, p);
  const alt = S.alt || SABLON.en.alt;
  const govde = doldur(sab.metin, p) + doldur(zorunlu ? alt.slice(0, alt.lastIndexOf('\n')) : alt, p);
  let durum = 'beklemede', hata = '';
  const t = await tasiyiciAl();
  if (t) {
    try {
      await t.sendMail({ from: GONDEREN, to: uye.eposta, subject: konu, text: govde,
        headers: zorunlu ? {} : { 'List-Unsubscribe': `<${kapat}>` } });
      durum = 'gonderildi';
    } catch (e) { durum = 'hata'; hata = String(e.message).slice(0, 300); }
  }
  await db.insert('INSERT INTO postalar (uye_id, kime, tur, konu, durum, hata, zaman) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uye.id, uye.eposta, tur, konu, durum, hata, Date.now()]);
  return durum;
}
