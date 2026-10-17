# Spec 0051 — Tüm Menü ve Modülleri Kapsayan Gerçekçi Test Verisi Paketi

- Status: Done
- Mode: lite
- Plan: `specs/plans/0051-plan.md`

## Intent

KidsCare platformundaki tüm modüllerin (Öğrenciler, Sınıflar, Yoklama, Günlük Takip, İlaç Takibi, Olay/Revir, Teslimat Güvenliği, Mesajlaşma, Finans ve Aidatlar, Yemek Menüsü, Gelişim & Portfolyo ve Etkinlik/Mazeret İzinleri) demo ve test ortamlarında boş durum ("Kayıt bulunamadı") olmadan, gerçekçi ve MEB okul öncesi pedagojisine uygun verilerle çalışmasını sağlamak. Mevcut veritabanındaki eski test verileri atomik cascade sırasıyla temizlenip sıfırdan 10 sınıf, 20 öğrenci ve tam ilişkisel hikaye kurgusuyla eksiksiz olarak oluşturulmuştur.

## Requirements

1. **Güvenli ve Sıralı Veri Sıfırlama (Cascade Cleanup):**
   - Yabancı anahtar (Foreign Key) kısıtlarına takılmadan ve kalıntı bırakmadan:
     `notification`, `userPushToken`, `mediaFile`, `passwordResetToken`, `paymentTransaction`, `billingInvoice`, `studentBillingPlan`, `messageReadReceipt`, `message`, `conversationParticipant`, `conversation`, `pickupEvent`, `pickupAuthorization`, `pickupContact`, `medicationRecord`, `incidentRecord`, `portfolioItem`, `developmentObservation`, `homeActivitySuggestion`, `dailyReport`, `activityPost`, `eventConsentResponse`, `eventConsent`, `attendanceExcuse`, `attendance`, `parentRequest`, `classroomTeacher`, `student`, `classroom`, `dailyMenu`, `user` tabloları temizlenmiştir.

2. **Çekirdek Kullanıcılar ve 10 Sınıf / 20 Öğrenci Altyapısı:**
   - 1 Süper Admin (`superadmin@demo.test`), 2 Admin (`admin@demo.test`, `admin2@demo.test`), 1 Servis Görevlisi (`service@demo.test`), 10 Sınıf Öğretmeni (`teacher@demo.test` ... `teacher10@demo.test`), 20 Veli (`parent@demo.test` / `parent1@demo.test` ... `parent20@demo.test`).
   - 10 Farklı Yaş Grubu Sınıfı (Minik Adımlar 2 yaş, Papatyalar 3 yaş ... Kaşifler ve Mucitler 5-6 yaş).
   - 20 Öğrenci (her sınıfta 2 öğrenci), pasaport JSON'larında gerçekçi kan grupları, alerjiler (fıstık, laktoz, çilek, yumurta akı vb.), diyet kısıtları ve acil durum kişileri.

3. **Operasyonel Modüller (Yoklama & Günlük Takip):**
   - **Yoklama:** 1-17 Ekim 2026 arası tüm hafta içi iş günleri (13 gün x 20 öğrenci = 260 kayıt). %85 Var (`PRESENT`, giriş-çıkış saatli), %10 İzinli (`EXCUSED`, `AttendanceExcuse` mazeret dilekçesi bağlı), %5 Devamsız (`ABSENT`).
   - **Günlük Takip:** Son 3 iş günü (15, 16, 17 Ekim) için 20 öğrencinin tamamına karneler: ruh hali, sabah/öğle/ikindi yemek durumu, uyku saat ve kalitesi, tuvalet kayıtları ve MEB kazanımlı öğretmen notları.

4. **Sağlık & Güvenlik Modülleri (İlaç, Olay/Revir, Teslimat):**
   - **İlaç Takibi:** 6 gerçekçi reçeteli ilaç kaydı (`medication_records`); farklı durumlarda: `REQUESTED` (veli talebi bekleyen), `APPROVED` (onaylı), `GIVEN` (verilmiş), `SKIPPED` (öğrenci uyuduğu için atlanmış).
   - **Olay / Revir:** 5 gerçekçi revir/kaza kaydı (`incident_records`); kategoriler: `DUSME`, `YARALANMA`, `HASTALIK`, `KAZA`, `DAVRANIS`; revir müdahalesi ve veli bildirim saatleri.
   - **Teslimat:** 20 öğrenci için tanımlı `pickup_contacts`, 4 adet tekil/süreli teslimat izni (`pickup_authorizations` - Onaylı ve Bekleyen), 8 adet gerçekleşmiş teslim tutanağı (`pickup_events` - `ID_CHECK`, `KNOWN_FACE`, `PHONE_CONFIRM`, `OTHER`).

5. **İletişim & Sosyal Modüller (Mesajlaşma & Galeri):**
   - **Mesajlaşma:** 6 farklı sohbet oturumu (`conversations`), 20+ mesaj (`messages`), okundu makbuzları (`message_read_receipts`), Veli-Öğretmen ve Veli-Yönetim konuları (`SAGLIK`, `IZIN`, `TESLIM`, `GUNLUK_BILGI`, `ODEME`), 1 adet acil durum bayraklı mesaj.
   - **Galeri:** 4 adet zengin etkinlik paylaşımı (`activity_posts`) etiketli öğrenciler ve görsellerle.

6. **Eğitim, Portfolyo & Menü Modülleri:**
   - **Yemek Menüsü:** 12 - 17 Ekim 2026 (Pazartesi - Cumartesi) haftalık zengin yemek menüsü (`daily_menus`), alerjen listeleri, kalori değerleri ve diyet uyarıları.
   - **Gelişim & Portfolyo:** 12 adet MEB gelişim gözlemi (`development_observations` - Motor, Dil, Sosyal-Duygusal, Bilişsel, Öz Bakım, Sanat) ve 8 adet fotoğraflı öğrenci çalışması (`portfolio_items`).

7. **Finans & İzinler:**
   - **Finans:** 20 öğrenci için aidat planı (`student_billing_plans`), Eylül ayı tamamı ödenmiş dekontlu faturalar, Ekim ayı karma faturalar (10 Ödenmiş, 6 Bekleyen, 4 Gecikmiş borç), Kasım ayı bekleyen faturalar.
   - **İzinler:** 2 Etkinlik İzni (`event_consents` - Doğa Gezisi ve Tiyatro), veli onay ve mazeretli ret yanıtları (`event_consent_responses`), 6 veli devamsızlık mazeret izni (`attendance_excuses`), 4 veli talebi (`parent_requests`).

## Acceptance Criteria

- [x] AC-1: `packages/database/prisma/seed.ts` hatasız derlenmeli ve `pnpm --filter @kidscare/database db:seed` tek komutta sıfır hata ile tamamlanmalıdır.
- [x] AC-2: Tüm temizleme adımları atomik transaction içinde çalışmalı, FK constraint ihlali yaşanmamalıdır.
- [x] AC-3: Admin panelindeki 12 menü ekranının tamamında (Öğrenciler, Sınıflar, Yoklama, Günlük Takip, İlaç, Olay/Revir, Teslimat, Mesajlaşma, Finans, Yemek Menüsü, Portfolyo, İzinler/Talepler) zengin veriler listelenmelidir.
- [x] AC-4: Sabit demo kullanıcıları (`superadmin@demo.test`, `admin@demo.test`, `teacher@demo.test`, `parent@demo.test`, `service@demo.test`) şifreleriyle (`KidsCare.2026!`) sorunsuz giriş yapabilmelidir.
- [x] AC-5: `./scripts/check.ps1` testi eksiksiz ve yeşil geçmelidir.

## Preserved Behavior

- [x] PB-1: `superadmin@demo.test`, `admin@demo.test`, `teacher@demo.test`, `parent@demo.test` varsayılan giriş e-postaları ve şifreleri değişmeden korunmalıdır.
- [x] PB-2: Mevcut RLS (Multi-tenancy tenant_id) ve Prisma şeması bütünlüğü bozulmamalı, hiçbir şema değişikliği yapılmamalıdır.

## Definition of Done

- [x] `packages/database/prisma/seed.ts` güncellendi ve başarıyla seed çalıştırıldı.
- [x] `./scripts/check.ps1` yeşil geçti.
- [x] Şartname tamamlanıp `specs/done/` dizinine taşındı.
