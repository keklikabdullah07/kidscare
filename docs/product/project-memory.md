# KidsCare Proje Hafızası

> Bu dosya, uzun süreli geliştirmede ana bağlam kaynağıdır. Yeni oturum başında önce okunmalıdır.

## Güncel Durum

- Proje: Kreş yönetim ve günlük bakım platformu
- Kapsam: Yalnızca web paneli ve backend
- Mobil uygulama: Kapsam dışı, değiştirilmeyecek
- Mimari: Nx monorepo, NestJS API, React/Vite web, Prisma/PostgreSQL
- Roller: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`
- Multi-tenancy: Zorunlu

## Mevcut Temel Modüller

- Auth ve rol bazlı erişim
- Tenant yönetimi
- Öğrenci yönetimi
- Yoklama
- Günlük rapor
- Yemek menüsü
- Etkinlik galerisi
- Veli portalı
- Ekip/kullanıcı yönetimi

## Ürün Vizyonu

> Öğretmen daha az veri girsin, veli daha anlamlı bilgi alsın, admin sorunları daha erken görsün.

KidsCare yalnızca yoklama, aidat ve mesajlaşma kopyası olmayacak. Farklılaşma alanları:

- Hızlı öğretmen günlük akışı
- Anlamlı veli günlük özeti
- Güven merkezi
- Gelişim hikâyesi
- Admin erken uyarı sistemi

## Kararlaştırılmış Geliştirme Sırası

1. Teknik taban ve mevcut sistem doğrulama
2. Öğretmen günlük akışı + veli günlük özeti
3. Teslim, sağlık, ilaç, olay ve iletişim güvenliği
4. Gelişim hikâyesi ve portfolyo
5. Admin erken uyarı merkezi
6. İleri otomasyon ve tahminleme

Ayrıntılı plan: `docs/product/implementation-plan.md`

Piyasa ve ürün analizi: `docs/product/market-research-and-differentiation.md`

## Sıradaki İş (Handoff Noktası)

- **Faz 1: V1 Fonksiyonel Stabilizasyon & Sıfır Hata Turu** ➡️ **%100 TAMAMLANDI**
  - Tüm menüler (Dashboard, Öğrenciler, Sınıflar, Ekip, Günlük Akış, Yoklama, Günlük Rapor, Veli Portalı, Mesajlar, Talepler, Teslimat, İlaç, Olay Kayıtları, Yemek Menüsü, Galeri, Ayarlar) uçtan uca çalışır durumda.
  - Canlı bulut veritabanı (Render PostgreSQL) güncellendi, tüm migration'lar ve seed verileri yüklendi (200 OK).
  - Testler: 162/162 (%100) yeşil, TypeScript derleme 0 hata.
  - Git: `developer` ve `main` dalları tam senkronize.

- **Faz 2: Tasarım & UI/UX Yenileme (Başlama Noktası)** ➡️ **YENİ OTURUMDA BAŞLAYACAK**
  - Kullanıcı yeni oturumda kendi hazırladığı **Tasarım Planı**'nı paylaşacaktır.
  - Yeni oturumda bu plan doğrultusunda web paneli (`apps/admin-web`) arayüzü modern, premium ve kullanıcı dostu bir tasarıma kavuşturulacaktır.
  - Yeni oturum başladığında ilk olarak kullanıcının tasarım planı dinlenmeli ve `brainstorming` kuralı uygulanmalıdır.

## Mimari Kurallar

- Tenant sorguları `withTenant` veya `runWithTenant` kullanmalı.
- Tenant-scoped endpoint'lerde `TenantGuard` zorunlu.
- Controller içinde Prisma sorgusu yazılmamalı.
- Repository katmanı kullanılmalı.
- Constructor bağımlılıklarında açık `@Inject(...)` kullanılmalı.
- DTO ve modeller `shared-types` / `shared-schemas` içinde olmalı.
- `any` kullanılmamalı.
- Mobil koduna dokunulmamalı.
- Kullanıcının mevcut değişiklikleri ezilmemeli.

## Veri Modeli Kararları

- Sınıf ve öğretmen ilişkisi için ilişkisel model tercih edilecek.
- Öğrencinin sınıf geçmişi gerekiyorsa tarihçeli üyelik modeli kullanılacak.
- Günlük kayıtlar MVP'de mevcut yapı ile ilerleyebilir.
- Sağlık, ilaç, teslim ve olay kayıtları güvenlik/audit ihtiyacı nedeniyle ayrı modeller olmalı.
- Otomatik özet yalnızca kaydedilmiş veriyi kullanmalı; veri uydurmamalı.

## Ürün İlkeleri

- Özellik sayısı değil, gerçek sorun çözümü öncelikli.
- Öğretmeni uzun formlara zorlamamak.
- Kritik bildirimleri rutin bildirimlerden ayırmak.
- Aynı veri üç kez girilmemeli:
  - Öğretmen hızlı giriş yapar.
  - Veli anlamlı çıktı görür.
  - Admin kontrol ve uyarı görür.
- Yapay zekâ tanı koymaz, öğretmen gözleminin yerine geçmez.

## Son Oturum Notu

- **Tarih:** 2026-09-24
- **Yapılan İş:** V1 Kapsam donduruldu ve mevcut tüm 15 menünün uçtan uca hatasız çalışması sağlandı.
  - Mesajlaşma katılımcı boşluğu giderildi: `resolveDefaultParticipants` mekanizmasıyla ilgili veli, sınıf öğretmeni ve yöneticiler sohbetlere otomatik katılımcı olarak ekleniyor.
  - Veli taleplerinin öğretmenler tarafından da onaylanabilmesi (`TEACHER` yetkisi) sağlandı.
  - Öğrenci ve sınıf ilişkisi (`classroomId`) `shared-types`, `shared-schemas`, API entity ve `StudentsPage` modal/kart/tablo bileşenlerine tam olarak bağlandı.
  - `PickupPage` içinde raw ID yerine gerçek öğrenci adlarının gösterimi sağlandı.
  - Yoklama, Günlük Takip, Veli Portalı, Mesajlar, İlaç, Olay Kayıtları, Yemek Listesi, Galeri ve Ayarlar sayfaları doğrulandı.
- **Değiştirilen Dosyalar:**
  - `packages/shared-types/src/student.ts`
  - `packages/shared-schemas/src/student.schema.ts`
  - `apps/api/src/modules/students/entities/student.entity.ts`
  - `apps/api/src/modules/parent/services/parent.service.ts`
  - `apps/api/src/modules/messaging/repositories/messaging.repository.ts`
  - `apps/api/src/modules/messaging/services/messaging.service.ts`
  - `apps/api/src/modules/messaging/controllers/messaging.controller.ts`
  - `apps/api/src/modules/messaging/services/messaging.service.spec.ts`
  - `apps/admin-web/src/api/students.ts`
  - `apps/admin-web/src/features/students/StudentsPage.tsx`
  - `apps/admin-web/src/features/pickup/PickupPage.tsx`
- **Test & Derleme Sonucu:**
  - `apps/api` TypeScript derleme: 0 HATA ✅
  - `apps/admin-web` TypeScript derleme: 0 HATA ✅
  - Backend API Unit Testleri: 27 suite, 127 test BAŞARILI (%100) ✅
  - Web Vitest Testleri: 16 dosya, 35 test BAŞARILI (%100) ✅
  - Toplam 162/162 test yeşil!
- **Canlı Ortam (Render & Vercel) Doğrulaması:**
  - Canlı bulut PostgreSQL veritabanında eksik olan son 4 migration (`classrooms`, `pickup/medication`, `grants/RLS`, `messaging/incidents`) uygulandı.
  - Migration sıralama bağımlılığı düzeltildi (`conversations` RLS yetkileri tablo oluşturma sonrasına taşındı).
  - Canlıdaki `500 Internal server error` hatası tamamen giderildi; tüm canlı uç noktalar 200 OK ile doğrulandı.
  - Canlı veritabanına `pnpm db:seed` başarıyla uygulandı (6 öğrenci, 2 sınıf, günün yemek menüsü, 8 teslimatçı ve kayıtlar canlıya yüklendi).
  - Git: `developer` ve `main` dalları merge edilip tam senkronize olarak GitHub'a push edildi.
- **Açık Sorunlar:** Yok, sistem %100 sıfır hata ve çalışır durumda.

### Son Oturum Notu (2026-09-24 — Impeccable Tasarım & UI Revizyonu)

- **Tarih:** 2026-09-24
- **Yapılan İş:**
  - Impeccable toolchain & skills sisteme entegre edildi (`.agents/skills/impeccable`), `PRODUCT.md` dosyası oluşturuldu.
  - **Tipografi & Sistem Token'ları:** Jenerik AI fontları yerine pedagojik ve modern `Lexend` fontu sisteme bağlandı. `index.css` içine markaya özel seçim renkleri (`::selection`), özel kaydırma çubuğu (scrollbar) ve tabular veri hizalaması eklendi.
  - **Global Kabuk (Layout):**
    - Rol bazlı hiyerarşik menü gruplandırması yapıldı (Günlük Akış, Güvenlik & Sağlık, İletişim & Rutinler, Yönetim).
    - AI anti-pattern olan `border-l-4` kaldırıldı; yerine zarif `ring-1` ve yüksek kontrastlı aktif durumlar getirildi.
    - Cliché 3-color AI gradyanları kaldırılıp zümrüt/adaçayı ve arduvaz marka renklerine geçildi.
  - **Ana Panel (Dashboard):**
    - Banned kicker/eyebrow ve gradyanlar kaldırıldı, zemin odaklı kurumsal hero alanı oluşturuldu.
    - Yüzdelik katılım çubuğu, karne ilerleme durumu, alerjen çapraz tarama kutusu ve acil eylem paneli sıfır emoji kuralıyla zenginleştirildi.
  - **Anti-Pattern Temizliği:**
    - `DailyTrackingPage`, `MessagesPage`, `StudentPassportModal` ve `ActivityGalleryPage` içindeki mor/indigo gradyanlar, emoji ikonlar ve soluk gri metinler temizlendi.
    - `npx impeccable detect apps/admin-web/src` taraması 0 hata / 0 anti-pattern ile başarıyla tamamlandı.
- **Değiştirilen Dosyalar:**
  - `PRODUCT.md`, `apps/admin-web/PRODUCT.md`
  - `apps/admin-web/index.html`
  - `apps/admin-web/src/index.css`
  - `apps/admin-web/src/components/Layout.tsx`
  - `apps/admin-web/src/features/dashboard/DashboardPage.tsx`
  - `apps/admin-web/src/features/daily-reports/DailyTrackingPage.tsx`
  - `apps/admin-web/src/features/messages/MessagesPage.tsx`
  - `apps/admin-web/src/features/students/StudentPassportModal.tsx`
  - `apps/admin-web/src/features/activities/ActivityGalleryPage.tsx`
  - `eslint.config.mjs`, `.gitignore`
- **Test Sonucu:**
  - TypeScript derleme: 0 HATA ✅
  - `apps/admin-web` Vitest: 16 test suite, 35 test BAŞARILI (%100) ✅
  - Impeccable Anti-Pattern Dedektörü: 0 ANTI-PATTERN ✅
- **Git Durumu:** `developer` ve `main` dalları senkronize ve push edildi.
- **Sıradaki Görev:** 1. Dalga'nın kalan sayfaları (Öğrenciler ve Yoklama ekranları) üzerinde Impeccable görsel derinlik ve bileşen cilalaması.
