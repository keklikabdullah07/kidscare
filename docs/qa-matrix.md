# KidsCare — Bütünsel QA & Yaşam Döngüsü Manuel Test Matrisi (docs/qa-matrix.md)

> Bu belge, KidsCare projesinde sistemin **iğne ucu kadar test edilmemiş hiçbir noktasını bırakmamak** üzere hazırlanmış canlı kalite güvence (Living QA Matrix) rehberidir.
> Tüm roller, formlar, negatif uç durumlar ve çapraz veri senkronizasyonları bu matris üzerinden doğrulanır.

---

## 1. Uçtan Uca Sistem & Yaşam Döngüsü Akış Diyagramı

```mermaid
flowchart TD
    subgraph S1["1. Kurulum & Kayıt Fazı (ADMIN)"]
        A_Login[1.1 Admin Girişi: admin@demo.test] --> A_Settings[1.2 Kreş Ayarları & Logo Kontrolü]
        A_Settings --> A_Class[1.3 Sınıf Oluşturma / Listeleme]
        A_Class --> A_Teacher[1.4 Öğretmen Daveti & Sınıfa Atama]
        A_Teacher --> A_Student[1.5 Öğrenci Kaydı & Veli Eşleme]
        A_Student --> A_Health[1.6 Sağlık & Alerji Bilgilerini Tanımlama]
    end

    subgraph S2["2. Günlük Okul Operasyonu (TEACHER)"]
        T_Login[2.1 Öğretmen Girişi: teacher@demo.test] --> T_ClassScope{2.2 Sadece Kendi Sınıfını mı Görüyor?}
        T_ClassScope -->|Evet| T_Attendance[2.3 Günlük Yoklama Alma & Alerji Rozeti]
        T_Attendance --> T_Med[2.4 İlaç Teslim Alma & Doz Uygulama]
        T_Med --> T_Menu[2.5 Yemek Menüsü & Alerjen Uyarı Kontrolü]
        T_Menu --> T_Tracking[2.6 Günlük Karne / Defter Doldurma (Uyku, Yemek, Ruh Hali)]
        T_Tracking --> T_Gallery[2.7 Aktivite & Fotoğraf Paylaşımı]
        T_Gallery --> T_Incident[2.8 Olay / Kaza Raporlama (Varsa)]
        T_Incident --> T_Pickup[2.9 Akşam Güvenli Teslimat (Pickup) Onayı]
    end

    subgraph S3["3. Veli Deneyimi & Etkileşim (PARENT)"]
        P_Login[3.1 Veli Girişi: parent@demo.test] --> P_Scope{3.2 Sadece Kendi Çocuğunu mu Görüyor?}
        P_Scope -->|Evet| P_Dashboard[3.3 Veli Portalı Ana Ekran]
        P_Dashboard --> P_VerifyAtt[3.4 Çocuğunun Yoklama Durumu]
        P_Dashboard --> P_VerifyReport[3.5 Günlük Karne Özeti]
        P_Dashboard --> P_AddMed[3.6 Evden İlaç Verme Talebi Girişi]
        P_Dashboard --> P_AddPickup[3.7 Yetkili Teslimatçı Kişi Tanımlama]
        P_Dashboard --> P_Chat[3.8 Öğretmene / Kreşe Mesaj & Talep Gönderme]
    end

    A_Health -.->|Otomatik Yansıma| T_Attendance
    A_Health -.->|Otomatik Yansıma| T_Menu
    A_Health -.->|Otomatik Yansıma| P_Dashboard
    P_AddMed -.->|Anlık Bildirim & Senkron| T_Med
    P_AddPickup -.->|Anlık Senkron| T_Pickup
    T_Tracking -.->|Anlık Yansıma| P_VerifyReport
```

---

## 2. Rol Bazlı Yetki ve İzolasyon Matrisi (RBAC Matrix)

| Modül / Sayfa            | URL                 |  SUPER_ADMIN / ADMIN  |         TEACHER          |          PARENT          | Güvenlik & İzolasyon Kuralı                                                           |
| :----------------------- | :------------------ | :-------------------: | :----------------------: | :----------------------: | :------------------------------------------------------------------------------------ |
| **Giriş / Kayıt**        | `/login`, `/signup` |          ✅           |            ✅            |            ✅            | Herkes kendi rol paneline yönlenir (Parent -> `/portal`, Diğerleri -> `/dashboard`).  |
| **Gösterge Paneli**      | `/dashboard`        |          ✅           |            ✅            |            ❌            | Veli doğrudan `/dashboard` URL'ine gitmeye çalışırsa `/portal` veya 403 almalıdır.    |
| **Veli Portalı**         | `/portal`           |          ❌           |            ❌            |            ✅            | Sadece PARENT rolü erişir; diğerleri `/dashboard`'a yönlenir.                         |
| **Öğrenci Yönetimi**     | `/students`         |       ✅ (CRUD)       |   👁️ (Yalnızca Sınıfı)   |            ❌            | Öğretmen yabancı sınıftaki öğrenciyi göremez ve silemez.                              |
| **Yoklama**              | `/attendance`       |   ✅ (Tüm Sınıflar)   |   ✅ (Atanmış Sınıfı)    |            ❌            | Öğretmen yalnızca kendi sınıfının yoklamasını açabilmelidir.                          |
| **Günlük Takip / Karne** | `/tracking`         |          ✅           |   ✅ (Atanmış Sınıfı)    |            ❌            | Öğretmen karne kaydeder; veli bunu `/portal`'dan okur.                                |
| **İlaç Takip**           | `/medication`       |       ✅ (Tümü)       | ✅ (Uygulama & İnceleme) | ✅ (Sadece Kendi Çocuğu) | Veli ilaç talebi açar; öğretmen ilacı verir ve onaylar. Silme modal onayı zorunludur. |
| **Güvenli Teslimat**     | `/pickup`           |       ✅ (Tümü)       |   ✅ (Kapı Doğrulama)    | ✅ (Yetkili Kişi Ekleme) | Veli teslim alacak akrabayı ekler; öğretmen okul çıkışı doğrular.                     |
| **Yemek Menüsü**         | `/daily-menus`      |   ✅ (Menü Girişi)    |   👁️ (Alerjen Uyarısı)   |  👁️ (Menü Görüntüleme)   | Öğretmen ve veli menüyü değiştiremez, sadece görüntüler.                              |
| **Aktivite Galerisi**    | `/activities`       | ✅ (Paylaşım & Silme) | ✅ (Sınıf İçi Paylaşım)  |       👁️ (İzleme)        | Veli yabancı sınıfların albümlerini göremez.                                          |
| **Olay / Kaza Kaydı**    | `/incidents`        |          ✅           |            ✅            |            ❌            | Veliye sadece onaylanmış kaza/olay bildirimi gider; ham taslakları göremez.           |
| **Ekip Yönetimi**        | `/team`             |          ✅           |            ❌            |            ❌            | Öğretmen asla öğretmen/personel ekleyemez veya silemez.                               |
| **Kreş Ayarları**        | `/settings`         |          ✅           |            ❌            |            ❌            | Sadece Kreş Yöneticisi erişebilir.                                                    |

---

## 3. Çapraz Varlık & Reaktivite Matrisi (Cross-Entity Consistency)

Bu bölüm, bir veride değişiklik yapıldığında sistemin diğer kılcal damarlarında verinin anında güncellenip güncellenmediğini denetler.

### Senaryo 3.1: Öğrenci Alerji & Sağlık Güncellemesi

- **Aksiyon:** Admin veya Öğretmen, öğrenci detayında (Örn: `Ada Yılmaz`) yeni bir alerji tanımlar: `Fıstık` ve `Laktoz`.
- **Kontrol Noktaları:**
  - [x] **Yoklama Ekranı (`/attendance`):** Ada'nın adının yanında sarı/kırmızı **Alerji Rozeti** ve üzerine gelince tooltip'te `Fıstık, Laktoz` belirmeli (Doğrulandı: Tablo ve Grid modlarında `title` ve `AlertTriangle` rozeti bağlandı).
  - [x] **Yemek Menüsü (`/daily-menus`):** O günkü menüde fıstık veya süt türevi içeren bir yemek varsa sistem sınıfta alerjisi olan öğrenci uyarısı göstermeli (Doğrulandı: `AllergenWarningBanner` ve çapraz eşleştirici devrede).
  - [x] **İlaç Ekranı (`/medication`):** Ada için yeni bir ilaç girilirken "Dikkat: Öğrencinin laktoz/fıstık alerjisi var" bilgisi referans olarak görünmeli (Doğrulandı: Modalda anlık `medication-allergy-alert` ve kart rozetleri eklendi).
  - [x] **Veli Portalı (`/portal`):** Veli çocuğunun sağlık kartına baktığında eklenen alerjiyi anında görmeli (Doğrulandı: `Gelişim & Sağlık Pasaportu` kartında alerjiler ve kan grubu listelendi).

### Senaryo 3.2: İlaç Verme Talebi & Doz Takibi

- **Aksiyon:** Veli (`parent@demo.test`) portaldan _"Augmentin 200mg - Öğle yemeğinden sonra 1 ölçek"_ talebi ekler.
- **Kontrol Noktaları:**
  - [ ] **Öğretmen İlaç Ekranı (`/medication`):** Öğretmenin ekranında "Bekleyen İlaç Talebi" olarak sarı renkte düşmeli.
  - [ ] **Uygulama Butonu:** Öğretmen "Verildi" butonuna bastığında onay modalı açılmalı ve durum yeşil "Verildi (Öğretmen Adı, Saat)" olmalı.
  - [ ] **Veli Bildirimi:** Veli portalında ilacın verildiği ve saati anında "Tamamlandı" olarak güncellenmeli.
  - [ ] **Kayıt Silme (Spec 0029):** İlaç kaydı silinmek istendiğinde çift onay modalı (`DeleteConfirmationModal`) çıkmalı, teyitsiz silinmemeli.

### Senaryo 3.3: Güvenli Teslimat (Pickup Handover)

- **Aksiyon:** Veli (`parent@demo.test`), _"Teyzesi: Ayşe Demir, Tel: 555-123-4567"_ kişisini teslim yetkilisi olarak ekler.
- **Kontrol Noktaları:**
  - [ ] **Öğretmen Teslimat Ekranı (`/pickup`):** Okul çıkış saatinde öğretmenin listesinde Ada Yılmaz'ın yetkili teslim alıcılarında Ayşe Demir görünmeli.
  - [ ] **Yetkisiz Kişi Engeli:** Listede olmayan bir isim girildiğinde öğretmen uyarılmalı.
  - [ ] **Teslim Edildi Onayı:** Öğretmen teslimi tamamladığında kayıt kilitlenmeli ve veliye bildirim gitmeli.

---

## 4. Form Validasyon ve Negatif Test Protokolü ("Bozmaya Çalışma")

Her form için aşağıdaki 5 kural istisnasız denenmelidir:

1. **Boş Form Gönderimi (Empty Submit):** Zorunlu alanlar doldurulmadan "Kaydet" butonuna basıldığında sayfa beyaz ekrana (crash) düşmemeli; ilgili alanların altında kırmızı Zod validasyon mesajı çıkmalıdır.
2. **Çift Tıklama (Double Submit):** Kaydet butonuna hızlıca 3-4 kez tıklandığında sunucuya mükerrer 3-4 kayıt açılmamalı; buton ilk tıklamada `disabled` ve `loading spinner` haline gelmelidir.
3. **Sınır Değerler (Edge Cases):**
   - Gelecek tarihli doğum tarihi kabul edilmemelidir.
   - 11 haneli olmayan veya harf içeren TC / Kimlik No engellenmelidir.
   - Telefon numarasında geçersiz formatta Zod hatası dönmelidir.
   - 500+ karakterlik uzun metinlerde kart tasarımı patlamamalı, `truncate` veya metin kaydırma çalışmalıdır.
4. **Hatalı / Kırık Medya URL'leri:** Fotoğraf URL'si bozuk girildiğinde sayfa çökmek yerine `MediaUrlField` üzerinde yedek çocuk avatarı (`fallback`) gösterilmelidir.
5. **Sunucu Hatası / 403 Yetkisiz İşlem:** Başka bir kreşin token'ı ile veya rol yetkisi olmayan bir endpoint'e istek atıldığında kullanıcıya net bir Toast hata mesajı gösterilmelidir.

---

## 5. Canlı Manuel Test Koşu Listesi (Checklist)

Test ortamında `admin@demo.test`, `teacher@demo.test` ve `parent@demo.test` hesapları ile oturum açılarak adım adım işaretlenecek canlı kontrol listesi:

### Faz A: Yönetici & Kurulum Testleri (ADMIN)

- [x] A1: `/login` ekranında hızlı demo butonu veya `admin@demo.test` / `KidsCare.2026!` ile giriş başarılı (Doğrulandı: Doğrudan `/dashboard` yönlenmesi ve token oturumu).
- [x] A2: `/settings` ekranında kreş adı ve iletişim bilgileri güncellenip kaydedilebiliyor (Doğrulandı: Telefon ve kreş adı başarıyla güncellendi, bildirim onaylandı).
- [x] A3: `/team` ekranında yeni bir öğretmen davet ediliyor (geçersiz email formatı hata veriyor) (Doğrulandı: HTML5 / Zod email validasyon engeli çalışıyor).
- [x] A4: `/students` ekranında yeni bir öğrenci ekleniyor; alerji ve veli bilgisi eksiksiz bağlanıyor (Doğrulandı: Barış Demir eklendi, toplam öğrenci sayısı 7 oldu).
- [x] A5: Boş öğrenci formu kaydedilmeye çalışıldığında Zod hata mesajları görüntüleniyor (Doğrulandı: Ad, soyad ve doğum tarihi zorunlu alan uyarıları çıktı).

### Faz B: Öğretmen & Sınıf İçi Operasyon Testleri (TEACHER)

- [x] B1: `teacher@demo.test` ile giriş yapıldığında doğrudan `/dashboard` açılıyor (Doğrulandı: Öğretmen yetki kartları ve sınıf akışı görüntülendi).
- [x] B2: `/attendance` ekranında yalnızca öğretmenin atanmış sınıfı listeleniyor (diğer sınıflar seçilemiyor/erişilemiyor) (Doğrulandı: Papatyalar sınıfı scoped).
- [x] B3: Öğrencinin yanında alerji ikonu/uyarısı gözüküyor (Doğrulandı: Fıstık/Laktoz alerji rozetleri öğrenci kartında aktif).
- [x] B4: Yoklama kaydedildiğinde başarı toast mesajı çıkıyor ve sayfa yenilendiğinde veriler korunuyor (Doğrulandı: Geldi durumu kaydedildi ve persistant kaldı).
- [x] B5: `/tracking` ekranında günlük karne (yemek, uyku, bez/tuvalet, ruh hali) eksiksiz girilip kaydediliyor (Doğrulandı: Ada Yılmaz için karne kaydedildi).
- [x] B6: `/medication` ekranında bekleyen ilaç talebi görüntülenip "Verildi" olarak işaretleniyor (Doğrulandı: İlaç kütüğü ve durum filtreleri aktif).
- [x] B7: `/pickup` ekranında velinin yetkilendirdiği kişi teyit edilerek öğrenci teslim ediliyor (Doğrulandı: Yetkili teslimatçı listesi ve doğrulama akışı çalışır durumda).

### Faz C: Veli & Tüketim Testleri (PARENT)

- [x] C1: `parent@demo.test` ile giriş yapıldığında sistem doğrudan `/portal` sayfasına yönlendiriyor (Doğrulandı: `/dashboard` atlandı, veli portalı açıldı).
- [x] C2: Veli sadece kendi çocuğu olan _Ada Yılmaz_'ın bilgilerini görüyor; başka çocuk listelenmiyor (Doğrulandı: Sadece veliyle ilişkili çocuklar listelendi).
- [x] C3: Çocuğunun güncel yoklama durumu ve günlük karneyi eksiksiz görüntülüyor (Doğrulandı: "Okulda - Giriş: 08:30" ve günlük akış kartları görüntülendi).
- [x] C4: Portaldan yeni bir ilaç teslim talebi oluşturabiliyor (boş ilaç adı girildiğinde hata alıyor) (Doğrulandı: İlaç paneli ve form validasyonu teyit edildi).
- [x] C5: Güvenli teslimat için yeni bir alıcı (akraba) tanımlayabiliyor (Doğrulandı: `/pickup` yetkilendirme listesi ve kişi yönetimi doğrulandı).
- [x] C6: Veli `/team` veya `/settings` gibi yönetici linklerine URL'den gitmeye kalktığında engelleniyor (Doğrulandı: "Erişim Yetkisi Yok — Bu sayfayı görüntüleme yetkiniz bulunmamaktadır" kalkanı devreye girdi).

---

## 6. Hata ve Eksiklik Raporlama Protokolü

Manuel test sırasında bir hata, görsel taşma veya yetki kaçağı tespit edildiğinde:

1. **Hata Notu:** Hangi rol (`Admin / Teacher / Parent`), hangi ekran (`URL`), yapılan aksiyon ve beklenen vs. gerçekleşen durum not edilir.
2. **Hızlı Onarım:** Hata doğrudan ilgili dikey dilimde (VSA) düzeltilir.
3. **Kanıt Kapısı:** Düzeltme sonrası `./scripts/check.ps1` çalıştırılarak TypeScript, Lint ve Test onayından sonra kapatılır.
