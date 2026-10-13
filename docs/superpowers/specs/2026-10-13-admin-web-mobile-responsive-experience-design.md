# KidsCare — Web Paneli Mobil Tarayıcı Deneyimi Tasarım Belgesi (Mobile Responsive Experience)

- **Tarih:** 2026-10-13
- **Konu:** `apps/admin-web` Mobil Tarayıcı (Responsive Web) Ergonomisi & Bütünsel Mobil Dönüşümü
- **Hedef Cihazlar:** Akıllı telefon tarayıcıları (iOS Safari, Android Chrome, 360px - 430px genişlik)
- **Durum:** Onaylandı (Spec 0030)

---

## 1. Amaç & Kapsam

KidsCare web yönetim paneli (`apps/admin-web`), masaüstü ekranlarda olduğu gibi öğretmenler ve veliler tarafından akıllı telefon tarayıcılarında açıldığında da bir mobil uygulama akıcılığında çalışmalıdır.

Bu tasarım belgesi;

1. Rol bazlı modern alt navigasyon barı (Bottom Navigation Bar),
2. Geniş masaüstü tablolarının mobilde dokunsal kartlara (`TactileCard`) dönüşümü,
3. Dokunmatik ergonomi (min 44px basma alanları),
4. iOS/Android Safe Area (`env(safe-area-inset-bottom)`) entegrasyonu,
5. Modalların mobil ekran taşma koruması (bottom-sheet benzeri ergonomi)
   özelliklerini tanımlar.

---

## 2. Mimari & Alt Navigasyon Barı (Bottom Navigation Bar)

### 2.1 Konum & Görünürlük

- Sadece mobil ekranlarda (`< 768px`, Tailwind: `md:hidden`) aktiftir.
- Ekranın en altına sabitlenir (`fixed bottom-0 left-0 right-0 z-40`).
- Saydam keten zemin ve buzlu cam efekti taşır (`bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95 backdrop-blur-xl border-t border-[#E8E2D5] dark:border-slate-800`).
- Safe Area payı içerir (`pb-[calc(0.5rem+env(safe-area-inset-bottom))]`).
- Ana içerik (`<main>`) mobilde `pb-24` alt boşluğu alarak alt barın arkasında kalmaz.

### 2.2 Rol Bazlı Sekme Dağılımı (4 Sekme + 1 Çekmece Menü)

#### ADMIN (Müdür / Yönetici):

1. **Gösterge:** `/dashboard` (İkon: `LayoutDashboard`)
2. **Öğrenciler:** `/students` (İkon: `Users`)
3. **Yoklama:** `/attendance` (İkon: `CheckCircle2`)
4. **İlaç:** `/medication` (İkon: `Pill`)
5. **Menü (Tümü):** Çekmece Menüyü Açar (`setMobileOpen(true)`) (İkon: `Menu`)

#### TEACHER (Öğretmen):

1. **Akış:** `/dashboard` (İkon: `LayoutDashboard`)
2. **Yoklama:** `/attendance` (İkon: `CheckCircle2`)
3. **Karne:** `/tracking` (İkon: `BookOpenCheck`)
4. **İlaç:** `/medication` (İkon: `Pill`)
5. **Menü (Tümü):** Çekmece Menüyü Açar (`setMobileOpen(true)`) (İkon: `Menu`)

#### PARENT (Veli):

1. **Portal:** `/portal` (İkon: `Home`)
2. **İlaç:** `/medication` (İkon: `Pill`)
3. **Teslimat:** `/pickup` (İkon: `ShieldCheck`)
4. **Mesajlar:** `/messages` (İkon: `MessageSquare`)
5. **Menü (Tümü):** Çekmece Menüyü Açar (`setMobileOpen(true)`) (İkon: `Menu`)

---

## 3. Tablo & Kart Mobil Dönüşümü (Responsive Transformation)

Geniş veri tabloları mobilde yatay kaydırma çubuğuna zorlanmak yerine, `<768px` genişlikte otomatik olarak dokunsal dikey kartlara dönüşür:

### 3.1 Öğrenci Yönetimi (`StudentsPage`)

- Masaüstü: Çok sütunlu tablo (`hidden md:table`).
- Mobil: `md:hidden` blok yapısı. Her kartta;
  - Avatar, ad-soyad, yaş/sınıf bilgisi.
  - Alerji rozeti (varsa kırmızı/kehribar vurgu).
  - Veli iletişim ikonu ve telefon arama linki (`tel:...`).
  - Hızlı Pasaport & Düzenle dokunsal butonları.

### 3.2 Yoklama Ekranı (`AttendancePage`)

- Masaüstü: Tablo satırları.
- Mobil: Öğrenci bazlı kompakt kart.
  - Kartın altında 3'lü tam genişlikli segment butonları: **Geldi (Yeşil)**, **Gelmedi (Kırmızı)**, **İzinli (Mavi)**.
  - Dokunma alanı minimum 44px (`min-h-[44px]`).

### 3.3 İlaç & Teslimat Ekranları (`MedicationPage`, `PickupPage`)

- İlaç talepleri kart üzerinde belirgin doz ve durum etiketiyle görünür.
- "Verildi" ve "Teslim Et" aksiyon butonları kartın altında tam genişlik (`w-full`) dokunsal buton haline gelir.

---

## 4. Modal & Form Ergonomisi

- **Modallar:** Mobilde ekran kenarlarına yapışmaz; `p-3` margin, `max-h-[90vh]` ve `overflow-y-auto` ile içeriğin kaydırılması sağlanır.
- **Form Butonları:** Modal altındaki "İptal" ve "Kaydet" butonları mobilde dikey veya eşit genişlikte (`flex-1`) düzenlenir.
- **Dokunsallık Kuralı:** Butonların 3D alt dudak gölgeleri mobilde de korunur (`active:translate-y-[2px]`).

---

## 5. Doğrulama ve Test Kriterleri

1. **Vitest / TypeScript / Lint:** `./scripts/check.ps1` sıfır hata ile geçmelidir.
2. **Tarayıcı Görsel Testi:** Mobil ekran boyutlarında (375px, 390px, 412px) sıfır yatay kayma (horizontal scrollbar = 0).
3. **Dokunma Testi:** Alt bar sekmelerinin doğru yönlendirmesi, "Menü" butonunun sol çekmeceyi sorunsuz açıp kapatması.
