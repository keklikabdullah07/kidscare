# Şartname 0040: Veli Dijital Mazeret Bildirimi & Gezi/Etkinlik Onay Formu

## 1. Amaç & İş Değeri

- **Sabah Telefon Trafiğini Bitirmek:** Velilerin sabah çocuğunun hastalığı veya izin durumu için kreş müdürünü ya da öğretmeni aramak zorunda kalmasını önlemek; veli portalından tek tıkla mazeret bildirebilmesini sağlamak.
- **Yemek & Mutfak İsrafını Önlemek:** Sabah bildirilen mazeretler sayesinde mutfak personelinin ve sınıf öğretmeninin o günkü mevcut öğrenci sayısını ve porsiyon adedini anında görebilmesi.
- **Kağıt İzin Formlarını Kaldırmak:** Okul dışı gezi, tiyatro, müze vb. etkinliklerde çantada kaybolan kağıt formlar yerine veliden mobil/web üzerinden hukuki & dijital izin toplanması.

---

## 2. Kapsam ve Roller

### A. Veli (PARENT)

1. **Mazeret Bildirimi:** Veli ana sayfasında dokunsal `📅 Gelemeyeceğimizi Bildir` butonu. Tarih, mazeret nedeni (Hastalık, Aile İzni, Seyahat vb.) ve kısa açıklama girerek bildirim gönderebilme.
2. **Gezi & Etkinlik İzni:** Kendisine iletilen etkinlik için detayları (yer, tarih, ücret, açıklama) inceleyip `✅ İzin Veriyorum` veya `❌ Katılmayacak` seçimi yapabilme.

### B. Öğretmen & Kreş Müdürü (TEACHER & ADMIN)

1. **Yoklama & Liste Entegrasyonu:** Mazeret bildiren öğrencinin yoklama ekranında otomatik `Mazeretli` rozeti ve sebebiyle görünmesi.
2. **Anlık Bildirim:** Veli bildirim yaptığında sınıf öğretmenine ve yönetime _"X öğrencisi bugün gelemeyecek"_ push ve sistem bildirimi düşmesi.
3. **Etkinlik İzin Takibi:** Geziye katılacak sınıftaki öğrencilerin izin durumunu (İzin Verenler / Katılmayanlar / Yanıt Bekleyenler) liste ve oran olarak izleyebilme.

---

## 3. Kabul Kriterleri (Acceptance Criteria)

- [ ] `packages/database`: `AttendanceExcuse` ve `EventConsent` Prisma modelleri oluşturulmalı, migration çalıştırılmalı.
- [ ] `packages/shared-types` & `shared-schemas`: Mazeret ve etkinlik onay DTO/validasyon şemaları tanımlanmalı.
- [ ] `apps/api`: `AttendanceModule` altına mazeret endpoint'leri (`POST /attendance/excuses`, `GET /attendance/excuses`) ve etkinlik izin endpoint'leri eklenmeli.
- [ ] `apps/api`: Mazeret kaydedildiğinde `NotificationsService` ile öğretmene/yöneticiye anlık bildirim tetiklenmeli.
- [ ] `apps/admin-web`: Veli ana sayfasında mazeret bildirme modalı ve bekleyen izin formları kartı yer almalı.
- [ ] `apps/admin-web`: Öğretmen yoklama sayfasında mazeretli öğrenciler açıkça belirtilmeli.
- [ ] `./scripts/check.ps1` %100 yeşil geçmeli.
