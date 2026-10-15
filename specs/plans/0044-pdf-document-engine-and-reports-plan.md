# 0044 — PDF Belge Motoru & Resmi Çıktılar Uygulama Planı

> **İlgili Şartname:** `specs/done/0044-pdf-document-engine-and-reports.md`  
> **Kapsam:** Web Paneli (`apps/admin-web`) — Print CSS, Önizleme Modalı, 3 Resmi Belge Şablonu, Sayfa Entegrasyonları  
> **Durum:** ✅ Tamamlandı — Kalite Kapısı %100 Yeşil

---

## 1. Hedef ve Mimari Yaklaşım

**Amaç:** Kreş kurucuları, müdürleri ve öğretmenlerin resmi makamlara (MEB, Sosyal Hizmetler) sunacağı yoklama çizelgeleri, acil durum gezi listeleri ve velilere hediye edilecek dönem sonu pedagojik gelişim karnelerini, ek sunucu yükü veya hantal Chromium/Puppeteer bağımlılıkları olmadan, tarayıcının yerel baskı motoru (`@media print`, CSS Paged Media `@page`, `window.print()`) ile pixel-perfect A4 formatında üretmesini sağlamak.

### Temel Prensipler & VPS Koruması ("İyi Misafir Protokolü"):

- ❌ **Sunucu Tarafı PDF Bağımlılığı Yok:** Puppeteer, Playwright veya Chromium binary'leri Docker imajına ve VPS diskine ASLA eklenmez.
- ✅ **İstemci Taraflı Baskı Standartları:** Modern CSS `@page { size: A4; margin: 10mm; }` ve `@media print` direktifleri kullanılarak tarayıcının kendi `PDF Olarak Kaydet` ve fiziksel yazıcı sürücüsü tetiklenir.
- ✅ **Canlı Dokunsal Önizleme:** Kullanıcı yazdırmadan önce belgeyi ekranda gerçek A4 ebat ve antetli formunda inceler, tek tıkla yazdırır.

```
[İlgili Sayfa (Students/Attendance/Development)]
             │
             ▼ (Kullanıcı "Yazdır / Belge Çıkar" tıklar)
    [PrintPreviewModal] (Ekranda gerçek A4 önizleme + Yazdırma Butonu)
             │
             ├──> [ReportCardPrint] (Dönem Sonu Renkli Pedagog Karnesi - A4 Dikey)
             ├──> [AttendanceSheetPrint] (MEB Aylık Yoklama Çizelgesi - A4 Yatay)
             └──> [EmergencyRosterPrint] (Acil Durum & Alerjen Kapı/Gezi Kartı - A4 Dikey)
             │
             ▼ (window.print() tetiklenir)
   Tarayıcı Yerel PDF & Baskı İletişim Kutusu (Sayfa kırılımları & antet korunur)
```

---

## 2. Global Kısıtlar ve Standartlar

- **Tasarım:** Dokunsal (tactile) sistem; modal butonlarında `<TactileButton />`, renkli rozetlerde `<Badge />`.
- **Baskı Stilleri:** `-webkit-print-color-adjust: exact; print-color-adjust: exact;` ile renk ve arka planlar tam çıkar.
- **Ekran UI İzolasyonu:** Menüler, butonlar ve modal kontrolleri `@media print` altında gizlenir (`.no-print`), sadece antetli resmi belge basılır.
- **TypeScript:** `exactOptionalPropertyTypes: true` uyumlu, `any` tipi kesinlikle yasak.
- **Kalite Kapısı:** `./scripts/check.ps1` %100 yeşil geçmelidir.

---

## 3. Görev Listesi ve Adımlar

### Görev 1: Print CSS Stillerinin Tanımlanması (`apps/admin-web/src/index.css`)

**Dosyalar:**

- Düzenle: `apps/admin-web/src/index.css`

**Gereksinimler:**

- `@media print` blokunun tanımlanması.
- `.no-print` sınıfı verilen elemanların (navigasyon, butonlar, modal başlıkları) baskıda gizlenmesi.
- `@page` dikey (portrait) ve yatay (landscape) tanımları.
- A4 dikey (210mm x 297mm) ve yatay (297mm x 210mm) boyutlandırma sınıfları (`.print-sheet-portrait`, `.print-sheet-landscape`).
- Sayfa kırılım kuralları (`.break-after-page`, `.avoid-break`).
- Renkli baskı zorunluluğu (`print-color-adjust: exact;`).

---

### Görev 2: Baskı Önizleme Modalı (`PrintPreviewModal.tsx`)

**Dosyalar:**

- Oluştur: `apps/admin-web/src/components/print/PrintPreviewModal.tsx`

**Gereksinimler:**

- Tam ekran karartmalı modal arayüzü.
- Üstte dokunsal kontrol paneli (`.no-print`):
  - Belge başlığı ve simgesi.
  - Sayfa yönlendirme rozeti (A4 Dikey / A4 Yatay).
  - `🖨️ Yazdır / PDF Kaydet` eylemi (`window.print()`).
  - `✖ Kapat` eylemi (ESC tuşu veya kapat butonu).
- Ortada gerçek A4 kağıt formunda, gölgeli beyaz zemin üzerinde canlı belge render alanı (`#printable-document`).

---

### Görev 3: Dönem Sonu Pedagojik Karnesi Şablonu (`ReportCardPrint.tsx`)

**Dosyalar:**

- Oluştur: `apps/admin-web/src/components/print/ReportCardPrint.tsx`

**Gereksinimler (AC-1):**

- A4 dikey, renkli, prestijli pedagojik belge tasarımı.
- **Antet Bölümü:** T.C. Millî Eğitim Bakanlığı Standart Anteti, Kurum Adı, Dönem (Örn: 2026-2027 Eğitim Öğretim Yılı 1. Dönem).
- **Öğrenci Kartviziti:** Öğrenci adı soyadı, fotoğrafı/avatarı, sınıfı, doğum tarihi, yaş grubu, kan grubu, boy, kilo.
- **6 Temel Pedagojik Gelişim Alanı Matrisi:**
  1. Dil ve İletişim Becerileri
  2. Bilisel Gelişim
  3. Motor Becerileri (Kaba & İnce Motor)
  4. Sosyal ve Duygusal Gelişim
  5. Öz Bakım & Günlük Yaşam Becerileri
  6. Görsel Sanatlar & Müzik
  - Her alan için 4 kademeli değerlendirme rozeti (Geliştirilmeli / Gelişmekte / Yetkin / İleri Düzey) ve açıklayıcı kazanım notu.
- **Öğretmenin Pedagojik Görüşü:** Öğretmenin öğrenciye özel sıcak ve teşvik edici dönem sonu değerlendirmesi.
- **Onay & İmza Blokları:** Sınıf Öğretmeni ve Kurum Müdürü imza/mühür alanları.

---

### Görev 4: MEB Resmi Aylık Sınıf Yoklama Çizelgesi Şablonu (`AttendanceSheetPrint.tsx`)

**Dosyalar:**

- Oluştur: `apps/admin-web/src/components/print/AttendanceSheetPrint.tsx`

**Gereksinimler (AC-2):**

- A4 yatay (landscape) format.
- **Resmi Başlık:** Kurum adı, sınıf adı, seçilen ay ve yıl, resmi mevzuat döküm başlığı.
- **Aylık Matris Tablosu:**
  - Sütunlar: Sıra No, Öğrenci No, Adı Soyadı, 1'den 31'e kadar ayın tüm günleri (hafta sonları gri taralı), Toplam Geldiği Gün (G), Toplam İzinli Gün (İ), Toplam Devamsızlık (Y), Devam Oranı (%).
  - Satırlar: Sınıftaki tüm öğrenciler alfabetik sıralı.
- **Alt İstatistik Özeti:** Sınıf mevcudu, ay içindeki toplam iş günü, sınıf ortalama devam yüzdesi.
- **Resmi Onay:** Tanzim tarihi, Sınıf Öğretmeni ve Okul Müdürü imza blokları.

---

### Görev 5: Acil Durum & Alerjen Kapı/Gezi Listesi Şablonu (`EmergencyRosterPrint.tsx`)

**Dosyalar:**

- Oluştur: `apps/admin-web/src/components/print/EmergencyRosterPrint.tsx`

**Gereksinimler (AC-3):**

- A4 dikey format, yüksek okunabilirlik ve kontrast.
- **Başlık & Güvenlik Uyarısı:** Kurum adı, sınıf adı, refakatçi öğretmenler, acil durum protokol hatırlatması (112 Acil / Kurum Santrali).
- **Öğrenci Güvenlik Tablosu:**
  - Sıra No, Öğrenci Adı Soyadı, Fotoğrafı.
  - Kan Grubu (Kırmızı belirgin yazı).
  - Kritik Alerjenler (Varsa dikkat çekici kırmızı/amber uyarı kutusu, yoksa "Yok").
  - Kronik Durumlar & Sürekli İlaçlar.
  - Birincil Veli Adı ve Telefonu (aranabilir format).
  - İkincil / Acil Durum Kişisi ve Telefonu.
  - Teslim Almaya Yetkili Kişiler.
- **Alt Bilgi:** "Bu belge gizli kişisel sağlık verileri içerir; yalnızca yetkili öğretmen gözetiminde kapı arkasında veya gezi dosyasında bulundurulmalıdır."

---

### Görev 6: Sayfa Entegrasyonları (`StudentsPage`, `AttendancePage`, `DevelopmentPage`)

**Dosyalar:**

- Düzenle: `apps/admin-web/src/features/students/StudentsPage.tsx`
- Düzenle: `apps/admin-web/src/features/attendance/AttendancePage.tsx`
- Düzenle: `apps/admin-web/src/features/development/DevelopmentPage.tsx`

**Entegrasyonlar:**

1. **Öğrenciler Sayfası (`StudentsPage.tsx`):**
   - Öğrenci kartındaki işlem menüsüne ve öğrenci pasaport modalına `🎓 Karne Yazdır` butonu.
   - Sınıf filtresi yanındaki üst eylemlere `🚨 Acil Durum / Gezi Listesi Yazdır` butonu.
2. **Yoklama Sayfası (`AttendancePage.tsx`):**
   - Başlık alanına `📄 MEB Yoklama Çizelgesi Yazdır` dokunsal butonu (seçili ay ve sınıf için önizlemeyi açar).
3. **Gelişim Değerlendirme Sayfası (`DevelopmentPage.tsx`):**
   - Öğrenci gelişim sekmesinde `🎓 Pedagojik Karne Yazdır` butonu.

---

### Görev 7: Birim Testleri & Kalite Kapısı Doğrulaması

**Dosyalar:**

- Oluştur: `apps/admin-web/src/components/print/PrintPreviewModal.test.tsx`

**Adımlar:**

- `PrintPreviewModal`, `ReportCardPrint`, `AttendanceSheetPrint` ve `EmergencyRosterPrint` bileşenlerinin doğru veriyle hatasız render olduğunu doğrulayan Vitest testleri.
- `./scripts/check.ps1` komutunun çalıştırılması (TypeScript derlemesi, ESLint ve tüm test suite'leri).
- Değişikliklerin commit edilmesi ve şartnamenin `specs/done/0044-pdf-document-engine-and-reports.md` konumuna taşınması.

---

## 4. Onay ve Başlama

Bu plan onaylandıktan sonra sırayla Görev 1'den Görev 7'ye kadar uygulanacak ve her adım testlerle kanıtlanacaktır.
