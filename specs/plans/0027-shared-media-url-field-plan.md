# Uygulama Planı 0027: Paylaşılan `MediaUrlField` Bileşeni

## Adımlar

### 1. Yeni bileşen: `apps/admin-web/src/components/ui/MediaUrlField.tsx`

- Props: `value`, `onChange`, `multiple`, `values`, `onValuesChange`, `category`, `placeholder`, `label`, `allowFileUpload`, `showPreview`, `error`.
- Internal state: `uploading`, `fileInputRef`.
- Internal handler: `handleFileUpload(e)` — `uploadMediaFile(file, category)`, sonuç URL'sini state'e yaz.
- Tekil mod: input + (Dosfa) + preview img (showPreview ise) + X kaldır.
- Çoklu mod: input + Dosfa + her URL için küçük preview kartı + "Tümünü Temizle".
- Hata: `useToast` ile bildir.

### 2. `ActivityGalleryPage.tsx` refactor

- Yerel state'ler (`customUrl`, `uploadingFiles`, `fileInputRef`, `handleFileUpload`, `addCustomUrl`) kaldırılır.
- "Veya Doğrudan Görsel URL'si Ekle" bloğu `<MediaUrlField multiple values={selectedUrls} onValuesChange={setSelectedUrls} category="ACTIVITY" showPreview />` ile değiştirilir.
- "Paylaşılacak Fotoğraflar" preview bloğu korunur (zaten ayrı).

### 3. `DevelopmentPage.tsx` refactor

- Yerel state'ler (`portFileInputRef`, `handlePortFileUpload`) kaldırılır.
- Medya URL bloğu `<MediaUrlField value={portForm.mediaUrl} onChange={(u) => setPortForm({...portForm, mediaUrl: u})} category="PORTFOLIO" showPreview />` ile değiştirilir.

### 4. Testler

- Yeni: `MediaUrlField.test.tsx` — render, file upload, çoklu mod, hata.
- Mevcut: `ActivityGalleryPage.test.tsx`, `DevelopmentPage.test.tsx` yeşil kalmalı.

## Doğrulama

```powershell
pnpm --filter @kidscare/admin-web test src/components/ui/MediaUrlField.test.tsx src/features/activities/ src/features/development/
pnpm exec eslint apps/admin-web/src/components/ui/MediaUrlField.tsx apps/admin-web/src/features/activities/ActivityGalleryPage.tsx apps/admin-web/src/features/development/DevelopmentPage.tsx
pwsh -File ./scripts/check.ps1
```

## Commit

- Tek commit: `refactor(media): extract shared MediaUrlField component (eliminates 2x duplication)`
