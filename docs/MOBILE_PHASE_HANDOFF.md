# KidsCare — Mobil Geliştirme Fazına Geçiş ve Bellek Dosyası (MOBILE_PHASE_HANDOFF.md)

Bu dosya, web yönetim paneli MVP aşamasının tamamlanması ve **Mobil Uygulama (`apps/mobile`)** geliştirme fazının başlaması amacıyla oluşturulmuştur. Yeni açılacak oturumlarda bağlamın kaybolmaması için tüm durum, mimari ve yol haritası burada özetlenmiştir.

---

## 1. Tamamlanan Web Paneli & Backend Durumu (Özet)

- **Web Yönetim Paneli (`apps/admin-web`):**
  - Tamamen responsive (Masaüstü, Tablet, Mobil Web).
  - Giriş ekranı masaüstünde dev KidsCare logolu split-screen vitrin, mobil web'de ise tek ekran odaklı kompakt kart olarak optimize edildi.
  - 15 ana modül (Dashboard, Öğrenciler, Sınıflar, Yoklama, Günlük Takip, Veli Portalı, Mesajlar, Talepler, Teslimat, İlaç, Olay Kayıtları, Yemek Listesi, Galeri, Ekip, Ayarlar) aktif.
  - 40 adet Vitest testi ve Vite production build sıfır hatayla geçmektedir.
  - Kodlar `developer` ve `main` branch'lerine pushlandı.

- **Backend API (`apps/api`):**
  - NestJS 10 + Fastify/Express + `tsx watch` + Prisma ORM.
  - Zorunlu kural: Tüm DI injection'larda `@Inject(ClassRef)` kullanılır.
  - PostgreSQL port 5433 (`kidscare-postgres`) ve Redis port 6379 aktif.
  - Çoklu kiracılık (Multi-tenancy) `tenant_id` ve `TenantGuard` ile izole edilmiştir.

---

## 2. Mobil Uygulama Mimarisi (`apps/mobile`)

- **Teknoloji Yığını:**
  - **Framework:** Expo SDK `~57.0.22`
  - **React / React Native:** React `19.2.3`, React Native `0.86.3`
  - **Navigasyon:** `@react-navigation/native` `^7.1.6`, `@react-navigation/native-stack` `^7.3.10`
  - **Depolama:** `@react-native-async-storage/async-storage` `2.2.0`
  - **Ortak Paketler:** `@kidscare/shared-types`, `@kidscare/shared-schemas`

- **Mevcut Dizin Yapısı (`apps/mobile/src`):**
  - `auth/`: `AuthContext.tsx`, `LoginScreen.tsx`, `SignupScreen.tsx`
  - `parent/`: `ParentHomeScreen.tsx` (Veli arayüzü)
  - `students/`: `StudentsScreen.tsx` (Öğretmen/Yönetici öğrenci listesi)
  - `attendance/`: Yoklama ekranları
  - `daily-reports/`: Günlük karne ve takip
  - `daily-menus/`: Yemek menüsü
  - `activities/`: Etkinlikler
  - `components/`: Ortak UI bileşenleri, `ErrorBoundary.tsx`
  - `api/`: API istemcisi ve base config
  - `theme.ts`: Renk ve tema değişkenleri

---

## 3. Tasarım Sistemi ve Marka Kimliği (KidsCare Design Tokens)

Mobil uygulama arayüzlerinde web ile birebir uyumlu ve lüks bir kreş deneyimi sunulacaktır:

- **Birincil Marka Rengi:** İskandinav Adaçayı / Derin Orman Yeşili (`#0F766E` / `teal-700`, açık varyant `#14B8A6`, koyu varyant `#115E59`).
- **Kreş Sıcaklığı & Vurgu Rengi:** Bal Kehribarı / Güneş Sarısı (`#F59E0B` / `amber-500`, açık zemin `#FEF3C7` / `amber-100`).
- **Zemin & Kart Renkleri:**
  - **Açık Mod:** Ana zemin keten/yulaf `#FAF9F6`, kartlar `#FFFFFF`, kenarlıklar `#E2E8F0` / `slate-200`.
  - **Koyu Mod:** Ana zemin derin obsidyen `#090D16`, kartlar `#131B2E`, kenarlıklar `#1E293B` / `slate-800`.
- **Tipografi & Kartlar:**
  - Yuvarlatılmış köşeler (`borderRadius: 16` veya `24`).
  - Net dokunma hedefleri (`minHeight: 44`).
  - Yumuşak gölgeler (`elevation: 2` Android, `shadowOpacity: 0.08` iOS).
- **Marka Logosu:**
  - Amblem: `docs/assets/kidscare_logo_orman.png` veya `apps/admin-web/public/brand/kidscare-icon.png`.

---

## 4. Test Kullanıcıları ve Demo Bilgileri

Mobil testler ve hızlı doldurma butonları için:

- **Kreş Kodu (Slug):** `demo` (Demo Kreş)
- **Müdür (Admin):** `admin@demo.test` / `demo1234`
- **Öğretmen (Teacher):** `teacher@demo.test` / `demo1234`
- **Veli (Parent):** `parent@demo.test` / `demo1234` (Öğrenci: Ada Yılmaz)
- **Süper Admin:** `superadmin@demo.test` / `demo1234`

---

## 5. Yeni Sekmede Başlanacak Mobil Görev Listesi

1. **Adım 1 — Tema ve Marka Varlıklarının Güncellenmesi:**
   - `apps/mobile/src/theme.ts` dosyasını KidsCare renk paletine (Teal `#0F766E` & Amber `#F59E0B`) göre güncellemek.
   - Logo görselini `apps/mobile/assets/` altına ekleyip uygulamaya bağlamak.
2. **Adım 2 — Mobil Giriş & Kayıt Ekranları (`LoginScreen`, `SignupScreen`):**
   - Web mobil görünümünde olduğu gibi temiz, kart odaklı, KidsCare logolu ve hızlı demo giriş butonlu (`Müdür`, `Öğretmen`, `Veli`) ekran tasarımı.
   - Açık/Koyu tema desteği.
3. **Adım 3 — Rol Tabanlı Navigasyon ve Ekranlar:**
   - **Veli Modu (`ParentHomeScreen`):** Günün özeti, çocuğunun yoklama durumu, yemek menüsü, günlük karne, öğretmen mesajları.
   - **Öğretmen Modu (`TeacherNavigator`):** Hızlı 10 saniyelik sınıf yoklaması, günlük karne doldurma, ilaç ve acil durum takibi.
4. **Adım 4 — API Bağlantısı & Test:**
   - Mobil istemcinin `apps/api` ile haberleştiğinin (Expo Go / Android / iOS) doğrulanması.
