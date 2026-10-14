# Uygulama Planı 0039: QA 4. Etap — Pedagojik Bildirimler & İzolasyon

## Hedef

QA Geri bildirim matrisindeki 20, 21 ve 22 numaralı maddelerin eksiksiz çözülmesi ve doğrulanması.

## Adımlar

1. **Adım 1 — Pedagojik Gözlem Bildirimi (Madde 20):**
   - `DevelopmentService` içine `NotificationsService` enjekte edilecek (`@Inject(NotificationsService)`).
   - `createObservation` fonksiyonunda öğrenci bulunup (`parentId`), veliye `"Yeni Gelişimsel Gözlem Eklendi"` başlıklı bildirim kaydedilecek.
   - `development.service.spec.ts` testi güncellenecek / oluşturulacak.
2. **Adım 2 — Öğretmen Sınıf İzolasyonu (Madde 21):**
   - `ClassroomsController.list` endpoint'ine `@CurrentUser() user: CurrentUserPayload` parametresi eklenecek.
   - `ClassroomsService.list` içinde: Eğer `user?.role === 'TEACHER'`, `ClassroomTeacher` tablosu sorgulanarak sadece öğretmenin atandığı sınıflar dönülecek.
   - Admin ve Superadmin için tüm sınıflar dönmeye devam edecek.
3. **Adım 3 — Veli Sınıf İzolasyonu (Madde 22):**
   - Veli portalında sınıf bilgileri sadece çocuğunun sınıfı olarak kilitlenecek, gereksiz dropdown seçenekleri temizlenecek.
4. **Adım 4 — Kalite Kapısı & CSV Güncellemesi:**
   - `./scripts/check.ps1` kanıtı alınacak.
   - `KidsCare_QA_Son_Durum.csv` ve `qa-field-feedback-matrix.md` güncellenecek.
   - Git commit atılacak.
