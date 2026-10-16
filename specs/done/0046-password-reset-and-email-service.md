# Spec 0046 — Şifremi Unuttum ve E-posta Servisi

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0046-password-reset-and-email-service-plan.md`

## Intent

KidsCare platformundaki tüm kullanıcıların (Kurucu/Müdür, Öğretmen, Veli) şifrelerini unuttuklarında güvenli, tek kullanımlık ve süreli bir bağlantı aracılığıyla e-posta üzerinden hesaplarına yeniden erişebilmelerini sağlamak. E-posta altyapısında sunucu kaynaklarını koruyan ("İyi Misafir Protokolü") ve ortam değişkenleriyle esnek çalışan (Resend / SMTP / Console) bir sürücü mimarisi kurarak hem yerel geliştirmede hem de canlı ortamda sorunsuz bildirim iletimini garanti altına almak.

## Requirements

1. **Şifre Sıfırlama Talebi (Forgot Password):**
   - Kullanıcı giriş ekranından ("Şifremi Unuttum?") kreş kodunu (slug) ve kayıtlı e-posta adresini girerek sıfırlama bağlantısı talep edebilmelidir.
   - Bilgi sızdırma (Account Enumeration) saldırılarını engellemek amacıyla; girilen e-posta sistemde kayıtlı olsun veya olmasın kullanıcıya her durumda aynı nötr/güvenli mesaj gösterilmelidir.
   - Kötüye kullanımı ve brute-force saldırılarını önlemek için IP ve hesap bazlı rate-limiting (istek sınırlaması) uygulanmalıdır.

2. **Güvenli Token ve E-posta İletimi:**
   - Şifre sıfırlama için üretilen token'lar plain-text olarak veritabanında saklanmamalı, SHA-256 ile hash'lenerek kaydedilmelidir.
   - Token'ların geçerlilik süresi 15 dakika ile sınırlandırılmalıdır ve bir kez kullanıldıktan sonra (`usedAt`) geçersiz hale gelmelidir.
   - E-posta içeriği KidsCare dokunsal tasarım kimliğine (#115e59 çam yeşili, #f59e0b kehribar) uygun antetli, mobil uyumlu ve Türkçe HTML şablonuyla hazırlanmalıdır.

3. **Yeni Şifre Belirleme (Reset Password):**
   - E-postadaki bağlantıya tıklandığında açılan `/reset-password?token=...` rotasında token'ın geçerliliği ve süresi anlık kontrol edilmelidir.
   - Token geçersizse veya süresi dolmuşsa kullanıcıya net bir uyarı ve yeni talep oluşturma butonu sunulmalıdır.
   - Geçerli token ile kullanıcı güçlü yeni şifresini (şifre tekrarı ve şifre gücü kontrolüyle) girip onaylayabilmelidir.
   - Şifre başarıyla güncellendiğinde token tüketilmeli, kullanıcının varsa diğer aktif sıfırlama token'ları iptal edilmeli ve kullanıcı giriş ekranına yönlendirilmelidir.

4. **Hibrit E-posta Sürücü Mimarisi (Resend / SMTP / Console):**
   - `RESEND_API_KEY` mevcutsa Resend API üzerinden e-posta gönderimi yapılmalıdır.
   - `SMTP_HOST` ve kimlik bilgileri tanımlıysa standart SMTP ile gönderim desteklenmelidir.
   - Geliştirme/test ortamında canlı kimlik bilgisi yoksa token konsola loglanmalı, harici servise gereksiz istek atılmamalıdır.

## Constraints & out of scope

- **Kapsam Dışı:** SMS ile şifre sıfırlama (V2 fazına bırakılmıştır).
- **Kapsam Dışı:** Sosyal medya / Google OAuth ile tek tıkla giriş (Ayrı bir spec konusudur).
- **Sert Sınırlar:** Şifreler en az 8 karakter olmalıdır. Token plain-text DB'ye yazılamaz.

## Acceptance criteria

- [x] AC-1: Kullanıcı `POST /auth/forgot-password` endpoint'ine geçerli `tenantSlug` ve `email` gönderdiğinde 15 dakika geçerli `PasswordResetToken` kaydı (SHA-256 hash ile) oluşur ve e-posta tetiklenir.
- [x] AC-2: Var olmayan bir e-posta veya kreş slug'ı girildiğinde sistem hata fırlatmaz, bilgi sızdırmayan başarı mesajı döner.
- [x] AC-3: `GET /auth/verify-reset-token?token=...` endpoint'i geçerli token için `{ valid: true }`, süresi dolmuş veya kullanılmış token için `{ valid: false, reason: string }` döner.
- [x] AC-4: `POST /auth/reset-password` endpoint'i geçerli token ile kullanıcının `passwordHash` alanını günceller, token'ı `usedAt` ile damgalar ve token tekrar kullanılamaz.
- [x] AC-5: `MailDriver` mimarisi Resend, SMTP ve Console sürücülerini ortam değişkenlerine göre hatasız seçer ve çalıştırır.
- [x] AC-6: Web Login ekranında "Şifremi Unuttum?" dokunsal modalı çalışır; `/reset-password?token=...` sayfası token doğrulama, şifre formu ve başarı yönlendirmesini sorunsuz işletir.
- [x] AC-7: Tüm yeni endpoint ve bileşenlerin birim testleri (%100 yeşil) tamamlanır, `./scripts/check.ps1` sıfır hata verir.

## Definition of Done

- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check.ps1` green
- [x] Independent review done; real findings fixed, noise rejected with written rationale
- [x] Docs / ADRs updated if behavior or architecture changed
- [x] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 1     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
