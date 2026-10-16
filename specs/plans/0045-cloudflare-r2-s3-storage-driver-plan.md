# Plan: Spec 0045 — Cloudflare R2 / AWS S3 Gerçek Bulut Depolama Sürücüsü

> **Bağlantılı Şartname:** [specs/active/0045-cloudflare-r2-s3-storage-driver.md](../active/0045-cloudflare-r2-s3-storage-driver.md)  
> **Mod:** lite  
> **Kapsam:** `apps/api` (`package.json`, `src/modules/media/drivers/`, `src/modules/media/services/`, `.env.example`)

---

## 1. Mimari Tasarım ve Değişiklik Özeti

### Adım 1: Bağımlılık Kurulumu (`apps/api/package.json`)

- `@aws-sdk/client-s3` kütüphanesi `@kidscare/api` paketine eklenir (`pnpm --filter @kidscare/api add @aws-sdk/client-s3`).
- Sadece `client-s3` alınarak gereksiz AWS SDK kütüphaneleri dışarıda tutulur (hafif build prensibi).

### Adım 2: `S3StorageDriver` Gerçek Implementasyonu (`apps/api/src/modules/media/drivers/s3-storage.driver.ts`)

- `S3Client` örneği yapılandırılır:
  - `endpoint`: `process.env.S3_ENDPOINT` (Cloudflare R2 için `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)
  - `region`: `process.env.S3_REGION || 'auto'`
  - `credentials`: `{ accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }`
- Metotlar:
  - `upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<StorageUploadResult>`
    - `PutObjectCommand` gönderilir (`Bucket`, `Key`, `Body`, `ContentType`).
    - Hata durumunda loglama ve kontrollü hata fırlatma.
    - Dönen nesne: `{ key, url: this.getUrl(key), size: fileBuffer.length, mimeType }`.
  - `delete(key: string): Promise<void>`
    - `DeleteObjectCommand` gönderilir (`Bucket`, `Key`).
  - `getUrl(key: string): string`
    - `S3_PUBLIC_URL` veya bucket url ile birleştirilerek temiz CDN URL'i döner.

### Adım 3: Ortam Değişkenleri ve Dokümantasyon (`.env.example`)

- `.env.example` dosyasına S3 / Cloudflare R2 parametre şablonları eklenir:
  ```env
  STORAGE_DRIVER=local # veya s3
  S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
  S3_REGION=auto
  S3_ACCESS_KEY_ID=your-access-key-id
  S3_SECRET_ACCESS_KEY=your-secret-access-key
  S3_BUCKET=kidscare-media
  S3_PUBLIC_URL=https://media.kidscare.app
  ```

### Adım 4: Birim Testleri (`apps/api/src/modules/media/drivers/s3-storage.driver.spec.ts`)

- `@aws-sdk/client-s3` mocklanır (`S3Client.prototype.send`).
- Başarılı `PutObjectCommand`, başarılı `DeleteObjectCommand`, hata fırlatma durumları ve `getUrl` formatı test edilir.

### Adım 5: Kalite Kapısı Doğrulaması

- `./scripts/check.ps1` çalıştırılarak TypeScript, ESLint ve tüm testlerin yeşil olduğu doğrulanır.
- Şartname `specs/done/` dizinine taşınır.

---

## 2. Riskler ve Önlemler

- **Risk:** Canlı ortamda R2 kimlik bilgileri girilmezse medya yüklemeleri patlayabilir.
  - **Önlem:** Sürücü başlatılırken eksik anahtar varsa erken uyarı (`Logger.warn`) verir; upload anında kullanıcıya net `InternalServerErrorException('Bulut depolama kimlik bilgileri yapılandırılmamış.')` döner.
