# Şartname 0054: Rol Bazlı Galeri/Teslimat İzolasyonu, Sınıf Filtreleri ve Öğrenci Kartı Bilgi Standartlaşması

## 1. Problem Tanımı ve Saha İhtiyacı

Kreş günlük operasyonlarında yönetici, öğretmen ve veli etkileşimlerinin hızlandırılması ve veri gizliliği (KVKK/çocuk mahremiyeti) için şu kritik ihtiyaçlar belirlenmiştir:

1. **Etkinlik Galerisi Filtreleme ve Öğretmen İzolasyonu:**
   - Mevcut durumda galeride tarih ve sınıf filtresi eksiktir.
   - Öğretmenin yalnızca kendi atandığı sınıfın etkinlik fotoğraflarını görmesi ve yüklemesi gerekirken, yöneticinin tüm sınıflar arasında tarih/sınıf bazlı filtreleme yapabilmesi gerekmektedir.
2. **Teslimat Kontrolünde Sınıf Ayrımı:**
   - Akşam teslimat saatinde (17:00-18:30) kapıdaki görevli veya yöneticinin tüm kreş karma listesi yerine sınıf sekmeleriyle (örn. "Papatyalar", "Kelebekler") filtreleme yaparak öğrenciyi hızlıca bulması gerekmektedir.
3. **Öğrenci Bilgi Kartlarında Standart Bağlam (Sınıf, Öğretmen, Veli):**
   - Yönetici ve öğretmenlerin öğrenciyle ilgili işlem yaptığı modüllerde (Veli Talepleri, Gelişim & Portfolyo, Yoklama ve Öğrenci Yönetimi) öğrencinin sınıfı, sınıf öğretmeni ve veli adı hızlıca görülebilmelidir.
   - **Tasarım Sistemi Kuralı:** Bu bilgiler kartın birincil aksiyonunu (yoklama alma, onay verme vb.) boğmayacak şekilde kompakt, dokunsal mikro-rozetler (`StudentContextBadges`) formatında standartlaştırılmalıdır.

---

## 2. Kapsam ve Teknik Değişiklikler

### A. Ortak Dokunsal Bileşen: `StudentContextBadges`

- **Dosya:** `apps/admin-web/src/components/ui/StudentContextBadges.tsx`
- **İçerik:**
  - `classroomName?: string` -> Zümrüt/Mavi tonlu sınıf rozeti
  - `teacherName?: string` -> Mor/İndigo tonlu öğretmen rozeti (Öğretmen ikonuyla)
  - `parentName?: string` -> Kehribar tonlu veli rozeti (Kullanıcı ikonuyla)
  - Kompakt, 11px font, aşırı yer kaplamayan dokunsal mikro-rozet tasarımı.

### B. Etkinlik Galerisinde Tarih ve Sınıf Filtreleme & Yetki İzolasyonu

- **Dosya:** `apps/admin-web/src/features/activities/ActivitiesPage.tsx`
- **Geliştirmeler:**
  - Tarih filtresi (Date picker veya dönem seçici).
  - Sınıf filtresi (Admin tüm sınıfları seçebilir; Öğretmen giriş yaptığında varsayılan olarak kendi sınıfı seçili gelir ve kilitlenir).
  - Filtrelenen sınıfa ve tarihe ait fotoğraflar anlık olarak listelenir.

### C. Teslimat Kontrolünde Sınıf Sekmeleri

- **Dosya:** `apps/admin-web/src/features/pickup/PickupPage.tsx`
- **Geliştirmeler:**
  - Sayfanın üst kısmına dokunsal `TactileTabs` eklenir: `Tümü`, ardından kreşin sınıfları (`Papatyalar`, `Kelebekler`, `Yıldızlar` vb.).
  - Sınıf seçildiğinde teslimat listesi anında filtrelenir.
  - Öğretmen rolündeki kullanıcı için kendi sınıfı otomatik seçilir.

### D. İlgili Modüllerde Öğrenci Bağlam Bilgilerinin Gösterimi

1. **Veli Talepleri (`apps/admin-web/src/features/parent-requests/ParentRequestsPage.tsx`):**
   - Talep kartında öğrenci adının yanına sınıf adı ve sorumlu öğretmen adı eklenir.
2. **Gelişim & Portfolyo (`apps/admin-web/src/features/development/DevelopmentPortfolioPage.tsx`):**
   - Öğrenci seçiminde ve portfolyo detay kartlarında sınıf, sorumlu öğretmen ve veli bilgisi gösterilir.
3. **Öğrenci Yönetimi (`apps/admin-web/src/features/students/StudentsPage.tsx`):**
   - Öğrenci kartlarında sınıf adının yanı sıra sorumlu öğretmenin adı gösterilir.
4. **Yoklama Ekranı (`apps/admin-web/src/features/attendance/AttendancePage.tsx`):**
   - "Tüm Kreş" genel yoklama listesinde her öğrenci kartında sınıfı, öğretmeni ve velisi mikro-rozet olarak eklenir.

---

## 3. Doğrulama ve Kabul Kriterleri

1. Etkinlik galerisinde sınıf ve tarih filtresi sorunsuz çalışmalı; öğretmen girdiğinde kendi sınıfına kilitlenmeli.
2. Teslimat sayfasında sınıf sekmelerine tıklandığında yalnızca o sınıfın teslimat listesi gelmeli.
3. Veli taleplerinde, gelişim & portfolyoda, yoklamada ve öğrenci listesinde Sınıf, Öğretmen ve Veli bilgileri dokunsal rozetler halinde net ve taşma yapmadan görünmeli.
4. `./scripts/check.ps1` kalite kapısından (TypeScript, ESLint, Nx testleri) sıfır hata ile geçmeli.
