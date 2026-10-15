# KidsCare Devir Teslim Notu (Yeni Sohbete Geçiş)

> **Tarih:** 2026-10-15  
> **Aktif Branş:** `developer` (Yerel commitler atıldı, kesinlikle push edilmedi)  
> **Son Durum:** ANEW %100 Yeşil Kalite Kapısı (`check.ps1` onaylı)

---

## 1. Tamamlanan Son İşler

1. **Spec 0041 (Geziler & İzin Yönetimi / Etkinlikler Hub):**
   - Web panelinde `/events` rotası 3 rol için (Admin, Öğretmen, Veli) `Etkinlikler & İzinler` çatı sayfası olarak tamamlandı.
   - 3 Master Tab: `Dış Geziler (İzin & Servis)`, `Okul İçi Etkinlikler`, `Genel İzin & Onay Formları`.
   - `specs/active/0040` ve `0041` tamamlanıp `specs/done/` klasörüne arşivlendi.
2. **Kural Güncellemesi (AGENTS.md):**
   - 5. Değişmez kural olarak **"Zero flattery & Brutal honesty (Sıfır Pohpohlama & Dobra Ürün Filtresi)"** eklendi.
3. **Google E-Tablo QA Entegrasyonu:**
   - Webhook entegrasyonu sağlandı: `https://script.google.com/macros/s/AKfycbzor7XX4Yel5Sey042fb90z_zziYnRRJBh6xpzld31XE8cs2iBnb9WLYppEk3PiSF83tQ/exec`
   - Tablodaki 28 satırın tümüne 10. sütun (Durum) ve 11. sütun (Öğretmen dostu çözüm özeti) yazıldı.

---

## 2. Yeni Sohbette Doğrudan Başlanacak İş (Spec 0042)

Google E-Tablo'daki 15 Ekim tarihli son 2 yeni madde için şartname ve plan hazırlandı:

- **Şartname:** `specs/active/0042-classroom-teacher-assignment-and-student-sync.md`
- **Plan:** `specs/plans/0042-classroom-teacher-assignment-and-student-sync-plan.md`

### Çözülecek 2 Madde:

1. **Öğrenci Sınıf Senkronu (Satır 28):**
   - `apps/api/src/modules/students/controllers/students.controller.ts` dosyasında `toResponse` içine `classroomId: s.classroomId` eklenecek.
2. **Yeni Sınıfa Öğretmen Atama (Satır 27):**
   - `apps/admin-web/src/api/classrooms.ts` içine `assignTeacherToClassroom` eklenecek.
   - `StudentsPage.tsx` üzerindeki `+ Yeni Sınıf` modalına öğretmen seçici dropdown eklenecek ve sınıf açılınca öğretmen atanacak.
3. **Doğrulama & Güncelleme:**
   - `.\scripts\check.ps1` yeşil kanıtı alınacak.
   - Webhook ile Google Sheet'teki 27 ve 28. satırlar `✅ Çözüldü` yapılacak.
   - Yerel commit atılacak (**ASLA PUSH YAPILMAYACAK**).
