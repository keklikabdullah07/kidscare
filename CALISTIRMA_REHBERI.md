# 🚀 KidsCare — Yerel Geliştirme ve Çalıştırma Rehberi

Bu rehber, projeyi yerel bilgisayarınızda (localhost) sıfırdan sorunsuz başlatmanız ve diğer projelerinizle karıştırmadan yönetmeniz için hazırlanmıştır.

---

## 📌 Hızlı Bakış: Hangi Terminalde Ne Çalışacak?

KidsCare monorepo mimarisinde çalışır. Tam bir geliştirme ortamı için **3 bileşenin** açık olması gerekir:

| Sıra  | Bileşen               | Çalıştırma Komutu      | Adres / Port                          | Açıklama                           |
| :---- | :-------------------- | :--------------------- | :------------------------------------ | :--------------------------------- |
| **1** | **Docker Veritabanı** | `docker compose up -d` | `localhost:5433` (DB), `6379` (Redis) | PostgreSQL & Redis container'ları  |
| **2** | **Backend API**       | `pnpm run dev:api`     | `http://localhost:3000`               | NestJS REST API                    |
| **3** | **Web Admin Paneli**  | `pnpm run dev:admin`   | `http://localhost:5173`               | React 19 + Vite Yönetim Paneli     |
| _Ops_ | _Mobil Uygulama_      | `pnpm run dev:mobile`  | Expo Metro                            | React Native / Expo Mobil Uygulama |

---

## 🛠️ Sıfırdan Adım Adım Başlatma

### 1. Adım: Docker Veritabanını Başlatın

Docker Desktop uygulamanızın açık olduğundan emin olun, ardından proje dizininde bir terminal açıp şunu çalıştırın:

```bash
docker compose up -d
```

> **Kontrol:** `docker ps` yazdığınızda `kidscare-postgres` ve `kidscare-redis` container'larının çalıştığını görmelisiniz.

---

### 2. Adım: Backend API'yi Başlatın (Terminal 1)

VS Code veya PowerShell'de yeni bir terminal açın ve çalıştırın:

```bash
pnpm run dev:api
```

- Ekranda şu satırı gördüğünüzde API hazırdır:
  ```text
  [Bootstrap] API listening on http://0.0.0.0:3000
  ```
- **Hızlı Test:** Tarayıcıdan `http://localhost:3000/health` adresine girdiğinizde `{"status":"ok"}` görmelisiniz.

---

### 3. Adım: Web Panelini Başlatın (Terminal 2)

İkinci bir terminal açın ve web panelini başlatın:

```bash
pnpm run dev:admin
```

- Ekranda şu satır belirecektir:
  ```text
  ➜ Local: http://localhost:5173/
  ```
- Tarayıcınızda `http://localhost:5173` adresine giderek yönetim paneline erişebilirsiniz.

---

## 🔑 Varsayılan Giriş Bilgileri (Demo Seed)

Sistemde hazır tanımlı test hesapları:

- **Kreş Kodu (Slug):** `demo`
- **Yönetici (Admin):**
  - E-posta: `admin@demo.test`
  - Şifre: `demo1234`
- **Öğretmen:**
  - E-posta: `teacher@demo.test`
  - Şifre: `demo1234`
- **Veli (Ada Yılmaz'ın Velisi):**
  - E-posta: `parent@demo.test`
  - Şifre: `demo1234`
- **Süper Admin (Tüm Kreşleri Yöneten):**
  - E-posta: `superadmin@demo.test`
  - Şifre: `demo1234`

---

## ⚠️ Sık Karşılaşılan Sorunlar ve Çözümleri

### 1. `http proxy error: /auth/me AggregateError [ECONNREFUSED]`

- **Sebebi:** Web paneli açık ancak arkadaki Backend API (Port 3000) kapalıdır.
- **Çözümü:** Bir terminalde `pnpm run dev:api` komutunun çalıştığından ve `http://localhost:3000/health` adresinin `ok` verdiğinden emin olun.

### 2. `Can't reach database server at localhost:5433`

- **Sebebi:** Docker Desktop kapalı veya container'lar durdurulmuştur.
- **Çözümü:** Docker Desktop'ı açın ve terminalde `docker compose up -d` komutunu çalıştırın.

### 3. `Port 3000 (veya 5173) is already in use`

- **Sebebi:** Önceki çalıştırmadan kalan bir Node süreci portu meşgul ediyordur.
- **Çözümü (PowerShell):**
  ```powershell
  # Port 3000'i kullanan süreci bulup kapatır
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

---

## 🛑 Projeyi Kapatma ve Temizleme

İşiniz bittiğinde bilgisayarınızı rahatlatmak için:

1. `pnpm run dev:api` ve `pnpm run dev:admin` çalışan terminallerde `Ctrl + C` tuşlarına basın.
2. Veritabanını durdurmak için:
   ```bash
   docker compose stop
   ```
   _(Verilerinizi silmez, sadece arka planda ram/işlemci tüketmesini durdurur)._

---

## ✅ Kod Göndermeden (Git Push) Önceki Kalite Testi

Sisteme kod göndermeden önce tüm testleri ve TypeScript kontrollerini tek komutla teyit edin:

```powershell
./scripts/check.ps1
```

Bu komut Prettier, ESLint, TypeScript ve otomatik testlerin tamamını çalıştırır ve **[DOGRULAMA TAMAMLANDI]** yeşil onayını verir.
