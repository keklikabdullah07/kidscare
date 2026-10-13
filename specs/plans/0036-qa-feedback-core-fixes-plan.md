# Uygulama Planı 0036 — Saha & Öğretmen QA Bildirimleri Çekirdek Onarımları

## 1. Mimari İnceleme ve Kök Neden Analizi

1. **İlaç Tarih İzolasyonu (Bug Satır 33):**
   - Sorun: `ParentDashboardPage.tsx` içinde `listMedicationRecords(currentChildId)` çağrılıyor ama seçili tarih (`selectedDate`) aktarılmıyor veya filtre uygulanmıyor. Ayrıca backend'de `MedicationRepository.list` tarih parametresi alsa da gün bazlı `scheduledAt` aralığı zorunlu tutulmuyor.
   - Çözüm: `ParentDashboardPage` üzerinde `selectedDate` başlangıç (00:00:00) ve bitiş (23:59:59) olarak `listMedicationRecords`'a aktarılacak veya gelen kayıtlar seçili günün tarihiyle filtrelenecek.
2. **Karnede Otomatik İlaç Listesi (UX Satır 31):**
   - Sorun: `DailyReportEditorModal.tsx` açıldığında `setMedications([])` yapılıyor.
   - Çözüm: Modal açılırken öğrencinin aktif ilaç kayıtları (`listMedicationRecords(studentId)`) ve pasaportundaki düzenli ilaçları (`student.passport?.regularMedications`) okunup `medications` state'ine otomatik aktarılacak.
3. **İlaçta Öğrenci Adı ve Yetki (Satır 12, 32):**
   - Sorun: `MedicationRepository` `student` tablosunu join etmiyor; `MedicationController.approve` içinde `TEACHER` rolü eksik.
   - Çözüm: Repository sorgusuna `student: { select: { id: true, firstName: true, lastName: true } }` eklenecek, `MedicationController.approve` rolüne `'TEACHER'` eklenecek.
4. **Veli Teslimatçıları 403 Hatası (Bug Satır 25):**
   - Sorun: `PickupController.listAuthorizations` endpoint'inde `@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')` var; `PARENT` eksik.
   - Çözüm: `@Roles` içine `'PARENT'` eklenecek ve velinin sadece kendi çocuğunun yetkilerini listelemesi güvenceye alınacak.
5. **Öğrenci Sınıf Atama Kaydetmeme (Bug Satır 30):**
   - Sorun: `StudentsService.create` ve `StudentsService.update` içinde `input.classroomId` Prisma data nesnesine atanmıyor.
   - Çözüm: `data.classroomId = input.classroomId` (veya connect/disconnect) eklenecek.
6. **Mesajlaşmada Veli Adı (Bug Satır 15):**
   - Sorun: `MessagingRepository` `sender` ve `student` modellerini join etmiyor.
   - Çözüm: Repository sorgularına `sender: { select: { id: true, firstName: true, lastName: true, role: true } }` ve `student: { select: { id: true, firstName: true, lastName: true } }` eklenecek.

---

## 2. Adım Adım Değişiklik Listesi

### Adım 1: Backend Düzeltmeleri

1. `apps/api/src/modules/students/services/students.service.ts`:
   - `create` ve `update` fonksiyonlarında `classroomId` alanını ekle.
2. `apps/api/src/modules/pickup/controllers/pickup.controller.ts`:
   - `listAuthorizations` endpoint'ine `'PARENT'` rolünü ekle.
3. `apps/api/src/modules/medication/controllers/medication.controller.ts`:
   - `approve` endpoint'ine `'TEACHER'` rolünü ekle.
4. `apps/api/src/modules/medication/repositories/medication.repository.ts`:
   - `MEDICATION_SELECT` içine `student: { select: { id: true, firstName: true, lastName: true } }` ekle.
5. `apps/api/src/modules/messaging/repositories/messaging.repository.ts`:
   - `CONVERSATION_SELECT` ve `MESSAGE_SELECT` içine `sender` ve `student` bilgilerini ekle.

### Adım 2: Frontend Düzeltmeleri

1. `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`:
   - İlaçları seçili güne (`selectedDate`) göre filtrele veya tarihli sorgula.
2. `apps/admin-web/src/features/daily-reports/DailyReportEditorModal.tsx`:
   - Modal açıldığında öğrencinin onaylı ilaçlarını otomatik çekip `medications` listesine doldur.
3. `apps/admin-web/src/features/medication/MedicationPage.tsx`:
   - İlaç kartlarında backend'den gelen `student` adını doğrudan kullan.
4. `apps/admin-web/src/features/messages/`:
   - Sohbet listesi ve mesaj balonlarında veli adını (`sender.firstName sender.lastName`) göster.

### Adım 3: Testler & Doğrulama

1. Birim ve servis testlerini güncelle/ekle (`students.service.spec.ts`, `pickup.controller.spec.ts`, `medication.service.spec.ts`).
2. `./scripts/check.ps1` komutunu çalıştırarak sıfır hata ile doğrula.
