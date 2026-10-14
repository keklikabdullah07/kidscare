# Şartname 0038: QA 3. Etap — Görünüm Hiyerarşisi, Galeri İzolasyonu & Mobilde Sınıf Yönetimi

## 1. Amaç & Kapsam

Saha QA tablosundaki (Google Sheets) 3. Etap maddelerini çözüme kavuşturmak:

1. **Madde 16 (Mobilde Yeni Sınıf Ekleme):** Mobil tarayıcıda kreş müdürü için sınıf oluşturma aksiyonunun erişilebilir olması, API'ye `createClassroom` fonksiyonunun eklenmesi ve responsive düzen.
2. **Madde 17 (Öğrenci Yönetiminde Sınıf Hiyerarşisi):** Admin öğrenciler sayfasına girdiğinde doğrudan düz liste yerine önce interaktif Sınıf Kartları hiyerarşisiyle karşılaşması ve sınıf bazlı odaklanma sağlaması.
3. **Madde 18 (Veli Aktivite & Galeri İzolasyonu):** Velinin diğer sınıfların veya yabancı öğrencilerin etkinliklerini görmesinin engellenmesi; sadece çocuğunun sınıfına, çocuğunun etiketlendiği etkinliklere veya genel kreş duyurularına erişebilmesi.
4. **Madde 19 (Veli Portalında Olay / Kaza Kayıtları):** Veli portalında çocuğuna ait olay/kaza kayıtlarının (Incidents) ve sağlık bildirim kartının görüntülenmesi.

## 2. Etkilenen Bileşenler

- `apps/admin-web/src/api/classrooms.ts` (`createClassroom` fonksiyonu)
- `apps/admin-web/src/features/students/StudentsPage.tsx` (Yeni Sınıf Ekle modalı, mobilde responsive butonlar, sınıf kartları hiyerarşisi)
- `apps/api/src/modules/activities/services/activities.service.ts` & `controllers/activities.controller.ts` (Veli rolü için sınıf/çocuk izolasyonu)
- `apps/admin-web/src/features/activities/ActivityGalleryPage.tsx` (Veli arayüzünde sadece kendi sınıfının filtreleri)
- `apps/admin-web/src/features/parent/ParentDashboardPage.tsx` (Olay/Kaza kayıtları kartı ve bildirimi)
- `apps/admin-web/src/api/incidents.ts` (Veli portalı için öğrenci bazlı olay sorgusu)

## 3. Doğrulama Kriterleri

- TypeScript (`tsc --noEmit`) 0 hata.
- ESLint (`pnpm lint`) 0 hata.
- Vitest & Jest (`pnpm test`) %100 yeşil.
- `docs/KidsCare_QA_Son_Durum.csv` güncellenmesi.
