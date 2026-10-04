# Şartname 0015: Küresel Dokunsal Sekme ve Buton Tıklanabilirlik Standardı (Global Tactile Tabs & Button Affordance)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Yönetim Panelinde aktif olmayan (pasif) sekme ve filtre butonlarının düz/çıplak metin gibi görünmesi ve tıklanabilir buton algısı yaratmaması sorununu çözmeyi; tüm proje genelinde tutarlı, fiziksel buton hissi veren, 3D alt dudaklı ve içe gömülü ray kapsayıcılı dokunsal sekme standardını (`<TactileTabs />`) ve global CSS sınıflarını getirmeyi amaçlar.

## 2. Kullanıcı Deneyimi ve Tasarım Gereksinimleri

- **Tıklanabilirlik Algısı (Affordance):**
  - Pasif/seçili olmayan bir sekme veya buton, asla transparan çıplak metin olamaz.
  - Beyaz/açık keten clay zemin, belirgin kenarlık (`#DDD4C4`), fiziksel 3D alt dudak gölgesi ve hover/active basılma animasyonuna sahip olmalıdır.
- **İçe Gömük Ray Kapsayıcısı (Segmented Capsule Track):**
  - Sekme grupları havada dağınık durmak yerine hafif içe gömülü bir ray zemininde (`bg-[#F4EFE6] dark:bg-slate-900/80 border border-[#DDD4C4] rounded-2xl p-1.5`) konumlanır.
- **Aktif (Seçili) Sekme:**
  - Marka rengi (`#115e59`), amber veya ilgili durum rengiyle belirginleşir; 3D ekstrüzyon gölgesiyle rayın üstünde kabarır.
  - Canlı sayaç rozetiyle öne çıkar.
- **Mobil ve Dar Ekran Uyumu:**
  - Taşma durumlarında yatay kaydırılabilir (`overflow-x-auto`) ve dokunsal dudakların kesilmemesi için dikey padding (`py-1`) korumalı olmalıdır.

## 3. Mimari ve Bileşen Standardı

1. **Evrensel CSS Sınıfları (`index.css`):**
   - `.tactile-tab-track`
   - `.tactile-tab-btn-inactive`
   - `.tactile-tab-btn-active`
2. **Yeniden Kullanılabilir Global Bileşen (`apps/admin-web/src/components/ui/TactileTabs.tsx`):**
   - Generic type desteği (`T extends string`).
   - İkon, etiket, sayaç, rozet rengi ve varyant desteği (`teal`, `amber`, `rose`, `sky`, `purple`).
3. **Uygulanacak İlk Sayfalar:**
   - `IncidentsPage.tsx` (Olay Kayıtları)
   - `MedicationPage.tsx` (İlaç Takibi)
   - `PickupPage.tsx` (Teslimat Kontrolü)

## 4. Kabul Kriterleri

- Pasif sekmelerin buton olduğu ilk bakışta %100 açık ve nettir.
- TypeScript ve ESLint sıfır hata verir.
- Tüm birim testleri ve `./scripts/check.ps1` %100 yeşil geçer.
