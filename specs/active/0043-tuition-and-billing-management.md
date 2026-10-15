# 0043 — Aidat, Tahsilat & Borç Takip Modülü (/finance)

## 1. Kapsam ve Gerekçe

Özel kreş ve anaokulu kurucularının ve yöneticilerinin en büyük operasyonel ve ticari ihtiyacı, öğrenci aidatlarının, ek hizmet ücretlerinin (servis, yemek vb.) takibi, vadesi geçen borçların izlenmesi ve hızlı tahsilat kaydıdır.

Bu şartname, karmaşık muhasebe/ERP kavramlarına girmeden, doğrudan kreş yöneticisinin ve velisinin ihtiyacını karşılayan dikey bir **Aidat & Tahsilat Yönetimi (`/finance`)** modülünün hayata geçirilmesini hedefler.

---

## 2. Kullanıcı Hikayeleri

### A. Kreş Müdürü / Kurucusu (ADMIN & SUPER_ADMIN)

1. **Ücret Planı Tanımlama:** Öğrenciye aylık eğitim aidatı, ek hizmet tutarları (servis, atölye), indirim oranı/tutarı ve ödeme vade gününü (örn: her ayın 5'i) kaydedebilmelidir.
2. **Finansal Genel Bakış (KPI):** Panelde `Bu Ay Beklenen Toplam`, `Tahsil Edilen Tutar`, `Geciken Borç Tutarı` ve `Tahsilat Başarı Oranı (%)` göstergelerini anlık görebilmelidir.
3. **Geciken Borç Takibi:** Vadesi geçmiş aidatları kırmızı uyarı rozetiyle listeleyebilmeli ve tek tıkla veliye sistem içi nazik hatırlatma bildirimi gönderebilmelidir.
4. **Hızlı Tahsilat Girişi:** Veli nakit, banka havalesi veya kredi kartı ile ödeme yaptığında saniyeler içinde "+ Tahsilat Al" butonu ile kaydı tamamlayabilmeli ve borcu düşebilmelidir.

### B. Veli (PARENT)

1. **Şeffaf Bakiye ve Aidat Durumu:** Veli kendi portalında çocuğunun güncel ay aidat durumunu (`Ödendi ✅` veya `Ödeme Bekliyor ⏳`), vade tarihini ve kalan borcunu görebilmelidir.
2. **Geçmiş Ödeme Makbuzları:** Geçmiş aylara ait yapılmış ödemeleri (tarih, tutar, ödeme yöntemi) listeleyebilmelidir.

---

## 3. Mimari ve Veri Modeli

### Veritabanı Modelleri (`packages/database/prisma/schema.prisma`):

1. **`StudentBillingPlan`:** Öğrencinin aktif ücret sözleşmesi (aylık aidat, servis ücreti, indirim, vade günü).
2. **`BillingInvoice`:** Aylık tahakkuk eden aidat faturası/borcu (dönem: YYYY-MM, toplam tutar, ödenen tutar, vade tarihi, durum: `PAID`, `PARTIALLY_PAID`, `PENDING`, `OVERDUE`).
3. **`PaymentTransaction`:** Gerçekleşen ödeme kaydı (tutar, ödeme yöntemi: `CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, işlem tarihi, dekont no / açıklama).

### Servis ve Yetkilendirme:

- `Multi-tenant` izolasyonu zorunludur (`tenantId`).
- Adminler tüm kreşin finansal verilerini ve tahsilatlarını yönetebilir.
- Veliler yalnızca kendi çocuklarına ait fatura ve tahsilat geçmişini görüntüleyebilir.
- Öğretmenler finansal verilere erişemez (Rol izolasyonu).

---

## 4. İlgili Belgeler

- Uygulama Planı: `specs/plans/0043-tuition-and-billing-management-plan.md`
- Tasarım Sistemi: Dokunsal (claymorphic) kartlar, KPI göstergeleri, `<TactileTabs />` ve `<TactileButton />`.
