# KidsCare — Evrensel Agent & Geliştirici Kuralları (AGENTS.md)

> **DİKKAT (TÜM YAPAY ZEKA MODELLERİ VE AJANLAR İÇİN KESİN KURAL):**
> Bu dosya projenin anayasasıdır. Hangi yapay zeka veya geliştirici çalışırsa çalışsın, bu dosyadaki mimari kurallardan, teknoloji sürümlerinden ve çalışma mantığından **ASLA sapamaz ve kafasına göre değiştiremez.**

---

## 1. Teknoloji Yığını ve Güncel Sürümler

- **Monorepo:** Nx / pnpm workspaces (`/apps` ve `/packages`).
- **Backend (`apps/api`):** NestJS 10 + Fastify/Express + `tsx watch` + Prisma ORM.
- **Veri Tabanı:** PostgreSQL (Docker `kidscare-postgres` port 5433) + Redis (port 6379).
- **Web Paneli (`apps/admin-web`):** React 19 + Vite 5 + TailwindCSS.
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

**KURAL:** Tüm roller Web (`apps/admin-web`) arayüzünde desteklenmelidir.

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

## 4. Geliştirme Fazı: Faz 2 — Mobil Uygulama (`apps/mobile`)

> **FAZ GÜNCELLEMESİ:** Web yönetim paneli (`apps/admin-web`) MVP aşaması başarıyla tamamlanmış ve canlıya alınmıştır. Kullanıcı kararıyla **Faz 2: Mobil Uygulama (`apps/mobile`)** geliştirme aşamasına geçilmiştir.

**Geliştirme Kapsamı:**

- ✅ Mobil uygulama geliştirme (`apps/mobile` — Expo SDK 57 + React Native 0.86)
- ✅ Backend API geliştirme, entegrasyon ve mobil endpoint testleri (`apps/api`)
- ✅ Ortak paketler (`packages/shared-types`, `packages/shared-schemas`)
- ✅ Web paneli koruma ve bakım (`apps/admin-web`)

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

KidsCare Web Yönetim Paneli, dünya standartlarında ödüllü bir kreş/okul öncesi yönetim deneyimi sunmak üzere tasarlanmıştır. Gelecekte eklenecek tüm yeni ekranlar, özellikler ve bileşenler bu tasarım kurallarına uymak **zorundadır**:

### Renk Paleti ve Marka Kimliği

- **Birincil Marka Rengi:** İskandinav Adaçayı / Derin Çam Yeşili (`text-teal-900`, `bg-teal-700`, koyu modda `dark:text-teal-300`, `dark:bg-slate-800`).
- **Kreş Sıcaklığı & Vurgu Rengi:** Güneş Işığı & Bal Kehribarı (`bg-amber-500`, `text-amber-800`, koyu modda `dark:text-amber-300`, `dark:bg-amber-500/20`).
- **Koyu Mod Yüzeyleri:** Ana arka plan derin obsidyen `#090D16`, kart yüzeyleri `#131B2E`, sınırlar `border-slate-800/80`.
- **Açık Mod Yüzeyleri:** Ana arka plan parlamayan keten/yulaf `#FAF9F6`, kart yüzeyleri `#FFFFFF`, sınırlar `border-slate-200/80`.
- **YASAK:** Çiğ jenerik renkler (saf kırmızı, çiğ yeşil, donuk kurumsal gri, çamurlu lacivert koyu mod). Daima HSL uyumlu ve Tailwind token'ları kullanılmalıdır.

### Kart ve Konteyner Mimarisi

- Tüm kartlar ve paneller: `rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-5 shadow-xs hover:shadow-md transition-all`.
- Sayfa boşlukları: Ana içerik konteynerinde `space-y-6` veya `space-y-8`. Izgara aralıkları `gap-4` veya `gap-5`.
- Sayfa Başlıkları: `<PageHeader>` veya sol tarafta 11x11 rounded-2xl ikon rozeti (`bg-teal-700 text-white dark:bg-slate-800 dark:text-teal-300`), sağ tarafta aksiyon butonları.

### Savunmacı ve Dayanıklı UI (Hardening)

- **Uzun İsimler & Taşmalar:** Esnek alanlardaki tüm öğrenci ve veli isimlerinde `min-w-0 flex-1 truncate` ve native `title="..."` ipucu zorunludur.
- **Kırık Görseller:** Tüm `<img>` etiketlerinde `onError` koruması ve yedek görsel mekanizması zorunludur.
- **Boş Durumlar (Empty States):** Asla soğuk "Veri yok" yazılmamalıdır. Daima temalı simge rozeti (`w-12 h-12 rounded-2xl bg-amber-50/bg-blue-50`), kalın başlık ve veliyi/öğretmeni yönlendiren açıklayıcı alt metin bulunmalıdır (`<EmptyState>` bileşeni kullanılmalıdır).
- **Erişilebilirlik & Dokunma:** Buton ve interaktif kontrollerde minimum 40-44px dokunma hedefi ve açıklayıcı `aria-label` / `title` bulunmalıdır.

### Mikro-Etkileşimler (Delight & Polish)

- Tıklanabilir butonlarda `active:scale-95` veya `active:scale-98` mikro basma hissi ve `transition-all duration-200`.
- Kartlarda `hover:-translate-y-1 hover:shadow-md` mikro yükselme.
- Tüm modal ve diyaloglarda <kbd>Escape</kbd> tuşu ve dış arka plana (backdrop) tıklamayla kapanma desteği zorunludur.
