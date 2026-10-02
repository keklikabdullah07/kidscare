# KidsCare — Evrensel Agent & Geliştirici Kuralları (AGENTS.md)

> **DİKKAT (TÜM YAPAY ZEKA MODELLERİ VE AJANLAR İÇİN KESİN KURAL):**
> Bu dosya projenin anayasasıdır. Hangi yapay zeka veya geliştirici çalışırsa çalışsın, bu dosyadaki mimari kurallardan, teknoloji sürümlerinden ve çalışma mantığından **ASLA sapamaz ve kafasına göre değiştiremez.**

## 0. ANEW Çalışma Modu ve Değişmez Kurallar (Invariant Rules)

- **Operating Mode:** `lite` (`/new-feature` ile segmentleri sırayla işletir, her kapıda insan onayı sorar).
- **Language:** `chat=tr · docs=tr` (İletişim ve belgeler Türkçe, protokol anahtarları İngilizce kalır).
- **Mimari:** Vertical Slice Architecture (VSA) — Her özellik kendi dikey diliminde izoledir (`docs/architecture.md`).
- **Trivial Değişiklik:** Yüzeysel imla/CSS düzeltmelerinde hızlı yol işletilebilir; ancak `./scripts/check.ps1` kanıtı asla atlanamaz (`docs/git.md`).
- **Tek Kişi Disiplini:** Tek geliştirici olmak asla özensizlik veya kestirme kod yazma gerekçesi olamaz; kalite çıtası en yüksek seviyede tutulur.

### 4 Değişmez Kural (Never Delete or Weaken):

1. **No spec, no code:** Şartnamesi (`specs/active/NNNN-<ad>.md`) olmayan hiçbir iş için kod yazılamaz.
2. **Plan before build:** Kod yazılmadan önce uygulama planı (`specs/plans/NNNN-plan.md`) insan tarafından onaylanmalıdır.
3. **The producer never verifies its own work:** Kodu yazan yapay zeka kendi kodunu denetleyemez; inceleme (Review) ve kalite kontrolü (QA) bağımsız yürütülür.
4. **Evidence over claims:** "Hallettim" demek yasaktır. İşi bitirmek için `scripts/check.ps1` yeşil çıktısı ve test kanıtı sunulmalıdır.

---

- **Monorepo:** Nx / pnpm workspaces (`/apps` ve `/packages`).
- **Backend (`apps/api`):** NestJS 10 + Fastify/Express + `tsx watch` + Prisma ORM.
- **Veri Tabanı:** PostgreSQL (Docker `kidscare-postgres` port 5433) + Redis (port 6379).
- **Web Paneli (`apps/admin-web`):** React 19 + Vite 5 + TailwindCSS.
- **Mobil Uygulama (`apps/mobile`):** Expo SDK 57 + React Native 0.86.
- **Ortak Paketler:**
  - `packages/shared-types`: Tüm DTO ve TypeScript modelleri tek merkezdedir.
  - `packages/shared-schemas`: Zod validasyon şemaları.
  - `packages/tenant-context`: AsyncLocalStorage bazlı tenant context.
  - `packages/database`: Prisma schema ve migration'lar.

---

## 2. Değiştirilemez Mimari ve Rol Kuralları

### Rol Kapsamı

Sistemde şu roller bulunur:

1. `SUPERADMIN` — Çoklu kreş yönetimi, sistem genel bakış.
2. `ADMIN` — Kreş kurucusu / müdürü.
3. `TEACHER` — Sınıf öğretmeni (yoklama alma, günlük karne doldurma).
4. `PARENT` — Veli (öğrencinin yoklama, karne, yemek ve gelişim takibi).

**KURAL:** Tüm roller Web (`apps/admin-web`) ve Mobil (`apps/mobile`) arayüzlerinde desteklenmelidir.

### Multi-Tenancy İzolasyonu

- Her tabloda `tenant_id` kolonu zorunludur (global tablolar hariç).
- Repository katmanında `withTenant` veya `runWithTenant` kullanılır.
- `@UseGuards(TenantGuard)` tenant-scoped endpoint'lerde zorunludur.

---

## 3. NestJS + `tsx` İçin Hayati Kural (Dependency Injection)

`apps/api` `tsx watch` altında çalışırken TypeScript metadata'sı (reflect-metadata) parametre tiplerini otomatik vermez. Bu nedenle:

> **ZORUNLU KURAL:** Tüm Controller, Service, Guard, Middleware ve Repository sınıflarının `constructor` parametrelerinde **açıkça `@Inject(SınıfAdı)` kullanılmalıdır.**

```ts
// DOĞRU:
constructor(
  @Inject(StudentsRepository) private readonly studentsRepository: StudentsRepository,
  @Inject(PrismaService) private readonly prisma: PrismaService,
  @Inject(Reflector) private readonly reflector: Reflector,
) {}

// YANLIŞ (Runtime'da undefined hatası verir):
constructor(private readonly prisma: PrismaService) {}
```

---

## 4. Geliştirme Fazı: Faz 3 — Anlık Bildirimler, Medya Depolama & Pazarlama

- ✅ **Faz 1:** Çekirdek altyapı, NestJS API, monorepo ve Web MVP
- ✅ **Faz 2:** Web V1 stabilizasyonu (`specs/done/0001`), Docker optimizasyonu (`specs/done/0003`), Mobil temel akışlar (`specs/done/0002`)
- ⏳ **Faz 3:** Anlık Bildirimler (Push Notifications — Expo/FCM), Medya/Fotoğraf depolama servisi ve Landing Page (`apps/marketing`)
- 🚀 **Faz 4:** AI Destekli Pedagojik Karne Özeti, Storybook UI Atölyesi & İleri Analitik

---

## 5. Test ve Geliştirme Bilgileri

Varsayılan Seed Kullanıcıları:

- **Kreş Slug:** `demo` (Demo Kreş)
- **Süper Admin:** `superadmin@demo.test` / `demo1234`
- **Admin:** `admin@demo.test` / `demo1234`
- **Öğretmen:** `teacher@demo.test` / `demo1234`
- **Veli:** `parent@demo.test` / `demo1234` (Öğrenci: Ada Yılmaz)

---

## 6. Yasaklı Hareketler

- ❌ Asla `any` tipi kullanmayın.
- ❌ Asla aynı DTO veya tipi `shared-types` dışına kopyalayıp mükerrer tanımlamayın.
- ❌ Asla Controller içinde doğrudan Prisma sorgusu yazmayın (Repository üzerinden geçilmelidir).
- ❌ Asla onaylanmamış harici kütüphaneler eklemeyin.

---

## 7. Tasarım Sistemi ve UI Standartları (KidsCare Impeccable Design System)

- **Birincil Marka Rengi:** İskandinav Adaçayı / Derin Çam Yeşili (`text-teal-900`, `bg-teal-700`, koyu modda `dark:text-teal-300`, `dark:bg-slate-800`).
- **Kreş Sıcaklığı & Vurgu Rengi:** Güneş Işığı & Bal Kehribarı (`bg-amber-500`, `text-amber-800`, koyu modda `dark:text-amber-300`, `dark:bg-amber-500/20`).
- **Koyu Mod Yüzeyleri:** Ana arka plan derin obsidyen `#090D16`, kart yüzeyleri `#131B2E`, sınırlar `border-slate-800/80`.
- **Açık Mod Yüzeyleri:** Ana arka plan parlamayan keten/yulaf `#FAF9F6`, kart yüzeyleri `#FFFFFF`, sınırlar `border-slate-200/80`.
- **YASAK:** Çiğ jenerik renkler (saf kırmızı, çiğ yeşil, donuk kurumsal gri, çamurlu lacivert koyu mod).
- **Savunmacı UI:** Uzun isimlerde `min-w-0 flex-1 truncate` + `title`, kırık görsellerde `onError`, boş durumlarda `<EmptyState>`.
- **Mikro-Etkileşim:** Butonlarda `active:scale-95`, kartlarda `hover:-translate-y-1`.
