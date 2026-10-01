# Plan 0001 — Web Yönetim Paneli V1 Stabilizasyonu ve Kalite Denetimi

- Spec: `specs/active/0001-web-v1-stabilization-and-audit.md`
- Status: Awaiting approval
- Approved by / on: —

---

## 1. Değişecek veya Eklenecek Dosyalar (Files to Change or Add)

### Web Paneli Katmanı (`apps/admin-web/src/`)

- `apps/admin-web/src/api/client.ts` — API hata yakalama, 401/403/500 yönlendirmeleri ve toast entegrasyonu
- `apps/admin-web/src/features/auth/LoginPage.tsx` — Giriş hata bildirimleri, demo butonları kararlılığı
- `apps/admin-web/src/features/students/StudentsPage.tsx` — Öğrenci listeleme, filtreleme, ekleme/silme modal doğrulamaları
- `apps/admin-web/src/features/attendance/AttendancePage.tsx` — Sınıf seçimi, yoklama durumları ve toplu kaydetme
- `apps/admin-web/src/features/daily-reports/DailyTrackingPage.tsx` — Günlük karne form kontrolleri, yemek/uyku/ruh hali kaydı
- `apps/admin-web/src/features/team/TeamPage.tsx` — Öğretmen/personel listesi ve yetki ataması
- `apps/admin-web/src/features/tenant/TenantSettings.tsx` — Kreş genel ayarları ve sınıf yönetimi
- `apps/admin-web/src/features/parent/ParentDashboardPage.tsx` — Veli portalı, çocuk bilgisi ve karne görünümü
- `apps/admin-web/src/features/medication/MedicationPage.tsx` — İlaç kayıt modalı ve durum güncellemesi
- `apps/admin-web/src/features/pickup/PickupPage.tsx` — Yetkili teslim alma kişileri formu
- `apps/admin-web/src/features/incidents/IncidentsPage.tsx` — Olay tutanağı kaydı ve bildirim
- `apps/admin-web/src/components/EmptyState.tsx` — Boş ekran durumları için standart savunmacı UI bileşeni
- `apps/admin-web/src/components/Layout.tsx` — Navigasyon menüsü, mobil sidebar duyarlılığı, rol bazlı link filtreleme

### Test ve Denetim Dosyaları

- `e2e/web-audit.spec.ts` — Playwright veya tarayıcı tabanlı E2E akış testleri (opsiyonel/destekleyici)

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: Canlı & Yerel Ortam Hazırlığı ve Tarayıcı Denetimi (Audit)

1. **Adım 1.1:** Chrome DevTools veya Browser Subagent ile canlı (`https://kidscare.abdullahkeklik.com`) veya yerel dev sunucusu üzerinde 3 temel rolle oturum açma:
   - Admin (`admin@demo.test` / `demo1234`)
   - Öğretmen (`teacher@demo.test` / `demo1234`)
   - Veli (`parent@demo.test` / `demo1234`)
2. **Adım 1.2:** 14 sayfanın her birini tek tek ziyaret ederek konsol hatalarını (`console.error`), ağ isteklerini (`400/404/500`) ve kırık arayüzleri listeleyen **"Hata Envanteri Raporu"** çıkarma.

### Aşama 2: Çekirdek Form ve API Hatalarının Çözümü (Core Fixes)

1. **Adım 2.1 — Kimlik Doğrulama & Oturum:** Token süresi dolduğunda veya yetkisiz erişimde (`401/403`) kullanıcının beyaz ekranda kalmasını önleyen genel hata yakalayıcıyı güçlendirme.
2. **Adım 2.2 — Öğrenci Yönetimi (`/students`):** Öğrenci ekleme modalında eksik alan doğrulamaları, sınıf seçimi ve silme işleminde onay penceresi entegrasyonu.
3. **Adım 2.3 — Yoklama Sistemi (`/attendance`):** Sınıf seçildiğinde öğrencilerin yüklenmesi, yoklama butonlarına (Geldi/Gelmedi/İzinli) tıklandığında anlık state ve API mutasyonunun doğrulanması.
4. **Adım 2.4 — Günlük Karne (`/tracking`):** Öğretmenin girdiği yemek (az/orta/hepsi), uyku ve ruh hali verilerinin doğru backend DTO'su ile gönderilip kaydedilmesi.

### Aşama 3: İkincil Modüller ve Veli Portalı Denetimi

1. **Adım 3.1 — Veli Portalı (`/portal`):** Veli rolündeki kullanıcının kendi öğrencisi (Ada Yılmaz) dışındaki verilere erişemediğinin ve karneleri net okuyabildiğinin doğrulanması.
2. **Adım 3.2 — İlaç, Teslim Alma ve Olaylar (`/medication`, `/pickup`, `/incidents`):** Form gönderimlerindeki eksik API parametrelerinin düzeltilmesi.
3. **Adım 3.3 — Kreş Ayarları & Sınıflar (`/settings`, `/team`):** Admin kullanıcısının yeni sınıf oluşturabilmesi ve öğretmen atayabilmesi.

### Aşama 4: Savunmacı UI & Cilalama (Hardening & Polish)

1. **Adım 4.1:** Veri olmayan tüm tablolara `<EmptyState>` yerleştirilmesi.
2. **Adım 4.2:** Uzun isimlerde `truncate` ve kırık görsellerde `onError` fallback denetimi.

### Aşama 5: Doğrulama ve V1 Sertifikasyonu (Verification Gate)

1. **Adım 5.1:** `./scripts/check.ps1` çalıştırılarak TypeScript, Lint ve 166 otomatik testin yeşil olduğu kanıtlanır.
2. **Adım 5.2:** 14 sayfanın tamamı tarayıcıda hatasız açıldığı teyit edilir.

---

## 3. Riskler ve Öneriler (Risks & Recommendations)

1. **Risk 1: Canlı Veritabanındaki Eksik Veriler (Empty Data)**
   - _Açıklama:_ Canlıda bazı tablolarda (örn: ilaç veya olay tutanağı) henüz hiç veri olmadığı için frontend dizilim hataları (undefined property) verebilir.
   - _Öneri (Proposal):_ Tüm frontend bileşenlerinde opsiyonel zincirleme (`data?.items ?? []`) ve `<EmptyState>` koruması zorunlu kılınacaktır.
2. **Risk 2: Rol Yetkilendirme Sapması (Role Drift)**
   - _Açıklama:_ Veli kullanıcısının yanlışlıkla admin rotalarına yönlenmesi veya 403 hatasıyla donması.
   - _Öneri (Proposal):_ `RoleGuard` bileşeni yetkisiz erişimde sessizce `/portal` veya `/login` rotasına yönlendirecek ve bilgilendirici toast basacaktır.

---

## 4. Kabul Kriteri ↔ Test Eşleştirme Matrisi (Criterion ↔ Test Map)

| Kabul Kriteri               | Kanıt Şekli / Doğrulama Yöntemi                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **AC-1 (Auth)**             | Admin, Öğretmen ve Veli rolleriyle canlı/lokal giriş yapılarak JWT ve yönlendirme doğrulanır.     |
| **AC-2 (/students)**        | Yeni öğrenci eklenir, liste güncellenir, arama ve filtreleme çalışır.                             |
| **AC-3 (/attendance)**      | Papatyalar sınıfı seçilir, yoklama alınır, API'ye 200 gittiği ve state'in korunduğu kanıtlanır.   |
| **AC-4 (/tracking)**        | Bir öğrenci için günlük karne doldurulur, başarı toast'ı ve veri kalıcılığı test edilir.          |
| **AC-5 (/team)**            | Personel listesi açılır, yeni öğretmen ekleme akışı test edilir.                                  |
| **AC-6 (/settings)**        | Kreş bilgisi güncellenir, yeni sınıf eklenir.                                                     |
| **AC-7 (Ek modüller)**      | `/medication`, `/pickup`, `/incidents`, `/menus`, `/gallery` sayfaları 0 konsol hatasıyla açılır. |
| **AC-8 (/portal)**          | Veli kullanıcısı kendi çocuğunun günlük karnesini ve devamsızlık durumunu hatasız görür.          |
| **AC-9 (Konsol Temizliği)** | Tarayıcıda 14 sayfa gezilir; hiçbir `Uncaught TypeError` veya kırmızı API çökmesi görülmez.       |
