# 🌟 KidsCare — Ana Proje Rehberi & Bilgi Bankası (PROJECT_INFO.md)

> **BU DOSYA PROJENİN TEK VE EKSİKSİZ BİLGİ KAYNAĞIDIR.**
> Projeyle ilgili tüm bulut bağlantıları, test hesapları, mimari kurallar, tamamlanan özellikler, APK indirme linkleri ve çalıştırma komutları bu belgede toplanmıştır. Hiçbir bilgi kaybolmaz veya unutulmaz.

---

## 📌 1. Proje Özeti ve Vizyonu

**KidsCare**, birden fazla kreşe ve anaokuluna hizmet verebilen, modern, güvenli ve multi-tenant (çok kiracılı) bir kreş yönetim SaaS platformudur.

### Kullanıcı Rolleri:

1. **SUPERADMIN:** Sistem geneli kreşleri açan, lisanslayan ve denetleyen üst yönetici.
2. **ADMIN (Kreş Müdürü / Kurucusu):** Kendi kreşinin öğretmenlerini, öğrencilerini, sınıflarını, menülerini, etkinliklerini ve ayarlarını yönetir.
3. **TEACHER (Sınıf Öğretmeni):** Sınıfındaki öğrencilerin yoklamasını alır, günlük karnesini (yemek, uyku, tuvalet, duygu durumu) doldurur ve gün içi etkinlik fotoğraflarını paylaşır.
4. **PARENT (Veli):** Yalnızca kendi çocuğunun/çocuklarının yoklama saatlerini, günlük karnesini, yemek menüsünü (akıllı alerji uyarısıyla), sağlık pasaportunu ve fotoğraf galerisini takip eder.

---

## ☁️ 2. Canlı Bulut Altyapısı & Bağlantı Bilgileri

KidsCare'in tüm backend ve veritabanı altyapısı canlı bulut ortamına taşınmıştır. Yerel bilgisayar kapalı olsa dahi sistem 7/24 çalışır.

| Bileşen                      | Sağlayıcı / Bölge          | Canlı Bağlantı / Detay                                                                                                          |
| ---------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Backend API (NestJS 10)**  | **Render.com (Frankfurt)** | 🔗 [https://kidscare-api.onrender.com](https://kidscare-api.onrender.com)                                                       |
| **Sağlık Kontrolü (Health)** | **Render.com**             | 🔗 [https://kidscare-api.onrender.com/health](https://kidscare-api.onrender.com/health) (Dönüş: `{"status":"ok"}`)              |
| **Bulut Veritabanı**         | **PostgreSQL (Frankfurt)** | Managed PostgreSQL (Docker bağımlılığı olmadan buluttan çalışır)                                                                |
| **Dış DB Bağlantı Adresi**   | `external`                 | `postgresql://kidscare_user:Vrv3Z3o5CwNYEJR3nXGt8F44SQhSZUSW@dpg-dakoc6u1egvs7389lgng-a.frankfurt-postgres.render.com/kidscare` |
| **İç DB Bağlantı Adresi**    | `internal (Render)`        | `postgresql://kidscare_user:Vrv3Z3o5CwNYEJR3nXGt8F44SQhSZUSW@dpg-dakoc6u1egvs7389lgng-a/kidscare`                               |
| **GitHub Kod Deposu**        | **GitHub**                 | 🔗 [https://github.com/keklikabdullah07/kidscare](https://github.com/keklikabdullah07/kidscare)                                 |
| **Ana Dallar (Branches)**    | `main` & `developer`       | `main` dalına her `push` yapıldığında Render sunucusu otomatik olarak derlenip canlıya geçer.                                   |

---

## 📲 3. Mobil Uygulama & Android APK Sürümleri (Expo EAS)

Mobil uygulama **Expo SDK 57** ile geliştirilmiş olup, bağımsız Android APK paketleri Expo EAS Cloud üzerinde derlenmiştir.

- **Expo Proje ID:** `eb3a5651-d4f5-4fc9-ba89-a00a1cf1691b`
- **EAS Proje Yönetim Paneli:** [https://expo.dev/accounts/partridgex/projects/kidscare](https://expo.dev/accounts/partridgex/projects/kidscare)

### 📥 İndirilebilir Hazır APK Bağlantıları:

1. **Güncel APK (v2 - Fotoğraf & Etkinlik Galerisi Dahil):**
   - 🔗 **[v2 APK'yı İndir ve Kur (Önerilen)](https://expo.dev/accounts/partridgex/projects/kidscare/builds/311cd53e-f687-4e3e-8a09-344f3f5bc485)**
2. **İlk APK (v1):**
   - 🔗 [v1 APK İndirme Bağlantısı](https://expo.dev/accounts/partridgex/projects/kidscare/builds/b9a439af-b862-40d7-832d-266ddf6d48c3)

### 🛠️ Yeni APK Derleme Komutu:

İleride yeni bir APK derlemesi almak istediğinizde:

```bash
cd apps/mobile
npx eas-cli build -p android --profile preview
```

---

## 🔑 4. Varsayılan Test Giriş Hesapları (Demo Seed Verileri)

Sistemde hazır kurulu gelen ve her iki ortamda (yerel + canlı Render DB) kayıtlı olan test kullanıcıları:

- **Kreş Slug (Kreş Kodu):** `demo` (Demo Kreş)

| Rol                  | E-posta             | Şifre      | İlgili Öğrenci / Yetki                                            |
| -------------------- | ------------------- | ---------- | ----------------------------------------------------------------- |
| **Yönetici (Müdür)** | `admin@demo.test`   | `demo1234` | Tüm kreşi, öğrencileri, öğretmenleri ve ayarları yönetir          |
| **Öğretmen**         | `teacher@demo.test` | `demo1234` | Yoklama alır, günlük karne doldurur, galeriye fotoğraf yükler     |
| **Veli**             | `parent@demo.test`  | `demo1234` | **Ada Yılmaz** isimli öğrencinin velisi (Kişiselleştirilmiş akış) |

---

## 💻 5. Teknoloji Yığını ve Versiyonlar

| Katman                 | Teknoloji                                                 | Açıklama                                       |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| **Monorepo**           | Turborepo / pnpm workspaces                               | `/apps` ve `/packages` modüler mimarisi        |
| **Backend API**        | NestJS 10 + Fastify/Express + `tsx watch`                 | Yüksek performanslı TypeScript backend         |
| **Veritabanı & ORM**   | PostgreSQL 16 + Prisma ORM                                | Row Level Security (RLS) ile tenant izolasyonu |
| **Web Yönetim Paneli** | React 19 + Vite 5 + TailwindCSS                           | Hızlı, modern ve responsive yönetim paneli     |
| **Mobil Uygulama**     | **Expo SDK 57** (`react: 19.2.3`, `react-native: 0.86.3`) | React Navigation v7, iOS & Android uyumlu      |
| **Ortak Paketler**     | `@kidscare/shared-types`, `@kidscare/shared-schemas`      | Tek merkezden tip ve Zod validasyonu yönetimi  |

---

## ⚖️ 6. Değiştirilemez Mimari Kurallar (Anayasa)

Bu kurallar projenin kararlılığı için zorunludur ve asla çiğnenemez:

1. **NestJS `@Inject(...)` Zorunluluğu:**
   `apps/api` `tsx watch` altında çalışırken parametre tiplerini otomatik vermez. Bu yüzden **tüm** Controller, Service ve Repository constructor parametrelerinde açıkça `@Inject(SınıfAdı)` bulunmalıdır. (Aksi takdirde runtime'da `undefined` ve HTTP 500 hatası verir).
2. **Multi-Tenancy & RLS İzolasyonu:**
   Her tabloda `tenant_id` zorunludur. Repository katmanında sorgular `prisma.withTenant` üzerinden geçer ve `SET LOCAL app.tenant_id` oturum değişkeni ile diğer kreşlerin verilerine erişim donanımsal olarak engellenir.
3. **`any` Tipi Yasağı:** Projede `any` tipi kullanılamaz. Modeller `shared-types` içinde tanımlanır.
4. **Mobil Ağ İletişimi:** Android'in `cleartext` (HTTP) yasağı nedeniyle mobil uygulama canlıda daima **HTTPS** (`https://kidscare-api.onrender.com`) üzerinden haberleşir.

---

## ✅ 7. Tamamlanan Modüller & Özellikler

1. **🛡️ Çok Katmanlı Güvenlik & Giriş (Auth & Multi-Tenancy):**
   - JWT bazlı oturum yönetimi.
   - Kreş slug doğrulaması ve RLS muafiyetli genel tenant lookup politikası.
2. **👶 Öğrenci & Sağlık Pasaportu (Health & Allergy Passport):**
   - Öğrenci kayıt, düzenleme ve silme.
   - Kan grubu, kronik rahatsızlıklar, alerjiler, acil durum irtibatları ve yetkili teslim alacak kişiler.
3. **🍲 Yemek Menüsü & Akıllı Alerji Uyarısı (Allergy Safety):**
   - Sabah kahvaltısı, öğle yemeği ve ikindi beslenmesi planlaması.
   - Menüde fıstık, süt vb. bir alerjen varsa, o alerjisi olan öğrencinin veli ekranında **büyük sarı ikaz panosu** çıkar.
4. **📋 Yoklama & Devamsızlık Takibi (Attendance):**
   - İçeride, Ayrıldı, İzinli ve Yok durumları.
   - Öğrencinin okula giriş ve ayrılış saatlerinin saniye saniye kaydı ve veliye gösterimi.
5. **🌟 Günlük Karne & Gelişim Takibi (Daily Reports):**
   - Yemek yeme derecesi (Hepsi, Yarısı, Az, Yemedi).
   - Uyku süresi, ruh hali (😊 Çok Mutlu, 😌 Sakin, ⚡ Enerjik vb.), tuvalet durumu ve öğretmen notu.
6. **📸 Fotoğraf & Etkinlik Galerisi (Media Gallery):**
   - Sınıf içi ve bahçe aktivitelerinin çoklu fotoğraflarla paylaşımı.
   - Tam ekran yakınlaştırılabilir fotoğraf görüntüleyici (`ImageViewerModal`).
   - `#Sanat`, `#Oyun`, `#Bahçe`, `#Müzik` etiket filtreleri.
   - Hem Veli hem Öğretmen mobil ekranlarında ve Web Yönetim panelinde tam entegre.

---

## 🔮 8. Sırada Bekleyen Geliştirmeler (Yol Haritası)

1. **💊 İlaç Takip Sistemi (Medication Tracking):**
   - Velinin ilaç adı, dozu ve saatini girmesi.
   - Öğretmenin "İlaç 13:30'da verildi" şeklinde tek tuşla onaylaması ve veliye saat damgalı bildirim gitmesi.
2. **📢 Okul Duyuruları & Acil Bildirimler:**
   - Gezi, etkinlik, tatil duyuruları ve bültenler.
3. **💬 Birebir Veli - Öğretmen Mesajlaşması:**
   - KVKK uyumlu, güvenli kurum içi sohbet.
4. **📅 Etkinlik Takvimi & Doğum Günleri:**
   - Aylık okul takvimi ve doğum günü hatırlatıcıları.
5. **💳 Aidat & Muhasebe Takibi:**
   - Aylık ödeme takibi ve veliye hatırlatma bildirimleri.
6. **🔔 Anlık Push Bildirimleri (Expo Notifications):**
   - Çocuk okula girdiğinde veya fotoğraf paylaşıldığında telefona anında bildirim düşmesi.

---

## 🖥️ 9. Web Panelini Canlıya Alma Rehberi (Render Static Site)

Arkadaşınızın ve yöneticilerin APK kurmadan herhangi bir cihazdan (telefon veya PC) tarayıcıyla giriş yapabilmesi için:

1. **[dashboard.render.com](https://dashboard.render.com)** adresine girin.
2. **"New +" -> "Static Site"** seçin.
3. GitHub deposunu bağlayın: `keklikabdullah07/kidscare`
4. Bilgileri girin:
   - **Name:** `kidscare-web`
   - **Branch:** `main`
   - **Root Directory:** `apps/admin-web`
   - **Build Command:** `pnpm build`
   - **Publish Directory:** `dist`
5. **Environment Variables** kısmına ekleyin:
   - `VITE_API_URL` = `https://kidscare-api.onrender.com`
6. **"Create Static Site"** butonuna tıklayın.

_(Bu işlem sonrası Render size `https://kidscare-web.onrender.com` gibi genel bir link verir. Siz her `push` yaptığınızda arkadaşınız sadece sayfayı yenileyerek yeni özellikleri anında görür)._

---

## ⌨️ 10. Yerel Geliştirici Komutları (Cheatsheet)

```bash
# Bağımlılıkları kurma
pnpm install

# Yerel PostgreSQL ve Redis konteynerlerini başlatma (Opsiyonel)
pnpm db:up

# Veritabanı tablolarını ve RLS politikalarını güncelleme
pnpm db:migrate

# Test kullanıcılarını ve demo kreşi yükleme
pnpm db:seed

# Projeleri yerelde çalıştırma
pnpm dev:api       # NestJS Backend API (Port 3000)
pnpm dev:admin     # Yönetim Web Paneli (Port 5173)
pnpm dev:mobile    # Expo Mobil Uygulama

# Testleri ve Tip Kontrollerini Çalıştırma
pnpm test          # Tüm birim testleri çalıştırır
pnpm --filter @kidscare/api exec tsc --noEmit     # Backend tip kontrolü
pnpm --filter @kidscare/mobile exec tsc --noEmit  # Mobil tip kontrolü
pnpm --filter @kidscare/admin-web exec tsc --noEmit # Web tip kontrolü
```

---

_Belge Tarihi: 16 Eylül 2026_  
_Hazırlayan: KidsCare Mühendislik & Mimari Ekibi_
