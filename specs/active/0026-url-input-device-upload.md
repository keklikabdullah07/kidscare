# Şartname 0026: URL Input'unda Cihazdan Fotoğraf Ekleme

## 1. Amaç ve Kapsam

Bu şartname, [`ActivityGalleryPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/activities/ActivityGalleryPage.tsx) içindeki "Yeni Etkinlik & Fotoğraf Paylaş" modalında, **custom URL input bölümüne cihazdan fotoğraf yükleme** özelliği eklenmesini hedefler.

Mevcut durumda modal iki ayrı bölüm içeriyor:

- **Dosya Upload Zone** (modal üst kısmı): `<input type="file" multiple>`, drag-drop görünümü
- **Custom URL Input + Preset Grid** (modal alt kısmı): URL yapıştırma + hazır fotoğraf seçimi

**Problem:** Kullanıcı URL input'unda çalışırken, cihazdan yükleme zone'u modal'ın farklı bir yerinde kalıyor. Aynı iş akışı içinde iki ayrı bölge arasında geçiş yapması gerekiyor.

**Çözüm:** Custom URL input'unun yanına kompakt bir **"📎 Dosya"** butonu eklemek. Tıklandığında file picker açılır, seçilen dosya(lar) mevcut `handleFileUpload` akışıyla yüklenir, sonuç URL'leri `selectedUrls` state'ine eklenir (preset veya elle girilmiş URL'lerle aynı şekilde).

## 2. UI Değişikliği

### 2.1. Mevcut URL Input Bölümü (Read-only referans)

```tsx
<div className="flex items-center gap-2 max-w-md">
  <input
    type="text"
    value={customUrl}
    onChange={(e) => setCustomUrl(e.target.value)}
    onKeyDown={...}
    placeholder="Başka URL ekle..."
    className="..."
  />
  <TactileButton onClick={addCustomUrl}>Ekle</TactileButton>
</div>
```

### 2.2. Hedeflenen Yapı

URL input satırına bir **Dosya Ekle** butonu ekle. Tıklayınca:

- `fileInputRef.current?.click()` → file picker açılır
- Kullanıcı dosya seçer → `handleFileUpload` tetiklenir
- Yüklenen URL'ler `selectedUrls`'e otomatik eklenir (mevcut akış)
- "Ekle" butonu korunur (URL yapıştırma için)

Görsel:

```
[ URL input                    ] [📎 Dosya] [Ekle]
```

## 3. Kabul Kriterleri

1. Custom URL input satırında "Dosya Ekle" butonu görünür.
2. Butona tıklayınca file picker açılır (jpeg/png/webp/heic kabul, multiple).
3. Seçilen dosyalar yüklenir ve `selectedUrls`'e eklenir.
4. Mevcut "Ekle" (URL yapıştırma) butonu hâlâ çalışır.
5. Mevcut üst upload zone'u kaldırılmaz (geriye uyumluluk, UX opsiyonu).
6. Vitest testleri geçer + yeni test eklenir.

## 4. Kapsam Dışı

- Drag & drop iyileştirmeleri.
- Kamera erişimi (`capture="environment"`).
- Toplu yükleme ilerleme çubuğu (zaten `uploadingFiles` state var).
