/* Arayüz metinleri. Eğitim içeriği sunucudan gelir (icerik/modul.mjs). */
import { EK } from './dil-ek.js';

export const METIN = {
  tr: {
    'marka.alt': 'Yeşil · Sosyal · Dijital Girişimcilik',
    'nav.pano': 'Panom', 'nav.giris': 'Giriş yap', 'nav.kayit': 'Ücretsiz kaydol', 'nav.cikis': 'Çıkış',
    'nav.hesap': 'Hesabım', 'nav.yonetim': 'Yönetim', 'nav.menu': 'Menü',

    'tan.ust': 'Erasmus+ · Ücretsiz çevrim içi eğitim',
    'tan.baslik': 'Fikrini harekete geçir.',
    'tan.alt': 'Yeşil, sosyal ve dijital girişimciliği keşfet; kendi fikrini ilk proje planına dönüştür. Kendi hızında, telefonundan da.',
    'tan.basla': 'Hemen başla', 'tan.devam': 'Panoma git', 'tan.zaten': 'Zaten hesabın var mı?',
    'tan.k1': 'bölüm', 'tan.k2': 'dakika', 'tan.k3': 'ücret', 'tan.k3d': '0 €', 'tan.k4': 'sertifika',
    'tan.uc': 'Üç yol, tek hedef',
    'tan.yesil': 'Yeşil', 'tan.yesil.m': 'Gezegene iyi gelen fikirler: döngüsel ekonomi, onarım, ileri dönüşüm.',
    'tan.sosyal': 'Sosyal', 'tan.sosyal.m': 'Topluluğun için değişim yaratan fikirler: kim, ne, nasıl?',
    'tan.dijital': 'Dijital', 'tan.dijital.m': 'Küçük başla, uzağa ulaş: ücretsiz araçlar ve sorumlu yapay zekâ.',
    'tan.nasil': 'Nasıl işler?',
    'tan.a1': 'Kaydol', 'tan.a1.m': 'Bir dakika sürer, ücretsizdir.',
    'tan.a2': 'Bölümleri bitir', 'tan.a2.m': 'Kısa okumalar, videolar ve küçük görevler.',
    'tan.a3': 'Testi geç', 'tan.a3.m': '10 sorudan 7\'si yeter, istediğin kadar dene.',
    'tan.a4': 'Sertifikanı al', 'tan.a4.m': 'Doğrulama kodlu, indirilebilir sertifika.',
    'tan.kimler': 'Kimler için?', 'tan.kimler.m': '17–30 yaş arası gençler, gençlik çalışanları ve girişimciliği merak eden herkes için. Daha az fırsata sahip gençler başta olmak üzere herkes ücretsiz katılabilir.',
    'tan.ortak': 'Altı ülkeden yedi kurum',

    'giris.baslik': 'Tekrar hoş geldin', 'giris.alt': 'Kaldığın yerden devam et.',
    'alan.eposta': 'E-posta', 'alan.parola': 'Parola', 'alan.parola.ip': 'En az 8 karakter',
    'alan.ad': 'Adın ve soyadın', 'alan.ad.ip': 'Sertifikada bu ad yazacak',
    'alan.ulke': 'Ülke', 'alan.dogum': 'Doğum yılı', 'alan.rol': 'Kendini nasıl tanımlarsın?',
    'rol.genc': 'Genç / öğrenci', 'rol.genclik': 'Gençlik çalışanı / eğitimci', 'rol.diger': 'Diğer',
    'ulke.TR': 'Türkiye', 'ulke.IT': 'İtalya', 'ulke.RO': 'Romanya', 'ulke.NL': 'Hollanda Krallığı', 'ulke.PT': 'Portekiz', 'ulke.DK': 'Danimarka', 'ulke.DIGER': 'Diğer',
    'alan.azfirsat': 'Kendimi daha az fırsata sahip bir genç olarak tanımlıyorum (ekonomik, sosyal, coğrafi engeller, engellilik vb.).',
    'alan.azfirsat.not': 'İsteğe bağlı. Yalnızca toplu istatistik için kullanılır, kimseye gösterilmez.',
    'alan.onay': '<a href="#/gizlilik" target="_blank">Aydınlatma metnini</a> okudum; verilerimin bu eğitim ve proje raporlaması için işlenmesini kabul ediyorum.',
    'alan.veli': '18 yaşından küçüğüm; velim kaydolmama ve verilerimin işlenmesine izin verdi.',
    'giris.dugme': 'Giriş yap', 'giris.yok': 'Hesabın yok mu?', 'kayit.dugme': 'Kaydol ve başla',
    'kayit.baslik': 'Ücretsiz kaydol', 'kayit.alt': 'Bir dakika sürer. Sertifikan bu bilgilerle hazırlanır.', 'kayit.var': 'Hesabın var mı?',

    'pano.merhaba': 'Merhaba, {ad}!', 'pano.alt': 'Girişimcilik yolculuğunda neredesin?',
    'pano.ilerleme': 'İlerleme', 'pano.bolum': '{n} / {t} bölüm',
    'pano.devam': 'Kaldığın yerden devam et', 'pano.baslat': 'İlk bölümle başla', 'pano.son': 'Son adımlar',
    'pano.bolumler': 'Bölümler', 'durum.tamam': 'Tamamlandı', 'durum.devam': 'Devam ediyor', 'durum.yeni': 'Başlanmadı',
    'adim.test': 'Son test', 'adim.test.m': '10 soru · geçmek için 7 doğru', 'adim.anket': 'Görüş anketi', 'adim.anket.m': 'İsimsiz · 2 dakika',
    'adim.sert': 'Sertifika', 'adim.sert.m': 'PDF olarak kaydet',
    'kilit.bolum': 'Önce altı bölümü bitir', 'kilit.test': 'Önce testi geç', 'kilit.anket': 'Önce anketi doldur',
    'dk': '{n} dk',

    'bol.okuma': 'Okuma', 'bol.okudum': 'Okudum ✓', 'bol.okudum.d': 'Okudum, devam',
    'bol.video': 'Video', 'bol.gorev': 'Dene', 'bol.gorev.not': 'Cevabını bir deftere yaz; burada saklanmaz.',
    'bol.tamam': 'Bu bölüm tamamlandı!', 'bol.sonraki': 'Sonraki bölüm', 'bol.panoya': 'Panoya dön',
    'bol.eksik': 'Bölümü tamamlamak için:', 'bol.e.okuma': 'okumayı bitir', 'bol.e.video': 'videoyu sonuna kadar izle', 'bol.e.soru': 'videodaki soruları cevapla',
    'vid.izlendi': '%{n} izlendi', 'vid.ileri': 'İleri saramazsın; izlediğin yere kadar dönebilirsin.',
    'vid.soru': 'Soru', 'vid.kontrol': 'Kontrol et', 'vid.dogru': 'Doğru! Videoya devam.', 'vid.yanlis': 'Tam değil, bir daha dene.', 'vid.devam': 'Devam et',
    'vid.dy0': 'Doğru', 'vid.dy1': 'Yanlış', 'vid.kaynak': 'Kaynak: {k} (YouTube)',

    'test.baslik': 'Son test', 'test.alt': '{t} soru. Geçmek için {g} doğru gerekir. İstediğin kadar deneyebilirsin.',
    'test.gonder': 'Cevapları gönder', 'test.eksik': 'Bütün soruları cevapla ({n}/{t}).',
    'test.gecti': 'Tebrikler, geçtin! {p}/{t}', 'test.kaldi': '{p}/{t} — geçmek için {g} gerekiyor. Bölümlere göz atıp tekrar dene.',
    'test.tekrar': 'Tekrar dene', 'test.ankete': 'Ankete geç', 'test.enIyi': 'En iyi sonucun: {p}/{t}',

    'anket.baslik': 'Görüş anketi', 'anket.alt': 'İsimsizdir: cevapların adınla birlikte saklanmaz. Eğitimi geliştirmemize yardım eder.',
    'anket.o1': 'Hiç katılmıyorum', 'anket.o5': 'Tamamen katılıyorum', 'anket.yorum': 'Neyi geliştirebiliriz? (isteğe bağlı)',
    'anket.gonder': 'Gönder', 'anket.eksik': 'Lütfen her maddeyi puanla.', 'anket.tesekkur': 'Teşekkürler! Sertifikan hazır.',

    'sert.baslik': 'Sertifikan', 'sert.hazirla': 'Sertifikamı oluştur', 'sert.yazdir': 'PDF olarak kaydet / yazdır',
    'sert.ipucu': 'Yazdırma penceresinde "PDF olarak kaydet"i seç; kâğıt yönü yatay olmalı.',
    'sert.ust': 'SERTİFİKA', 'sert.ust2': 'Certificate of completion', 'sert.belge': 'Bu belge,',
    'sert.metin': 'Yeşil, Sosyal ve Dijital Girişimcilik çevrim içi eğitimini başarıyla tamamladığını belgeler.',
    'sert.metin2': 'has successfully completed the online training Green, Social & Digital Entrepreneurship.',
    'sert.tarih': 'Tarih', 'sert.kod': 'Doğrulama kodu', 'sert.dogrula': 'Doğrulama:',
    'sert.ret': 'Co-funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.',

    'dog.baslik': 'Sertifika doğrulama', 'dog.alt': 'Sertifikadaki kodu yaz.', 'dog.dugme': 'Doğrula',
    'dog.gecerli': 'Geçerli sertifika', 'dog.gecerli.m': '{ad} — {tarih}', 'dog.gecersiz': 'Bu kodla bir sertifika bulunamadı.',

    'hesap.baslik': 'Hesabım', 'hesap.sil': 'Hesabımı sil', 'hesap.sil.m': 'Hesabın, ilerlemen ve sertifikan kalıcı olarak silinir. Anket cevapların zaten isimsizdir. Bu işlem geri alınamaz.',
    'hesap.sil.onay': 'Onaylamak için parolanı yaz', 'hesap.silindi': 'Hesabın silindi.',

    'yon.baslik': 'Göstergeler', 'yon.alt': 'Başvurudaki ölçütler (WP3 A-2). Yönetici hesapları sayılmaz.', 'yon.csv': 'Katılımcı listesi (CSV)',
    'yon.kayitli': 'Kayıtlı', 'yon.tamamlama': 'Tamamlama oranı', 'yon.hedef': 'hedef {h}', 'yon.sertifika': 'Sertifika', 'yon.azfirsat': 'Daha az fırsat',
    'yon.giris': 'Toplam giriş', 'yon.sure': 'Ort. süre', 'yon.video': 'Ort. video izleme', 'yon.test': 'Teste giren / geçen',
    'yon.bolumler': 'Bölüm tamamlama', 'yon.ulke': 'Ülke', 'yon.yas': 'Yaş', 'yon.rol': 'Rol', 'yon.anket': 'Anket ({n} yanıt, 1–5)', 'yon.yorumlar': 'Son yorumlar',

    'giz.baslik': 'Aydınlatma metni',
    'alt.finans': 'Avrupa Birliği tarafından eş finanse edilmektedir',
    'alt.ret': 'Avrupa Birliği tarafından eş finanse edilmektedir. Ancak burada yer alan görüş ve düşünceler yalnızca yazar(lar)a aittir ve Avrupa Birliği\'nin ya da Avrupa Eğitim ve Kültür Yürütme Ajansı\'nın (EACEA) görüşlerini yansıtmak zorunda değildir. Ne Avrupa Birliği ne de EACEA bunlardan sorumlu tutulabilir.',
    'alt.dogrula': 'Sertifika doğrula', 'alt.gizlilik': 'Aydınlatma metni',

    'genel.yukleniyor': 'Yükleniyor…', 'genel.kaydet': 'Kaydet', 'genel.vazgec': 'Vazgeç', 'genel.geri': '← Geri',
    'hata.eposta': 'Geçerli bir e-posta yaz.', 'hata.parola': 'Parola en az 8 karakter olmalı.', 'hata.ad': 'Adını ve soyadını yaz.',
    'hata.ulke': 'Ülkeni seç.', 'hata.rol': 'Bir seçenek işaretle.', 'hata.dogum': 'Doğum yılını kontrol et.', 'hata.yas_kucuk': 'Bu eğitime 13 yaşından itibaren katılabilirsin.',
    'hata.onay': 'Devam etmek için aydınlatma metnini onayla.', 'hata.veli': '18 yaşından küçüksen velinin onayı gerekiyor.',
    'hata.eposta_var': 'Bu e-postayla zaten bir hesap var. Giriş yapmayı dene.', 'hata.giris': 'E-posta ya da parola yanlış.',
    'hata.cok_deneme': 'Çok fazla deneme. 15 dakika sonra tekrar dene.', 'hata.oturum': 'Oturumun kapanmış, tekrar giriş yap.',
    'hata.kilitli': 'Bu adım henüz açılmadı.', 'hata.parola_yanlis': 'Parola yanlış.', 'hata.sunucu': 'Bir şeyler ters gitti, tekrar dene.',
    'hata.ag': 'Bağlantı kurulamadı.',
  },
  en: {
    'marka.alt': 'Green · Social · Digital Entrepreneurship',
    'nav.pano': 'Dashboard', 'nav.giris': 'Log in', 'nav.kayit': 'Join for free', 'nav.cikis': 'Log out',
    'nav.hesap': 'My account', 'nav.yonetim': 'Admin', 'nav.menu': 'Menu',

    'tan.ust': 'Erasmus+ · Free online training',
    'tan.baslik': 'Put your idea into action.',
    'tan.alt': 'Discover green, social and digital entrepreneurship and turn your own idea into a first project plan. At your own pace, also on your phone.',
    'tan.basla': 'Start now', 'tan.devam': 'Go to dashboard', 'tan.zaten': 'Already have an account?',
    'tan.k1': 'parts', 'tan.k2': 'minutes', 'tan.k3': 'cost', 'tan.k3d': '€0', 'tan.k4': 'certificate',
    'tan.uc': 'Three paths, one goal',
    'tan.yesil': 'Green', 'tan.yesil.m': 'Ideas that are good for the planet: circular economy, repair, upcycling.',
    'tan.sosyal': 'Social', 'tan.sosyal.m': 'Ideas that create change in your community: who, what, how?',
    'tan.dijital': 'Digital', 'tan.dijital.m': 'Start small, reach far: free tools and responsible AI.',
    'tan.nasil': 'How it works',
    'tan.a1': 'Sign up', 'tan.a1.m': 'Takes a minute, completely free.',
    'tan.a2': 'Complete the parts', 'tan.a2.m': 'Short readings, videos and small tasks.',
    'tan.a3': 'Pass the test', 'tan.a3.m': '7 out of 10 is enough, try as often as you like.',
    'tan.a4': 'Get your certificate', 'tan.a4.m': 'A downloadable certificate with a verification code.',
    'tan.kimler': 'Who is it for?', 'tan.kimler.m': 'Young people aged 17–30, youth workers and anyone curious about entrepreneurship. Everyone can join for free, especially young people with fewer opportunities.',
    'tan.ortak': 'Seven organisations from six countries',

    'giris.baslik': 'Welcome back', 'giris.alt': 'Continue where you left off.',
    'alan.eposta': 'Email', 'alan.parola': 'Password', 'alan.parola.ip': 'At least 8 characters',
    'alan.ad': 'Your full name', 'alan.ad.ip': 'This name appears on your certificate',
    'alan.ulke': 'Country', 'alan.dogum': 'Year of birth', 'alan.rol': 'How would you describe yourself?',
    'rol.genc': 'Young person / student', 'rol.genclik': 'Youth worker / educator', 'rol.diger': 'Other',
    'ulke.TR': 'Türkiye', 'ulke.IT': 'Italy', 'ulke.RO': 'Romania', 'ulke.NL': 'Kingdom of the Netherlands', 'ulke.PT': 'Portugal', 'ulke.DK': 'Denmark', 'ulke.DIGER': 'Other',
    'alan.azfirsat': 'I consider myself a young person with fewer opportunities (economic, social or geographical obstacles, disability, etc.).',
    'alan.azfirsat.not': 'Optional. Used only for aggregate statistics, never shown to anyone.',
    'alan.onay': 'I have read the <a href="#/gizlilik" target="_blank">privacy notice</a> and agree that my data is processed for this training and project reporting.',
    'alan.veli': 'I am under 18; my parent or guardian has allowed me to register and my data to be processed.',
    'giris.dugme': 'Log in', 'giris.yok': 'No account yet?', 'kayit.dugme': 'Sign up and start',
    'kayit.baslik': 'Join for free', 'kayit.alt': 'Takes a minute. Your certificate is prepared with these details.', 'kayit.var': 'Already have an account?',

    'pano.merhaba': 'Hi, {ad}!', 'pano.alt': 'Where are you on your entrepreneurship journey?',
    'pano.ilerleme': 'Progress', 'pano.bolum': '{n} / {t} parts',
    'pano.devam': 'Continue where you left off', 'pano.baslat': 'Start with the first part', 'pano.son': 'Final steps',
    'pano.bolumler': 'Parts', 'durum.tamam': 'Completed', 'durum.devam': 'In progress', 'durum.yeni': 'Not started',
    'adim.test': 'Final test', 'adim.test.m': '10 questions · 7 correct to pass', 'adim.anket': 'Feedback survey', 'adim.anket.m': 'Anonymous · 2 minutes',
    'adim.sert': 'Certificate', 'adim.sert.m': 'Save as PDF',
    'kilit.bolum': 'Finish the six parts first', 'kilit.test': 'Pass the test first', 'kilit.anket': 'Fill in the survey first',
    'dk': '{n} min',

    'bol.okuma': 'Reading', 'bol.okudum': 'Read ✓', 'bol.okudum.d': 'I have read it, continue',
    'bol.video': 'Video', 'bol.gorev': 'Try it', 'bol.gorev.not': 'Write your answer in a notebook; it is not stored here.',
    'bol.tamam': 'You completed this part!', 'bol.sonraki': 'Next part', 'bol.panoya': 'Back to dashboard',
    'bol.eksik': 'To complete this part:', 'bol.e.okuma': 'finish the reading', 'bol.e.video': 'watch the video to the end', 'bol.e.soru': 'answer the questions in the video',
    'vid.izlendi': '{n}% watched', 'vid.ileri': 'You cannot skip ahead; you can go back to anything you have watched.',
    'vid.soru': 'Question', 'vid.kontrol': 'Check', 'vid.dogru': 'Correct! Back to the video.', 'vid.yanlis': 'Not quite, try again.', 'vid.devam': 'Continue',
    'vid.dy0': 'True', 'vid.dy1': 'False', 'vid.kaynak': 'Source: {k} (YouTube)',

    'test.baslik': 'Final test', 'test.alt': '{t} questions. You need {g} correct answers to pass. You can try as many times as you like.',
    'test.gonder': 'Submit answers', 'test.eksik': 'Answer all questions ({n}/{t}).',
    'test.gecti': 'Well done, you passed! {p}/{t}', 'test.kaldi': '{p}/{t} — you need {g} to pass. Have a look at the parts and try again.',
    'test.tekrar': 'Try again', 'test.ankete': 'Go to the survey', 'test.enIyi': 'Your best result: {p}/{t}',

    'anket.baslik': 'Feedback survey', 'anket.alt': 'Anonymous: your answers are not stored with your name. It helps us improve the training.',
    'anket.o1': 'Strongly disagree', 'anket.o5': 'Strongly agree', 'anket.yorum': 'What could we improve? (optional)',
    'anket.gonder': 'Submit', 'anket.eksik': 'Please rate every statement.', 'anket.tesekkur': 'Thank you! Your certificate is ready.',

    'sert.baslik': 'Your certificate', 'sert.hazirla': 'Create my certificate', 'sert.yazdir': 'Save as PDF / print',
    'sert.ipucu': 'In the print dialog choose "Save as PDF"; use landscape orientation.',
    'sert.ust': 'CERTIFICATE', 'sert.ust2': 'Sertifika', 'sert.belge': 'This is to certify that',
    'sert.metin': 'has successfully completed the online training Green, Social & Digital Entrepreneurship.',
    'sert.metin2': 'Yeşil, Sosyal ve Dijital Girişimcilik çevrim içi eğitimini başarıyla tamamlamıştır.',
    'sert.tarih': 'Date', 'sert.kod': 'Verification code', 'sert.dogrula': 'Verify at:',
    'sert.ret': 'Co-funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.',

    'dog.baslik': 'Verify a certificate', 'dog.alt': 'Enter the code printed on the certificate.', 'dog.dugme': 'Verify',
    'dog.gecerli': 'Valid certificate', 'dog.gecerli.m': '{ad} — {tarih}', 'dog.gecersiz': 'No certificate found with this code.',

    'hesap.baslik': 'My account', 'hesap.sil': 'Delete my account', 'hesap.sil.m': 'Your account, progress and certificate are permanently deleted. Your survey answers are already anonymous. This cannot be undone.',
    'hesap.sil.onay': 'Type your password to confirm', 'hesap.silindi': 'Your account has been deleted.',

    'yon.baslik': 'Indicators', 'yon.alt': 'Indicators from the application (WP3 A-2). Admin accounts are not counted.', 'yon.csv': 'Participant list (CSV)',
    'yon.kayitli': 'Registered', 'yon.tamamlama': 'Completion rate', 'yon.hedef': 'target {h}', 'yon.sertifika': 'Certificates', 'yon.azfirsat': 'Fewer opportunities',
    'yon.giris': 'Total logins', 'yon.sure': 'Avg. time', 'yon.video': 'Avg. video watched', 'yon.test': 'Took / passed test',
    'yon.bolumler': 'Part completion', 'yon.ulke': 'Country', 'yon.yas': 'Age', 'yon.rol': 'Role', 'yon.anket': 'Survey ({n} responses, 1–5)', 'yon.yorumlar': 'Latest comments',

    'giz.baslik': 'Privacy notice',
    'alt.finans': 'Co-funded by the European Union',
    'alt.ret': 'Co-funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.',
    'alt.dogrula': 'Verify a certificate', 'alt.gizlilik': 'Privacy notice',

    'genel.yukleniyor': 'Loading…', 'genel.kaydet': 'Save', 'genel.vazgec': 'Cancel', 'genel.geri': '← Back',
    'hata.eposta': 'Enter a valid email.', 'hata.parola': 'Password must be at least 8 characters.', 'hata.ad': 'Enter your full name.',
    'hata.ulke': 'Select your country.', 'hata.rol': 'Choose an option.', 'hata.dogum': 'Check your year of birth.', 'hata.yas_kucuk': 'You can join this training from the age of 13.',
    'hata.onay': 'Please accept the privacy notice to continue.', 'hata.veli': 'If you are under 18, your parent or guardian must agree.',
    'hata.eposta_var': 'There is already an account with this email. Try logging in.', 'hata.giris': 'Wrong email or password.',
    'hata.cok_deneme': 'Too many attempts. Try again in 15 minutes.', 'hata.oturum': 'Your session has ended, please log in again.',
    'hata.kilitli': 'This step is not open yet.', 'hata.parola_yanlis': 'Wrong password.', 'hata.sunucu': 'Something went wrong, please try again.',
    'hata.ag': 'Could not connect.',
  },
};

export const DILLER = [
  { kod: 'tr', ad: 'Türkçe' }, { kod: 'en', ad: 'English' },
  /* Ortak dilleri: çevirisi client/src/diller/<kod>.js olarak eklendiğinde açılır (diller/index.js). */
  { kod: 'it', ad: 'Italiano' }, { kod: 'ro', ad: 'Română' },
  { kod: 'pt', ad: 'Português' }, { kod: 'da', ad: 'Dansk' },
];

/* Tarih biçimi için yerel ayar. */
const YEREL = { tr: 'tr-TR', en: 'en-GB', it: 'it-IT', ro: 'ro-RO', pt: 'pt-PT', da: 'da-DK' };
export const yerel = dil => YEREL[dil] || 'en-GB';
/* Yüzde: dile göre (tr "%50", it/en "50%", da "50 %"). n 0–100 arası sayı. */
export const yuzde = (dil, n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '–'
  : new Intl.NumberFormat(yerel(dil), { style: 'percent', maximumFractionDigits: 1 }).format(Number(n) / 100));

/* İkinci tur metinleri (dil-ek.js) aynı sözlüğe katılır; aynı anahtar varsa EK geçerli. */
Object.assign(METIN.tr, EK.tr);
Object.assign(METIN.en, EK.en);

export function cevirmen(dil) {
  const s = METIN[dil] || METIN.tr;
  return (k, p = {}) => String(s[k] ?? METIN.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => p[x] ?? '');
}
