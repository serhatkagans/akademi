# Eksikler ve hatalar

25 Kasım 2026 gözden geçirmesinin bulguları (`GOZDEN-GECIRME.md`'ye göre yapıldı).
Bir madde düzeltilince kutusu işaretlenir, yanına tarih ve commit yazılır.

## Sıradaki işler (25 Kasım 2026'da kararlaştırılan sıra)

Ölçüt: sistem sade kalacak — Moodle karmaşık ve kalabalık olduğu için bırakıldı. Yeni ekran ya da
yeni kavram getiren iş, ihtiyaç gerçekten doğmadan yapılmaz.

1. **A1–A4** hataları (kullanıcı hiçbir fark görmez).
2. **F1** ankete gençlik çalışanı maddeleri (yalnızca rol `genclik` ise 4 ek soru) ve **F3** eksik oranlar.
3. **Video kontrolü**: haftada bir, içerikteki YouTube videoları hâlâ açılıyor ve gömülebiliyor mu;
   bozulan varsa yönetim panelinde tek satır uyarı (bozulmadıkça görünmez). Videolar başkalarının
   kanallarında; biri silinirse o adım, bölüm ve sertifika kilitlenir.
4. **Site izleme**: sistemin dışında, ücretsiz bir izleme servisi (proje sahibi kurar; izlenecek adres
   `https://aiotechs.cloud/akademi/api/ben`).
5. Sonra: F4 (e-kitap indirmeleri), C1–C2 (rapor dönemi ve ülke kırılımı), D küçük kusurlar.

Her işten sonra: `npm test`, derleme, canlıya alma (hafıza notundaki güncelleme adımları), GitHub.

**Bilerek yapılmayanlar** (yeni ekran/kavram getirir; ihtiyaç doğarsa yeniden konuşulur):
içerik editörü rolü (HBV'ye şimdilik yönetici hesabı verilir), yönetici işlem kaydı, çeviri için Excel
indir/yükle (düzeltmeler elle işlenir), ön test, PDF sertifika, içerik geçmişi (günlük yedek yeterli),
forum / mesajlaşma / canlı ders / ödev / SCORM.

## A. Düzeltilmesi gereken hatalar

- [x] **A1 · Anket gerçekte isimsiz değil.** Anket satırının `zaman` değeri ile kişinin `uyeler.anket_at`
  değeri aynı milisaniyeyle yazılıyor (`routes/ogrenme.mjs`, anket ucu). İki zaman eşleştirilerek cevabın
  sahibi bulunabilir; satırda ayrıca dil ve ülke var. Aydınlatma metni "isimsizdir" diyor.
  *Çözüm:* anket `zaman`'ını güne yuvarlamak (ya da `anket_at`'i).
  ✔ 25.11.2026: anket satırında dil/ülke yok, zaman ayın başına yuvarlanıyor; eski satırlar açılışta düzeltiliyor.
- [x] **A2 · Hesap silinince e-posta adresi kalıyor.** `postalar.kime` adresi tutuyor; hesap silinince yalnızca
  `uye_id` boşalıyor (`lib/db.mjs`, `ON DELETE SET NULL`). Aydınlatma metni "silinir" diyor.
  *Çözüm:* hesap silmede (kişinin kendisi ve yönetici) o kişinin `postalar` satırlarını silmek.
  ✔ 25.11.2026: hesap silinince (kişi ya da yönetici) e-posta kayıtları da siliniyor; eski sahipsiz kayıtlar açılışta siliniyor.
- [x] **A3 · Video izleme sunucuda doğrulanmıyor.** `/api/ogren/adim/<b>/<a>/video` istemcinin bildirdiği
  `sn` değerine güveniyor; tek istekle `sn = sure` gönderilince video izlenmiş sayılıyor. "Takipli video"
  ve video izleme göstergesi buna dayanıyor.
  *Çözüm:* izlenen sürenin, son bildirimden beri geçen gerçek zamandan (küçük bir payla) hızlı artmasına izin vermemek.
  ✔ 25.11.2026: 11 videonun gerçek süresi içerikte; ilerleme gerçek zamanın en çok 2 katı + 15 sn ilerleyebiliyor; içerik ekranı yeni videonun süresini önizlemede kendisi yazıyor.
- [x] **A4 · Pilot grup kayıtta takılır.** Aynı IP'den 15 dakikada en çok 10 kayıt (`routes/hesap.mjs`,
  `KAYIT_SINIR` varsayılanı). Bir sınıftan 24 kişi aynı anda kaydolursa 11. kişi `cok_deneme` alır.
  *Çözüm:* varsayılanı yükseltmek (ör. 60) ya da sunucuda `.env`'e `KAYIT_SINIR` yazmak.
  ✔ 25.11.2026: varsayılan 60 kayıt / 15 dk / IP.

## B. Karar ya da hukuki görüş bekleyenler

- [ ] **B1 · Yaş sınırı ve veli onayı.** Kayıt 13 yaştan açık; 18 altı için veli onayı yalnızca kutucuk
  (`lib/uye.mjs`). Dijital rıza yaşı ortak ülkelerde 13–16 arasında. Hedef kitle 17–30: alt sınırı 16 ya da
  17 yapmak hukuki yükü azaltır. **Karar: proje sahibi.**
- [ ] **B2 · Hatırlatma e-postaları varsayılan açık** (`uyeler.bildirim` = 1). Kişi kapatabiliyor ama baştan
  izin sorulmuyor. Hukukçu baksın.
- [ ] **B3 · Aydınlatma metni.** Veri sorumlusu ve iletişim bilgisi yazılmamış. Ayrıca eklenmeli: silinen
  hesap yedeklerde 14 gün daha durur; hatırlatma e-postaları; grup eğitmeninin gördükleri (var).
- [ ] **B4 · E-posta (SMTP) ayarı yok.** Sertifika, hatırlatma ve "parolamı unuttum" e-postaları gitmiyor
  ("beklemede"). Arayüz yine de "gönderildi" diyor. Gönderen adres kararı bekleniyor; o zamana kadar parolayı
  yönetici Kullanıcılar ekranından sıfırlar.
- [ ] **B5 · Yedek aynı diskte** (`/opt/akademi/data/yedek`). Başka bir makineye düzenli kopya yok.

## C. Eksik özellikler

- [ ] **C1 · Raporda dönem seçimi yok.** Göstergeler ve Excel/PDF hep baştan bugüne toplam; ara rapor için
  tarih aralığı seçilemiyor (`lib/gosterge.mjs`, `lib/rapor.mjs`).
- [ ] **C2 · Ülke kırılımı eksik.** Ülkeye göre yalnızca kayıt sayısı var; tamamlama, sertifika ve "daha az
  fırsat" ülke bazında yok. Ortaklar kendi rakamlarını isteyecek.
- [ ] **C3 · Ad düzeltme yok.** Adını yanlış yazan kişinin sertifikası yanlış adla çıkar; kişi de yönetici
  de düzeltemez.

## F. Başvuru metnine ve yönetim paneline göre eksikler

Kaynak: `../erasmusreact/KA220-YOU-70AE2506.md` (başvuru formu) ve yönetim panelinin özellikleri;
ikisi de yalnızca okundu.

- [ ] **F1 · Anket başvurudaki nitel göstergeleri karşılamıyor.** Başvuru (modül, "qualitative indicators"):
  içeriğin açıklığı/anlaşılırlığı/kullanışlılığı, rehberlik ve mentorluk becerisine katkı (öz değerlendirme),
  gençlik çalışmasında uygulanabilirlik, gençlerin GSD projelerini desteklemeye uygunluk, proje formatını
  bağımsız uygulama güveni. `ANKET` (`icerik/modul.mjs`) beş genel madde içeriyor; gençlik çalışanına
  yönelik dört madde yok. *Çözüm:* role göre ek maddeler (rol `genclik` ise sorulur), 6 dilde.
- [ ] **F2 · Gençlik çalışanı içeriği yok.** Başvuru modülün amacını "gençlik çalışanları ve proje
  personelinin proje formatını uygulamayı öğrenmesi" ve yüz yüze eğitime (LTTA) hazırlık olarak tanımlıyor.
  Altı bölüm gence hitap ediyor. Format HBV'den (WP3 A-1) gelecek; "formatı nasıl uygularım" bölümünün
  yeri ayrılmalı. **Bekleyen: HBV.**
- [ ] **F3 · Oranlar eksik.** Başvuru "post-module survey response rate" ve "assessment completion rate"
  diyor; panelde ve raporda yalnızca sayılar var (`lib/gosterge.mjs`, `lib/rapor.mjs`).
  *Çözüm:* anket yanıt oranı (anket / modülü tamamlayan), teste girme ve geçme oranı.
- [ ] **F4 · E-kitap indirmeleri ayrı izlenmiyor.** Başvuru: E-kitap için ilk 6 ayda en az 200
  indirme/görüntüleme. Yönetim paneli dışarıya kapalı olduğu için e-kitap orada yayımlanmayacak; doğal yeri
  akademinin Kaynaklar sayfası. Sayaç var ama raporda yalnızca toplam: dosya başına sayı ve tarih aralığı yok.
  *Çözüm:* raporda kaynak başına indirme; indirmeleri tarihli tutmak (ilk 6 ay hesabı için).
- [ ] **F5 · Felemenkçe yok.** CECF Hollanda'dan; başvuru "çıktılar ortakların ulusal dillerinde" diyor.
  Yönetim panelinde de yok. **Sorulacak: CECF / koordinatör.**
- [ ] **F6 · Beş yıl yayında kalma taahhüdü.** Başvuru: modül proje bitiminden sonra en az beş yıl açık
  kalacak. Şu an kişisel sunucuda, aiotechs.cloud adresinde; barındırmayı kimin üstleneceği ve kalıcı adres
  yazılı değil. **Karar: proje sahibi / koordinatör.**
- [ ] **F7 · Ortak bazında görünüm yok.** Panelde her ortak kendi kurumunun kayıtlarını görüyor; akademide
  yönetici ya hep ya hiç. En sade çözüm raporda ülke süzgeci (C2 ile birlikte yapılır).
- [ ] **F8 · Kurulum belgesi ve sürüm etiketi yok.** Panelde `DAGITIM.md` ve sürüm numaraları var; akademinin
  sunucu kurulum/güncelleme adımları depoda yazılı değil.
- [ ] **F9 · Pilot geri bildirimi (isteğe bağlı).** Başvuruda 24 kişi içeriği test edecek; tek kanal sondaki
  anket. Adım bazında "bu adımda sorun var" bildirimi yok.

## D. Küçük kusurlar

- [ ] **D1** Süresi dolan oturum satırları (`oturumlar`) hiç silinmiyor.
- [ ] **D2** Sertifika ucuna aynı anda iki istek gelirse ikincisi 500 verir (UNIQUE ihlali); anket ucunda
  iki satır oluşabilir (`routes/ogrenme.mjs`).
- [ ] **D3** Bölüm/adım sırası yalnızca arayüzde zorlanıyor; API ile sıra atlanabilir (göstergeleri etkilemez).
- [ ] **D4** Doğum tarihi yalnızca yıl: 12 yaşındaki biri 13 sayılabilir (`lib/uye.mjs`, `yas`).
- [ ] **D5** İçerik kaydında bozuk bir adım (ör. `null`) 400 yerine 500 döner (`lib/icerik.mjs`, `adimDenetle`).
- [ ] **D6** Giriş yanıt süresi hesabın var olup olmadığını ele verir (hesap yoksa scrypt çalışmaz); kayıt
  zaten `eposta_var` döndürüyor. Düşük öncelik.

## E. Başkalarının işi (takip)

- [ ] **E1** İçerik TASLAK: WP2 ihtiyaç analizi ve HBV'nin formatına göre içerik ekibi gözden geçirecek.
- [ ] **E2** it / ro / pt / da çevirileri makine çevirisi: her ortak kendi dilini gözden geçirecek
  (AB metninde "Co-funded" karşılığı, EntreComp yetkinlik adları, İngilizce bırakılan terimler).

## Gözden geçirmede bakılmayanlar

- Başvuru metninin kendisiyle gösterge karşılaştırması (rehberdeki listeye göre yapıldı).
- Erişilebilirlik taraması yeniden çalıştırılmadı; arayüz elle baştan sona gezilmedi.
- Ekran okuyucuyla deneme yapılmadı.
