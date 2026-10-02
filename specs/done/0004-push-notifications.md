# Spec 0004 — Anlık Bildirimler (Push Notifications) ve Veli Bilgilendirme Sistemi

- Status: Done
- Mode: lite
- Plan: `specs/plans/0004-push-notifications-plan.md`

## Intent

KidsCare platformunda velilerin ve öğretmenlerin çocukların durumuyla ilgili anlık gelişmelerden (kreşe giriş/çıkış, günün karnesinin paylaşılması, ilaç saati ve acil duyurular) anında haberdar olabilmesi için Expo Push Notification tabanlı anlık bildirim sistemi kurulacaktır. Mobil uygulama açılışında veya kullanıcı oturum açtığında push token güvenle kaydedilecek; yoklama, günlük karne ve ilaç süreçleri tamamlandığında backend otomatik olarak ilgili velilere ve öğretmenlere sesli/rozetli anlık bildirim gönderecektir.

## Requirements

1. **Cihaz Token Kaydı ve Yönetimi:**
   - Mobil kullanıcı (`PARENT`, `TEACHER`, `ADMIN`) oturum açtığında cihazın Expo Push Token'ı (`ExponentPushToken[...]`) alınarak backend'e iletilmelidir.
   - Kullanıcı oturumu kapattığında (`logout`), ilgili cihaza bildirim gitmemesi için token silinmelidir.
   - Aynı kullanıcının birden fazla cihazı (örneğin anne ve babanın ayrı telefonları) desteklenmelidir.
2. **Otomatik Olay Tetikleyicileri (Event Triggers):**
   - **Yoklama (Giriş):** Öğretmen öğrenciyi "Geldi" işaretlediğinde velinin telefonuna anında bildirim düşmelidir (_"⏰ [Öğrenci Adı] kreşe giriş yaptı."_).
   - **Teslim Alma (Çıkış):** Öğrenci velisine veya yetkiliye teslim edildiğinde bildirim düşmelidir (_"🚗 [Öğrenci Adı], [Teslim Alan] tarafından teslim alındı."_).
   - **Günlük Karne:** Günün karnesi kaydedildiğinde veliye bildirim düşmelidir (_"🌟 [Öğrenci Adı]'ın bugünkü karnesi paylaşıldı."_).
   - **İlaç Takibi:** İlaç verildiğinde veliye anlık teyit bildirimi düşmelidir (_"💊 [İlaç Adı] saatinde verildi."_).
3. **Multi-Tenancy & Güvenlik:**
   - Push bildirimleri asla başka bir kreşin velisine veya öğrencisine gitmemelidir.
   - Expo Push API çağrıları hata verse dahi (örneğin cihaz offline ise) ana işlem (yoklama alma veya karne kaydetme) asla başarısız olmamalı, sessizce loglanmalıdır (fail-safe).
4. **Bildirim Geçmişi:**
   - Gönderilen bildirimler mobil veya web arayüzünde "Bildirimler" sekmesinde listelenebilmeli ve okunmamış bildirim rozeti gösterilmelidir.

## Constraints & out of scope

- **Kapsam İçi:** `packages/database` (Push token şeması), `apps/api` (Notifications modülü ve Expo API entegrasyonu), `apps/mobile` (Expo Notifications token kaydı ve dinleyici).
- **Kapsam Dışı:** SMS (Twilio/Netgsm) veya WhatsApp API entegrasyonu bu fazın kapsamı dışındadır; yalnızca mobil push ve uygulama içi bildirimler hedeflenmektedir.

## Acceptance criteria

- [x] AC-1 — Push Token Kaydı: `POST /notifications/token` endpoint'i üzerinden kullanıcı token'ı `user_push_tokens` tablosuna kaydedilmeli ve `DELETE /notifications/token` ile silinebilmelidir.
- [x] AC-2 — Yoklama Bildirim Tetikleyicisi: Öğretmen check-in yaptığında öğrencinin velisine Expo Push API üzerinden anlık bildirim gitmelidir.
- [x] AC-3 — Teslim Alma Bildirimi: Öğrenci teslim edildiğinde teslim alan kişi bilgisiyle veliye anlık bildirim iletilmelidir.
- [x] AC-4 — Günlük Karne Bildirimi: Öğretmen günlük karne kaydettiğinde veliye anlık bildirim iletilmelidir.
- [x] AC-5 — İlaç Takip Bildirimi: İlaç verildi işaretlendiğinde veliye anlık teyit bildirimi iletilmelidir.
- [x] AC-6 — Fail-Safe Güvencesi: Ağ hatası veya geçersiz push token durumunda yoklama/karne kaydı çökmeksizin başarıyla tamamlanmalıdır.
- [x] AC-7 — Bildirim Geçmişi API: `GET /notifications` endpoint'i kullanıcının son bildirimlerini tarih sırasına göre getirmelidir.
- [x] AC-8 — Test & Kalite Kapısı: Yeni servis ve repository için birim testleri yazılmalı, `./scripts/check.ps1` %100 yeşil kalmalıdır.

## Definition of Done

- [x] Tüm 8 kabul kriteri birim testleri ve API çağrılarıyla doğrulanmış olmalı
- [x] `scripts/check.ps1` (Types + Lint + Test) yeşil olmalı
- [x] Bağımsız inceleme (Review) tamamlanıp bulgular çözülmüş olmalı
- [x] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 1     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
