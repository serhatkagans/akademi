# Dağıtım ve işletme

Canlı adres: **https://aiotechs.cloud/akademi/** · sunucu `genctek` (DirectAdmin + Apache, CentOS/Alma).
Diğer uygulamalarla aynı sunucuda çalışır; **Apache yapılandırmasına ve diğer uygulamalara dokunulmaz.**

## Sunucudaki yerleşim

| Yol | İçerik |
|---|---|
| `/opt/akademi/releases/<tarih>/` | her sürüm ayrı klasörde (kod + `dist/` + `node_modules/`) |
| `/opt/akademi/current` | geçerli sürüme bağlantı (symlink) |
| `/opt/akademi/data/` | `akademi.sqlite`, `kaynaklar/` (yüklenen dosyalar), `yedek/` |
| `/opt/akademi/.env` | ayarlar (yalnızca root okur) |
| `/etc/systemd/system/akademi.service` | servis (kullanıcı `akademi`, `/opt/node24/bin/node`) |

`.env`: `PORT=3110`, `HOST=127.0.0.1`, `BASE_PATH=/akademi`, `PUBLIC_ORIGIN=https://aiotechs.cloud`,
`COOKIE_SECURE=true`, `TRUST_PROXY=true`, `DATA_DIR=/opt/akademi/data`. E-posta için `SMTP_*` (bkz. `.env.example`).

Apache, `/akademi/` isteklerini öneki koruyarak `127.0.0.1:3110/akademi/`'ye iletir; uygulama `BASE_PATH`
önekini kendisi atar. Port yalnızca 127.0.0.1'de dinler.

## Güncelleme (yeni sürüm)

Yerelde (akademi klasöründe):
```
npm test && npm run build
git archive --format=tar -o paket.tar HEAD && tar --force-local --append -f paket.tar dist && gzip -f paket.tar
scp paket.tar.gz genctek:/tmp/akademi.tar.gz && rm paket.tar.gz
```
Sunucuda (root):
```
ONCEKI=$(readlink /opt/akademi/current)
Y=/opt/akademi/releases/$(date +%Y%m%d%H%M%S); mkdir -p $Y && tar xzf /tmp/akademi.tar.gz -C $Y
cd $Y && PATH=/opt/node24/bin:$PATH npm ci --omit=dev && chown -R root:root $Y
cd /opt/akademi/current && set -a && . /opt/akademi/.env && set +a && runuser -u akademi -- env DATA_DIR=$DATA_DIR /opt/node24/bin/node scripts/yedek.mjs
ln -sfn $Y /opt/akademi/current && systemctl restart akademi && systemctl is-active akademi
```
Geri dönmek için: `ln -sfn $ONCEKI /opt/akademi/current && systemctl restart akademi`.

Güncellemeden sonra diğer uygulamaların durum kodları karşılaştırılır (`/root/akademi-oncesi.txt`, ilk
kurulumdaki liste; `/akademi` dışında hiçbiri değişmemeli).

## Sürümler

`package.json` sürümü ile aynı numarada açıklamalı Git etiketi (`vBÜYÜK.KÜÇÜK.YAMA`): hata düzeltmesi yama,
geriye uyumlu özellik küçük sürümü artırır. Etiketler: `git tag -n`.

## Yedek

- Sunucu her gün yedek alır (`data/yedek/akademi-YYYY-MM-DD.sqlite` + `kaynaklar/`), 14 gün saklar.
  Elle: `npm run yedek`. Son yedek zamanı yönetim → Göstergeler'de görünür.
- **Yedek aynı diskte durur.** Disk arızasına karşı düzenli olarak başka bir makineye kopyalanmalı.
  Kendi bilgisayarına almak için (Windows PowerShell ya da Git Bash, haftada bir yeterli):
  ```
  scp -r genctek:/opt/akademi/data/yedek "C:\Users\<kullanıcı>\Yedekler\akademi"
  ```
  Ya da Windows Görev Zamanlayıcısı'nda bu komutu haftalık görev yapın.
- Geri yükleme: `scripts/yedek.mjs` dosyasının başındaki adımlar.

## İzleme

- **Site izleme (proje sahibi kurar):** ücretsiz bir çalışma süresi izleme servisinde (ör. UptimeRobot,
  Better Stack) şu adres için 5 dakikalık HTTP denetimi açın; yanıt `200` olmalı:
  `https://aiotechs.cloud/akademi/api/ben`
  Kapanırsa servis e-posta gönderir.
- **Video denetimi (kendiliğinden):** haftada bir, içerikteki YouTube videoları hâlâ açılıyor ve gömülebiliyor mu
  denetlenir; bozuk olan yönetim → Göstergeler'in üstünde uyarı olarak görünür (`lib/video-denetim.mjs`).
- Günlükler: `journalctl -u akademi -n 100`.

## Yönetici hesabı

```
cd /opt/akademi/current && set -a && . /opt/akademi/.env && set +a
runuser -u akademi -- env DATA_DIR=$DATA_DIR /opt/node24/bin/node scripts/yonetici.mjs ekle <eposta> "Ad Soyad"
```
Parola bir kez ekrana yazılır. Sonra kişi Hesabım'dan kendi parolasını koyar.
