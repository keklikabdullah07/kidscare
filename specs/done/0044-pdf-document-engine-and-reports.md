# Spec 0044 — PDF Belge Motoru & Resmi Çıktılar

- Status: Done
- Mode: lite
- Plan: `specs/plans/0044-pdf-document-engine-and-reports-plan.md`

## Intent

Kreş kurucuları, müdürleri ve öğretmenleri için resmi kurumlara (MEB, Sosyal Hizmetler) ibraz edilecek evraklar ile velilere sunulacak gelişim karnelerinin standart, antetli ve yüksek kaliteli yazdırılabilir formatta üretilmesi gerekmektedir.
KidsCare üzerinde dijital olarak toplanan öğrenci bilgileri, yoklama kayıtları, gelişim gözlemleri ve sağlık/alerjen verileri; ek sunucu yükü ve Docker imajını şişiren Chromium/Puppeteer gibi hantal bağımlılıklara girmeden, pixel-perfect A4 CSS baskı motoru ve tarayıcı yerel PDF desteği ile tek tıkla resmi belgelere dönüştürülmüştür.
Kapsam dışı: Dış matbaa entegrasyonu veya e-imza yasal saklama servisi.

---

## Requirements

1. **Dönem Sonu Pedagojik Karnesi (A4 Renkli / Baskıya Hazır):**
   - Öğrencinin adı, soyadı, sınıfı, doğum tarihi, yaş grubu, kan grubu ve kreş logosu.
   - 6 Gelişim Alanı (Dil, Bilişsel, Motor, Sosyal-Duygusal, Öz Bakım, Sanat) için gelişim puanı veya başarı düzeyi.
   - Öğrenci pasaportundan boy, kilo ve kan grubu bilgisi.
   - Öğretmenin öğrenciye özel pedagojik dönem sonu değerlendirme ve tebrik mesajı.
   - Sınıf öğretmeni ve kreş kurucusu/müdürü imza blokları.

2. **MEB / Resmi Aylık Sınıf Yoklama Çizelgesi:**
   - Seçilen sınıf ve ay için resmi teftişe ve arşivlemeye uygun A4 yatay (landscape) format.
   - Öğrenci listesi, gün gün katılım matrisi (G: Geldi, Y: Yok, İ: İzinli/Mazeretli).
   - Toplam devam, devamsızlık ve sınıf mevcudu özet istatistikleri.
   - Kurum adı, onay tarihi ve müdür imza alanı.

3. **Acil Durum & Alerjen Kapı/Gezi Listesi (Health & Safety Roster):**
   - Sınıf kapısına asılacak veya dış geziye çıkarken refakatçi öğretmen çantasında bulunacak A4 döküm.
   - Öğrenci adı, kan grubu, tespit edilen kritik alerjenler (kırmızı vurgulu rozetler), acil aranacak veli irtibat telefonları ve yetkili teslim alıcı isimleri.

4. **Yazdırma & Önizleme Deneyimi (Print Experience):**
   - Her belge için yazdırmadan önce ekranda tam sayfa antetli önizleme modalı (`PrintPreviewModal`).
   - Tek tıkla `Yazdır / PDF Olarak Kaydet` eylemi (`window.print()`).
   - Ekran UI öğelerinin (menüler, butonlar, başlıklar) baskıda gizlenmesi (`@media print`), sadece resmi belgenin çıkması.
   - İlgili sayfalardan doğrudan erişim (Öğrenci detayından karne, Yoklama sayfasından MEB çizelgesi, Sınıf sayfasından Acil Durum kartı).

---

## Constraints & out of scope

- **Sunucu Emanettir (İyi Misafir Protokolü):** VPS diskini ve belleğini şişirecek headless browser (Puppeteer, Playwright vb.) sunucuya kurulamaz. Tüm render istemci tarafında CSS Paged Media (`@page { size: A4; margin: 10mm; }`) standartlarıyla çalışır.
- **Kişisel Verilerin Korunması:** Sağlık ve iletişim verileri içeren belgeler yalnızca yetkili personele (Admin, Öğretmen) açıktır.

---

## Acceptance criteria

- [x] AC-1 — Yönetici veya öğretmen bir öğrenci için "Dönem Sonu Karnesi" önizlemesini açtığında, öğrencinin bilgileri, fotoğrafı, gelişim alanları ve öğretmen görüşü A4 dikey formatta eksiksiz görüntülenir.
- [x] AC-2 — Yoklama sayfasında bir sınıf ve ay seçilip "MEB Yoklama Çizelgesi" istendiğinde, gün gün katılım tablosu ve istatistikler A4 yatay düzende dökülür.
- [x] AC-3 — Sınıf sayfasından "Acil Durum & Alerji Listesi" istendiğinde, öğrencilerin kan grupları, alerjenleri ve veli acil telefonları tek sayfada net ve okunabilir olarak listelenir.
- [x] AC-4 — Yazdırma butonuna basıldığında (`window.print()`) arayüz menüleri kaybolur, yalnızca resmi antetli belge basılır veya PDF olarak kaydedilir.
- [x] AC-5 — `./scripts/check.ps1` sıfır hata ile yeşil geçer.

---

## Definition of Done

- [x] Şartname acceptance criteria'ları testlerle kanıtlanmış olmalı.
- [x] `scripts/check.ps1` %100 yeşil çıktısı alınmalı.
- [x] Şartname `specs/done/` klasörüne arşivlenmeli.
