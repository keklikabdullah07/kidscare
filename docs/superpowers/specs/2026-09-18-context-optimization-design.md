# KidsCare — Context ve Proje Şişkinliğini Azaltma Tasarım Dokümanı (Design Spec)

- **Tarih:** 2026-09-18
- **Kapsam:** Yapay zeka context penceresi (token tasarrufu & indeksleme filtreleri) ve proje dosya sistemi/dokümantasyon temizliği.
- **Hedef:** Antigravity/Gemini ve diğer AI ajanlarının her istekte tükettiği kural token'larını minimuma indirmek, arama sonuçlarındaki bilgi kirliliğini engellemek ve kök dizini kurumsal bir monorepo standardına kavuşturmak.

---

## 1. Problem Tanımı ve Mevcut Durum

1. **Yapay Zeka Prompt & Kural Şişkinliği:**
   - Antigravity, her mesajlaşmada `AGENTS.md` (4 KB) ve `GEMINI.md` dosyalarını tam metin kural (`<RULE>`) olarak modele enjekte etmektedir.
   - `CLAUDE.md` (4.8 KB) dosyası da `AGENTS.md` ile hemen hemen aynı maddeleri mükerrer olarak barındırmaktadır.
   - `.claude/skills/` altında 7 adet skill dosyası bulunmakta ve bazılarında artık geçerli olmayan (örneğin Expo SDK 51 gibi) çelişkili bilgiler yer almaktadır.
2. **Arama ve İndeksleme Şişkinliği:**
   - `.superpowers/sdd/` altında geçmişe ait 34 adet görev ve rapor dosyası bulunmaktadır. Agent arama yaparken veya ripgrep çalışırken bu eski raporlar kod aramalarını kirletmekte ve context penceresine dolmaktadır.
3. **Kök Dizin Dağınıklığı:**
   - Kök dizinde sahipsiz `01-admin-web.png`, `02-marketing.png`, `03-expo-dev-tools.png`, `04-api-health.png`, `expo-status.png` ve `expo-live.log` bulunmaktadır.
   - `PROJECT_INFO.md` (11.6 KB), `kres-uygulamasi-teknoloji-karar-raporu.md` (7.4 KB), `DEPLOYMENT.md` ve `LOCAL_DEV.md` kök dizindedir.
4. **Eksik Ignore Yapılandırması:**
   - `.gitignore` yalnızca 14 satırdır.
   - `.ignore` ve `.geminiignore` dosyaları bulunmadığından AI araçları arama yaparken eski task raporlarını, `.turbo`, `.nx` ve geçici klasörleri taramaktadır.

---

## 2. Tasarlanan Çözüm ve Mimari Değişiklikler

### A. Kural Dosyalarının Kristalize Edilmesi (Single Source of Truth)

- **`AGENTS.md` (Anayasa):**
  - Projenin değiştirilemez kuralları (Expo SDK 57, NestJS `@Inject`, multi-tenancy `tenant_id` + TenantGuard, 4 kullanıcı rolü, varsayılan seed bilgileri, yasaklı hareketler) eksiksiz korunacaktır.
  - Gereksiz laf kalabalığı ve tekrarlar temizlenerek metin %30-40 oranında daha kompakt ve doğrudan hale getirilecek; böylece her istemde harcanan prompt token'ı azaltılacaktır.
- **`GEMINI.md`:**
  - Antigravity tarafından her mesajda kural olarak çekildiği için minimal bir yönlendirme olarak tutulacaktır.
- **`CLAUDE.md`:**
  - Mükerrer kural tanımları kaldırılacak, doğrudan `AGENTS.md` dosyasını referans alan tek sayfalık hafif bir rehbere dönüştürülecektir.
- **`.claude/skills/`:**
  - Eski ve çelişkili bilgiler içeren (Expo 51 vb.) 7 dosya kaldırılarak veya `docs/archive/` altına taşınarak AI arama havuzundan çıkarılacaktır.

### B. Kök Dizin ve Doküman Mimarisi Düzeni

- **Görseller:** Kök dizindeki tüm `.png` ekran görüntüleri `docs/assets/screenshots/` klasörüne taşınacaktır.
- **Geçici Loglar:** Kök dizindeki `expo-live.log` silinecektir.
- **Büyük Geçmiş Raporları:**
  - `PROJECT_INFO.md` -> `docs/architecture/initial-project-info.md`
  - `kres-uygulamasi-teknoloji-karar-raporu.md` -> `docs/architecture/tech-decision-report.md`
  - `DEPLOYMENT.md` -> `docs/deployment/DEPLOYMENT.md`
  - `LOCAL_DEV.md` -> `docs/development/LOCAL_DEV.md`
- **Kök Dizinde Kalanlar:**
  - Yalnızca `README.md`, `AGENTS.md` (ve araç referansları `GEMINI.md`, `CLAUDE.md`) ve konfigürasyon dosyaları (`package.json`, `pnpm-lock.yaml`, `nx.json`, `.gitignore` vb.).
  - `README.md` dosyası, `docs/` altındaki yeni yollara link verecek şekilde güncellenecektir.

### C. Yapay Zeka Arama & İndeksleme Koruması (.ignore & .gitignore)

- **`.gitignore` Güncellemesi:**
  - `.superpowers/`, `*.log`, `docs/assets/screenshots/`, `.turbo/`, `.nx/cache/`, `.next/`, `dist/`, `coverage/`, `.cache/`, `.expo/` tam olarak tanımlanacaktır.
- **`.ignore` ve `.geminiignore` Oluşturulması:**
  - Ripgrep ve yapay zeka arama araçları için:
    - `.superpowers/`
    - `docs/archive/`
    - `docs/superpowers/`
    - `node_modules/`
    - `.nx/`
    - `.turbo/`
    - `dist/`
    - `*.log`
  - Bu sayede agent kod ararken veya grep yaparken eski SDD raporları ve build dosyaları context'e girmeyecektir.

---

## 3. Doğrulama ve Test Planı

1. **Git Status ve Dosya Bütünlüğü:**
   - Kök dizinin temizlendiği, taşınan dosyaların `docs/` altında doğru yerleştiği doğrulanacak.
2. **Arama / Grep Doğrulaması:**
   - Yapay zeka arama araçlarının (ripgrep) artık `.superpowers/` veya eski rapor dosyalarını listelemediği doğrulanacak.
3. **Build ve Lint Testi:**
   - `pnpm test` veya TypeScript tip kontrolleri çalıştırılarak hiçbir import veya kod yolunun etkilenmediği doğrulanacak (taşınan tüm dosyalar dokümantasyondur).
