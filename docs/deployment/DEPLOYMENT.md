# KidsCare — Canlı Dağıtım & Ortam Bilgileri (DEPLOYMENT.md)

Bu dosya KidsCare projesinin canlı bulut altyapısını, veritabanı bağlantılarını, mobil APK sürümlerini ve dağıtım (deployment) süreçlerini belgeler.

---

## 1. Canlı Servisler & Bağlantı Adresleri

### 🚀 Backend API (NestJS)

- **Sağlayıcı:** Render.com (Frankfurt Region)
- **Canlı URL:** [https://kidscare-api.onrender.com](https://kidscare-api.onrender.com)
- **Sağlık Kontrolü:** [https://kidscare-api.onrender.com/health](https://kidscare-api.onrender.com/health)
- **GitHub Entegrasyonu:** `keklikabdullah07/kidscare` deposundaki `main` branch'i ile senkronizedir. `main` branch'ine yapılan her `git push` sonrası Render otomatik olarak derler ve canlıya alır.

### 🐘 Bulut Veritabanı (PostgreSQL)

- **Sağlayıcı:** Render Managed PostgreSQL (Frankfurt)
- **Veritabanı Adı:** `kidscare`
- **Dış Bağlantı (External URL):**
  ```env
  DATABASE_URL=postgresql://kidscare_user:Vrv3Z3o5CwNYEJR3nXGt8F44SQhSZUSW@dpg-dakoc6u1egvs7389lgng-a.frankfurt-postgres.render.com/kidscare
  ```
- **İç Bağlantı (Render API Internal):**
  ```env
  DATABASE_URL=postgresql://kidscare_user:Vrv3Z3o5CwNYEJR3nXGt8F44SQhSZUSW@dpg-dakoc6u1egvs7389lgng-a/kidscare
  ```

---

## 2. Mobil Uygulama & APK Dağıtımı (Expo EAS)

- **EAS Proje ID:** `eb3a5651-d4f5-4fc9-ba89-a00a1cf1691b`
- **EAS Proje Paneli:** [https://expo.dev/accounts/partridgex/projects/kidscare](https://expo.dev/accounts/partridgex/projects/kidscare)

### 📲 Hazır İndirilebilir APK Sürümleri:

1. **Güncel Sürüm (Foto & Etkinlik Galerisi Dahil):**
   - **İndirme Linki:** [https://expo.dev/accounts/partridgex/projects/kidscare/builds/311cd53e-f687-4e3e-8a09-344f3f5bc485](https://expo.dev/accounts/partridgex/projects/kidscare/builds/311cd53e-f687-4e3e-8a09-344f3f5bc485)
2. **İlk Sürüm:**
   - **İndirme Linki:** [https://expo.dev/accounts/partridgex/projects/kidscare/builds/b9a439af-b862-40d7-832d-266ddf6d48c3](https://expo.dev/accounts/partridgex/projects/kidscare/builds/b9a439af-b862-40d7-832d-266ddf6d48c3)

### ⚙️ Yeni APK Derleme Komutu:

Yeni bir APK paketi oluşturmak için proje kökünden veya `apps/mobile` klasöründen şu komut çalıştırılır:

```bash
cd apps/mobile
npx eas-cli build -p android --profile preview
```

---

## 3. Web Yönetim Paneli Canlı Yayınlama Rehberi (Render Static Site)

Web yönetim panelini (`apps/admin-web`) uzaktan herkesin erişebileceği canlı bir web sitesi olarak yayınlamak için:

1. **[dashboard.render.com](https://dashboard.render.com)** adresine gidin.
2. **"New +" -> "Static Site"** seçeneğine tıklayın.
3. GitHub deposunu bağlayın: `keklikabdullah07/kidscare`
4. Alanları doldurun:
   - **Name:** `kidscare-web`
   - **Branch:** `main`
   - **Root Directory:** `apps/admin-web`
   - **Build Command:** `pnpm build`
   - **Publish Directory:** `dist`
5. **Environment Variables** bölümüne ekleyin:
   - `VITE_API_URL` = `https://kidscare-api.onrender.com`
6. **"Create Static Site"** butonuna basın.
7. Render size `https://kidscare-web.onrender.com` şeklinde global erişilebilir bir URL verir.

---

## 4. Test & Giriş Bilgileri (Demo Seed Verileri)

Sistemdeki varsayılan hesaplar:

| Rol                  | E-posta             | Şifre      | Açıklama                                                 |
| -------------------- | ------------------- | ---------- | -------------------------------------------------------- |
| **Kreş Slug**        | `demo`              | —          | Giriş ekranında sorulan kreş kodu                        |
| **Yönetici (Müdür)** | `admin@demo.test`   | `demo1234` | Tüm kreşi ve öğrencileri yönetir                         |
| **Öğretmen**         | `teacher@demo.test` | `demo1234` | Yoklama alır, karne doldurur, aktivite paylaşır          |
| **Veli**             | `parent@demo.test`  | `demo1234` | Öğrenci: **Ada Yılmaz** (Gelişim, yemek, yoklama takibi) |
