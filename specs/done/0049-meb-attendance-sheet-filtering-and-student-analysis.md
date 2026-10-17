# Spec 0049 — MEB Yoklama Çizelgesi Filtreleme & Zenginleştirilmiş Öğrenci Analiz Çıktısı

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0049-plan.md`

## Intent

KidsCare yönetim panelinde yer alan "MEB Çizelgesi Yazdır" işlevinin, ekrandaki aktif sınıf ve tarih filtrelerine duyarsız kalarak tüm okulu ve varsayılan sabit değerleri (%94 ortalama vb.) yazdırması sorunu çözülecektir. Resmi MEB teftiş ve arşiv standartlarına (Okul Öncesi Eğitim Kurumları Yönetmeliği) tam uyumlu olarak; seçili sınıf, seçili ay/yıl ve filtrelenmiş öğrenciler baz alınacaktır. Çizelge çıktısında öğrencilerin T.C./Kütük No (veya Öğrenci No), Ad Soyad, Cinsiyet (K/E), Yaş/Doğum Yılı bilgileri, ayın tüm iş günlerine ait gerçek devam-devamsızlık durumu (G, İ, Y) ve dinamik hesaplanan ağırlıklı sınıf devam ortalaması yer alacaktır.

## Requirements

1. **Sınıf ve Tarih Filtresi Sadakati:**
   - Yoklama sayfasında (`AttendancePage`) seçili olan sınıf (tüm sınıflar veya belirli bir sınıf), seçili ay ve yıl MEB baskı modalına doğrudan yansıtılmalıdır.
   - Çizelge başlığında seçili sınıfın gerçek adı (örneğin "Papatyalar Sınıfı" veya "Tüm Sınıflar & Gruplar"), ilgili ay ve yıl yazmalıdır.
   - İlgili sınıfın atanmış öğretmeni varsa "Sınıf Öğretmeni" imza alanında o öğretmenin adı yer almalıdır.

2. **Aylık Gerçek Yoklama Verisi Çekimi (Date-Range API Entegrasyonu):**
   - MEB çizelgesi sadece seçilen tek bir günün verisini değil, o ayın 1'inden ay sonuna kadarki tüm günlerin yoklama verilerini backend'den çekmelidir.
   - API `GET /attendance?startDate=YYYY-MM-01&endDate=YYYY-MM-DD` aralık sorgusunu desteklemelidir.

3. **Zenginleştirilmiş Öğrenci Analizi ve MEB Mevzuat Sütunları:**
   - Tabloda resmi MEB teftiş formatına uygun sütunlar bulunmalıdır:
     - Sıra No
     - Öğrenci No / Kütük No (varsa id son 4 hanesi / kütük)
     - Öğrenci Adı Soyadı
     - Cinsiyet (K / E)
     - Doğum Yılı / Yaş (örn: 2021 / 5 Yaş)
     - 1'den 28/29/30/31'e kadar Gün Matrisi (Hafta sonları otomatik gri '—', gelecek günler '·' veya açık gri, geçmiş iş günleri G/İ/Y)
     - Toplam Geldi (G), İzinli/Raporlu (İ), Devamsız (Y)
     - Bireysel Devam Yüzdesi (%)
   - Tablo alt özetinde:
     - Sınıf Mevcudu: Toplam Öğrenci (X Kız, Y Erkek)
     - Ayın Toplam Resmi İş Günü Sayısı
     - Gerçek Sınıf Devam Ortalaması: Sınıfın gerçek devam eden günlerinin toplam iş günü mevcuduna oranı (Asla %94 hardcoded olmayacak!).

4. **Yazdırma Modalında Hızlı Ay ve Sınıf Değiştirme (Toolbar):**
   - Baskı önizleme modalı açıldığında, kullanıcının sayfayı kapatmadan farklı bir ayı veya farklı bir sınıfı seçip çıktısını anında yenileyebilmesine olanak tanıyan mini bir filtre/araç çubuğu sunulmalıdır.

## Constraints & out of scope

- A4 Landscape (Yatay) baskı formatı korunmalı, tablo sağa/aşağı taşmayacak şekilde CSS `@media print` ve tablo genişlikleri optimize edilmelidir.
- Mevcut tekil gün API çağrısı (`GET /attendance?date=...`) geriye dönük tam uyumlu kalmalı, bozulmamalıdır.
- Harici onaylanmamış kütüphane eklenmeyecektir.

## Acceptance criteria

- [x] AC-1: `AttendanceRepository`, `AttendanceService` ve `AttendanceController` tarih aralığı (`startDate`, `endDate`) ile yoklama sorgulamayı destekler.
- [x] AC-2: `AttendancePage` üzerinden MEB çizelgesi yazdırıldığında aktif seçili sınıfın adı, öğrencileri ve ilgili ayın gerçek yoklama kayıtları aktarılır.
- [x] AC-3: `AttendanceSheetPrint` bileşeninde Öğrenci No, Cinsiyet (K/E) ve Yaş/Doğum Yılı sütunları eksiksiz listelenir.
- [x] AC-4: Sınıf devam ortalaması (%...) ve kız/erkek dağılımı gerçek verilere dayalı dinamik olarak hesaplanır, hardcoded değerler temizlenir.
- [x] AC-5: Gelecek iş günleri veya henüz yoklaması alınmamış günler haksız yere 'G' (Geldi) olarak işaretlenmez, nötr gösterilir.
- [x] AC-6: Birim/entegrasyon testleri güncellenir ve `./scripts/check.ps1` %100 yeşil geçer.

## Definition of Done

- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check.ps1` green
- [x] Independent review done; real findings fixed
- [x] Spec moved to `specs/done/`

## Scorecard

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 1     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
