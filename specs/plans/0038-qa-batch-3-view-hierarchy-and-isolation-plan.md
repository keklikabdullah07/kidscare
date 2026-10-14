# Uygulama Planı 0038: QA 3. Etap — Görünüm Hiyerarşisi, Galeri İzolasyonu & Mobilde Sınıf Yönetimi

## Adım 1: Sınıf API ve Modal Entegrasyonu (Madde 16)

1. `apps/admin-web/src/api/classrooms.ts` içine `createClassroom({ name, ageGroup })` ekle.
2. `StudentsPage.tsx` içine:
   - Kreş müdürü (`ADMIN`/`SUPER_ADMIN`) için `+ Yeni Sınıf` butonu ve modalı ekle.
   - Buton alanını `flex-wrap` ve mobil uyumlu hale getir (`md:flex-nowrap`).

## Adım 2: Öğrenci Yönetiminde Sınıf Kartları Hiyerarşisi (Madde 17)

1. `StudentsPage.tsx` içinde sayfanın üstüne "Sınıf Hiyerarşisi" kartları ekle:
   - [Tüm Öğrenciler (Top. N)]
   - Her sınıf için dokunsal kart: Sınıf Adı, Yaş Grubu, Kayıtlı Öğrenci Sayısı.
   - Sınıfsız Öğrenciler (varsa).
2. Tıklanan sınıf `selectedClassroomId` state'ine atanır ve liste anında o sınıfa göre filtrelenir.

## Adım 3: Aktivite & Galeri İzolasyonu (Madde 18)

1. `apps/api/src/modules/activities/controllers/activities.controller.ts`:
   - `@CurrentUser() user: CurrentUserPayload` parametresini `list` metoduna ekle.
2. `apps/api/src/modules/activities/services/activities.service.ts`:
   - Eğer `user.role === 'PARENT'` ise velinin çocuklarının kayıtlı olduğu sınıfları ve öğrenci ID'lerini veritabanından çek.
   - Veliye yalnızca kendi çocuğunun sınıfına ait (`classroom === studentClassroom`), etiketlendiği (`taggedStudentIds`) veya genel kreş aktivitelerini döndür.
3. `apps/admin-web/src/features/activities/ActivityGalleryPage.tsx`:
   - Veli görünümünde sınıf etiketini kendi çocuğunun sınıfına sabitle ve diğer sınıfların filtrelerini gizle.

## Adım 4: Veli Portalında Olay / Kaza Kayıtları (Madde 19)

1. `apps/admin-web/src/api/incidents.ts` kontrolü: `listIncidents` fonksiyonunu doğrula.
2. `ParentDashboardPage.tsx` içine:
   - Seçili çocuğun olay kayıtlarını (`incidents`) çek ve state'e bağla.
   - Eğer çocuğun bugün veya son dönemde veliye bildirilmiş (`parentNotified: true`) bir olayı varsa, sayfanın üstünde dikkat çekici bir "🚨 Olay & Sağlık Bildirimi" kartı göster (Kategori, Açıklama, Alınan Tedbir, Saat).
   - "Geçmiş Olay Kayıtları" modalini/açılır listesini ekle.

## Adım 5: Kalite Kapısı ve Doğrulama

1. `./scripts/check.ps1` koştur (TypeScript + ESLint + Testler).
2. `docs/KidsCare_QA_Son_Durum.csv` içinde ilgili satırları `✅ YAPILDI` olarak güncelle.
3. Git commit oluştur.
