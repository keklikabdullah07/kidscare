# Uygulama Planı 0036 — Saha QA Kritik Hatalar Paketi 1 (Batch 1)

## 1. Mimari Kök Neden Analizi ve Değişiklik Haritası

### 1.1 Yemek Menüsü 500 Hatası & Yetki Kısıtlaması

- **Dosya 1:** `apps/api/src/modules/daily-menus/services/daily-menus.service.ts`
  - **Hata:** `constructor(..., private readonly allergenMatcher: AllergenMatcher)` satırında `@Inject(AllergenMatcher)` yok. NestJS `tsx watch` altında reflection tipleri kaybolduğu için `allergenMatcher` runtime'da `undefined` oluyor ve menü kaydedilirken/çekilirken 500 hatası fırlatıyor.
  - **Çözüm:** `@Inject(AllergenMatcher)` eklenmesi.
- **Dosya 2:** `apps/admin-web/src/features/daily-menus/DailyMenuPage.tsx`
  - **Hata:** `const canEdit = authState.status === 'authenticated' && authState.user.role !== 'PARENT';` (Öğretmen de düzenleyebiliyor).
  - **Çözüm:** `const canEdit = authState.status === 'authenticated' && (authState.user.role === 'ADMIN' || authState.user.role === 'SUPER_ADMIN');` olarak sınırlandırılması.

### 1.2 Öğrenci Sınıf Atama Kaydetmeme Hatası

- **Dosya 3:** `apps/api/src/modules/students/services/students.service.ts`
  - **Hata:** `create` ve `update` fonksiyonlarında `input.classroomId` Prisma data nesnesine atanmıyor.
  - **Çözüm:**
    - `create`: `classroomId: input.classroomId ?? null,`
    - `update`:
      ```ts
      if (input.classroomId !== undefined) {
        if (input.classroomId) {
          data.classroom = { connect: { id: input.classroomId } };
        } else {
          data.classroom = { disconnect: true };
        }
      }
      ```

### 1.3 Veli Teslimatçıları 403 Erişim Engeli

- **Dosya 4:** `apps/api/src/modules/pickup/controllers/pickup.controller.ts`
  - **Hata:** `@Get('authorizations')` üzerinde `@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')` var.
  - **Çözüm:** `@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')` eklenmesi. Veli rolündeki kullanıcı için `studentId` parametresi doğrulanarak yetki listesi döndürülmesi.

### 1.4 Öğretmenin Veli Talebini Onaylayamaması

- **Dosya 5:** `apps/admin-web/src/features/messages/ParentRequestsPage.tsx`
  - **Hata:** Onay/Reddet butonları `(role === 'ADMIN' || role === 'SUPER_ADMIN')` içine alınmış.
  - **Çözüm:** `(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TEACHER') && r.status === 'PENDING'` yapılması.

### 1.5 İlaç Takibi Günlük Sıfırlanma & Karnede Otomatik İlaç

- **Dosya 6:** `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`
  - **Hata:** İlaçlar çekilirken seçili gün (`selectedDate`) filtrelenmiyor; dünün `GIVEN` ilacı bugünde de görünmeye devam ediyor.
  - **Çözüm:** Veli portalında ilaç listesi `selectedDate` gününün başlangıç ve bitişine göre filtrelenecek. Düzenli/sürekli ilaçlar ile tek seferlik ilaçlar ayrılacak.
- **Dosya 7:** `apps/admin-web/src/features/daily-reports/DailyReportEditorModal.tsx`
  - **Hata:** Modal açıldığında ilaç listesi boş kalıyor.
  - **Çözüm:** Modal açıldığında öğrencinin onaylı ilaç kayıtları çekilip karneye başlangıç verisi olarak yüklenecek.

---

## 2. Sıralı İşlem Adımları (Execution Steps)

1. **Backend Düzeltmeleri:**
   - `DailyMenusService` içine `@Inject(AllergenMatcher)` ekle.
   - `StudentsService` içine `classroomId` aktarımını ekle (`create` ve `update`).
   - `PickupController` `listAuthorizations` endpoint'ine `'PARENT'` rolünü ekle.
2. **Frontend Düzeltmeleri:**
   - `DailyMenuPage.tsx` içinde öğretmen için düzenleme yetkisini kapat.
   - `ParentRequestsPage.tsx` içinde öğretmen için Onayla/Reddet butonlarını aç.
   - `ParentDashboardPage.tsx` içinde ilaçların gün filtresini ekle.
   - `DailyReportEditorModal.tsx` içinde öğrencinin mevcut ilaçlarını otomatik çekip listele.
3. **Birim Testleri & Doğrulama:**
   - `students.service.spec.ts` testinde `classroomId` güncellemesini doğrula.
   - `daily-menus.service.spec.ts` ve controller testlerini doğrula.
   - `pickup.controller.spec.ts` testini doğrula.
   - `./scripts/check.ps1` çalıştırıp sıfır TypeScript/Lint/Test hatası kanıtını al.
