# Şartname 0013: İlaç Takibi ve Uygulama Yönetimi (Medication Tracking & Administration)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Yönetim Panelinde **Güvenlik & Sağlık ➔ İlaç Takibi (`/medication`)** sayfasının KidsCare Dokunsal Tasarım Sistemine (Claymorphic / Tactile) tam uyumlu hale getirilmesini, veli talepleri, öğretmen dozaj uygulama akışı, durum filtreleme ve ilaç arama yeteneklerinin eksiksiz tamamlanmasını tanımlar.

## 2. Kullanıcı Hikayeleri ve Rol İhtiyaçları

- **Yönetici (Admin / SuperAdmin):**
  - Velilerin girdiği ilaç kullanım taleplerini (`REQUESTED`) inceleyebilmeli, onaylayabilmeli (`APPROVED`) veya gerekçe belirterek reddedebilmelidir (`REJECTED`).
  - Gün içindeki tüm ilaçların kime, ne zaman ve hangi dozda verildiğini takip edebilmelidir.
- **Öğretmen (Teacher):**
  - Sınıfındaki öğrencilerin bugün alması gereken ilaçları (Günün İlaçları - `APPROVED` / `SCHEDULED`) bir bakışta görebilmelidir.
  - İlacı öğrenciye uyguladığında ("İlacı Ver"), uygulama notuyla birlikte tek tıkla veya detaylı kayıt altına alabilmelidir (`GIVEN`).
  - İlaç herhangi bir sebeple verilemediğinde (uyuyor, devamsız, veli isteği), atlama gerekçesini belirterek kaydedebilmelidir (`SKIPPED`).
- **Veli (Parent):**
  - Çocuğunun kreşte alması gereken ilacı (ad, doz, saat, yemek öncesi/sonrası talimatı) talep olarak sisteme girebilmelidir.

## 3. Fonksiyonel Gereksinimler

1. **KPI Özet Sayaçları (Tactile Metric Cards):**
   - Bekleyen Talepler (`REQUESTED`)
   - Günün Planlanan İlaçları (`APPROVED` + `SCHEDULED`)
   - Bugün Verilenler (`GIVEN`)
   - Atlanan & Reddedilenler (`SKIPPED` + `REJECTED`)
2. **Filtreleme & Arama (Filtering & Search Bar):**
   - Durum Sekmeleri: _Tümü_, _Onay Bekleyenler_, _Günün Planları_, _Verilenler_, _Atlanan & Reddedilenler_.
   - Öğrenci Adı ve İlaç Adına göre anlık metin araması.
   - Öğrenciye göre hızlı filtreleme dropdown'ı.
3. **Dokunsal İlaç Kartları:**
   - Tek Etkileşimli Varlık kuralı: Kartın kendisi sabit border & gölgeye sahip; içerisindeki Onayla, Reddet, Verildi, Atlandı butonları dokunsal 3D efektlidir (`TactileButton` / `.btn-tactile-*`).
   - Öğrenci adı, dozaj, planlanan saat, talimatlar, durum rozeti ve varsa ret/atlama açıklaması.
4. **Yeni Talep Oluşturma Modalı (`CreateMedicationModal`):**
   - Öğrenci seçimi, ilaç adı, dozaj, planlanan saat, talimat ve veli onay notu alanları.
5. **Doz Uygulama / Verme Modalı (`AdministerMedicationModal`):**
   - İlaç verilirken uygulama zamanı ve opsiyonel hemşire/öğretmen notu girilebilmeli (`POST /medication/records/:id/given`).
6. **Ret ve Atlama Diyalogları:**
   - Açıklama girişi zorunlu `PromptModal`.

## 4. Kabul Kriterleri

- Tüm rol bazlı yetkilendirmeler (Admin onay/ret, Öğretmen verme/atlama) korunur.
- Tasarım sistemi renkleri (#115e59 çam yeşili, #f59e0b kehribar, dokunsal basma hissiyatı) kusursuz uygulanır.
- Sayfa sıfır hata ile derlenir, Vitest birim testleri ve `./scripts/check.ps1` %100 yeşil geçer.
