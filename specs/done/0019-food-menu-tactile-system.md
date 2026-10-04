# Şartname 0019: Yemek Listesi (`/food-menu`) Dokunsal (Claymorphic) Tasarım Sistemi Harmonizasyonu

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Yönetim Paneli'nde yer alan **İletişim & Rutinler ➔ Yemek Listesi** (`/food-menu`) sayfasının ([`DailyMenuPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/daily-menus/DailyMenuPage.tsx)) projenin dokunsal kil (claymorphic) tasarım sistemine, `PageHeader`, `StatCard`, `TactileTabs` ve `TactileButton` bileşenlerine tam uyumlu hale getirilmesini hedefler.

## 2. Mevcut Durum Analizi ve Sorunlar

- **Eksik KPI Göstergeleri:** Günün menüsündeki toplam çeşit sayısını, öğün dağılımını (kahvaltı, öğle, ikindi) ve en önemlisi alerjen risk altındaki öğrenci sayısını özetleyen dokunsal göstergeler bulunmuyor.
- **Sekme & Odaklanma:** Öğünler arasında (Tümü, Kahvaltı, Öğle, İkindi, Alerjenler) hızlı filtreleme ve odaklanma sağlayan `TactileTabs` bileşeni yer almamaktadır.
- **Düz Butonlar ve Kontroller:** Tarih gezintisi, alerjen etiketleri ve silme/kaydetme butonları standart `btn-tactile-*` sınıfları yerine düzensiz stillere sahiptir; tutarlı `<TactileButton>` bileşeni kullanılmalıdır.
- **Alerjen Uyarı Bandı Derinliği:** Alerjen çakışması tespit edildiğinde gösterilen uyarı panosu KidsCare'in 3D tactile ekstrüzyon gölge standartlarına tam kavuşturulmalıdır.

## 3. Fonksiyonel ve Görsel Gereksinimler

### 3.1. Dokunsal KPI Kartları (`StatCard`)

Günün menüsünü özetleyen 4 adet interaktif dokunsal kart:

1. **Kahvaltı Çeşitleri:** Sabah kahvaltısındaki çeşit sayısı (örn: 4 Çeşit, amber vurgu).
2. **Öğle Yemeği:** Öğle menüsündeki yemek sayısı (örn: 4 Çeşit, teal vurgu).
3. **İkindi Ara Öğünü:** İkindi atıştırmalığı sayısı (örn: 2 Çeşit, turuncu/orange vurgu).
4. **Alerjen Riski:** Menüdeki içeriklerin çakıştığı öğrenci sayısı (0 ise yeşil/güvenli, 1+ ise rose/acil uyarı vurgusu).

### 3.2. Global Dokunsal Sekmeler (`TactileTabs`)

Öğün odaklanması ve görünüm için:

- **Tüm Öğünler** (`ALL`)
- **Sabah Kahvaltısı** (`BREAKFAST`)
- **Öğle Yemeği** (`LUNCH`)
- **İkindi Ara Öğünü** (`SNACK`)
- **Alerjen Denetimi** (`ALLERGENS`)

### 3.3. Dokunsal Tarih Gezinti Çubuğu

- Önceki Gün ve Sonraki Gün dokunsal ok butonları.
- Tarih seçici (`<input type="date">`) squircle çerçeveli ve pürüzsüz.
- Bugün seçili değilse tek tıkla bugüne dönen `<TactileButton variant="secondary" size="sm">Bugün</TactileButton>` butonu.

### 3.4. 3D Claymorphic Öğün Kartları & Editör

- Her öğün için özel ikonlu, çift katmanlı squircle kartlar.
- Veli görünümünde temiz, maddeli, şık liste öğeleri.
- Yönetici görünümünde kolay düzenlenebilir, satır bazlı squircle metin alanları.
- Alerjen seçim çipleri: 3D basılabilir, seçildiğinde aktif içeri gömülme efekti.
- Eylemler: "Günün Menüsünü Kaydet" (`TactileButton variant="teal"`), "Kreş Menüsünü Sil" (`TactileButton variant="danger"`).

## 4. Kabul Kriterleri (Acceptance Criteria)

1. `/food-menu` açıldığında 4 adet `StatCard` günün menü verilerini ve alerjen riskini anlık olarak göstermeli.
2. `TactileTabs` ile öğünler arasında geçiş ve odaklanma kusursuz çalışmalı.
3. Tarih değiştirildiğinde ilgili güne ait menü ve KPI'lar anında güncellenmeli.
4. Menü kaydetme ve silme akışları sorunsuz işlemeli.
5. Veli ve Yönetici rolleri arasındaki izin ayrımı korunmalı.
6. Vitest testleri (`DailyMenuPage.test.tsx`) %100 geçmeli.
7. `./scripts/check.ps1` monorepo kapısından sıfır hata ile geçmeli.
