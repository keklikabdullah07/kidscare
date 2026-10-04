# Uygulama Planı 0028: Portfolyo Fotoğraf Ekleme Akışının Etkinlik Galerisi ile Birebir Uyumlaştırılması

## Adımlar

### 1. `MediaUrlField.tsx` İyileştirmesi

- `MediaUrlFieldProps` arayüzüne `showAddButton?: boolean;` prop'unu ekle.
- "Dosfa" yazımını "Dosya" olarak düzelt.

### 2. `DevelopmentPage.tsx` Geliştirmesi

- İthalatlara `Check` (`lucide-react`), `listMediaFiles` (`../../api/media`), `MediaFileItem` (`@kidscare/shared-types`) ekle.
- `PRESET_PORTFOLIO_PHOTOS` sabitini tanımla (6 adet okul öncesi portfolyo sanat çalışması).
- `tenantMediaFiles` state'i ekle ve `showPortModal` açıldığında `listMediaFiles` çağırarak doldur.
- `togglePortPreset`, `togglePortPhotoUrl`, `removePortMediaUrl` yardımcı fonksiyonlarını ekle.
- `handleCreatePortfolio` fonksiyonunda sıfır görsel kontrolü ve çoklu görsel döngüsüyle kayıt mantığını kur.
- Portfolyo Eseri Ekle modalındaki görsel alanını `ActivityGalleryPage` ile birebir aynı hiyerarşide güncelle:
  1. `<MediaUrlField ... showMultiplePreview={false} multipleFiles />`
  2. "Paylaşılacak Fotoğraflar" belirgin önizleme galerisi (sayı rozeti, tümünü temizle, boş durum, 3'lü kart ızgarası, `#1, #2` sıra etiketi, X kaldır butonu)
  3. "Kreş Arşivinden Seçin ({tenantMediaFiles.length} fotoğraf)" 4'lü kart ızgarası + `Check` rozeti
  4. "Veya Hazır Örnek Eserlerden Ekleyin" 3'lü kart ızgarası + `Check` rozeti

### 3. Test ve Doğrulama

- `DevelopmentPage.test.tsx` dosyasında `../../api/media` mock'u ekle ve yeni portfolyo görsel akışını test et.
- `pnpm --filter @kidscare/admin-web test` çalıştır.
- Monorepo genelinde `./scripts/check.ps1` veya TypeScript/Lint doğrulaması yap.
