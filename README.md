# E-YOUTHPRENEUR Academy

GSD (Yeşil · Sosyal · Dijital) Girişimcilik Çevrim İçi Eğitim Modülü — Erasmus+ KA220-YOU,
WP3 / A-2 (lider BTE, ortak HBV; 31.10.2026 – 29.02.2028).

Yönetim platformundan (`../erasmusreact`) **bağımsızdır**: ayrı uygulama, ayrı veritabanı,
ayrı hesaplar. Gençler kendileri kaydolur; yönetim platformu proje yürütücülerinindir.

## Çalıştırma

    npm install
    npm run build      # arayüzü dist/ altına derler
    npm start          # http://localhost:3120
    npm test           # uçtan uca API sınamaları (geçici veritabanıyla)
    npm run dev        # geliştirme: Vite 5173 + API 3120

Yönetici hesabı (göstergeler + katılımcı CSV'si) yalnızca komut satırından:

    npm run yonetici -- ekle eposta@kurum.org "Ad Soyad"   # parolayı yazdırır
    npm run yonetici -- parola eposta@kurum.org

Yerelde veri `data/akademi.sqlite`; sunucuda `DATABASE_URL` ile PostgreSQL (bkz. `.env.example`).

## Yapı (kasıtlı olarak küçük)

| Yer | Ne |
|---|---|
| `icerik/bolumler.mjs` | **Ders içeriği**: 6 bölüm, 40 adım (konu anlatımı, video, örnek hikâye, anahtar kavramlar, bilgini sına, etkinlik). TR + EN. |
| `icerik/modul.mjs` | Son test (10 soru), anket maddeleri, kanvas alanları, ülkeler |
| `server.mjs` | node:http sunucu, güvenlik başlıkları (CSP: yalnızca YouTube oynatıcısına izin) |
| `routes/hesap.mjs` | kayıt, giriş, çıkış, dil, hesabı silme, etkin süre (nabız) |
| `routes/ogrenme.mjs` | ilerleme, video izleme, ara sorular, test, anket, sertifika, herkese açık doğrulama |
| `routes/yonetim.mjs` | göstergeler, rapor (Excel), katılımcı CSV'si (yalnızca yönetici); hesap `lib/gosterge.mjs`, Excel `lib/rapor.mjs` |
| `lib/icerik.mjs` | İçerik deposu: başlangıç içeriği `icerik/modul.mjs`, yönetici düzenleyince veritabanındaki sürüm geçerli; HTML süzgeci |
| `routes/grup.mjs` | Gruplar: eğitmen grup açar, gençler kodla katılır, eğitmen ilerlemeyi görür (e-posta ve notları görmez) |
| `routes/kaynak.mjs` | Kaynaklar kütüphanesi: herkese açık liste ve indirme (sayaçlı), yükleme/silme yalnızca yönetici; dosyalar `DATA_DIR/kaynaklar/` |
| `client/src/` | React arayüz; sayfalar `sayfalar/`, metinler `dil.js` + `dil-ek.js`, tema `stil.css` → `stil-ek.css` → `stil-kurumsal.css` (Inter yazı tipi gömülü) |
| `scripts/ekran.mjs` | gözden geçirme için ekran görüntüsü (görünmez Chrome) |

## Kurallar

- **Bölüm tamam** = okuma "okudum" + (video varsa) videonun ≥ %90'ı izlendi ve ara soruların hepsi doğru.
- **Video**: YouTube IFrame API, `youtube-nocookie.com`. İleri sarma yok (izlenen noktanın ötesine atlayan geri döner),
  ara soruda video durur. İzlenen saniye 10 sn'de bir ve duraklatınca kaydedilir.
- **Son test** 6 bölüm bitince açılır; 10 sorudan 7 doğru, sınırsız deneme, seçenekler her denemede karışır.
- **Anket** test geçilince; **isimsiz** (cevap satırı kişiye bağlı değil). **Sertifika** üçü birden tamamsa;
  kod `EYP-XXXX-XXXX`, `#/dogrula/<kod>` herkese açık (yalnızca ad + tarih). PDF tarayıcının yazdırmasıyla.
- **KVKK/GDPR**: aydınlatma onayı zorunlu, 13 yaş altı kayıt yok, 18 altı veli onayı, "daha az fırsat" isteğe bağlı,
  kişi hesabını ve bütün verisini kendisi siler.
- **Göstergeler** (başvurudaki WP3 A-2 ölçütleri): kayıt, tamamlama oranı (hedef ≥ %70), sertifika (≥ %65),
  daha az fırsat (%40), giriş sayısı, ortalama süre, video izleme, test, anket ortalamaları ve yorumlar.
  Yönetici hesapları sayılmaz.

## Altıncı tur (25 Kasım 2026)
- **Parola**: Hesabım'da parola değiştirme (öbür oturumlar kapanır); girişte "Parolamı unuttum" → e-postaya
  1 saatlik, tek kullanımlık bağlantı (`#/parola/<jeton>`, yalnızca özeti saklanır; hesabın var olup olmadığı yanıttan anlaşılmaz).
  SMTP ayarlı değilse e-posta gitmez; yönetici Kullanıcılar ekranından parolayı sıfırlayabilir.
- **Verilerimi indir** (GDPR md. 15/20): Hesabım → JSON (hesap, ilerleme, denemeler, defter, sertifika, gruplar, e-postalar; parola yok).
- **Yedek**: sunucu her gün `data/yedek/` altına yedek alır (SQLite `VACUUM INTO` ya da `pg_dump`, + kaynak dosyaları),
  14 gün saklar; elle: `npm run yedek`. Geri yükleme `scripts/yedek.mjs` başında. **Yedek aynı diskte**: düzenli olarak
  başka bir makineye kopyalanmalı. Son yedek zamanı Göstergeler ekranında görünür. `YEDEK=kapali` kapatır.
- **Çeviri eskimesi**: `icerik/diller/<kod>.iz.json` çevirinin yapıldığı İngilizce metnin izlerini tutar. İngilizcesi değişen
  adımın çevirisi gösterilmez (güncel İngilizce görünür) ve Yönetim → İçerik'in üstünde "eski / eksik" olarak listelenir.
  Çeviri güncellenince: `node scripts/ceviri-iz.mjs <kod>`.
- **Erişilebilirlik** (WCAG 2.1 AA): `node scripts/erisim.mjs <eposta> <parola> '#/yol' …` (axe-core) — bütün sayfalar
  iki temada temiz. Kontrast düzeltildi (soluk yazı, bölüm renklerinin yazı tonu, bağlantı rengi), odak halkası koyu
  zeminde sarı, kayan tablolar klavyeyle kaydırılabilir, videolarda altyazı kişinin dilinde açık gelir.
- **Alt dizin**: vekil öneki soymadan iletirse (`/akademi/...`) uygulama `BASE_PATH` önekini kendisi atar.

## Beşinci tur (24 Kasım 2026)
- **Ortak dilleri**: İtalyanca, Rumence, Portekizce (Portekiz), Danca. Her dil iki dosya:
  `client/src/diller/<kod>.js` (arayüz + aydınlatma metni) ve `icerik/diller/<kod>.mjs` (bölümler, adımlar,
  sorular, test, anket, kanvas, e-posta şablonları; bölüm/adım kimliğiyle eşlenir). Dosya varsa dil kendiliğinden açılır.
  **Makine çevirisi — ortakların gözden geçirmesi gerekir.** İçerik ekranında yapılan değişikliklerden sonra
  `node scripts/ceviri-kaynak.mjs <klasör>` İngilizce kaynağı çıkarır, `node scripts/ceviri-denetle.mjs it ro pt da`
  eksik/uyumsuz alanları (yer tutucular, HTML etiketleri, dizi uzunlukları) listeler.
- **Gösterge raporu** (Yönetim → Rapor): Ulusal Ajans raporu için Excel (Türkçe ya da İngilizce, 7 sayfa:
  Özet + hedefler, Bölümler, Ülke, Yaş, Rol, Anket, anonim Katılımcılar) ve yazdırılabilir A4 rapor (PDF olarak kaydet).
  Kişisel veri içermez. Excel yazıcısı dış paket kullanmaz (`lib/xlsx.mjs`, `lib/zip.mjs`).
- Ana sayfa görseli yenilendi (etiketli yörünge, yeni simgeler); koyu bantların altında ve üst çubukta yeşil→mavi geçiş çizgisi.

## Dördüncü tur (24 Kasım 2026)

- **İkinci tema (yeşil)**: yönetim platformundaki ikinci temanın aynısı (bant yeşil, vurgu mavi). Üst banttaki düğmeyle değişir, tarayıcıda saklanır (`html[data-tema="yesil"]`, `client/src/stil-tema.css`).
- **Kullanıcılar** (`#/yonetim/uyeler`): ara, hesap aç (rastgele parola bir kez gösterilir), parola sıfırla (açık oturumlar kapanır), yöneticilik ver/al, sil. Yönetici kendini silemez, kendi yetkisini alamaz.
- **E-postalar** (`lib/posta.mjs`, `lib/hatirlatma.mjs`, `#/yonetim/posta`): "sertifikan hazır" ve "kaldığın yerden devam et" (3 gün girmeyene, haftada en çok bir, toplam en çok 3). SMTP ayarı (`SMTP_HOST/PORT/USER/PASS/FROM`) yoksa hiçbir şey gönderilmez, "beklemede" kaydedilir. Kişi Hesabım'dan ya da e-postadaki imzalı bağlantıyla bildirimi kapatır. Hatırlatma saatte bir çalışır (`HATIRLATMA=kapali` ile kapatılır).
- **Rozetler**: 14 rozet, ilerlemeden türetilir (ayrı kayıt yok); panoda ızgara, yeni rozette köşede bildirim.
- **Grup CSV**: eğitmen kendi grubunun listesini indirir.
- **Video soruları**: içerik ekranında video adımı açıkken video oynar; "Bu saniyede soru ekle" o ana soru koyar (ekip videoyu izleyerek ayrıntılı soru yazsın diye).
- `npm test` 13/13.

## Üçüncü tur: adımlı ders akışı (24 Kasım 2026)

- Bölüm = 4–8 adım; `#/bolum/<id>/<adım no>`. Solda hedefler ve adım listesi, ortada tek adım, altta Önceki/Devam.
- Adım tamamlama sunucuda (`routes/ogrenme.mjs`, tablo `adim_ilerleme`): metin/örnek/kartlar "devam" ile; video %90 + ara sorular; sına tüm sorular doğru (açıklama cevaptan sonra gelir); etkinlik deftere yazınca. Bölüm, bütün adımları bitince tamam.
- **Videolar (11)**: YouTube'da varlık, gömülebilirlik ve süre denetlendi. JRC EntreComp serisi (Avrupa Komisyonu), Avrupa Eğitim Vakfı, Ellen MacArthur Foundation, Oxford Saïd, Strategyzer, The School of Life. Ara sorular videonun başlığındaki ana mesaja dayanır (altyazı metni alınamadığı için ayrıntı sorulmadı).
- **Örnek hikâyeler (8)**: BlaBlaCar, Too Good To Go, Repair Café, Auticon, askıda ekmek, Vinted, Ecosia, Fairphone — yalnızca kamuya açık temel bilgiler.
- Sına ve video sorularında seçenekler karışık gösterilir. İçerik ekranı adım türlerini düzenler; eski biçimdeki içerik otomatik adımlara çevrilir.

## İkinci tur (24 Kasım 2026)

- **Proje fikri defteri** (`#/fikrim`): görev cevapları ve 7 alanlı proje kanvası otomatik kaydedilir (yalnızca sahibi görür), plan A4 dikey PDF.
- **Gruplar** (`#/grup`): rolü "gençlik çalışanı" olan ya da yönetici grup açar; gençler kayıtta ya da Hesabım'da 6 haneli kodla katılır.
- **İçerik ekranı** (`#/yonetim/icerik`): bölüm ekle/sil/sırala, TR+EN metinler (sade yazı: boş satır = paragraf, "- " = madde), YouTube videosu ve ara sorular, son test ve geçme puanı.
- **Kaynaklar** (`#/kaynaklar`, `#/yonetim/kaynak`): açık erişimli proje çıktıları; indirme sayısı göstergelerde.
- **Kurumsal görünüm**: beyaz üst bant, lacivert ana renk, Inter, ince çerçeveli kartlar.
- `npm test` 9/9.

## Durum (24 Kasım 2026)

- İlk sürüm yerelde çalışıyor; `npm test` 4/4. Ekranlar masaüstü ve telefon genişliğinde gözden geçirildi.
- **İçerik TASLAK**: ihtiyaç analizi ve HBV'nin proje formatına göre içerik ekibi gözden geçirecek.
  Yalnızca Yeşil bölümde video var (Ellen MacArthur Foundation, YouTube'da doğrulandı).
- **Aydınlatma metni TASLAK**: veri sorumlusu ve iletişim bilgisi netleşmeli, hukuk gözden geçirmeli.
- Yapılacak: sunucuya kurulum (`/akademi` — şu an orada deneme Moodle'ı var), e-posta (parola sıfırlama),
  ortak dili çevirilerinin ortaklarca gözden geçirilmesi.
