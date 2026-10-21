# Spec 0063 — Kapsamlı Rol İzolasyonu, Konsol Kartı Düzeni ve Dokunsal Rozet İyileştirmesi

- Status: Draft
- Mode: lite
- Plan: `specs/plans/0063-plan.md`

## Intent

Sistemdeki menüler incelendiğinde iki temel sorun tespit edilmiştir:

1. **!isTeacher Rol İzolasyon Zaafiyeti:** Eski kodlarda `!isTeacher` kontrolü yapılarak kullanıcıların ya "Öğretmen" ya da "Müdür" olduğu varsayılmıştır. Oysa `PARENT` (Veli) rolü de öğretmen değildir (`!isTeacher === true`). Bu durum `ActivityGalleryPage`, `PickupPage`, `EventsPage` ve `AttendancePage` sayfalarında Veli oturumunda bile "Tüm Sınıflar & Kreş" gibi yetkisiz ve anlamsız kreş geneli filtrelerinin görünmesine yol açmıştır (Kullanıcının ilettiği kanıt ekran görüntüsündeki açık).
2. **Filtre Düzeni ve Rozet Uyumsuzluğu:** `ParentRequestsPage.tsx` üzerinde sekmeler, sınıf/öğrenci filtreleri ve arama çubuğu tek bir yatay satıra tıkıştırılarak dar ekranlarda yatay taşma (scroll) ve buton çarpışması yaratmıştır. Ayrıca `<AdaptiveScopeBadge />` renkleri ve yüksekliği KidsCare dokunsal keten/krem tasarım diliyle (`bg-[#FCFAF7]`, `border-[#DDD4C4]`, `py-2`) uyumsuzdur.

Bu şartname:

1. **Rol İzolasyonunu Tamamlar:** Veli (`isParent`) için sınıf seçicilerini tamamen gizler veya tek sınıfa kilitler; `!isTeacher` kontrollerini `isStaff` / `isAdmin` kontrollerine dönüştürür.
2. **Konsol Kartı Düzenini Getirir:** `ParentRequestsPage.tsx` filtresini KidsCare standartlarındaki 2 katmanlı Bütünleşik Konsol Kartı mimarisine kavuşturur.
3. **Dokunsal Rozeti Standartlaştırır:** `<AdaptiveScopeBadge />` tokenlarını mat keten form elemanlarıyla (`py-2`, `h-10`) eşitler.

---

## Requirements

### 1. `ActivityGalleryPage.tsx` Rol İzolasyonu

- Veli (`isParent`) için "Tüm Sınıflar & Kreş" seçeneği veya sınıf değiştirme dropdown'ı kesinlikle gösterilmez.
- Veli tek sınıfa kayıtlıysa o sınıf kilitli rozet olarak gösterilir ya da filtre çubuğundan sınıf seçici tamamen kaldırılarak sadece Tarih ve Etkinlik Etiketleri bırakılır.
- Etkinlik oluşturma modalındaki sınıf seçicisi zaten sadece personel (`canEdit`) içindir; `!isTeacher` yerine `isStaff` kontrolü kullanılır.

### 2. `PickupPage.tsx` Rol İzolasyonu

- `displayClassrooms` filtresi `!isParent && isStaff` durumunda gösterilir.
- `{!isTeacher && <option value="ALL">🏫 Tüm Sınıflar & Kreş</option>}` ifadesi yerine `{!isTeacher && isStaff && ...}` kullanılır (Veli asla tüm kreş yetkililerini göremez).

### 3. `EventsPage.tsx` ve `AttendancePage.tsx` Rol İzolasyonu

- `EventsPage.tsx:587` ve `AttendancePage.tsx:926` içerisindeki `!isTeacher` kontrolleri `isStaff` (Müdür / Personel) şartına bağlanır.

### 4. `ParentRequestsPage.tsx` Bütünleşik Konsol Kartı Düzeni

- Kapsayıcı: `bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4`
- Üst Katman: `<TactileTabs ... />` (Bağımsız satır, alt sınır çizgili).
- Alt Katman: Sol blokta adaptif sınıf ve öğrenci rozet/filtreleri, sağ blokta arama inputu (`w-full sm:w-72`).

### 5. `<AdaptiveScopeBadge />` Tasarım Revizyonu

- Rozetler `bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700/80 px-3 py-2 rounded-2xl text-xs font-bold shadow-2xs` sınıflarını kullanır.
- Yanındaki form `<select>` elemanları ile birebir aynı yükseklikte ve hizada durur.

---

## Acceptance Criteria

- [ ] AC-1: `ActivityGalleryPage` veli (PARENT) olarak açıldığında kesinlikle `Tüm Sınıflar & Kreş` dropdown'ı görünmez.
- [ ] AC-2: `PickupPage` veli olarak açıldığında kreş geneli sınıf seçicisi görünmez, yalnızca kendi çocuğunun yetkilileri listelenir.
- [ ] AC-3: `EventsPage` ve `AttendancePage` sayfalarında veli oturumunda `Tüm Sınıflar` seçeneği sızmaz.
- [ ] AC-4: `ParentRequestsPage` sekmeleri ve filtreleri 2 katmanlı Bütünleşik Konsol Kartı içine yerleşir, 1150px ve altındaki genişliklerde yatay taşma (scroll) oluşmaz.
- [ ] AC-5: `<AdaptiveScopeBadge />` bileşeni `bg-[#FCFAF7]` ve `border-[#DDD4C4]` tokenları ile `py-2` yüksekliğinde render edilir.
- [ ] AC-6: `admin-web` vitest testleri ve TypeScript kontrolleri `%100 yeşil` geçer.
