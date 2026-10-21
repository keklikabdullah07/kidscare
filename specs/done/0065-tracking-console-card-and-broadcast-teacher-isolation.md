# Spec 0065 — Günlük Takip Konsol Kartı Düzeni ve Duyuru/Öğretmen Yetki İzolasyonu

- Status: Draft
- Mode: lite
- Plan: `specs/plans/0065-plan.md`

## Intent

Proje genelindeki menü denetiminde iki kritik UI/UX ve rol izolasyonu zaafiyeti tespit edilmiştir:

1. **Günlük Takip (`DailyTrackingPage.tsx`) Mükerrer Filtre/Kart Karmaşası:**
   - Üstte 3 adet devasa statik kart: "Toplam Öğrenci (2)", "Karnesi Girilenler (0)", "Karne Bekleyenler (2)" tıklanabilir filtre görevi yapmaktadır.
   - Hemen altında arama çubuğunun yanında ise birebir aynı görevi yapan butonlar bulunmaktadır: `Tümü (2)`, `Girilenler (0)`, `Bekleyenler (2)`.
   - Bu durum dikeyde devasa ekran alanı çalmakta ve kullanıcıya mükerrer iki kontrol sunarak bilişsel yük yaratmaktadır.
2. **Duyuru & Bildirim (`BroadcastPage.tsx`) Öğretmen Yetki Aşımı:**
   - Bir sınıf öğretmeni (`TEACHER` rolü) sayfayı açtığında hedef kitle seçeneklerinde **"Tüm Kreş (Veli & Öğretmen)"** ve **"Öğretmenler (Sadece Eğitim Kadrosu)"** seçeneklerini görebilmekte ve tüm kreşe duyuru atabilmektedir.
   - Sektör standardı ve kreş operasyonunda bir sınıf öğretmeninin tüm kreş velilerine veya diğer öğretmenlere genel duyuru/acil durum ikazı atması yasaktır. Bu yetki yalnızca **Kurucu / Kreş Müdürü (ADMIN / SUPERADMIN)** yetkisindedir.
   - Öğretmenin hedef kitlesi yalnızca **kendi sınıfı (`Sınıf Bazlı`)** veya **kendi sınıfındaki öğrenciler (`Öğrenci Bazlı`)** ile sınırlandırılmalıdır. Tek sınıflı öğretmen için sınıf seçimi de otomatik olarak kendi sınıfına kilitlenmelidir.

---

## Requirements

### 1. `DailyTrackingPage.tsx` KPI Kartı Temizliği ve Bütünleşik Konsol Kartı

- Satır 424-534 arasındaki 3 adet dev `button` (Toplam Öğrenci, Karnesi Girilenler, Karne Bekleyenler) kartı tamamen kaldırılır.
- Arama ve filtreleme çubuğu (`{/* Filter & Search Toolbar */}`) KidsCare standartlarındaki dokunsal Bütünleşik Konsol Kartı (`bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xs`) düzenine geçirilir.
- Filtre butonları (`Tümü`, `Girilenler`, `Bekleyenler`) `<TactileTabs />` veya dokunsal buton standardıyla netleştirilir.

### 2. `BroadcastPage.tsx` Öğretmen Yetki İzolasyonu

- `useAuth()` hook'u ile kullanıcının rolü kontrol edilir (`isTeacher = user.role === 'TEACHER'`).
- Öğretmen kullanıcılarda:
  - **"Tüm Kreş"** ve **"Öğretmenler"** hedef kitle butonları gizlenir veya devre dışı bırakılır; yalnızca **"Sınıf Bazlı"** ve **"Öğrenci Bazlı"** seçenekleri sunulur.
  - Varsayılan hedef kitle `CLASSROOM` olarak atanır.
  - Sınıf listesinde yalnızca öğretmenin sorumlu olduğu sınıf(lar) listelenir; tek sınıflıysa kilitlenir.
  - Öğrenci seçim listesinde yalnızca öğretmenin kendi sınıfındaki öğrenciler listelenir.
  - "Kar Tatili", "Yemek Menüsü Değişikliği" gibi tüm kreşe yönelik şablonlar öğretmen için filtrelenir ya da hedefi otomatik kendi sınıfına çevrilir.

---

## Acceptance Criteria

- [ ] AC-1: `DailyTrackingPage` üzerinde mükerrer 3 adet kart bulunmaz; sayfa doğrudan sınıf kartları, toplu kayıt ve konsol arama/filtre çubuğu ile ferah açılır.
- [ ] AC-2: `BroadcastPage` öğretmen oturumunda açıldığında hedef kitlede "Tüm Kreş" ve "Öğretmenler" seçenekleri bulunmaz.
- [ ] AC-3: `BroadcastPage` öğretmen oturumunda yalnızca öğretmenin sorumlu olduğu sınıf ve öğrenciler seçilebilir.
- [ ] AC-4: `admin-web` vitest testleri ve `tsc --noEmit` hatasız yeşil geçer.
