# Uygulama Planı 0037 — Saha QA 2. Etap: İletişim, İsimler ve Veri Köprüsü (Batch 2)

## 1. Mimari İnceleme ve Kök Neden Analizi

### 1.1 Mesajlaşmada Veli ve Öğrenci Adı (Tablo Satır 15)

- **Backend:** `apps/api/src/modules/messaging/repositories/messaging.repository.ts`
  - `CONVERSATION_SELECT` içine:
    - `student: { select: { id: true, firstName: true, lastName: true } }`
    - `createdBy: { select: { id: true, firstName: true, lastName: true, role: true } }`
    - `participants: { select: { userId: true, user: { select: { id: true, firstName: true, lastName: true, role: true } } } }`
  - `MESSAGE_SELECT` içine:
    - `sender: { select: { id: true, firstName: true, lastName: true, role: true } }`
- **Frontend:** `apps/admin-web/src/features/messages/MessagesPage.tsx`
  - Sohbet listesinde ve mesaj başlığında veli adı ve öğrenci adı gösterilecek.

### 1.2 İlaç Takibinde Öğrenci Adı (Tablo Satır 32)

- **Backend:** `apps/api/src/modules/medication/repositories/medication.repository.ts`
  - `MEDICATION_SELECT` içine `student: { select: { id: true, firstName: true, lastName: true } }` eklenecek.
- **Frontend:** `apps/admin-web/src/features/medication/MedicationPage.tsx`
  - İlaç kartlarının başlığına belirgin öğrenci rozeti ve ismi yerleştirilecek.

### 1.3 İlaç Formunda Doz Vakitleri & Veli İlaç Yönetimi (Tablo Satır 26)

- **Frontend:** `apps/admin-web/src/features/parent/ParentDashboardPage.tsx` ve `MedicationPage.tsx`
  - Modal formuna `Sabah (09:00)`, `Öğle (13:00)`, `İkindi (16:00)` hızlı butonları eklenecek.
  - Veli portalına ilacı silme (`deleteMedicationRecord`) ve düzenleme aksiyonu eklenecek.

### 1.4 Pasaport Yetkilileri ➔ Teslimat Köprüsü (Tablo Satır 11)

- **Frontend:** `apps/admin-web/src/features/pickup/PickupPage.tsx` ve `ParentDashboardPage.tsx`
  - Öğrencinin pasaportunda `passport.emergencyContacts` listesinde `isAuthorizedPickup: true` işaretli olan kişiler, teslimat onay/yetkili listesinde otomatik olarak birleştirilerek öğretmene gösterilecek.

### 1.5 Teslimat Ekranında Reaktif Öğrenci Seçimi (Tablo Satır 17)

- **Frontend:** `apps/admin-web/src/features/pickup/PickupPage.tsx`
  - Öğrenci seçildiğinde (`selectedStudentId`), ilgili öğrencinin yetkili kişileri, alerji uyarıları ve teslimat geçmişi reaktif olarak güncellenecek.

---

## 2. Sıralı İşlem Adımları

1. **Backend Repository & DTO Güncellemeleri:**
   - `MedicationRepository.ts`: `student` ilişkisi ekle.
   - `MessagingRepository.ts`: `sender`, `student`, `participants.user` ilişkilerini ekle.
2. **Frontend UI & Entegrasyon Güncellemeleri:**
   - `MessagesPage.tsx`: Sohbet başlığında ve listesinde veli & öğrenci adını göster.
   - `MedicationPage.tsx`: İlaç kartına öğrenci adını belirginleştir, hızlı vakit butonları ekle.
   - `ParentDashboardPage.tsx`: Veli ilaç formuna hızlı vakit butonları ve silme aksiyonu ekle.
   - `PickupPage.tsx`: Pasaport acil yetkililerini teslimat listesine bağla ve öğrenci seçimini reaktif kıl.
3. **Doğrulama & Test:**
   - Birim testlerini güncelle/çalıştır.
   - `./scripts/check.ps1` ile sıfır hata ve %100 kalite kapısını onayla.
