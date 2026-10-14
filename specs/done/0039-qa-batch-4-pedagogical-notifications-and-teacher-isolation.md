# Şartname 0039: QA 4. Etap — Pedagojik Gözlem Bildirimleri & Öğretmen/Veli Sınıf İzolasyonu

## 1. Problem Tanımı

Gerçek saha testlerinde öğretmen ve velilerden gelen son grup kritik geri bildirimler:

1. **Madde 20 (Pedagojik Gözlem Bildirimi):** Öğretmen bir öğrenciye gelişimsel/pedagojik gözlem (`DevelopmentObservation`) kaydettiğinde, veli portalında gözlem görünmesine rağmen velinin bildirim merkezine (`Notifications`) ve paneline "Çocuğunuz için yeni bir pedagojik gelişim gözlemi eklendi" bildirimi gitmiyor.
2. **Madde 21 (Öğretmen Sınıf İzolasyonu):** Öğretmen panelinde (`StudentsPage`, `DailyTrackingPage`) sınıflar listelenirken kreşteki tüm sınıflar görünebiliyor; öğretmenin yalnızca sorumlu olduğu / atandığı sınıfı (`ClassroomTeacher`) görmesi ve sadece kendi sınıfının öğrencilerini yönetmesi isteniyor.
3. **Madde 22 (Veli Sınıf & Öğrenci İzolasyonu):** Veli panelinde ve filtreleme alanlarında diğer sınıfların veya kreşin yabancı sınıf listelerinin dropdown'larda görünmemesi, velinin sadece çocuğunun sınıfı ve öğrenci bilgileriyle sınırlandırılması gerekiyor.

## 2. Kapsam ve Değişiklikler

- **Backend:**
  - `apps/api/src/modules/development/services/development.service.ts`:
    - Gözlem oluşturulduğunda (`createObservation`), öğrencinin `parentId`'si kontrol edilerek `NotificationsService.sendNotification` veya `prisma.notification.create` tetiklenecek.
  - `apps/api/src/modules/students/controllers/students.controller.ts` & `services/students.service.ts`:
    - `TEACHER` rolü için sınıf listeleme veya öğrenci filtreleme sorgularında öğretmenin atandığı sınıfların ID'leri alınacak.
  - `apps/api/src/modules/classrooms/controllers/classrooms.controller.ts`:
    - `TEACHER` rolü girdiğinde sadece atandığı sınıfların listelenmesi (veya öğretmen için `assignedOnly` filtresi).
- **Web Paneli:**
  - `apps/admin-web/src/features/students/StudentsPage.tsx`:
    - Öğretmen rolü için sınıf kartlarında ve öğrenci listesinde sadece atandığı sınıfın gösterilmesi.
  - `apps/admin-web/src/features/daily-reports/DailyTrackingPage.tsx`:
    - Öğretmen giriş yaptığında varsayılan olarak kendi sınıfının seçili gelmesi ve yabancı sınıfların kısıtlanması.

## 3. Kabul Kriterleri (Acceptance Criteria)

1. Öğretmen gelişim gözlemi kaydettiğinde veli kullanıcısına anında sistem içi bildirim (`NOTIFICATION`) oluşturulmalıdır.
2. Öğretmen rolündeki kullanıcı `StudentsPage` ve `DailyTrackingPage` sayfalarında sadece yetkili olduğu sınıfları görmelidir.
3. Veli arayüzünde sadece kendi çocukları ve kayıtlı oldukları sınıf bilgisi yer almalıdır.
4. `./scripts/check.ps1` sıfır hata ile geçmelidir.
