# Uygulama Planı 0026: URL Input'unda Cihazdan Fotoğraf Ekleme

## Adımlar

### 1. `ActivityGalleryPage.tsx` UI değişikliği

- Custom URL input div'ine **Dosya Ekle** butonu ekle (Upload ikonu).
- Buton `onClick={() => fileInputRef.current?.click()}` ile file picker'ı tetikler.
- `handleFileUpload` zaten mevcut (`fileInputRef`'e bağlı `<input type="file">` üzerinden çalışıyor); ekstra state veya handler gerekmez.
- Üst upload zone'u (522-556) **korunur** — kullanıcı iki yol arasında seçim yapabilir.
- Mevcut "Ekle" butonu (URL yapıştırma) **korunur**.

### 2. Test

- Yeni test: "Dosya Ekle butonuna tıklayınca file picker açılır" — `<input type="file">`'in click() çağrıldığını doğrular.
- Mevcut upload testleri (varsa) yeşil kalır.

## Doğrulama

```powershell
pnpm --filter @kidscare/admin-web test src/features/activities/
pnpm exec eslint apps/admin-web/src/features/activities/ActivityGalleryPage.tsx
pwsh -File ./scripts/check.ps1
```

## Commit

- Tek commit: `feat(gallery): add device upload button next to URL input`
