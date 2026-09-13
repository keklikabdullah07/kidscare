# Kreş Uygulaması — Teknoloji Kararları & Mimari Özet Raporu

## 1. Proje Kimliği (Özet)
- **Vizyon:** Öğretmen, öğrenci ve aile arasındaki bağı güçlendiren, tüm günlük iletişim ve bilgilendirmenin uygulama üzerinden aktığı bir kreş platformu
- **Model:** Birden fazla kreşe satılabilir çok kiracılı (multi-tenant) SaaS
- **Geliştirici profili:** Solo geliştirici; öncelik hız değil **kalite** (hız ve sağlamlık eşit ağırlıkta)
- **Ana uzmanlık:** React + Node.js (Angular/.NET yeni öğreniliyor — bu proje kapsamında kullanılmayacak)
- **İlk KPI:** Öğretmen ve ailenin uygulamaya adaptasyonu, herkesin sorunsuz kullanabilmesi

---

## 2. Bizi Ayıracak Farklılaştırıcılar
1. **Öğrenci Pasaportu** — kan grubu, alerjiler, beslenme tercihleri, bireysel notlar tek profilde (öğretmenin unutmaması için)
2. **AI destekli günlük özet** — öğretmen kısa not girer, sistem düzgün rapora çevirir
3. **Aile-katılımlı etkinlik modeli** — sadece bilgilendirme değil, aktif katılım
4. **Vendor lock-in karşıtı duruş** — istediğin an veri export
5. **Çoklu şube yönetimi** (V2) — kreş zincirlerine merkezi panel

---

## 3. MVP Kapsamı
| # | Özellik |
|---|---------|
| 1 | Öğrenci Pasaportu |
| 2 | Günlük Yaşam Takibi (yemek, uyku, aktivite) |
| 3 | Fotoğraf + Video + Günlük Akış |
| 4 | Giriş-Çıkış + Güvenlik |
| 5 | Veli ↔ Öğretmen İletişimi |
| 6 | Yemek Listesi |
| 7 | Etkinlik Yönetimi (+ materyal bilgilendirmesi) |
| 8 | Aidat + Ödeme + Evrak Yönetimi |

---

## 4. Teknoloji Kararları (Final)

### Karar Süreci
Tüm alternatifler (backend: NestJS/.NET/Django/Go/Spring; web: React/Angular/Vue/Svelte; mobil: Flutter/React Native/Ionic/Native) karşılaştırmalı olarak değerlendirildi. Solo geliştirici + gerçek uzmanlık alanı (React/Node.js) + kalite önceliği kriterleri birlikte değerlendirilince **tek dil ekseni (TypeScript uçtan uca)** net kazanan oldu.

### Final Stack

| Katman | Teknoloji | Gerekçe (özet) |
|---|---|---|
| **Veritabanı** | PostgreSQL | Row-Level Security ile tenant izolasyonu, JSONB ile esnek şema (Öğrenci Pasaportu) |
| **ORM** | Prisma | NestJS ile olgun entegrasyon, uçtan uca tip güvenliği |
| **Backend** | NestJS | Zorunlu modülerlik, built-in DI, Guard/Interceptor ile merkezi tenant izolasyonu — solo geliştiricide disiplini "yapı" sağlıyor, sen değil |
| **Admin/Öğretmen Paneli** | React + Vite | Login arkası, SEO gereksiz, hafif ve hızlı SPA |
| **Pazarlama/Tanıtım Sitesi** | Next.js | Public, SEO ve hızlı ilk yükleme kritik (müşteri kazanımı buradan) |
| **Mobil (Veli + Öğretmen)** | React Native + Expo | Tek kod tabanı, Expo ile native modül/build süreci basitleşiyor |
| **Real-time** | Socket.io | Günlük akış bildirimleri, mesajlaşma |
| **Push Notification** | Firebase Cloud Messaging | Web + mobil tek entegrasyon |
| **Dosya/Medya Depolama** | Cloudflare R2 (S3 uyumlu) | Maliyet avantajlı |
| **Ödeme** | iyzico | Türkiye pazarı |
| **Background Jobs** | BullMQ (Redis) | Günlük özet, hatırlatmalar, otomatik uyarılar |
| **State/Data Fetching (Web+Mobil)** | TanStack Query + Zustand | Az boilerplate, solo bakım kolaylığı |
| **UI Kütüphanesi (Admin Panel)** | Mantine veya shadcn/ui | Hazır bileşen seti, tasarım zamanı tasarrufu |
| **Form + Validasyon** | React Hook Form + Zod | Backend ile paylaşılan şema |
| **Monorepo** | Turborepo veya Nx | Paylaşılan tipler (`Student`, `Tenant`, `Payment`) ve validasyon şemaları tek kaynaktan |

### Neden NestJS (Express/Fastify değil)?
Express ile gidilirse yapı/disiplin geliştiriciye kalır — solo geliştirici için 6 ay sonra tutarlılığı koruma riski yüksek. NestJS'in modül/DI/Guard sistemi bu disiplini hazır sağlıyor; multi-tenant izolasyonu merkezi Guard'da tek yerden yönetilebiliyor (Express'te route başına manuel tekrar riski var — çocuk sağlık verisiyle çalışıldığı için bu risk kritik).

### Neden React + Vite / Next.js ayrımı?
Next.js'in gücü SSR + SEO. Admin panel login arkasında ve public değil, bu yüzden Next.js gereksiz ağırlık. Pazarlama sitesi ise tamamen public ve SEO'ya bağımlı büyüme stratejisi taşıyor — orada Next.js doğru araç.

---

## 5. Mimari Notlar
- **Multi-tenancy:** PostgreSQL Row-Level Security + Prisma middleware ile tenant_id filtrelemesi
- **Monorepo yapısı:**
  ```
  /apps
    /api        → NestJS backend
    /admin-web  → React + Vite (admin/öğretmen paneli)
    /marketing  → Next.js (tanıtım sitesi)
    /mobile     → React Native + Expo
  /packages
    /shared-types    → DTO/interface tanımları
    /shared-schemas  → Zod validasyon şemaları
  ```
- **KVKK/Gizlilik:** Öğrenci Pasaportu sağlık verisi içerdiği için açık rıza akışı ve erişim loglaması ilk günden planlanmalı

---

## 6. Mimari Kararların Sahipliği (Belirlenmiş vs. Agent'a Bırakılan)

### Zaten Belirlenmiş Olan (üst düzey mimari — sonradan değiştirilmesi pahalı kararlar)
- Monorepo yapısı (`/apps/api`, `/admin-web`, `/marketing`, `/mobile`, `/packages`)
- Multi-tenancy stratejisi: PostgreSQL Row-Level Security + Prisma middleware
- Katman modeli: NestJS modülerlik (her domain kendi modülü — `students`, `payments`, `tenants` vb.)
- Veri akışı: Backend → paylaşılan tipler (`packages/shared-types`) → Web/Mobil

Bu kararlar AI agent'ına bırakılmayacak; kod yazımına başlamadan önce sabitlenmiş durumda.

### Henüz Belirlenmemiş Olan (agent'ın, verilen kurallar dahilinde uygulayacağı ince mimari)
- Her modülün içindeki dosya yapısı (controller/service/DTO isimlendirmesi, repository pattern / CQRS gibi desen tercihi)
- SOLID prensiplerinin somut kod seviyesinde uygulanışı (interface soyutlamaları, DI detayları)
- Test yapısı ve klasörleme

Bu ikinci kısım agent'a tamamen serbest bırakılmayacak — `CLAUDE.md` (Claude Code için proje kuralları dosyası) içine somut kurallar (örnek modül şablonu, isimlendirme standardı, her yeni modülün içermesi gereken dosyalar) yazılarak agent'ın çerçeve içinde kod üretmesi sağlanacak.

## 7. Geliştirme Araçları Kararı

| Görev | Araç | Neden |
|---|---|---|
| Backend mimarisi (NestJS modülleri, tenant izolasyonu, domain mantığı) | **Claude Code** (Sonnet 5/Opus 5) | Derin kod tabanı muhakemesi, SOLID'e sadık kalma, çok dosyalı tutarlılık en kritik burada |
| Frontend/UI iterasyonu (admin panel, mobil ekranlar) | **Antigravity + Gemini** | Görsel diff + browser automation ile hızlı UI iterasyonu, ücretsiz |
| Rutin/toplu işler (CRUD boilerplate, dokümantasyon, basit testler) | **MiniMax M3** | Çok ucuz, bu tür işlerde yeterli |

## 8. Sıradaki Adım
Kod yazımına **Claude Code** ile başlanacak — en kritik ve sonradan değiştirilmesi en pahalı olan temel (backend mimarisi) burada atılıyor. Önerilen sıra:
1. `CLAUDE.md` proje kurallarının yazılması (modül şablonu, isimlendirme standardı, tenant izolasyon deseni)
2. Monorepo iskeletinin kurulması (Turborepo/Nx + apps/packages yapısı)
3. Veritabanı şeması (tenant, kullanıcı, öğrenci/pasaport, ödeme tabloları) + Prisma migration
4. NestJS backend temel modülleri (auth, tenants, students)
5. Admin panel temel iskelet + auth akışı (Antigravity/Gemini'ye geçiş)
