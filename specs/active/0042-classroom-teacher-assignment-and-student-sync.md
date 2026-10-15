# 0042 — Yeni Sınıf Öğretmen Ataması & Öğrenci Sınıf Senkronizasyonu

## 1. Kapsam ve Gerekçe

Google E-Tablo QA tablosundaki 15 Ekim tarihli iki kritik yönetici geri bildirimi:

1. **Yeni Sınıf Açılışında Öğretmen Atama Eksikliği:** Admin panelinde `+ Yeni Sınıf` modalında yalnızca sınıf adı ve yaş grubu alınmakta, sorumlu sınıf öğretmeni atanamamaktadır.
2. **Öğrenci Sınıf Güncelleme Senkronizasyon Hatası:** Öğrencinin sınıfı düzenlendiğinde veritabanında güncellenmesine rağmen `StudentsController.toResponse` fonksiyonunda `classroomId` alanı unutulduğu için frontend'e dönen `updated` nesnesinde `classroomId` `undefined` kalmakta ve üstteki sınıf kartları ile hiyerarşik filtre güncellenmemektedir.

## 2. Kullanıcı Hikayeleri

- **Yönetici (Admin):** `+ Yeni Sınıf` modalını açtığında kurumdaki öğretmenlerin listesini bir dropdown'da (`select`) görebilmeli, isterse hemen bir öğretmen seçerek sınıfı açabilmeli ve öğretmen anında o sınıfa atanmalıdır.
- **Yönetici (Admin):** Bir öğrencinin sınıfını değiştirdiğinde, öğrenci kaydedilir kaydedilmez üstteki sınıf kartlarında, öğrenci kartı rozetinde ve filtrelerde anında yeni sınıfına geçmiş olarak görebilmelidir.

## 3. İlgili Dosyalar

- API: `apps/api/src/modules/students/controllers/students.controller.ts` (`toResponse` fonksiyonuna `classroomId: s.classroomId` eklenmesi)
- Web API İstemcisi: `apps/admin-web/src/api/classrooms.ts` (`assignTeacherToClassroom` fonksiyonu)
- Web UI: `apps/admin-web/src/features/students/StudentsPage.tsx` (`handleCreateClassroom` ve `StudentFormModal` senkronu)
- QA Tablosu: Satır 27 & 28
