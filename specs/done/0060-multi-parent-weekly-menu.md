# Şartname 0060: 1 Öğrenciye 2 Veli Ataması ve Haftalık Yemek Menüsü Planlayıcı (Paket 3)

## 1. Amaç ve Kapsam

Bu şartname iki kritik kreş operasyonel gereksinimini karşılar:

1. **1 Öğrenciye 2 Veli Atanabilmesi (Çoklu Veli Desteği):**
   - Kreşlerde bir çocuğun hem annesi hem de babası (veya iki velisi) ayrı KidsCare hesaplarına sahip olabilir. Her iki veli de öğrencinin karnesini, yoklamasını, fotoğraflarını ve ilaç takibini kendi mobil/web oturumlarından bağımsız olarak takip edebilmelidir.
   - Öğrenci kayıt/düzenleme formunda hem "1. Veli (Örn. Anne)" hem de "2. Veli (Örn. Baba)" seçilebilir olacaktır.
   - Backend `student-access.ts` ve `StudentsService.findByParent`, ikinci veliyi (`passport.secondaryParentId`) tam yetkili veli olarak tanıyarak veri izolasyonunu sağlayacaktır.
2. **Haftalık Yemek Menüsü Planlama & Takvim Görünümü:**
   - Yemek menüsü ekranında (`/daily-menus`) günlük tek tek geçişin yanı sıra **"Haftalık Menü Planlayıcı (Pazartesi - Cuma)"** görünümü eklenecektir.
   - Haftanın 5 günü tek ekranda tablo/grid olarak görülebilecek, her günün sabah, öğle ve ikindi menüleri hızlıca girilip kaydedilebilecektir.
   - Haftalar arasında (Önceki Hafta, Sonraki Hafta, Bu Hafta) geçiş yapılabilecektir.

---

## 2. Etkilenen Dosyalar ve Bileşenler

- **Backend / Shared:**
  - `packages/shared-types/src/student.ts` (secondaryParentId alanı)
  - `packages/shared-schemas/src/student.ts` (secondaryParentId validasyonu)
  - `apps/api/src/common/utils/student-access.ts` (secondaryParentId yetkilendirme doğrulaması)
  - `apps/api/src/modules/students/services/students.service.ts` (findByParent içinde secondaryParentId sorgusu)
- **Web Paneli:**
  - `apps/admin-web/src/features/students/StudentsPage.tsx` (1. ve 2. veli seçimi, kartlarda her iki velinin gösterimi)
  - `apps/admin-web/src/features/students/StudentPassportModal.tsx` (2. veli seçimi)
  - `apps/admin-web/src/features/daily-menus/DailyMenuPage.tsx` (Haftalık görünüm modu, Pazartesi-Cuma gridi, haftalık menü yükleme ve kaydetme)
  - `apps/admin-web/src/features/daily-menus/WeeklyMenuView.tsx` (Haftalık takvim bileşeni)

---

## 3. Kabul Kriterleri (Acceptance Criteria)

1. **AC-1 (Çoklu Veli API):** Bir öğrenciye `secondaryParentId` atandığında, 2. veli de `/parent` endpoint'lerinden çocuğunu görebilmeli ve yetki hatası (ForbiddenException) almamalıdır.
2. **AC-2 (Çoklu Veli UI):** Öğrenci ekleme/düzenleme formunda iki ayrı veli seçici dropdown bulunmalıdır ("1. Veli" ve "2. Veli").
3. **AC-3 (Haftalık Menü Görünümü):** Yemek menüsü sayfasında "📅 Günlük" ve "🗓️ Haftalık Planlama" sekmeleri bulunmalıdır. Haftalık modda Pazartesi-Cuma 5 günlük menü tek ekranda listelenmelidir.
4. **AC-4 (Haftalık Navigasyon):** Haftalık görünümde önceki hafta, sonraki hafta ve bu haftaya geçiş yapılabilmeli; o haftaya ait menüler `/daily-menus/range` ile yüklenmelidir.
5. **AC-5 (Kalite Kapısı):** `./scripts/check.ps1` %100 yeşil tamamlanmalıdır.
