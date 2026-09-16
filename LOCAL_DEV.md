# 🛠️ KidsCare — Lokal Geliştirme Rehberi (LOCAL_DEV.md)

> PC'yi açtıktan sonra projeyi lokalde koşturma. Üç senaryo; çoğu zaman **Senaryo A** yeter.

---

## ✅ Önkoşullar

- Node.js ≥ 20
- pnpm 9 (`npm i -g pnpm@9` veya `corepack enable`)
- Docker Desktop açık (Postgres + Redis konteynerleri için)
- Expo Go (mobil için, telefona kurulu) — opsiyonel

---

## 🚀 Senaryo A — Sadece PC restart, container'lar kapandı

DB ve Redis'i ayağa kaldır, backend ve admin-web'i başlat.

```bash
# Terminal 1 — bir kez (DB zaten ayakta ise atlayabilirsin)
pnpm db:up

# Terminal 1 — backend
pnpm dev:api
# → http://localhost:3000

# Terminal 2 — admin-web
pnpm dev:admin
# → http://localhost:5173
```

**Tarayıcıda**: http://localhost:5173 → `demo` + `admin@demo.test` + `demo1234`

---

## 🗃️ Senaryo B — Şema değişti (migration yeni geldi)

`git pull` sonrası veya yeni migration eklendiyse:

```bash
pnpm db:up
pnpm db:migrate:dev   # "y" onayla (mevcut data varsa sorabilir)
pnpm db:seed          # sadece DB sıfırsa veya demo data lazımsa
pnpm dev:api
pnpm dev:admin
```

> `db:migrate:dev` interaktif soru sorabilir ("schema reset?" gibi). Lokalde `y` güvenli.

---

## 🧹 Senaryo C — Sıfırdan temiz başlangıç

DB dahil her şeyi silip yeniden kurmak:

```bash
pnpm db:down
docker volume rm kidscare-postgres-data
docker volume rm kidscare-redis-data   # gerekirse
pnpm db:up
pnpm db:migrate:dev       # y onayla
pnpm db:seed              # demo tenant + 3 user + Ada öğrenci
pnpm dev:api
pnpm dev:admin
```

---

## 📱 Mobil de lazımsa (opsiyonel 3. terminal)

```bash
pnpm dev:mobile          # aynı Wi-Fi (Expo Go QR)
pnpm dev:mobile:tunnel   # farklı ağ (ngrok tunnel)
```

**Mobil ayar**: Login ekranı → ⚙️ Sunucu Ayarı → `http://<PC_IP>:3000` (lokal) veya `https://kidscare-api.onrender.com` (prod).

---

## 🔄 Günlük workflow ipuçları

- **Backend `tsx watch`**: API terminalini kapatma. Kod değişikliği otomatik reload olur.
- **Frontend `vite`**: Aynı şekilde HMR yansır, sayfa yenileme yeterli.
- **Schema değişikliği**: `prisma generate` api açılışında otomatik çalışır, restart gerekmez.
- **Crontab gerekmez**: Yukarıdaki 3 komut yeterli.

---

## ⏹️ Kapatma sırası

```bash
# Çalışan terminallerde:
Ctrl + C           # api + admin'i durdur

# İstersen container'ları da durdur:
pnpm db:down
```

> DB'yi down edersen sonraki açılışta `pnpm db:up` tekrar gerekir. Açık bırakmak RAM'de ~200MB yer.

---

## 🆘 Sorun giderme

| Belirti | Çözüm |
|---------|-------|
| `pnpm db:up` → port 5433 meşgul | `docker ps`, eski container'ı `docker stop` |
| API başlamıyor: `EADDRINUSE :3000` | Başka process port'u tutuyor. `netstat -ano \| findstr :3000` → PID bul → Task Manager'dan öldür |
| Login sonsuz dönüyor | Network tab'da `/auth/login` method'u kontrol et (POST olmalı, GET değil). Vite proxy config (`apps/admin-web/vite.config.ts`) çalışıyor mu bak |
| `prisma migrate dev` → DB drift uyarısı | Lokalde `y` ile reset güvenli. Prod'da ASLA |
| Vite hot-reload bozdu | Tarayıcıda `Ctrl+Shift+R` (hard refresh) |

---

_Belge Tarihi: 16 Eylül 2026_