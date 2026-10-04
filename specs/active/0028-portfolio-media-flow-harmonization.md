# Şartname 0028: Portfolyo Fotoğraf Ekleme Akışının Etkinlik Galerisi ile Birebir Uyumlaştırılması

## 1. Amaç ve Arka Plan

KidsCare yönetim panelinde "Yeni Etkinlik & Fotoğraf Paylaş" (`ActivityGalleryPage.tsx`) modalındaki görsel seçim/yükleme mimarisi (URL input + cihazdan dosya yükleme + belirgin önizleme kartları + kreş arşivi + hazır örnek görseller) altın standart deneyimi temsil etmektedir.

Buna karşın "Gelişim & Portfolyo" (`DevelopmentPage.tsx`) modalındaki portfolyo eseri ekleme alanında yalnızca sade ve preview'dan yoksun bir input bulunmakta; arşivden görsel seçme, hazır örneklerden ekleme ve zengin önizleme kartları yer almamaktadır.

Bu şartnamenin amacı, **Portfolyo Eseri Ekle** modalını da Etkinlik Galerisi ile **birebir aynı zihinsel model (mental model), görsel hiyerarşi ve dokunsal UI standartlarına** kavuşturmaktır.

---

## 2. Kapsam ve Yapılacaklar

### 2.1. `MediaUrlField.tsx` Tip ve Kod Düzeltmesi

- `MediaUrlFieldProps` arayüzüne `showAddButton?: boolean;` tanımı eklenir.
- Kod içi ve dokümantasyondaki yazım hataları ("Dosfa" -> "Dosya") düzeltilir.

### 2.2. `DevelopmentPage.tsx` Portfolyo Modalı Deneyimi

1. **Medya URL & Dosya Yükleme:**
   - `MediaUrlField` çoklu modda (`values={portMediaUrls}`, `onValuesChange={setPortMediaUrls}`, `category="PORTFOLIO"`, `showMultiplePreview={false}`, `multipleFiles`).
2. **"Paylaşılacak Fotoğraflar" Belirgin Önizleme Alanı:**
   - Seçilen görsel sayacı: `{portMediaUrls.length} seçildi` rozeti.
   - `portMediaUrls.length > 0` iken "Tümünü Temizle" butonu.
   - Boş durumda dashed kutu: "Henüz portfolyo görseli seçilmedi. Cihazınızdan fotoğraf yükleyin veya aşağıdaki galeriden seçin."
   - 3 kolonlu dokunsal kartlar:
     - `#{idx + 1}` sıra numarası rozeti.
     - `onError` kırık görsel koruması (fallback URL).
     - "Örnek Eser" veya "Yüklenen Foto" etiketi.
     - Kırmızı `X` kaldırma butonu (`removePortMediaUrl`).
3. **"Kreş Arşivinden Seçin ({tenantMediaFiles.length} fotoğraf)":**
   - Modal açıldığında `listMediaFiles('PORTFOLIO')` ve gerekirse genel kreş arşivi çekilir (`tenantMediaFiles`).
   - 4 kolonlu kaydırılabilir ızgara; tıklandığında `portMediaUrls` listesine ekleme/çıkarma yapar, seçili olanlarda yeşil onay rozeti (`Check`) gösterilir.
4. **Hazır Örnek Fotoğrafların Kaldırılması:**
   - Kullanıcı talebi doğrultusunda hem Etkinlik Galerisi hem de Portfolyo modallarından yapay/stok hazır örnek fotoğraflar kaldırılmış; yalnızca gerçek yüklenen/URL girilen fotoğraflar ve kreş arşivi bırakılmıştır.
5. **Kayıt Mantığı (`handleCreatePortfolio`):**
   - Sıfır görsel kontrolü: Görsel seçilmemişse kullanıcı uyarılır (`Lütfen en az bir portfolyo görseli seçin veya yükleyin.`).
   - Çoklu görsel desteği: Seçilen her bir görsel için `createPortfolioItem` çağrılır (birden fazla ise `Başlık (1/N)` şeklinde), böylece hiçbir seçilen/yüklenen görsel kaybolmaz.

---

## 3. Kabul Kriterleri

1. Portfolyo Eseri Ekle modalında görsel ekleme bölümü Etkinlik Galerisi ile birebir aynı düzende çalışır.
2. Cihazdan yüklenen veya URL olarak girilen görseller anında "Paylaşılacak Fotoğraflar" önizleme alanına düşer.
3. Kreş arşivinden ve hazır örnek eserlerden tek tıkla görsel seçilip kaldırılabilir.
4. "Tümünü Temizle" ve tekil görseli kaldırma butonları kusursuz çalışır.
5. `DevelopmentPage.test.tsx` ve `admin-web` vitest testleri yeşil geçer.
6. TypeScript derleme ve ESLint 0 hata verir.
