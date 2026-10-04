# Uygulama Planı 0016: Gelişim Hikâyesi & Öğrenci Portfolyosu Dokunsal Dönüşümü (Development & Portfolio Tactile System)

## 1. Mimari ve Değişiklik Özeti

`apps/admin-web/src/features/development` dikey diliminde yer alan `DevelopmentPage.tsx` sayfasını KidsCare Dokunsal Tasarım Sistemine (Tactile Claymorphism) tam uyumlu hale getiriyoruz. Sayfada:

1. Üst başlık ve sekmeye göre dinamik dokunsal aksiyon butonları (`<TactileButton variant="primary">`)
2. 4 adet dokunsal KPI özet kartı (`StatCard` bileşeniyle)
3. Yeni evrensel dokunsal sekme standardı (`<TactileTabs />`)
4. Squircle form kontrollü filtreleme çubuğu (`#FCFAF7` zemin ve `#DDD4C4` sınırlar)
5. Dokunsal pedagojik gözlem, portfolyo ve etkinlik kartları
6. Açılır şık ve dokunsal modallar (Gözlem Ekle, Çalışma Ekle, Etkinlik Ekle)
7. Hata ve boş durum yönetimi (`<EmptyState />`)

## 2. Yapılacak Adımlar

### Adım 1: Sayfa İskeleti & Bileşen İncelemesi

- `DevelopmentPage.tsx` bileşenlerini ve state yapısını (`activeTab`, `selectedStudentId`, `selectedDomain`) incelemek.
- Gözlem, portfolyo ve etkinlik ekleme form modallarının dokunsal modal formatına uyarlanmasını planlamak.

### Adım 2: `DevelopmentPage.tsx` Dokunsal Dönüşümü

- **Başlık & Aksiyon:** İskandinav keten/obsidyen zemin, 3D ikon kutusu, aktif sekmeye göre değişen `<TactileButton variant="primary">`.
- **4'lü KPI Sayaçları (`StatCard`):** Toplam Gözlem, Portfolyo Eseri, Ev Etkinlikleri, Veliye Açık Kayıtlar.
- **Sekmeler:** `<TactileTabs />` entegrasyonu (Pedagojik Gözlemler, Öğrenci Portfolyosu, Ev Etkinlik Havuzu).
- **Filtreler:** Öğrenci ve Gelişim Alanı seçimi squircle dokunsal form alanlarına dönüştürülür.
- **Kartlar:** Gözlem, portfolyo ve ev aktivitesi kartları 3D claymorphic derinliğe ve rozetlere kavuşturulur.
- **Modallar:** Gözlem, portfolyo ve etkinlik ekleme formları dokunsal modal kabuğu ve butonlarla sarılır.

### Adım 3: Testler & Doğrulama

- `apps/admin-web/src/features/development/DevelopmentPage.test.tsx` testlerini güncel sekme ve KPI yapılarına göre genişletmek.
- `pnpm --filter admin-web exec vitest run src/features/development/DevelopmentPage.test.tsx` ile test etmek.
- `./scripts/check.ps1` kalite kapısını çalıştırmak ve %100 yeşil sonucu doğrulamak.

### Adım 4: Kullanıcı Test Raporu & Şartnamenin Taşınması

- Şartnameyi `specs/done/` dizinine taşımak.
- Değişiklikleri git ile commit'lemek.
- Kullanıcıya tarayıcı test adımlarını içeren ayrıntılı rapor sunmak.
