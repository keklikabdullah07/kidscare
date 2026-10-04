# Implementation Plan: Spec 0011 — Fotoğraf & Etkinlik Galerisi (Web & Veli Portalı)

Bu plan, öğretmen ve yöneticilerin kreş aktivitelerini fotoğraflayıp etiketlemesini; velilerin ise çocuklarının gün içindeki etkinlik fotoğraflarını ve sınıf albümlerini hem Veli Portalı (`/portal`) hem de Galeri ekranı (`/gallery`) üzerinden lightbox önizlemesi ile görüntüleyebilmesini sağlar.

---

### Invariant Rules

- Tek Etkileşimli Varlık İlkesi (Single Interactive Entity Rule) korunur.
- Dokunsal Kleyomorfik Tasarım standartları (`border-2 border-[#DDD4C4]`, 3D butonlar, `#FCFAF7` zeminler) uygulanır.
- Zero-any ve `@Inject(SınıfAdı)` NestJS DI kuralına titizlikle uyulur.
- Monorepo tam doğrulama scripti (`./scripts/check.ps1`) yeşil olmadan işlem tamamlanamaz.

---

### Task 1: Backend API Yetkilendirme & Shared Client (CB-1)

**Files:**

- Modify: `apps/api/src/modules/media/controllers/media.controller.ts`
- Modify: `apps/api/src/modules/media/controllers/media.controller.spec.ts`
- Create: `apps/admin-web/src/api/media.ts`

**Adımlar:**

1. `MediaController` içindeki `GET /media` endpoint'ine `@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')` yetkisi eklenir. Veli sadece kendi kiracısına (`tenantId`) ait dosyaları listeleyebilir.
2. `apps/api/src/modules/media/controllers/media.controller.spec.ts` testinde PARENT rolünün listeleme yapabildiği doğrulanır.
3. `apps/admin-web/src/api/media.ts` oluşturularak `listMediaFiles`, `uploadMediaFile` ve `deleteMediaFile` API istemci fonksiyonları yazılır.

---

### Task 2: Lightbox & Görsel Önizleme Modalı (CB-4)

**Files:**

- Create: `apps/admin-web/src/features/gallery/LightboxModal.tsx`

**Adımlar:**

1. Seçilen görseli yüksek çözünürlükte gösteren, karartılmış zeminli (`backdrop-blur-md bg-black/80`), ESC tuşu veya kapat butonuyla kapanan modal oluşturulur.
2. Görsel metadata'sı (dosya adı, yükleyen, tarih, kategori rozeti) ve tam ekran/yeni sekmede açma veya indirme butonu eklenir.

---

### Task 3: Web Paneli Galeri Ekranı & Menü Entegrasyonu (CB-2, CB-3, CB-5)

**Files:**

- Create: `apps/admin-web/src/features/gallery/GalleryPage.tsx`
- Modify: `apps/admin-web/src/App.tsx`
- Modify: `apps/admin-web/src/components/layout/AppLayout.tsx`

**Adımlar:**

1. `GalleryPage.tsx` bileşeni hazırlanır:
   - Başlık çubuğu: İstatistikler ve "Fotoğraf Yükle" eylem alanı (`btn-tactile-teal`).
   - Kategori filtre sekmeleri: Tümü, Etkinlikler (`ACTIVITY`), Portfolyo (`PORTFOLIO`), Günlük Karne (`DAILY_REPORT`), Genel (`GENERAL`) dokunsal butonları.
   - Fotoğraf yükleme paneli: Admin ve Öğretmen için dosya seçici (`input type="file" accept="image/*"`), kategori seçimi ve anlık yükleme animasyonu.
   - Fotoğraf ızgarası (Grid): Kartlar, görsel önizlemesi, kategori etiketi, tarih ve admin/öğretmen için silme butonu.
   - Silme onayı: `ConfirmModal` ile güvenli silme.
2. `AppLayout.tsx` sol gezinme çubuğuna "Fotoğraf Galerisi" (`ImageIcon`) menü öğesi eklenir.
3. `App.tsx` içine `/gallery` rotası tanımlanır (Tüm roller erişebilir).

---

### Task 4: Veli Portalı Galeri Vitrini Entegrasyonu (CB-6)

**Files:**

- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`

**Adımlar:**

1. Veli Portalı alt kısmına "Günün Etkinlik Fotoğrafları & Galeri" vitrin kartı eklenir.
2. O güne veya son aktivitelere ait fotoğraflar dokunsal küçük kartlar halinde gösterilir; tıklandığında `LightboxModal` ile tam boyutta açılır.
3. "Tüm Galeriyi Gör" butonu ile veli doğrudan `/gallery` ekranına yönlendirilebilir.

---

### Task 5: Testler, Kalite ve Monorepo Doğrulaması

**Files:**

- Create: `apps/admin-web/src/features/gallery/GalleryPage.test.tsx`

**Adımlar:**

1. Admin-web vitest testi yazılarak galeri listeleme ve filtreleme işlevleri doğrulanır.
2. `pnpm --filter @kidscare/admin-web test` çalıştırılır.
3. `./scripts/check.ps1` ile monorepo tam tip, lint ve test denetimi yapılır.
4. Şartname `specs/done/` klasörüne taşınır ve commit atılır.
