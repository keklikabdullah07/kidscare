# Spec 0046: Şifremi Unuttum ve E-posta Servisi (Resend / SMTP) Uygulama Planı

- **Spec:** [`specs/active/0046-password-reset-and-email-service.md`](../active/0046-password-reset-and-email-service.md)
- **Tarih:** 2026-10-16
- **Durum:** Approved
- **Geliştirici Rolü:** Full-Stack Engineer

---

## 1. Mimari Genel Bakış ve Dosya Dağılımı

Bu plan; güvenli, tek kullanımlık ve süreli şifre sıfırlama mekanizmasını KidsCare'in çok kiracılı (multi-tenant) yapısına ve "İyi Misafir Protokolü" kurallarına tam uyumlu olarak inşa eder.

```
packages/database/
  └── prisma/schema.prisma                      # PasswordResetToken modeli & RLS
  └── prisma/migrations/...                     # PostgreSQL migration

packages/shared-types/
  └── src/auth.ts                               # ForgotPassword & ResetPassword tipleri
packages/shared-schemas/
  └── src/auth.schema.ts                        # Zod validasyon şemaları

apps/api/src/modules/mail/
  ├── mail.module.ts                            # MailModule tanımı
  ├── drivers/
  │   ├── mail-driver.interface.ts              # Soyut MailDriver arayüzü
  │   ├── resend.driver.ts                      # Resend REST API sürücüsü
  │   ├── smtp.driver.ts                        # Kurumsal SMTP sürücüsü
  │   └── console.driver.ts                     # Dev / Test yerel sürücüsü
  ├── templates/
  │   └── password-reset.template.ts            # KidsCare markalı HTML e-posta
  └── mail.service.ts                           # E-posta orkestrasyon servisi

apps/api/src/modules/auth/
  ├── dto/
  │   ├── forgot-password.dto.ts                # Zod DTO wrapper
  │   └── reset-password.dto.ts                 # Zod DTO wrapper
  ├── repositories/
  │   └── password-reset.repository.ts          # DB sorguları & SHA-256 token hash yönetimi
  ├── services/
  │   └── auth.service.ts                       # forgotPassword, verifyResetToken, resetPassword metodları
  ├── controllers/
  │   └── auth.controller.ts                    # Public & Throttled uç noktalar
  └── tests/
      └── password-reset.spec.ts                # Backend birim & entegrasyon testleri

apps/admin-web/
  ├── src/api/auth.ts                           # forgotPassword, verifyResetToken, resetPassword API istemcileri
  ├── src/features/auth/
  │   ├── components/ForgotPasswordModal.tsx    # Dokunsal Şifremi Unuttum Modalı
  │   ├── LoginPage.tsx                         # Modal entegrasyonu & "Şifremi Unuttum?" bağlantısı
  │   ├── ResetPasswordPage.tsx                 # Bağımsız şifre sıfırlama rotası
  │   └── ResetPasswordPage.test.tsx            # Web arayüz birim testleri
  └── src/App.tsx                               # /reset-password rota tanımı
```

---

## 2. Görev Dağılımı (Bite-Sized Tasks)

### Task 1: Veritabanı Modeli & Multi-Tenant RLS (`packages/database`)

1. `schema.prisma` içine `PasswordResetToken` modelini ekle:
   - `id String @id @default(cuid())`
   - `tenantId String`
   - `userId String`
   - `tokenHash String @unique`
   - `expiresAt DateTime`
   - `usedAt DateTime?`
   - `createdAt DateTime @default(now())`
   - `tenant Tenant`, `user User` ilişkileri ve `@@index([tenantId])`, `@@index([userId])`, `@@index([tokenHash])` tanımları.
2. Migration dosyasını oluştur veya `prisma db push` / `prisma migrate` ile yerel DB'ye uygula.
3. Multi-tenant RLS politikasını ekle (eğer RLS kullanılıyorsa).

### Task 2: Paylaşılan Tipler & Şemalar (`shared-types` & `shared-schemas`)

1. `packages/shared-types/src/auth.ts`:
   - `ForgotPasswordInput`, `ForgotPasswordResponse`
   - `VerifyResetTokenInput`, `VerifyResetTokenResponse`
   - `ResetPasswordInput`, `ResetPasswordResponse`
2. `packages/shared-schemas/src/auth.schema.ts`:
   - `forgotPasswordSchema`: `tenantSlug` (min 2), `email` (valid email).
   - `verifyResetTokenSchema`: `token` (min 16).
   - `resetPasswordSchema`: `token` (min 16), `newPassword` (min 8 karakter, güçlü parola kuralı).
3. Şema birim testlerini yaz ve `pnpm --filter @kidscare/shared-schemas test` ile doğrula.

### Task 3: E-posta Altyapısı (`MailModule`)

1. `MailDriver` arayüzünü oluştur:
   ```ts
   export interface SendMailOptions {
     to: string;
     subject: string;
     html: string;
     text?: string;
   }
   export interface MailDriver {
     sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string }>;
   }
   ```
2. Sürücüleri yaz:
   - `ResendDriver`: `RESEND_API_KEY` varsa fetch ile Resend REST API'ye istek atar (ek harici ağır paket zorunluluğu olmadan "İyi Misafir Protokolü" ile hafif çalışır).
   - `SmtpDriver`: `nodemailer` veya hafif socket üzerinden standart SMTP gönderimi yapar.
   - `ConsoleDriver`: Test veya anahtar eksikliği durumunda token ve bağlantıyı konsola basar.
3. `MailService`: Ortam değişkenlerine göre doğru sürücüyü seçer (`@Inject(...)` kuralına tam uyumlu).
4. `password-reset.template.ts`: KidsCare dokunsal kimliğine uygun HTML e-posta şablonunu oluşturur.

### Task 4: Backend Auth İş Mantığı & Uç Noktaları (`apps/api`)

1. `PasswordResetRepository`:
   - `createToken(tenantId, userId, tokenHash, expiresAt)`
   - `findByTokenHash(tokenHash)`
   - `markAsUsed(id)`
   - `invalidateUserTokens(userId)`
2. `AuthService`:
   - `forgotPassword(input)`:
     - Tenant bul (`findTenantBySlug`). Bulunamazsa bile sessizce `{ success: true, message: '...' }` dön (Account Enumeration önlemi).
     - User bul (`findUserByEmail`). Bulunamazsa sessizce dön.
     - 32 byte rastgele token üret (`crypto.randomBytes(32).toString('hex')`).
     - SHA-256 hash'le DB'ye kaydet (`expiresAt`: 15 dk sonra).
     - MailService ile sıfırlama linki gönder (`${WEB_URL}/reset-password?token=${rawToken}`).
   - `verifyResetToken(token)`:
     - Hash'le ve DB'de ara. `usedAt` veya `expiresAt < now()` ise `{ valid: false, reason: 'EXPIRED_OR_USED' }` dön.
   - `resetPassword(token, newPassword)`:
     - Hash'le doğrula.
     - Şifreyi `PasswordService.hash(newPassword)` ile hash'le ve `User.passwordHash` güncelle.
     - Token'ı `markAsUsed` yap ve kullanıcının diğer aktif token'larını iptal et.
3. `AuthController`:
   - `@Public()` ve `@Throttle(...)` korumalı `POST /auth/forgot-password`, `GET /auth/verify-reset-token`, `POST /auth/reset-password`.
4. Birim testlerini (`password-reset.spec.ts`) yaz ve doğrula.

### Task 5: Web Arayüzü (`apps/admin-web`)

1. `src/api/auth.ts`: `forgotPassword`, `verifyResetToken`, `resetPassword` fonksiyonlarını ekle.
2. `ForgotPasswordModal.tsx`:
   - Dokunsal modal yapısı (`<TactileButton />`, KidsCare renkleri).
   - Kreş kodu ve e-posta alanları, yükleniyor durumu ve başarı mesajı.
3. `LoginPage.tsx`: Şifre alanının altına "Şifremi Unuttum?" tetikleyicisini yerleştir.
4. `ResetPasswordPage.tsx`:
   - URL'den `token` parametresini okur (`useSearchParams`).
   - İlk yüklemede `verifyResetToken` çağırır; geçersizse dokunsal uyarı kartı gösterir.
   - Geçerliyse yeni şifre ve şifre tekrarı alanlarını sunar, şifre gücü göstergesi ekler.
   - Başarılı olunca 3 saniyelik geri sayım ile `/login` sayfasına yönlendirir.
5. `App.tsx`: `/reset-password` rotasını tanımla.
6. `ResetPasswordPage.test.tsx` birim testlerini yaz.

### Task 6: Kalite Kapısı & Doğrulama

1. `./scripts/check.ps1` çalıştır (Typecheck + Lint + Testler).
2. Google E-Tablo QA webhook'unu çalıştırarak 33. satır olarak kaydet (`scripts/sync-qa-sheet.mjs`).
3. `specs/active/0046-...md` şartnamesini `specs/done/` klasörüne taşı.
