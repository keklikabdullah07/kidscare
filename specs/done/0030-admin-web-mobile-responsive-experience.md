# Şartname 0030: Web Paneli Mobil Tarayıcı Deneyimi (Mobile Responsive Experience)

Status: Active

## 1. Amaç ve Kapsam

Bu şartname, KidsCare web yönetim panelinin (`apps/admin-web`) akıllı telefon tarayıcılarında (iPhone Safari, Android Chrome — 360px ila 430px genişlik) bir mobil uygulama ergonomisi ve akıcılığında çalışmasını sağlamayı amaçlar.

### Hedefler:

1. **Mobil Alt Navigasyon Barı (Bottom Bar):** Ekranın altında sabitlenen, rol bazlı 4 ana sekme + sol çekmeceyi açan "Menü" butonu.
2. **Safe Area & Ergonomi:** iPhone home bar için `env(safe-area-inset-bottom)` desteği, min 44px dokunma hedefleri ve `<main>` için alt tampon (`pb-24`).
3. **Masaüstü Tablolarının Mobil Kartlara Dönüşümü:** `StudentsPage` ve `AttendancePage` sayfalarında mobilde yatay kaydırma yerine dikey dokunsal kartların kullanılması.
4. **Modalların Ekran Taşma Koruması:** `max-h-[90vh]` ve `overflow-y-auto` ile klavye ve küçük ekranlarda form butonlarının erişilebilir kalması.

---

## 2. Rol Bazlı Alt Bar Özellikleri

- **ADMIN:** Dashboard (`/dashboard`), Öğrenciler (`/students`), Yoklama (`/attendance`), İlaç (`/medication`), Menü (Çekmece açar).
- **TEACHER:** Akış (`/dashboard`), Yoklama (`/attendance`), Günlük Karne (`/tracking`), İlaç (`/medication`), Menü (Çekmece açar).
- **PARENT:** Portal (`/portal`), İlaç (`/medication`), Teslimat (`/pickup`), Mesajlar (`/messages`), Menü (Çekmece açar).

Masaüstünde (`md:` ve üzeri) alt bar otomatik gizlenir (`hidden md:flex` sidebar aktif kalır).

---

## 3. Kabul Kriterleri

1. Mobil görünümde (`viewport <= 768px`) alt bar görünür ve aktif route'a göre seçili sekme vurgulanır.
2. Alt bardaki "Menü" butonuna basıldığında sol drawer açılır ve tüm ek sayfalara (Ayarlar, Menü, Galeri) erişilir.
3. Öğrenciler ve Yoklama sayfalarında mobilde tablo yatay taşma yapmaz; dokunsal kart blokları gösterilir.
4. `./scripts/check.ps1` hatasız yeşil çıktısını verir.
