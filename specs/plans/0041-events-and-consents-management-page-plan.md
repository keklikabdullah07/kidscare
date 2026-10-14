# 0041 — Gezi & Etkinlik İzin Yönetimi Uygulama Planı (Admin, Öğretmen, Veli)

> **Durum:** 📋 TASLAK / BEKLEMEDE (Gelecek Sohbette veya İlerleyen Fazda Uygulanmak Üzere Hazırlandı)  
> **İlgili Şartname:** `specs/active/0041-events-and-consents-management-page.md`  
> **Kapsam:** Web Paneli (`apps/admin-web`), API Ek Endpoint'leri (`apps/api`), Paylaşılan Tipler (`packages/shared-types`, `shared-schemas`)

---

## 1. Giriş ve İhtiyaç Analizi

Etap 1'de (`0040`) veritabanı altyapısı ve temel izin yanıt mekanizması kuruldu. Ancak gezi izinlerinin sadece Veli Portalı ana sayfasında bir kart olarak durması iki temel soruna yol açmaktadır:

1. **Geçmiş & Arşiv Eksikliği:** Veli çocuğunun geçmişte hangi gezilere katıldığını, ne kadar ödediğini ve hangi izinleri verdiğini görebileceği bir arşive ihtiyaç duyar.
2. **Yönetim & Öğretmen Eksikliği:** Kreş müdürü veya öğretmenin yeni gezi tanımlayabileceği, velilerin onay durumlarını anlık takip edebileceği ve gezi günü servise binerken **"Dijital İzinli Katılımcı Listesini"** kontrol edebileceği bir ekran bulunmamaktadır.

Bu plan, **Admin, Öğretmen ve Veli** olmak üzere 3 rolün tüm ihtiyaçlarını karşılayan tam kapsamlı bir `🎪 Geziler & İzinler` modülü tasarlar.

---

## 2. 3 Rol İçin Detaylı Fonksiyon Matrisi

| Özellik / Ekran                    |              ADMIN (Müdür)              |          TEACHER (Öğretmen)          |                 PARENT (Veli)                 |
| :--------------------------------- | :-------------------------------------: | :----------------------------------: | :-------------------------------------------: |
| **Sol Menü Erişimi**               |         `🎪 Geziler & İzinler`          |        `🎪 Geziler & İzinler`        |            `🎪 Geziler & İzinler`             |
| **Yeni Gezi Oluşturma**            | ✅ Evet (Tüm okul veya seçili sınıflar) |   ✅ Evet (Yalnızca kendi sınıfı)    |                   ❌ Hayır                    |
| **Gezi Düzenleme / İptal**         |                 ✅ Evet                 |     ⚠️ Sadece kendi oluşturduğu      |                   ❌ Hayır                    |
| **Onay Durumu & KPI Takibi**       |         ✅ Evet (Tüm sınıflar)          |        ✅ Evet (Kendi sınıfı)        |       ❌ Sadece kendi çocuğunun durumu        |
| **Servis Yolcu / Yoklama Listesi** |     ✅ Evet (Yazdır / PDF / Liste)      | ✅ Evet (Sınıf bazlı biniş kontrolü) |                   ❌ Hayır                    |
| **Dijital İzin Yanıtlama**         |          ❌ Hayır (Görüntüler)          |        ❌ Hayır (Görüntüler)         |  ✅ Evet (`İzin Veriyorum` / `Katılmayacak`)  |
| **Geziye Özel Veli Notu Ekleme**   |             ❌ Hayır (Okur)             |           ❌ Hayır (Okur)            | ✅ Evet (Örn: "Alerjisi var, dikkat edilsin") |
| **Geçmiş Geziler Arşivi**          |           ✅ Tüm okul arşivi            |           ✅ Sınıf arşivi            |        ✅ Kendi çocuğunun gezi geçmişi        |
| **Ana Ekran Hatırlatması**         |                    —                    |                  —                   |     ✅ Onay bekleyen varsa uyarı widget'ı     |

---

## 3. Rol Bazlı Kullanıcı Deneyimi (UX / UI Mimarisi)

### 3.1. ADMIN (Müdür / Kurucu) Arayüzü (`/events`)

1. **Üst Başlık ve Eylemler:**
   - Sayfa Başlığı: `🎪 Geziler & Etkinlik İzin Yönetimi`
   - Eylem Butonu: `<TactileButton>` `+ Yeni Gezi / Etkinlik Oluştur`
   - Filtreler: Durum (`Aktif`, `Tamamlandı`, `İptal`), Sınıf Seçimi
2. **Gezi Kartları:**
   - Gezi Başlığı, Tarih/Saat, Konum rozeti, Ücret etiketi
   - **Canlı İlerleme Çubuğu (Progress Bar):**
     - _Örn: 24 Öğrenci Hedef → 18 İzin Verildi (%75) · 2 Katılmayacak · 4 Yanıt Bekleniyor_
   - Finansal Özet: _Toplanan / Beklenen Ücret: 2.700 TL / 3.600 TL_
3. **Detay ve Servis Listesi Modalı (Yolcu Listesi):**
   - Gezi kartına tıklandığında açılan katılımcı tablosu:
     - Öğrenci Adı - Sınıfı - Veli Adı - İzin Durumu (`Onaylandı`, `Katılmıyor`, `Bekliyor`) - Veli Notu - Yanıt Tarihi
   - **Yazdır / Dışa Aktar Butonu:** Servis şoförü ve rehber öğretmen için tek sayfalık katılımcı çıktısı.

---

### 3.2. TEACHER (Sınıf Öğretmeni) Arayüzü (`/events`)

1. **Sınıf Odaklı İzolasyon:**
   - Öğretmen yalnızca sorumlu olduğu sınıfın veya tüm okula açık gezileri görür.
   - Kendi sınıfı için gezi tanımlayabilir (Örn: _"Kelebekler Sınıfı Kütüphane Ziyareti"_).
2. **Gezi Günü Hızlı Servis Yoklaması:**
   - Gezi günü tek dokunuşla çalışan biniş kontrol listesi:
     - Sadece velisinden `İzin Verildi` onayı olan öğrenciler yeşil liste halinde gelir.
     - Öğretmen servise binen her öğrenciyi `Servise Bindi` olarak işaretleyebilir.
     - Velinin girdiği özel notlar (ilaç, alerji, hassasiyet) öğrenci adının hemen altında dikkat çekici sarı etiketle gösterilir.

---

### 3.3. PARENT (Veli) Arayüzü (`/events` & Dashboard)

1. **Sol Menüdeki Bağımsız Sayfa (`/events`):**
   - **Sekme 1: Onay Bekleyen & Yaklaşan Geziler**
     - Çocuk için açılmış aktif geziler.
     - Detaylı gezi açıklaması, öğretmen notu, kalkış saati, ne giyilmesi gerektiği.
     - Dokunsal `[✅ İzin Veriyorum]` ve `[❌ Katılmayacak]` butonları.
     - Opsiyonel **Veli Notu Kutusu** (Örn: _"Serviste ön koltukta oturmasını rica ederim"_).
   - **Sekme 2: Geçmiş Gezilerimiz & Katıldıklarımız**
     - Çocuğun daha önce katıldığı geziler, izin durumları, etkinlik fotoğrafları linki.
2. **Veli Portalı Ana Sayfası (`/portal`):**
   - Ana sayfada uzun listelerle kalabalık yapılmaz.
   - Eğer henüz yanıtlanmamış gezi izni varsa hero kartının altında zarif bir dikkat bandı belirir:
     - _"📢 1 Yeni Gezi İzni Onayınızı Bekliyor (Atatürk Arboretumu Gezisi) ➡️ Detayları Gör ve Yanıtla"_
   - Tıklandığında doğrudan `/events` sayfasına yönlendirir; yanıt verildikten sonra ana sayfadan otomatik kaybolur.

---

## 4. Teknik Mimari ve Kod Değişiklik Adımları

### 4.1. Backend API (`apps/api/src/modules/consents`)

- `GET /events/consents/:id/roster`: Belirli bir etkinliğin tüm öğrenci listesini ve veli izin yanıtlarını (öğrenci adı, veli, telefon, karar, veli notu) döndürür (Admin ve Öğretmen için).
- `PUT /events/consents/:id`: Gezi detaylarını güncelleme veya geziyi iptal etme endpoint'i.
- `POST /events/consents/:id/respond`: Veli notu (`notes?: string`) alanını destekleyen mevcut endpoint korunur.

### 4.2. Web Arayüzü (`apps/admin-web`)

1. **Yeni Sayfa:** `apps/admin-web/src/features/events/EventsPage.tsx`
   - Role duyarlı görünüm (Admin, Teacher, Parent).
   - `CreateEventModal` bileşeni (Admin/Teacher için yeni gezi formu).
   - `EventRosterModal` bileşeni (Servis ve katılımcı listesi modalı).
2. **Navigasyon:** `apps/admin-web/src/components/Layout.tsx`
   - Hem Admin hem Teacher hem de Parent menü gruplarına `🎪 Geziler & İzinler` (`/events`, `icon: Compass` veya `Ticket`) eklenmesi.
3. **App Rotası:** `apps/admin-web/src/App.tsx`
   - `/events` yolunun tanımlanması.

---

## 5. Doğrulama ve Kabul Kriterleri (QA Checklist)

1. **Admin Testi:** Admin `admin@demo.test` ile giriş yapıp sol menüden `Geziler` sekmesine gidebilmeli, yeni bir gezi açabilmeli, kaç velinin onay verdiğini grafik/sayı olarak görebilmeli.
2. **Öğretmen Testi:** Öğretmen `teacher@demo.test` ile kendi sınıfının gezi katılımcı listesini inceleyebilmeli.
3. **Veli Testi:** Veli `parent@demo.test` ile giriş yaptığında hem aktif gezileri hem geçmiş arşivi görebilmeli; izin verdiğinde anlık olarak güncellenmeli.
4. **Kalite Kapısı:** `./scripts/check.ps1` sıfır hata ile yeşil olmalı.
5. **Git Protokolü:** Geliştirme bitirildiğinde yerel commit atılmalı, kesinlikle pushlanmamalıdır.
