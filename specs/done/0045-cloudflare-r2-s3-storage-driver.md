# Spec 0045 — Cloudflare R2 / AWS S3 Gerçek Bulut Depolama Sürücüsü

- Status: Done
- Mode: lite
- Plan: `specs/plans/0045-cloudflare-r2-s3-storage-driver-plan.md`

## Intent

KidsCare platformunda veli ve öğretmenlerin yüklediği öğrenci fotoğrafları, portfolyo etkinlik görselleri, günlük karne fotoğrafları ve resmi evrak ekleri bulunmaktadır.
Şu ana kadar lokal ortamda ve testlerde `LocalStorageDriver` ile disk üzerine yazma veya `S3StorageDriver` sahte (stub) sürücüsü kullanılmıştır.

Canlı ortamımız (Dokploy VPS) emanet bir sunucudur ve "İyi Misafir Protokolü" gereği sunucu diskini medya dosyalarıyla şişirmek kesinlikle yasaktır. Bu şartname, S3 uyumlu nesne depolama servislerine (öncelikli olarak sıfır çıkış ücreti sunan Cloudflare R2 veya AWS S3) tam entegre, tenant izolasyonlu, yüksek performanslı ve güvenli bir gerçek depolama sürücüsünün hayata geçirilmesini amaçlar.

---

## Requirements

1. **S3 Uyumlu Gerçek Bulut Depolama Sürücüsü (`S3StorageDriver`):**
   - `@aws-sdk/client-s3` kütüphanesinin hafif ve modüler kullanımı (`S3Client`, `PutObjectCommand`, `DeleteObjectCommand`).
   - S3 standart parametreleri: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`.
   - Cloudflare R2 endpoint formatına (`https://<account_id>.r2.cloudflarestorage.com`) ve AWS S3 formatlarına tam uyum.
   - Doğrudan `Buffer` veya Stream üzerinden nesne yükleme (`upload`), silme (`delete`) ve CDN URL üretimi (`getUrl`).

2. **Tenant İzolasyonu ve Güvenli Dosya İsimlendirme:**
   - Her yüklenen dosya strictly `tenants/{tenantId}/{category}/{uuid}-{sanitizedName}` anahtar hiyerarşisinde saklanır.
   - Farklı tenant'ların birbirlerinin dosyalarına erişmesi veya anahtar çakışması imkansız kılınır.

3. **Geriye Dönük Uyumluluk ve Geliştirici Deneyimi (Fallback):**
   - `STORAGE_DRIVER` ortam değişkeni:
     - `STORAGE_DRIVER=s3`: Canlı/prodüksiyon modu, Cloudflare R2 / S3 kullanılır.
     - `STORAGE_DRIVER=local`: Yerel geliştirme modu, disk üzerinde `uploads/` dizini kullanılır.
   - Eğer `STORAGE_DRIVER=s3` seçilmiş fakat gerekli S3 anahtarları eksikse, sistem çökmez; açıklayıcı bir konfigürasyon uyarısı loglar ve güvenli hata fırlatır.

4. **Birim Testleri ve Mocklama:**
   - `S3StorageDriver` için `@aws-sdk/client-s3` çağrılarını mocklayan kapsamlı birim testleri yazılır.
   - Başarılı upload, başarısız S3 bağlantısı, dosya silme ve CDN URL üretimi test edilir.

---

## Constraints & Out of Scope

- **İyi Misafir Protokolü:** Prodüksiyonda `STORAGE_DRIVER=s3` zorunlu olacaktır. Sunucu diski üzerine doğrudan medya kaydedilemez.
- **Kapsam Dışı:** Video işleme / transcode servisi veya karmaşık resim yeniden boyutlandırma CDN workers (V2 konusu).

---

## Acceptance Criteria

- [x] AC-1 — `S3StorageDriver`, `@aws-sdk/client-s3` kullanarak belirtilen R2/S3 bucket'ına dosya yükleyebilir ve `PutObjectCommand` çağrısını başarıyla tamamlar.
- [x] AC-2 — Silme işleminde `DeleteObjectCommand` çalışarak nesneyi bucket'tan kaldırır.
- [x] AC-3 — Üretilen dosya URL'leri `S3_PUBLIC_URL` veya Cloudflare CDN alan adıyla kusursuz formatlanır.
- [x] AC-4 — `apps/api` içindeki `MediaModule` ve `MediaService`, `STORAGE_DRIVER=s3` olduğunda sorunsuz `S3StorageDriver` enjekte eder.
- [x] AC-5 — `S3StorageDriver` için yazılan birim testleri %100 geçer ve `./scripts/check.ps1` yeşil onay verir.

---

## Definition of Done

- `@aws-sdk/client-s3` bağımlılığı `apps/api` altına eklenmiş olmalı.
- `S3StorageDriver` ve birim testleri tamamlanmış olmalı.
- `.env.example` dosyasına S3 / Cloudflare R2 değişkenleri eklenmiş olmalı.
- `./scripts/check.ps1` hatasız tamamlanmalı.
