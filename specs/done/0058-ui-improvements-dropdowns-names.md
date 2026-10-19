# Şartname 0058: Kullanıcı İsimleri, Varsayılan Bugün Tarihleri ve Dropdown Standartlaşması (Paket 1)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Admin ve Öğretmen panellerinde günlük saha operasyonunu kolaylaştıran, görsel karmaşayı bitiren ve kullanıcı deneyimini ferahlatan 6 temel arayüz iyileştirmesini kapsar:

1. **Kullanıcı İsimleri Gösterimi:** Mesajlaşma (`/messages`) ve ilgili kullanıcı listelerinde e-posta adresleri (`parent@demo.test`) yerine kullanıcının Adı ve Soyadı (`firstName + lastName`) gösterilecek; eksikse e-postanın @ öncesi temiz fallback olarak kullanılacaktır.
2. **Etkinlik Galerisinde Varsayılan Bugün Filtresi:** Etkinlik galerisi (`/gallery`) ve genel operasyonel tarih filtrelerinde sayfa ilk açıldığında doğrudan bugünün tarihi seçili olacaktır.
3. **Teslimat Kontrolünde Sınıf Dropdown'ı:** Teslimat ekranında (`/pickup`) yan yana taşarak yatayda kötü bir görüntü oluşturan sınıf butonları yerine şık, dokunsal açılır sınıf seçici (dropdown) entegre edilecektir.
4. **Veli Talepleri & Gelişim/Portfolyo Sınıf Filtresi:** Veli Talepleri (`/parent-requests`) ve Gelişim/Portfolyo (`/development`) sayfalarına sınıf bazlı filtreleme dropdown'ı eklenecektir.
5. **Öğrenci Kütüğünde Karne Temizliği & Responsive Tablo:** Öğrenciler sayfasında (`/students`) tablo satırlarından ve detay kartından kütük işlevine ait olmayan "Karne" butonları kaldırılarak sayfa ferahlatılacak; tablo ekran daraldığında numara ve metinlerin kaybolmaması için responsive savunmacı CSS uygulanacaktır.
6. **Etkinlik Kategori Butonları Görünümü:** Etkinlikler sayfasında taşan kategori butonları KidsCare dokunsal tasarım kuralına uygun olarak `flex-wrap py-1.5` ile düzeltilecektir.

---

## 2. Etkilenen Dosyalar ve Bileşenler

- `apps/admin-web/src/features/messages/MessagesPage.tsx`
- `apps/admin-web/src/features/gallery/PhotoGalleryPage.tsx`
- `apps/admin-web/src/features/pickup/PickupPage.tsx`
- `apps/admin-web/src/features/parent-requests/ParentRequestsPage.tsx`
- `apps/admin-web/src/features/development/DevelopmentPage.tsx`
- `apps/admin-web/src/features/students/StudentsPage.tsx`
- `apps/admin-web/src/features/events/EventsPage.tsx` (varsa kategori butonları)

---

## 3. Kabul Kriterleri (Acceptance Criteria)

1. **AC-1 (İsimler):** Mesajlaşma konuşma listesinde ve başlığında hiçbir e-posta adresi tek başına isim gibi görünmeyecek; kullanıcı adı-soyadı veya temiz rumuz gösterilecek.
2. **AC-2 (Galeri Tarihi):** `/gallery` sayfasına girildiğinde tarih filtresi boş değil, doğrudan `YYYY-MM-DD` bugünün tarihiyle açılacak.
3. **AC-3 (Teslimat Dropdown):** `/pickup` sayfasında tüm sınıflar yatayda dizi buton olarak değil, dokunsal `<select>` sınıf dropdown'ı olarak filtrelenebilecek.
4. **AC-4 (Talepler & Gelişim Sınıf Filtresi):** `/parent-requests` ve `/development` sayfalarında açılır Sınıf filtresi bulunacak ve seçilen sınıfa ait kayıtlar listelenecek.
5. **AC-5 (Öğrenci Kütüğü):** `/students` sayfasından eski statik "Karne" yazdırma butonu kaldırılacak (bu özellik `/development` içinde pedagojik karne olarak yaşayacak); dar ekranlarda öğrenci numaraları ve rozetler bozulmadan okunabilecek.
6. **AC-6 (Etkinlik Butonları):** Etkinlik butonları kapsayıcıdan taşmayacak, gölgeleri kesilmeyecek (`flex-wrap py-1.5`).
7. **AC-7 (Kalite Kapısı):** `./scripts/check.ps1` %100 yeşil tamamlanacak.
