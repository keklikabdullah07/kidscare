# Şartname 0037 — Saha QA 2. Etap: İletişim, İsimler ve Veri Köprüsü (Batch 2)

## 1. Amaç ve Kapsam

Google Sheets QA tablosunda tespit edilen ve iletişim/veri senkronizasyonunu aksatan aşağıdaki 5 konuyu çözmektir:

1. **Mesajlaşmada Veli Adı ve Görünürlük (Tablo Satır 15, 22, 23):**
   - `MessagingRepository` sorgularına gönderici bilgisi (`sender: { id, firstName, lastName, role }`) ve ilişkili öğrenci (`student: { id, firstName, lastName }`) dahil edilecek.
   - `MessagesPage.tsx` üzerinde sohbet listesinde ve mesaj balonlarında "Veli Adı Soyadı" ve "Öğrenci Adı" açıkça görüntülenecek.
2. **İlaç Takibinde Öğrenci Adı Görünürlüğü (Tablo Satır 32):**
   - `MedicationRepository` `MEDICATION_SELECT` sorgusuna `student: { id, firstName, lastName }` eklenecek.
   - `MedicationPage.tsx` üzerindeki ilaç kartlarında öğrencinin adı ve soyadı belirgin bir başlık ve avatarla gösterilecek.
3. **İlaç Silme, Düzenleme ve Vakit Seçenekleri (Tablo Satır 26):**
   - Veli ve öğretmen ilaç ekleme modallarına hızlı dozaj vakti butonları (`Sabah - 09:00`, `Öğle - 13:00`, `İkindi - 16:00`) eklenecek.
   - Veli portalında kayıtlı ilacı silme ve güncelleme imkanı sağlanacak.
4. **Pasaporta Eklenen Kişilerin Teslimat Listesine Entegrasyonu (Tablo Satır 11):**
   - Öğrenci sağlık ve gelişim pasaportundaki yetkili teslim alıcılar (`passport.emergencyContacts[isAuthorizedPickup: true]`), `PickupPage` ve veli teslim listesinde yetkili kişi olarak doğrudan bağlanacak.
5. **Teslimat Ekranında Reaktif Öğrenci Seçimi (Tablo Satır 17):**
   - Öğretmen teslimat ekranında (`PickupPage.tsx`) listeden farklı bir öğrenci seçtiğinde, öğrencinin bilgileri, fotoğrafı, alerjileri ve teslim yetkilileri ekranda anında güncellenecek.

---

## 2. Kabul Kriterleri (Acceptance Criteria)

- [ ] **Kriter 1 (Mesajlaşmada Veli Adı):** Öğretmen mesajlar sayfasını açtığında her konuşmada velinin adını soyadını ve çocuğunun adını görür; "Bilinmeyen Kullanıcı" veya salt ID görünmez.
- [ ] **Kriter 2 (İlaçta Öğrenci Adı):** Öğretmen ilaç listesinde ilacın kime ait olduğunu (Öğrenci Adı Soyadı) kartın en tepesinde görür.
- [ ] **Kriter 3 (İlaç Doz Vakitleri & Silme):** İlaç modalında veli tek tıkla Sabah/Öğle/İkindi seçebilir; veli portaldan oluşturduğu ilacı silebilir veya güncelleyebilir.
- [ ] **Kriter 4 (Pasaport-Teslimat Köprüsü):** Pasaporta teslimat yetkilisi olarak eklenen akrabalar, okul çıkışında öğretmenin teslimat ekranında yetkili kişi listesinde görünür.
- [ ] **Kriter 5 (Reaktif Teslimat):** Öğretmen teslim edilecek öğrenciyi değiştirdiğinde formdaki isim, sınıf ve yetkili alıcılar anında değişir.
- [ ] **Kriter 6 (Doğrulama):** `./scripts/check.ps1` sıfır hata ve %100 test başarısıyla tamamlanır.
