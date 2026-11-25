# Gözden geçirme rehberi

Bağımsız bir gözden geçirme için: neye bakılmalı, nerede, nasıl denenir. Bulguları
"eksik / hata / öneri" diye ayırın; her bulguda dosya ve satır verin.

## Bağlam
- Erasmus+ KA220-YOU **E-YOUTHPRENEUR**, WP3 A-2 "GSD Entrepreneurship Online Training Module"
  (lider BTE, ortak HBV; 31.10.2026–29.02.2028). Ortaklar: TR (2), IT, RO, NL, PT, DK.
- Canlı: https://aiotechs.cloud/akademi/ (systemd `akademi.service`, SQLite, `/opt/akademi`).
- Kullanıcının isteği: **sade, anlaşılır ama kurumsal ve profesyonel**; karmaşık menü/klasör yapısı yok.
- Kapsam dışı: `../erasmusreact` (proje yönetim platformu) — ayrı sistem, entegrasyon yok, değiştirilmez.

## Çalıştırma
```
npm install && npm run build && npm start      # http://localhost:3120
npm test                                        # 20 test (gerçek sunucu + geçici veritabanı)
node scripts/ceviri-denetle.mjs it ro pt da     # çeviri bütünlüğü
node scripts/erisim.mjs <eposta> <parola> '#/pano' …   # WCAG 2.1 AA (axe-core)
npm run yonetici -- ekle <eposta> "Ad"          # yönetici hesabı
```

## Başvuru göstergeleri — karşılanıyor mu?
`lib/gosterge.mjs`, `lib/rapor.mjs`, Yönetim → Göstergeler / Rapor
- kayıtlı kullanıcı · modülü tamamlayan ve tamamlama oranı (hedef ≥ %70)
- giriş sayısı · modülde geçirilen süre (`/api/nabiz`, dakikada en çok bir)
- değerlendirme (son test: 10 soru, 7 doğru) · sertifika (hedef ≥ %65 katılımcı)
- modül sonu memnuniyet anketi (isimsiz) · 17–30 yaş ve "daha az fırsat" (hedef %40, öz beyan)
- Soru: başvuruda olup burada olmayan bir gösterge/çıktı var mı? Ulusal Ajans raporu için yeterli mi?

## Doğrulamalar (sunucu tarafı) — bakılacak yerler
| Konu | Dosya |
|---|---|
| Kayıt: e-posta, parola ≥ 8, ad, ülke/rol listeden, yaş ≥ 13, 18 altına veli onayı, açık rıza | `lib/uye.mjs` `kayitDenetle` |
| Giriş/kayıt/sıfırlama deneme sınırları, CSRF (Origin), çerez (HttpOnly, SameSite, Secure) | `lib/http.mjs`, `routes/hesap.mjs` |
| Parola değiştirme, şifremi unuttum (jeton yalnız özetiyle, 1 saat, tek kullanım), veri indirme | `routes/hesap.mjs` |
| Adım tamamlama kuralları (video izleme oranı, ileri sarma, sorular), kilitler | `routes/ogrenme.mjs` |
| Doğru cevapların istemciye sızmaması | `lib/icerik.mjs` `istemciIcerigi` |
| Yönetici içerik kaydı: yapı denetimi, HTML süzgeci | `lib/icerik.mjs` `icerikDenetle`, `temizHtml` |
| Kaynak yükleme: tür/boyut, dosya adı | `routes/kaynak.mjs` |
| Grup: eğitmen yalnızca kendi grubunu görür, e-posta görmez | `routes/grup.mjs` |
| Sertifika doğrulama (kodla, kişisel veri sızmadan) | `routes/ogrenme.mjs` `dogrulaRoutes` |
| Yetki: `/api/yonetim/*` yalnızca yönetici; yönetici kendini silemez / yetkisini alamaz | `routes/yonetim.mjs` |

## Bilinen açık konular
- **E-posta (SMTP) yok**: sertifika/hatırlatma/parola sıfırlama e-postaları "beklemede" kalıyor. Gönderen adres kararı bekleniyor.
- **İçerik TASLAK**: ihtiyaç analizi (WP2) ve HBV'nin formatına göre içerik ekibi gözden geçirecek.
- **Çeviriler (it, ro, pt, da) makine çevirisi**: ortaklar gözden geçirmeli.
- **Aydınlatma metni TASLAK**: veri sorumlusu ve iletişim bilgisi eksik; hukuki gözden geçirme gerekli.
- **Yedek aynı diskte** (`/opt/akademi/data/yedek`): başka makineye kopyalama yok.
- Ad düzeltme ekranı yok (yalnızca yönetici yeni hesap açabilir).

## Sınırlar (öneri yaparken)
- Yeni bağımlılık eklemekten kaçının (şu an çalışma zamanında yalnızca `pg`, `nodemailer`).
- Sunucuda diğer uygulamalara ve Apache yapılandırmasına dokunmayın.
- Forum/sohbet/canlı ders gibi büyük eklemeler kapsam dışı (başvuruda yok, karmaşıklaştırır).
