# Şartname 0027: Paylaşılan `MediaUrlField` Bileşeni

## 1. Amaç ve Kapsam

Bu şartname, **URL + cihazdan dosya yükleme + preview** işlevselliğini paylaşılan tek bir React bileşenine çıkarmayı hedefler.

Bugün iki sayfada benzer kod tekrarlanıyor:

- [`ActivityGalleryPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/activities/ActivityGalleryPage.tsx) — "Veya Doğrudan Görsel URL'si Ekle" satırı + Dosfa butonu (URL `selectedUrls` array'ine eklenir, çoklu dosya + preview grid).
- [`DevelopmentPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/development/DevelopmentPage.tsx) — "Medya / Fotoğraf URL" input + Dosfa butonu (tek URL `portForm.mediaUrl`'a yazılır, tek dosya + tek preview).

Tekrarlanan parçalar:

- Hidden `<input type="file" ref={...} />` + `Upload` ikonu + `TactileButton` "Dosfa"
- `onClick={() => fileInputRef.current?.click()}`
- `handlePortFileUpload` / `handleFileUpload` benzeri async upload + state yazma
- Preview alanı (img + kaldırma butonu)

## 2. Hedeflenen Bileşen: `MediaUrlField`

### 2.1. Konum

`apps/admin-web/src/components/ui/MediaUrlField.tsx`

### 2.2. Props

```ts
interface MediaUrlFieldProps {
  /** Mevcut URL değeri. Tekil modda doğrudan bağlanır. */
  value: string;
  /** URL değiştiğinde çağrılır. */
  onChange: (url: string) => void;
  /** Çoklu mod: true ise onChange ekleme olarak davranır (append). */
  multiple?: boolean;
  /** Mevcut çoklu URL listesi (sadece multiple modda). */
  values?: string[];
  /** Mevcut çoklu URL'leri güncelleyen handler (sadece multiple modda). */
  onValuesChange?: (values: string[]) => void;
  /** Yükleme kategorisi (API'ye geçirilir): 'PORTFOLIO' | 'ACTIVITY' | 'STUDENT' | 'OTHER'. */
  category?: 'PORTFOLIO' | 'ACTIVITY' | 'STUDENT' | 'OTHER';
  /** URL placeholder metni. */
  placeholder?: string;
  /** Label metni. */
  label?: string;
  /** true ise Dosfa butonu + hidden file input render edilir. */
  allowFileUpload?: boolean;
  /** true ise preview img render edilir. */
  showPreview?: boolean;
  /** Hata durumunda gösterilecek mesaj. */
  error?: string;
}
```

### 2.3. Davranış

- **Tekil mod (`multiple=false`):** `value` + `onChange` doğrudan bağlı. URL input + (opsiyonel) Dosfa butonu + (opsiyonel) preview.
- **Çoklu mod (`multiple=true`):** `values` array'ine ekleme. URL input + Dosfa (multiple) + her URL için küçük preview kartı + "Tümünü Temizle".
- Dosfa yükleme: `uploadMediaFile(file, category)`, dönen URL state'e yazılır. Yükleme sırasında buton `disabled` + "Yükleniyor…" label.
- Hata: `error` prop'u varsa `showToast` + inline gösterim.

## 3. Kabul Kriterleri

1. `MediaUrlField` bileşeni `apps/admin-web/src/components/ui/MediaUrlField.tsx` altında oluşturulur.
2. `ActivityGalleryPage` ve `DevelopmentPage` mevcut kopyalanmış kodu kaldırır, `MediaUrlField` kullanır.
3. Mevcut testler yeşil + yeni test eklenir.
4. ESLint temiz, check.ps1 0 hata.

## 4. Kapsam Dışı

- Çoklu dosya drag & drop (mevcut `<input type="file" multiple>` korunur).
- Farklı medya kategorileri için özel UI (tüm varyant tek bileşen).
- Kamera erişimi (`capture="environment"`).
