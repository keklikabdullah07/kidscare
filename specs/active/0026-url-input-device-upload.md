# Şartname 0026: Medya / Fotoğraf URL Alanlarında Cihazdan Yükleme

## 1. Amaç ve Kapsam

Bu şartname, **"Medya / Fotoğraf URL" etiketli tüm input alanlarında** cihazdan fotoğraf yükleme özelliği eklenmesini hedefler.

Tespit edilen alan:

- [`DevelopmentPage.tsx:896-908`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/development/DevelopmentPage.tsx) — portföy gözlem ekleme/düzenleme modalında "Medya / Fotoğraf URL" input.

Mevcut durum: yalnızca `<input type="url">` ile dış URL yapıştırılabiliyor. Öğretmen kendi cihazından fotoğraf yüklemek istediğinde başka bir yere yönlendirilmesi gerekiyor (upload zone yok).

**Çözüm:** URL input'unun yanına kompakt bir **"📎 Dosya"** butonu ekle. Tıklayınca file picker açılır, seçilen dosya `uploadMediaFile` API'si ile yüklenir, dönen URL otomatik olarak `portForm.mediaUrl` state'ine yazılır.

## 2. UI Değişikliği

### 2.1. Mevcut Yapı (DevelopmentPage.tsx:896-908)

```tsx
<div>
  <label>Medya / Fotoğraf URL</label>
  <input type="url" value={portForm.mediaUrl} onChange={...} />
</div>
```

### 2.2. Hedeflenen Yapı

```
[ Medya / Fotoğraf URL input    ] [📎 Dosya]
```

## 3. Kabul Kriterleri

1. URL input satırında "Dosya" butonu görünür.
2. Butona tıklayınca file picker açılır.
3. Seçilen dosya `uploadMediaFile` ile yüklenir, dönen URL `portForm.mediaUrl`'a yazılır.
4. Yükleme sırasında buton disabled olur.
5. Vitest testi eklenir (buton render + onClick).
6. ESLint + check.ps1 0 hata.

## 4. Kapsam Dışı

- Drag & drop, kamera erişimi.
- Çoklu dosya yükleme (bu alan tek URL alır).
