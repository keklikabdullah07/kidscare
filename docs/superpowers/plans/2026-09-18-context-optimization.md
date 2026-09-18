# KidsCare Context & Proje Sadeleştirme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KidsCare uygulamasının yapay zeka context token tüketimini düşürmek, kök dizindeki dağınıklığı kurumsal monorepo standartlarına kavuşturmak ve gereksiz arama/indeksleme şişkinliğini ortadan kaldırmak.

**Architecture:** Tek kural kaynağı (single source of truth) olarak kristalize edilmiş `AGENTS.md` mimarisi, `.ignore` / `.geminiignore` tabanlı arama kalkanı, `docs/` altında hiyerarşik dokümantasyon organizasyonu.

**Tech Stack:** Turborepo, pnpm workspaces, NestJS 10, Expo SDK 57, React 19, Vite 5.

## Global Constraints

- `AGENTS.md` içindeki tüm teknik kurallar (Expo SDK 57, NestJS `@Inject`, multi-tenancy `tenant_id` + TenantGuard, 4 rol, varsayılan test seed'leri) eksiksiz korunacaktır.
- Kod veya paket bağımlılıklarında hiçbir runtime kırılması yaratılmayacaktır.
- Taşınan tüm dokümanlar `docs/` altında arşivlenecek ve hiçbir bilgi kaybı yaşanmayacaktır.

---

### Task 1: Kök Dizindeki Ekran Görüntüleri ve Geçici Logların Temizlenmesi

**Files:**

- Move: `01-admin-web.png`, `02-marketing.png`, `03-expo-dev-tools.png`, `04-api-health.png`, `expo-status.png` -> `docs/assets/screenshots/`
- Delete: `expo-live.log`

- [ ] **Step 1: Hedef dizini oluştur ve görselleri taşı**
- [ ] **Step 2: Geçici log dosyasını sil**
- [ ] **Step 3: Doğrula ve commit et**

---

### Task 2: Dokümantasyon Dosyalarının `docs/` Hiyerarşisine Düzenlenmesi

**Files:**

- Move: `PROJECT_INFO.md` -> `docs/architecture/initial-project-info.md`
- Move: `kres-uygulamasi-teknoloji-karar-raporu.md` -> `docs/architecture/tech-decision-report.md`
- Move: `DEPLOYMENT.md` -> `docs/deployment/DEPLOYMENT.md`
- Move: `LOCAL_DEV.md` -> `docs/development/LOCAL_DEV.md`
- Modify: `README.md` (yeni doküman yollarını linkleyecek şekilde güncelleme)

- [ ] **Step 1: Dizinleri oluştur ve markdown dosyalarını taşı**
- [ ] **Step 2: `README.md` içindeki linkleri güncelle**
- [ ] **Step 3: Doğrula ve commit et**

---

### Task 3: Ignore ve Arama Filtrelerinin Güçlendirilmesi (.gitignore, .ignore, .geminiignore)

**Files:**

- Modify: `.gitignore`
- Create: `.ignore`
- Create: `.geminiignore`

- [ ] **Step 1: `.gitignore` dosyasına eksik klasör ve kalıpları ekle**
- [ ] **Step 2: `.ignore` ve `.geminiignore` dosyalarını oluştur (eski SDD raporları ve build çıktıları için)**
- [ ] **Step 3: Ripgrep ile arama yapılarak ignore filtrelerinin çalıştığını test et**
- [ ] **Step 4: Commit et**

---

### Task 4: Kural Dosyalarının ve Prompt Context'in Sadeleştirilmesi

**Files:**

- Modify: `AGENTS.md` (öz ve net anayasa, %35 token tasarrufu)
- Modify: `GEMINI.md` (minimal referans)
- Modify: `CLAUDE.md` (mükerrer kısımlar yerine `AGENTS.md` referansı)
- Move/Archive: `.claude/skills/` -> `docs/archive/claude-skills/`

- [ ] **Step 1: `AGENTS.md` dosyasını kritik kuralları eksiksiz koruyarak sadeleştir**
- [ ] **Step 2: `GEMINI.md` ve `CLAUDE.md` dosyalarını `AGENTS.md`'yi referans alacak şekilde hafiflet**
- [ ] **Step 3: `.claude/skills/` klasörünü `docs/archive/` altına alarak arama/token kirliliğini engelle**
- [ ] **Step 4: Commit et**

---

### Task 5: Genel Doğrulama ve Bütünlük Testi

- [ ] **Step 1: `git status` kontrolü yap**
- [ ] **Step 2: Proje test ve tip kontrolünü çalıştır (`pnpm --filter @kidscare/api test:unit` veya build)**
- [ ] **Step 3: Sonuçları doğrula ve özetle**
