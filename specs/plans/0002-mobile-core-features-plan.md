# Plan 0002 — Mobil Uygulama (Expo) V1 Stabilizasyonu ve Entegrasyonu

- Spec: `specs/active/0002-mobile-core-features.md`
- Status: Approved
- Approved by: User

---

## 1. Değişecek veya Gözden Geçirilecek Dosyalar (Files to Inspect / Change)

### Mobil İstemci Katmanı (`apps/mobile/src/`)

- `apps/mobile/src/api/client.ts` — API base URL çözünürlüğü, 8sn timeout mekanizması, token yönetimi ve ağ hatası yakalama.
- `apps/mobile/src/theme.ts` — KidsCare Impeccable Design System renkleri (İskandinav adaçayı `#0F4C3A`, bal kehribarı `#F59E0B`, keten arka plan `#FAF9F6`).
- `apps/mobile/src/auth/LoginScreen.tsx` — Demo giriş butonları (`admin`, `teacher`, `parent`), form validasyonu ve hata mesajları.
- `apps/mobile/src/navigation/StaffTabs.tsx` & `ParentTabs.tsx` — Tab bar ikonları, rozetler ve ekran geçişleri.
- `apps/mobile/src/attendance/AttendanceCheckModal.tsx` & `src/staff/StaffCareTab.tsx` — Sınıf yoklama alma akışı ve anlık API senkronizasyonu.
- `apps/mobile/src/daily-reports/DailyReportModal.tsx` & `src/staff/StaffTrackingTab.tsx` — Günlük karne (yemek, uyku, tuvalet, ruh hali) kaydı.
- `apps/mobile/src/parent/ParentHomeScreen.tsx` & `ParentCareTab.tsx` — Veliye yansıyan karne kartları, yemek menüsü ve duyurular.
- `apps/mobile/src/components/EmptyState.tsx` & `ErrorBoundary.tsx` — Savunmacı UI ve hata toleransı.

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: API Bağlantısı & Kimlik Doğrulama Doğrulaması (Auth & Client)

1. **Adım 1.1:** Mobil istemcinin yerel API (`http://localhost:3000` / yerel IP) veya canlı API ile iletişiminin test edilmesi.
2. **Adım 1.2:** `admin@demo.test`, `teacher@demo.test` ve `parent@demo.test` hesaplarıyla mobil giriş, `AsyncStorage` token saklama ve rol bazlı yönlendirmenin (`StaffTabs` vs `ParentTabs`) test edilmesi.

### Aşama 2: Personel / Öğretmen İş Akışları (`StaffTabs`)

1. **Adım 2.1 — Yoklama (Attendance):** Sınıf bazlı öğrenci listeleme, Geldi/Gelmedi/Geç butonları ve API mutasyonunun doğrulanması.
2. **Adım 2.2 — Günlük Karne (Tracking):** Günlük karne modalında yemek (hepsi/yarısı/hiç), uyku (saat/dakika), tuvalet ve ruh hali seçimlerinin kaydedilmesi.
3. **Adım 2.3 — Öğrenci Pasaportu:** Öğrenci detay kartı, veli acil durum iletişimi ve alerji uyarılarının incelenmesi.

### Aşama 3: Veli Deneyimi (`ParentTabs`)

1. **Adım 3.1 — Veli Ana Ekranı:** Öğrenci Ada Yılmaz için bugünkü yoklama durumu ve son etkinliklerin gösterimi.
2. **Adım 3.2 — Bakım & Karne Görüntüleme:** Öğretmenin girdiği karnenin ve günün yemek menüsünün veli ekranında anında okunması.
3. **Adım 3.3 — Savunmacı UI:** Henüz karne girilmemişse veya aktivite yoksa `<EmptyState>` bileşeninin şık bir şekilde sunulması.

### Aşama 4: Tasarım Sistemi, Tip Güvenliği & Kalite Kapısı

1. **Adım 4.1:** Renk paletlerinin ve tipografinin KidsCare Impeccable Design standartlarına uyumlu hale getirilmesi.
2. **Adım 4.2:** `pnpm exec tsc -p apps/mobile/tsconfig.json --noEmit` ile sıfır tip hatası doğrulaması.
3. **Adım 4.3:** `./scripts/check.ps1` kalite kapısının çalıştırılıp tüm monorepo testlerinin yeşil kaldığının kanıtlanması.

---

## 3. Doğrulama ve Kanıt Protokolü (Verification & Evidence)

1. **Tip Güvenliği:** Mobil TypeScript derleyicisi 0 hata ile tamamlanmalıdır.
2. **Fonksiyonel Testler:** Giriş, yoklama ve karne akışları API çağrıları veya simülatör / test betikleri ile kanıtlanacaktır.
3. **Kalite Kapısı:** `./scripts/check.ps1` (55 test suite) %100 yeşil olacaktır.
