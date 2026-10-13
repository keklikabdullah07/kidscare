# Spec 0034: Güvenli Teslimat (Pickup Handover) & Yetkili Alıcı Yönetimi

## 1. Amaç & Kapsam

Bu şartname, KidsCare güvenlik matrisinin **Senaryo 3.3 (Güvenli Teslimat - Pickup Handover)** gereksinimlerini karşılar:

1. **Veli Portalı Yetkilendirme (`ParentDashboardPage.tsx`):** Veli, çocuğunu kreşten teslim alabilecek yetkili kişileri ("Teyzesi: Ayşe Demir, Tel: 555-123-4567") portaldan listeleyebilmeli ve `+ Teslim Alıcı Ekle` modalı ile hızlıca sisteme ekleyebilmelidir (`createPickupContact` + `createPickupAuthorization`).
2. **Öğretmen Teslimat Ekranı (`PickupPage.tsx`):** Okul çıkışında Ada Yılmaz'ın yetkili teslim alıcıları listesinde velinin eklediği kişi görünmeli ve onaylanabilmelidir.
3. **Yetkisiz Kişi Uyarı Kalkanı (`PickupPage.tsx`):** "Öğrenciyi Teslim Et" modalında seçilen veya yazılan kişi öğrencinin onaylı yetkili listesinde yoksa, sistem öğretmene anlık sarı/turuncu dikkat kalkanı göstererek _"⚠️ Bu kişi öğrencinin onaylı teslim alıcı listesinde bulunmuyor! Lütfen veli telefon teyidi veya kimlik kontrolü yapınız"_ uyarısı vermelidir.
4. **Resmi Teslimat Kütüğü:** Teslimat onaylandığında `POST /pickup/events` ile resmi kayıt oluşturulmalı ve teslimat günlüğüne işlenmelidir.

## 2. Mimari & Veri Akışı

- **Backend:** Mevcut `/pickup/contacts`, `/pickup/authorizations`, `/pickup/events` endpoint'leri kullanılacaktır.
- **Veli Portalı:** `ParentDashboardPage.tsx` içerisine `listPickupAuthorizations` ve `createPickupContact` / `createPickupAuthorization` entegre edilir.
- **Öğretmen Ekranı:** `PickupPage.tsx` içerisinde teslim alma modalında öğrencinin onaylı kişileri listelenir; yabancı isim girildiğinde dinamik `data-testid="unauthorized-pickup-warning"` uyarısı tetiklenir.

## 3. Kabul Kriterleri (Test Senaryoları)

- [ ] **Test 1 (Veli Portalı):** Veli portaldan çocuğunun teslim alıcılarını görebilmeli, `+ Teslim Alıcı Ekle` butonuna basıp yeni kişi (Ayşe Demir, Teyze, 0555 123 4567) eklediğinde API'ye istek gitmeli ve listede görünmelidir.
- [ ] **Test 2 (Öğretmen Ekranı & Yetkisiz Kişi Kalkanı):** Teslimat modalında onaylı kişi seçildiğinde uyarı çıkmamalı; listede olmayan bir isim girildiğinde ise _"onaylı teslimat listesinde bulunmuyor"_ uyarı kalkanı gösterilmelidir.
- [ ] **Test 3 (Teslimatın Tamamlanması):** Öğretmen teslimatı onayladığında `POST /pickup/events` başarılı olmalı ve teslimat kütüğünde listelenmelidir.
