# Şartname 0026: "Medya / Fotoğraf URL" Alanlarında Cihazdan Yükleme + Üst Upload Zone Kaldırma

## 1. Amaç ve Kapsam

Bu şartname iki hedefi kapsar:

1. **"Medya / Fotoğraf URL" etiketli tüm input alanlarında** cihazdan fotoğraf yükleme özelliği:
   - [`DevelopmentPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/development/DevelopmentPage.tsx) portföy modalı (satır 896-908).
2. **Etkinlik galerisi modalında tek yükleme noktası** — mevcut iki ayrı yükleme yeri birleştirilir:
   - `ActivityGalleryPage.tsx` — "Yeni Etkinlik & Fotoğraf Paylaş" modalı.
   - Mevcut üst "Cihazınızdan Fotoğraf Yükleyin" zone kaldırılır.
   - "Veya Doğrudan Görsel URL'si Ekle" satırındaki "Dosya" butonu tek yükleme noktası olur.

## 2. Tespit Edilen Alanlar

### 2.1. `DevelopmentPage.tsx:896-908`

Yalnızca `<input type="url">` var, cihazdan yükleme yok. Çözüm: URL input yanına "Dosya" butonu.

### 2.2. `ActivityGalleryPage.tsx` "Yeni Etkinlik" modalı

Mevcut iki yükleme yeri:

- **Üst "Cihazınızdan Fotoğraf Yükleyin" zone** (modal üst) — kaldırılacak
- **"Veya Doğrudan Görsel URL'si Ekle" satırı** (modal alt) — Dosya butonu ile tek yükleme noktası

**Problem:** İki yükleme yeri UX karışıklığı yaratıyor.

**Çözüm:** Üst zone kaldırılır, alttaki URL satırı + Dosya butonu (zaten mevcut) tek nokta olur.

## 3. Kabul Kriterleri

1. `DevelopmentPage` "Medya / Fotoğraf URL" satırında "Dosya" butonu görünür.
2. `ActivityGalleryPage` "Veya Doğrudan Görsel URL'si Ekle" satırında "Dosya" butonu görünür.
3. Her iki sayfada buton tıklayınca file picker açılır.
4. Yükleme sonrası dönen URL ilgili state'e yazılır.
5. `ActivityGalleryPage` üst upload zone kaldırılır.
6. Vitest testleri geçer.
7. ESLint + check.ps1 0 hata.

## 4. Kapsam Dışı

- Drag & drop iyileştirmeleri.
- Kamera erişimi (`capture="environment"`).
- Çoklu dosya yükleme (DevelopmentPage tek URL alır).
