# Spec 0050 — Öğretmen & Veli Sınıf İzolasyonu ve Veri Gizliliği Paketi

- Status: Done
- Mode: lite
- Plan: `specs/plans/0050-plan.md`

## Intent

KidsCare okul öncesi platformunda KVKK, öğrenci mahremiyeti ve MEB mevzuatı gereğince öğretmen ve veli ekranlarında katı veri izolasyonu sağlanacaktır. Bir sınıf öğretmeninin diğer sınıflara ait veli taleplerini, revir/olay kayıtlarını, pedagojik portfolyoları ve yemek alerjen uyarılarını görmesi engellenmiş; öğretmenin ekranları sadece sorumlu olduğu sınıfın öğrencilerine kilitlenmiştir. Benzer şekilde velilerin sadece kendi çocuklarına ait teslimat yetkililerini görmesi sağlanmış ve öğrenci listesi tablo görünümündeki beslenme kısıtlaması görünürlük eksikliği giderilmiştir (E-Tablo Satır 38, 39, 42, 43, 44, 45).

## Requirements

1. **Öğretmen Veli Talepleri İzolasyonu (Tablo Satır 42):**
   - `ParentRequestsPage`: Kullanıcı `TEACHER` rolündeyse, sorumlu olduğu sınıfların öğrencilerine ait veli talepleri ve sayaçları filtrelenir. Form ve filtre dropdown'ları öğretmenin sınıfı ile sınırlıdır. Admin ve Süper Admin tüm talepleri görmeye devam eder.

2. **Öğretmen Yemek Listesi Alerjen İzolasyonu (Tablo Satır 43):**
   - `DailyMenuPage`: Öğretmen yemek menüsü sayfasını açtığında, günün menüsüyle eşleşen alerji uyarıları (`allergenWarnings`) ve sayaçlar yalnızca öğretmenin kendi sınıfındaki öğrencileri kapsar.

3. **Öğretmen Olay / Revir Kayıtları İzolasyonu (Tablo Satır 44):**
   - `IncidentsPage`: Öğretmen sisteme girdiğinde olay kayıtları listesinde, sayaçlarda ve öğrenci seçici dropdown'larında sadece kendi sınıfındaki öğrencileri görür ve sadece kendi sınıfı için kayıt girebilir.

4. **Öğretmen Gelişim & Portfolyo İzolasyonu (Tablo Satır 45):**
   - `DevelopmentPage`: Öğretmen pedagojik gözlem ve portfolyo sayfasına girdiğinde, öğrenci listesi, sayaçlar ve gözlem kartları yalnızca kendi sınıfındaki öğrencilerle sınırlandırılmıştır.

5. **Veli Teslimat Yetkilileri İzolasyonu (Tablo Satır 39):**
   - Veli portalında ve genel teslimat API/ekranında (`PickupPage`), veli yalnızca kendi çocuğuna tanımlı veya onaylanmış teslimat yetkililerini ve geçmiş kütüğü görür.

6. **Öğrenci Tablo Görünümünde Beslenme Kısıtlamaları (Tablo Satır 38):**
   - `StudentsPage.tsx` liste/tablo görünümünde Sağlık sütununa `p.dietaryRestrictions` rozeti eklenmiştir; kart görünümünde olduğu gibi tablo görünümünde de öğrencinin vejetaryen, glütensiz vb. beslenme kısıtlamaları görünürdür.

## Acceptance criteria

- [x] AC-1: Öğretmen rolündeki kullanıcı `ParentRequestsPage`'de sadece kendi sınıfındaki öğrencilerin veli taleplerini görür.
- [x] AC-2: Öğretmen rolündeki kullanıcı `DailyMenuPage`'de sadece kendi sınıfındaki öğrencilerin alerjen uyarılarını görür.
- [x] AC-3: Öğretmen rolündeki kullanıcı `IncidentsPage`'de sadece kendi sınıfındaki öğrencilerin olay/revir kayıtlarını görür ve açar.
- [x] AC-4: Öğretmen rolündeki kullanıcı `DevelopmentPage`'de sadece kendi sınıfındaki öğrencilerin gözlem ve portfolyolarını görür.
- [x] AC-5: Veli ekranında teslimat yetkilileri yalnızca aktif seçili çocuğa ait kişileri listeler.
- [x] AC-6: `StudentsPage.tsx` tablo görünümünde beslenme kısıtlamaları (`dietaryRestrictions`) rozetleri listelenir.
- [x] AC-7: Tüm testler güncellenir ve `./scripts/check.ps1` %100 yeşil geçer.

## Definition of Done

- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check.ps1` green (%100 Başarılı)
- [x] Independent review done; real findings fixed
- [x] Spec moved to `specs/done/`
