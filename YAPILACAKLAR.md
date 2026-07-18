# Yapılacaklar

Düğün: **8 Ağustos 2026** · Site: https://testmatestudio.online

## Düğünden ÖNCE (istersen)

- [ ] QR kodu bastırmadan önce siteyi telefondan son bir kez test et (yükleme + galeri)
- [ ] Admin şifresiyle bir kez giriş yapıp panelin çalıştığını doğrula

## Düğünden SONRA

### 1. Fotoğrafları indir
- Admin paneli → Tümünü Seç → "Seçilenleri İndir (ZIP)"
- **Not:** İnternet sağlayıcının AWS'e giden hattı yavaş (~0,7 MB/s ölçüldü; normal hızın 6,3 MB/s).
  Kabaca süre: **1 GB ≈ 25 dakika**. İndirme sırasında sekmeyi kapatma, bilgisayar uyumasın.
- Veri çoksa (10+ GB) indirmeden önce aşağıdaki hızlandırmayı değerlendir.

### 2. Çok veri birikirse: indirme hızlandırma (opsiyonel)
Ölçümlere göre en etkili çözüm **Cloudflare R2'ye geçiş** (Cloudflare hesabın zaten var,
oraya bağlantın 10 kat hızlı, S3 uyumlu API sayesinde kod değişikliği az).
Alternatif: AWS konsolundan CloudFront kurulumu (IAM kullanıcısının yetkisi yok,
konsoldan el ile yapılmalı). Detaylı ölçümler Claude'un proje hafızasında kayıtlı —
"düğün fotoğraflarını indireceğim, hızlandıralım" demen yeterli.

### 3. Sistemi kapat
- [ ] Tüm dosyaların indiğini ve açıldığını doğrula (birkaç fotoğraf/video örnekle kontrol et)
- [ ] Yedeği ikinci bir yere kopyala (harici disk / kişisel bulut)
- [ ] S3 bucket'ını boşalt ve sil (`gokceugur-wedding-gallery`, eu-north-1) — aylık ücret kesilmesin
- [ ] Railway servisini sil/durdur (testmatestudio projesi)
- [ ] Domain yenilemesini iptal et (Natro) — istersen
- [ ] AWS IAM kullanıcısını (`wedding-app`) ve erişim anahtarlarını sil

## Bilinen küçük pürüzler (düğün için engel değil)

- **Railway otomatik deploy çalışmıyor** — her push sonrası şu komutla el ile tetikleniyor:
  `railway service source connect --repo ugurakyay/QR_Wedding --branch main --service 8ade0e4f-1c89-412f-a367-4d2e8e334e40`
- Bazı hata mesajları İngilizce (sunucu tarafı; normalde kullanıcı görmez)
- `client/.env` ve Dockerfile'daki `VITE_ADMIN_PASSWORD` artık kodda kullanılmıyor, kaldırılabilir
- Admin girişi kalıcı: şifre değişmediği sürece token süresiz geçerli, deploy'lar oturumu düşürmez
