# Şartname 0021: Kreş Ayarları (`/settings`) Dokunsal (Claymorphic) Tasarım Sistemi Harmonizasyonu

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Yönetim Paneli'nde yer alan **Yönetim & Operasyon ➔ Kreş Ayarları** (`/settings`) sayfasının ([`TenantSettings.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/tenant/TenantSettings.tsx)) projenin dokunsal kil (claymorphic) tasarım sistemine, `PageHeader`, `StatCard` ve `TactileButton` bileşenlerine tam uyumlu hale getirilmesini hedefler.

## 2. Mevcut Durum Analizi ve Sorunlar

- **Düz Header Bloğu:** Sayfa başlığı manuel `<div>` ile yazılmış, `<PageHeader>` bileşeni kullanılmamaktadır.
- **KPI Kartları Tutarsız:** 4 özet kartı (Kurum Durumu, Slug, Kapasite, Kayıt Tarihi) elle yazılmış, `shadow-xs` ve `border-slate-200/80` ile eski stilde; `StatCard` kullanılmamaktadır.
- **Form Kartları Düz:** Kurumsal Profil ve Güvenlik kartları `shadow-xs` ile eski stilde, `TACTILE_CARD_CLASSES` derinliği yok.
- **Form Alanları Yumuşak Değil:** Input alanları `rounded-xl` ve standart focus state, squircle ve tutarlı tactile focus halkası yok.
- **Toggle Switch'leri Yenilenmeli:** Manuel `bg-teal-700` toggle yerine tactile tarzda, 3D derinlik hissi olabilen.
- **Eski Tip Butonlar:** "Yenile", "Yeniden Dene" ve "Kaydet" butonları düz `<button>`, `<TactileButton>` kullanılmamaktadır.

## 3. Fonksiyonel ve Görsel Gereksinimler

### 3.1. Dokunsal Header & Yenile

- `<PageHeader icon={School}>` standart header.
- `actions` slotunda `<TactileButton variant="secondary" size="sm">Yenile</TactileButton>`.
- Sayfa başlığının yanındaki "Kurumsal Lisans" badge'i korunur (squircle çip).

### 3.2. 4 Dokunsal KPI Kartı (`StatCard`)

- **Kurum Durumu:** `tenant.status` (emerald vurgu, `ShieldCheck` ikonu).
- **Kreş Kodu (Slug):** `tenant.slug` (teal vurgu, `Hash` ikonu).
- **Kapasite:** "1 / 50" göstergesi (amber vurgu, `Users` ikonu, progressPercent=%4).
- **Kayıt Tarihi:** TR-formatlı tarih (indigo vurgu, `Calendar` ikonu).

### 3.3. 3D Claymorphic Kurumsal Profil Formu

- `TACTILE_CARD_CLASSES` ile form kartı yeniden yazılır.
- Input alanları squircle (`rounded-2xl`), `shadow-2xs`, focus state tutarlı.
- **Kreş Resmi Adı** düzenlenebilir (`required`, 2-128 karakter).
- **Slug**, **Şube**, **Telefon**, **E-posta** alanları `readOnly` korunur.
- Header: `<Building2 />` ikonu + bölüm başlığı.

### 3.4. 3D Claymorphic Güvenlik & Tercihler

- `TACTILE_CARD_CLASSES` ile kart yeniden yazılır.
- 3 toggle switch (alerjen uyarısı, teslimat kontrolü, gün sonu karne hatırlatması) — mevcut işlevsellik korunur.
- Toggle'lar squircle arka plan + 3D topuz ile yeniden tasarlanır (buton değil, sadece görsel güncelleme).
- Header: `<BellRing />` ikonu + bölüm başlığı.

### 3.5. Footer & Kaydet

- Footer bandı `TACTILE_CARD_CLASSES` ile derinlik kazanır.
- "Kaydet" → `<TactileButton variant="teal" size="md">`.
- "Kaydedilmemiş değişiklikler var" badge'i korunur.

## 4. Kabul Kriterleri (Acceptance Criteria)

1. `/settings` açıldığında 4 `StatCard` kurum bilgilerini anlık gösterir.
2. Header `<PageHeader>` + "Yenile" `<TactileButton>` standardına uyar.
3. Kurumsal Profil ve Güvenlik kartları `TACTILE_CARD_CLASSES` ile 3D derinliğe kavuşur.
4. "Kaydet" `<TactileButton variant="teal">` standardına uyar.
5. Mevcut işlevsellik (kaydetme, toggle'lar, validasyon) birebir çalışır.
6. Vitest testleri (`TenantSettings.test.tsx`) %100 geçmeli; yeni testler eklenir.
7. `./scripts/check.ps1` monorepo kapısından sıfır hata ile geçmeli.
