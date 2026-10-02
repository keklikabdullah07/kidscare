# Spec 0005 — Medya & Fotoğraf Depolama Servisi (Multi-Tenant Storage)

- Status: Done
- Mode: lite
- Plan: `specs/plans/0005-media-storage-plan.md`

## Intent

KidsCare platformunda kreşlerin günlük aktiviteleri, yemek menüsü görselleri, öğrenci vesikalıkları, karne fotoğrafları, portfolyo çalışmaları ve sağlık/ilaç belgelerinin güvenli bir şekilde sunucuya yüklenmesi ve hızlıca servis edilmesi için çok kiracılı (multi-tenant) bir medya depolama motoru kurulacaktır. Sistem, yerel geliştirme ve VPS üzerinde sıfır ek maliyetle çalışabilen yerel disk (Local Storage Driver) desteğinin yanı sıra, bulut ortamları (AWS S3, Cloudflare R2, MinIO) ile tam uyumlu S3 sürücüsü mimarisine sahip olacaktır. Her kiracının dosyaları kendi tenant ID dizininde izole edilecek, güvenlik denetimlerinden (MIME type ve boyut sınırları) geçirilerek güvenle sunulacaktır.

## Requirements

1. **Çok Kiracılı Dosya Yükleme (Upload API):**
   - İdareci (`ADMIN`) ve Öğretmen (`TEACHER`) kullanıcılar tekil veya çoklu dosya yükleyebilmelidir.
   - Her yüklenen dosya fiziksel olarak veya nesne deposunda `tenants/{tenantId}/{category}/{uuid}-{filename}` yolunda saklanmalıdır.
   - Farklı bir kreşin kullanıcısı başka bir kreşin dosyasına veya dizinine erişemez veya üzerine yazamaz.
2. **Güvenlik ve Format Doğrulaması:**
   - Desteklenen görsel formatları: JPEG, PNG, WEBP, HEIC (maksimum 10MB).
   - Desteklenen belge formatları: PDF (sağlık/rapor belgeleri için maksimum 20MB).
   - Yürütülebilir veya tehlikeli dosyalar (`.exe`, `.sh`, `.js`, `.html` vb.) sunucu tarafında anında reddedilmelidir.
3. **Esnek Depolama Sürücüsü (Driver Pattern):**
   - **Local Disk Driver:** Geliştirme ortamında ve bağımsız VPS kurulumlarında `uploads/` dizinine yazıp HTTP üzerinden doğrudan servis edebilmelidir (`/uploads/tenants/...`).
   - **S3 / R2 Driver:** Ortam değişkenlerinde (`STORAGE_DRIVER=s3`) tanımlandığında AWS S3 veya Cloudflare R2 / MinIO bucket'ına yükleme yapabilmelidir.
4. **Dosya Silme ve Temizleme:**
   - Yetkili kullanıcı yüklediği bir görseli veya belgeyi silebilmelidir (`DELETE /media/:fileKey`).
   - Dosya silinirken tenant doğrulaması zorunlu olmalıdır (kiracı izolasyonu).
5. **Veri Tabanı Medya Kayıtları (Audit & Metadata):**
   - Yüklenen her medyanın URL'i, dosya boyutu, MIME türü, yükleyen kullanıcı ID'si ve ait olduğu kategori (`STUDENT_AVATAR`, `DAILY_REPORT`, `ACTIVITY`, `PORTFOLIO`, `DOCUMENT`) veri tabanında tutulmalıdır.
6. **VPS Sıfır-Şişme Politikası (Zero-Bloat VPS Protection):**
   - **RAM-Only Processing (`memoryStorage`):** Yüklenen dosyalar sunucu diskinde geçici `/tmp` artığı bırakmamak için bellekte (RAM buffer) işlenmelidir.
   - **Bulut / Harici Depolama Önceliği (Cloudflare R2 / S3):** Prodüksiyon ve VPS ortamında dosyalar Dokploy sunucu diskine DEĞİL, harici nesne deposuna (Cloudflare R2 veya S3) akıtılır. Böylece VPS disk kullanımı **sıfır (0 bayt)** kalır.
   - **Docker İzolasyonu:** `.dockerignore` içinde `uploads/` dizini hariç tutularak Docker imaj boyutunun büyümesi kesin olarak engellenmelidir.
   - **Sıkı Boyut Limitleri:** Profil avatarları maks. 2MB, genel fotoğraflar maks. 5MB, belgeler maks. 10MB ile sınırlandırılarak bant genişliği ve depolama optimize edilir.

## Constraints & out of scope

- **Kapsam İçi:** Çok kiracılı dosya yükleme API'si, yerel disk ve S3/R2 sürücü soyutlaması, görsel/belge boyut & MIME doğrulama, statik dosya sunumu (`/uploads`), API dokümantasyonu ve testler.
- **Kapsam Dışı:** Ağır video transkripsiyonu veya gerçek zamanlı video yayını (video streaming) V1 kapsamı dışındadır.

## Acceptance criteria

- [x] AC-1 — Dosya Yükleme API: `POST /media/upload` multipart endpoint'i geçerli görsel dosyalarını kabul etmeli ve erişilebilir bir genel URL ile metadata döndürmelidir.
- [x] AC-2 — Çok Kiracılı İzolasyon: Yüklenen dosyanın depolama yolu ve DB kaydı zorunlu olarak aktif oturumun `tenantId`'sini içermelidir.
- [x] AC-3 — Güvenlik Doğrulaması: Geçersiz dosya türü (örn. `.exe` veya script) ya da 10MB üzerindeki görseller `400 Bad Request` ile reddedilmelidir.
- [x] AC-4 — Yerel Statik Sunum: Local driver aktifken yüklenen dosyalar `GET /uploads/tenants/...` üzerinden tarayıcıda veya mobil uygulamada sorunsuz görüntülenebilmelidir.
- [x] AC-5 — Sürücü Soyutlaması (`IStorageDriver`): Sistem `STORAGE_DRIVER=local` veya `s3` konfigürasyonuna göre runtime'da doğru sürücüyü kullanmalıdır.
- [x] AC-6 — Dosya Silme API: `DELETE /media/:id` endpoint'i yalnızca aynı tenant'a ait dosyayı fiziksel ve mantıksal olarak silebilmelidir.
- [x] AC-7 — Birim ve Entegrasyon Testleri: Medya servisi, dosya doğrulayıcı ve kontrolcü için testler yazılmalı; `./scripts/check.ps1` %100 yeşil kalmalıdır.

## Definition of Done

- [x] Tüm 7 kabul kriteri birim testleri ve API kontrolleriyle doğrulanmış olmalı
- [x] `scripts/check.ps1` (Types + Lint + Test) %100 yeşil olmalı
- [x] Kodlama ve mimari standartları (NestJS DI `@Inject`, VSA, zero-any) sağlanmış olmalı
- [x] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 1     |
| Fix rounds                    | 1     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
