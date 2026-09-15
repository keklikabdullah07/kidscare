# KidsCare — Evrensel Agent & Geliştirici Kuralları (AGENTS.md)

> **DİKKAT (TÜM YAPAY ZEKA MODELLERİ VE AJANLAR İÇİN KESİN KURAL):**
> Bu dosya projenin anayasasıdır. Hangi yapay zeka veya geliştirici çalışırsa çalışsın, bu dosyadaki mimari kurallardan, teknoloji sürümlerinden ve çalışma mantığından **ASLA sapamaz ve kafasına göre değiştiremez.**

---

## 1. Teknoloji Yığını ve Güncel Sürümler

- **Monorepo:** Turborepo / pnpm workspaces (`/apps` ve `/packages`).
- **Backend (`apps/api`):** NestJS 10 + Fastify/Express + `tsx watch` + Prisma ORM.
- **Veri Tabanı:** PostgreSQL (Docker `kidscare-postgres` port 5433) + Redis (port 6379).
- **Web Paneli (`apps/admin-web`):** React 19 + Vite 5 + TailwindCSS.
- **Mobil Uygulama (`apps/mobile`):** **Expo SDK 57** (`expo: ~57.0.22`, `react: 19.2.3`, `react-native: 0.86.3`, `react-navigation` v7).
- **Pazarlama Sitesi (`apps/marketing`):** Next.js 14/15.
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

**KURAL:** Tüm roller hem Web (`apps/admin-web`) hem de Mobil (`apps/mobile`) arayüzlerinde desteklenmelidir.

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

## 4. Mobil (Expo SDK 57) & Ağ Kuralları

1. **`app.json` içinde `"sdkVersion": "57.0.0"` daima belirtilmelidir.** Silinmemeli veya düşürülmemelidir.
2. **Expo Başlatma:** `scripts/dev-mobile.mjs` komutunda `--clear` parametresi bulunmalıdır.
3. **Ağ / IP Yönetimi (`apps/mobile/src/api/client.ts`):**
   - API istekleri için `AbortController` (8 sn timeout) zorunludur, asla sonsuz `fetch` bırakılamaz.
   - Mobil istemci hem yerel Wi-Fi IP'sini (`http://<PC_IP>:3000`), hem genel tüneli (`https://shiny-singers-repeat.loca.lt`), hem de kullanıcı tarafından girilen özel URL'yi desteklemelidir.
   - `LoginScreen` üzerinde "⚙️ Sunucu Ayarı" her zaman erişilebilir olmalıdır.

---

## 5. Test ve Geliştirme Bilgileri

Varsayılan Seed Kullanıcıları:

- **Kreş Slug:** `demo` (Demo Kreş)
- **Veli:** `parent@demo.test` / `demo1234` (Öğrenci: Ada Yılmaz)
- **Öğretmen:** `teacher@demo.test` / `demo1234`
- **Admin:** `admin@demo.test` / `demo1234`

---

## 6. Yasaklı Hareketler

- ❌ Asla `any` tipi kullanmayın.
- ❌ Asla aynı DTO veya tipi `shared-types` dışına kopyalayıp mükerrer tanımlamayın.
- ❌ Asla Controller içinde doğrudan Prisma sorgusu yazmayın (Repository üzerinden geçilmelidir).
- ❌ Asla `apps/mobile` paket sürümlerini SDK 57 dışına düşürmeyin.
