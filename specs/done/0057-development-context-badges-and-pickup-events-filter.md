# Şartname 0057: Gelişim/Portfolyo Öğrenci Bağlam Bilgileri ve Teslimat Kontrolü Sınıf Filtresi

## Durum

- **Durum:** DONE
- **Tarih:** 2026-10-18
- **Doğrulama:** ./scripts/check.ps1 %100 Yeşil (Vitest + Jest 42 suites 244 tests)
- **Kapsam:** `apps/admin-web/src/features/development/DevelopmentPage.tsx`, `apps/admin-web/src/features/pickup/PickupPage.tsx`

---

## 1. Amaç ve İş İhtiyacı

Kullanıcı geri bildirimlerine göre iki kritik operasyonel gereksinim tespit edilmiştir:

1. **Gelişim & Portfolyo (`/development`):**
   - Öğretmen ve yöneticiler pedagojik gözlem ve portfolyo eserlerini incelerken öğrencinin sınıfını, velisini ve öğretmenini doğrudan kart üzerinden net bir biçimde görebilmelidir.
   - `DevelopmentPage.tsx`'te `getStudentContext` fonksiyonu güçlendirilerek veli kullanıcı bilgileri (`User` tablosundan PARENT rolündeki kullanıcılar) ile eşleştirilmeli ve hem Pedagojik Gözlemler hem de Öğrenci Portfolyosu kartlarında `<StudentContextBadges />` eksiksiz gösterilmelidir.
2. **Teslimat Kontrolü (`/pickup`):**
   - Admin ve yetkili kullanıcılar için teslimat kontrolünde sınıf bazlı ayrım yapılabilmelidir.
   - Halihazırda Yetki Yönetimi (`AUTHORIZATIONS`) sekmesinde bulunan sınıf filtreleme butonları, Teslimat Günlüğü & Geçmiş Kütük (`EVENTS`) sekmesine de entegre edilmeli; ayrıca kütük dönemi ve öğrenci filtresiyle kusursuz uyum içinde çalışmalıdır.

---

## 2. Kapsam ve Değişiklikler

### 2.1. Gelişim ve Portfolyo (`DevelopmentPage.tsx`)

- `listUsers('PARENT')` çağrısı eklenerek veliler `parents` state'inde toplanacak.
- `getStudentContext` fonksiyonunda:
  - `student.parentId` ile `parents` listesinden veli adı (`firstName` + `lastName` veya `email`) çözülecek,
  - `student.passport` içerisindeki `motherName`, `fatherName` ve `emergencyContacts` da yedek olarak desteklenecektir.
- Kartlardaki `StudentContextBadges` bu zenginleştirilmiş bağlamı gösterecektir.

### 2.2. Teslimat Kontrolü (`PickupPage.tsx`)

- Sınıf filtreleme barı hem `AUTHORIZATIONS` hem de `EVENTS` sekmelerinde ortak/erişilebilir kılınacak (veya EVENTS sekmesi araç çubuğuna sınıf seçici eklenecek).
- `filteredEvents` ve `items` zaten `selectedClassroomId`'ye göre filtrelendiğinden, EVENTS sekmesinde sınıf seçimi yapıldığında hem günün kütüğü hem de öğrenci dropdown'ı seçilen sınıfa göre daraltılacak.
- Öğretmen giriş yaptığında yalnızca kendi sorumlu olduğu sınıflar kısıtlı kalmaya devam edecek (rol izolasyonu).

---

## 3. Kabul Kriterleri (Acceptance Criteria)

1. Gelişim sayfasında gözlem ve portfolyo kartlarında öğrencinin sınıfı, öğretmeni ve velisi `StudentContextBadges` bileşeniyle görünür olmalıdır.
2. Teslimat kontrolü sayfasında "EVENTS" sekmesinde Admin sınıf seçebilmeli ve seçtiği sınıfa göre teslimat kayıtları filtrelenmelidir.
3. Rol izolasyonu: Öğretmen sadece kendi sınıfını görürken, Admin "Tüm Sınıflar" veya dilediği sınıfı seçebilmelidir.
4. `./scripts/check.ps1` %100 yeşil geçmeli ve testler eksiksiz doğrulanmalıdır.
