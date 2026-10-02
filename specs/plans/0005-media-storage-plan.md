# Plan 0005 — Medya & Fotoğraf Depolama Servisi (Multi-Tenant Storage)

- Spec: `specs/active/0005-media-storage.md`
- Status: Approved
- Approved by: User
- Mode: lite

---

## 1. Değişecek veya Eklenecek Dosyalar (Files to Change or Add)

### Veritabanı Katmanı (`packages/database/`)

- `packages/database/prisma/schema.prisma` — `MediaCategory` enum ve `MediaFile` modelinin eklenmesi.
- `packages/database/prisma/migrations/20261002130000_add_media_files/migration.sql` — PostgreSQL migration dosyası (RLS dahil).
- `packages/database/src/index.ts` — `MediaFile` ve `MediaCategory` export'ları.

### Ortak Paketler (`packages/`)

- `packages/shared-types/src/media.ts` — `MediaCategory`, `MediaFileItem`, `UploadMediaResponse` sözleşmeleri.
- `packages/shared-types/src/index.ts` — Export güncellemesi.
- `packages/shared-schemas/src/media.schema.ts` — Zod girdi şemaları.
- `packages/shared-schemas/src/index.ts` — Export güncellemesi.

### Backend Katmanı (`apps/api/src/modules/media/`)

- `apps/api/src/modules/media/media.module.ts` — NestJS medya modülü ve sürücü DI konfigürasyonu.
- `apps/api/src/modules/media/drivers/storage-driver.interface.ts` — `IStorageDriver` arayüzü.
- `apps/api/src/modules/media/drivers/local-storage.driver.ts` — Yerel disk sürücüsü (`uploads/` dizini).
- `apps/api/src/modules/media/drivers/s3-storage.driver.ts` — S3 / Cloudflare R2 / MinIO sürücüsü (hazırlık & fallback).
- `apps/api/src/modules/media/services/media.service.ts` — Güvenlik/MIME doğrulama, tenant namespace yönetimi ve iş mantığı.
- `apps/api/src/modules/media/repositories/media.repository.ts` — Prisma tabanlı veritabanı erişimi.
- `apps/api/src/modules/media/controllers/media.controller.ts` — `POST /media/upload`, `DELETE /media/:id`, `GET /media` endpoint'leri.
- `apps/api/src/modules/media/services/media.service.spec.ts` — Birim testleri.
- `apps/api/src/modules/media/controllers/media.controller.spec.ts` — Kontrolcü birim testleri.
- `apps/api/src/app.module.ts` — `MediaModule` import'u.
- `apps/api/src/main.ts` — `/uploads` statik dosya sunum middleware'i (Fastify/Express uyumlu).

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: Veritabanı Şeması ve Ortak Tipler (Database & Shared Contracts)

1. **Adım 1.1:** `schema.prisma` içine `MediaCategory` enum (`STUDENT_AVATAR`, `DAILY_REPORT`, `ACTIVITY`, `PORTFOLIO`, `HEALTH_RECORD`, `GENERAL`) ve `MediaFile` modelini ekleme.
2. **Adım 1.2:** SQL migration dosyasını hazırlama (`ENABLE ROW LEVEL SECURITY` ve tenant indeksleri ile), `prisma generate` çalıştırma.
3. **Adım 1.3:** `shared-types` ve `shared-schemas` paketlerine DTO ve Zod şemalarını tanımlayıp export etme.

### Aşama 2: Sürücü Katmanı ve Depolama Motoru (Storage Driver Engine)

1. **Adım 2.1:** `IStorageDriver` arayüzünü (`uploadFile`, `deleteFile`, `getFileUrl`) tanımlama.
2. **Adım 2.2:** `LocalStorageDriver` uygulamasını kodlama (yalnızca yerel geliştirme için).
3. **Adım 2.3 — Zero-Bloat Savunması:**
   - Multer'ı `memoryStorage()` ile konfigüre ederek sunucu diskinde geçici dosya bırakmama.
   - Dosya boyut filtreleri: Avatar için maks. 2MB, görseller için maks. 5MB, PDF için maks. 10MB.
   - S3 / R2 sürücüsü aktifken dosyaları doğrudan harici bucket'a gönderme (VPS disk tüketimi: 0 bayt).

### Aşama 3: Medya Servisi, Kontrolcüsü ve Statik Sunum (API Layer)

1. **Adım 3.1:** `MediaRepository` ile `media_files` tablosuna metadata kaydetme ve kiracı bazlı silme metodlarını yazma.
2. **Adım 3.2:** `MediaService` içinde çok kiracılı dosya yolu oluşturma (`tenants/${tenantId}/${category}/${uuid}-${fileName}`) ve kayıt akışını tamamlama.
3. **Adım 3.3:** `MediaController` ile `POST /media/upload` (Multer / Fastify-multipart) ve `DELETE /media/:id` endpoint'lerini açma.
4. **Adım 3.4:** `apps/api/src/main.ts` içine statik dosya sunumunu entegre etme.

### Aşama 4: Testler, Doğrulama ve Raporlama (Verification & Review)

1. **Adım 4.1:** `media.service.spec.ts` ve `media.controller.spec.ts` birim testlerini yazma ve çalıştırma.
2. **Adım 4.2:** Canlı yükleme ve silme test betiği (`test-media-upload.js`) ile entegrasyonu doğrulama.
3. **Adım 4.3:** `./scripts/check.ps1` (Typecheck + Lint + Testler) tam döngüsünü %100 yeşil çıktıyla tamamlama.
4. **Adım 4.4:** Şartnameyi `specs/done/` klasörüne taşıyıp yerel Git commit'i oluşturma (push yapmadan).

---

## 3. Riskler ve Savunma Stratejisi

- **Risk 1 (Güvenlik / Zararlı Dosyalar):** Kullanıcı `.php`, `.sh`, `.exe` gibi tehlikeli dosyalar yükleyebilir.
  - _Savunma:_ Sadece katı bir MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) kabul edilir, dosya adları sanitize edilip rastgele UUID prefix ile saklanır.
- **Risk 2 (Tenant İzolasyon Açığı):** Başka bir kreşin kullanıcısı diğer kreşin dosyasını silemez.
  - _Savunma:_ Silme ve okuma sorguları zorunlu olarak aktif oturumun `tenant_id` filtresine ve DB RLS kuralına tabidir.
- **Risk 3 (Fastify / Express Multipart Uyumu):** API'de multipart yüklemeleri kütüphane uyumsuzluğu yaratabilir.
  - _Savunma:_ NestJS standardı FileInterceptor / Fastify multipart güvenle konfigüre edilir.
