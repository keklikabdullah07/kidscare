# Plan 0004 — Anlık Bildirimler (Push Notifications) ve Veli Bilgilendirme Sistemi

- Spec: `specs/active/0004-push-notifications.md`
- Status: Approved
- Approved by: User

---

## 1. Değişecek veya Eklenecek Dosyalar (Files to Change or Add)

### Veritabanı Katmanı (`packages/database/`)

- `packages/database/prisma/schema.prisma` — `UserPushToken` ve `Notification` modellerinin eklenmesi.
- `packages/database/prisma/migrations/20261002120000_add_notifications_and_push_tokens/migration.sql` — PostgreSQL migration dosyası.

### Ortak Paketler (`packages/`)

- `packages/shared-types/src/notification.ts` — `PushTokenInput`, `NotificationItem`, `SendPushPayload` tipleri.
- `packages/shared-schemas/src/notification.schema.ts` — Zod girdi doğrulama şemaları.

### Backend Katmanı (`apps/api/src/modules/notifications/`)

- `apps/api/src/modules/notifications/notifications.module.ts` — NestJS modülü.
- `apps/api/src/modules/notifications/controllers/notifications.controller.ts` — Token kaydı ve bildirim listeleme endpoint'leri.
- `apps/api/src/modules/notifications/services/notifications.service.ts` — Bildirim oluşturma ve veli çözümleme iş mantığı.
- `apps/api/src/modules/notifications/services/expo-push.service.ts` — Expo Push API HTTP istemcisi (fail-safe).
- `apps/api/src/modules/notifications/repositories/notifications.repository.ts` — Veritabanı erişim katmanı.
- `apps/api/src/modules/notifications/services/notifications.service.spec.ts` — Birim testleri.

### Tetikleyici Entegrasyonları (Event Triggers)

- `apps/api/src/modules/attendance/services/attendance.service.ts` — Yoklama giriş ve çıkışında veliye bildirim tetikleme.
- `apps/api/src/modules/daily-reports/services/daily-reports.service.ts` — Günlük karne kaydedildiğinde veliye bildirim tetikleme.
- `apps/api/src/modules/medication/services/medication.service.ts` — İlaç verildiğinde veliye bildirim tetikleme.

### Mobil Katmanı (`apps/mobile/`)

- `apps/mobile/src/api/notifications.ts` — Token kaydı ve bildirim okuma API çağrıları.
- `apps/mobile/src/auth/AuthContext.tsx` — Başarılı giriş sonrasında token'ı backend'e kaydetme, çıkışta silme.

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: Veritabanı ve Ortak Tip Sözleşmeleri (Database & Shared Types)

1. **Adım 1.1:** `schema.prisma` içinde `UserPushToken` ve `Notification` tablolarını tanımlama.
2. **Adım 1.2:** Prisma migration üretme ve uygulama (`prisma migrate dev` / `deploy`), Prisma client'ı yeniden oluşturma.
3. **Adım 1.3:** `shared-types` ve `shared-schemas` paketlerine bildirim modellerini ve şemalarını ekleme.

### Aşama 2: Backend Notifications Modülü (API Layer)

1. **Adım 2.1:** `ExpoPushService` oluşturma (Expo API `https://exp.host/--/api/v2/push/send` çağrıları, batch desteği ve hata toleransı).
2. **Adım 2.2:** `NotificationsRepository` ve `NotificationsService` oluşturma.
3. **Adım 2.3:** `NotificationsController` ile `POST /notifications/token`, `DELETE /notifications/token`, `GET /notifications` endpoint'lerini açma.

### Aşama 3: Otomatik Bildirim Tetikleyicileri (Triggers)

1. **Adım 3.1 — Yoklama:** `attendance.service.ts` içinde `checkInStudent` ve `checkOutStudent` metodlarına veli push bildirimi bağlama.
2. **Adım 3.2 — Günlük Karne:** `daily-reports.service.ts` içinde `saveStudentDailyReport` sonrasında veliye bildirim bağlama.
3. **Adım 3.3 — İlaç:** `medication.service.ts` içinde `markMedicationGiven` sonrasında bildirim bağlama.

### Aşama 4: Mobil İstemci Entegrasyonu & Kalite Kapısı

1. **Adım 4.1:** `apps/mobile/src/api/notifications.ts` ile API bağlantısını kurma.
2. **Adım 4.2:** Giriş ve çıkış akışlarına token senkronizasyonunu ekleme.
3. **Adım 4.3:** Birim testlerini yazma ve `./scripts/check.ps1` kalite kapısını 100% yeşil olarak tamamlama.

---

## 3. Doğrulama ve Kanıt Protokolü (Verification & Evidence)

1. **Birim Testleri:** `notifications.service.spec.ts` bildirimlerin başarıyla üretildiğini ve fail-safe mantığını test etmelidir.
2. **API Kontrat Testi:** Node scratch betiği ile token kaydı, yoklama alma ve veliye push gönderimi simülasyonu kanıtlanmalıdır.
3. **Kalite Kapısı:** `./scripts/check.ps1` (55+ test suite) %100 yeşil tamamlanmalıdır.
