# Şartname 0020: Ekip & Roller (`/team`) Dokunsal (Claymorphic) Tasarım Sistemi Harmonizasyonu

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Yönetim Paneli'nde yer alan **Yönetim & Operasyon ➔ Ekip & Roller** (`/team`) sayfasının ([`TeamPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/team/TeamPage.tsx)) projenin dokunsal kil (claymorphic) tasarım sistemine, `PageHeader`, `StatCard`, `TactileTabs` ve `TactileButton` bileşenlerine tam uyumlu hale getirilmesini hedefler.

## 2. Mevcut Durum Analizi ve Sorunlar

- **Düz Header Bloğu:** Sayfa başlığı manuel `<div>` ile yazılmış, `<PageHeader>` bileşeni kullanılmamaktadır.
- **Kartlar Tutun Statik Değil:** Yeni hesap oluşturma formu ve kullanıcı listesi kartları `shadow-xs` ve ince kenarlı (`border-slate-200/80`) eski stilde; 3D claymorphic derinlik yok.
- **Eski Tip Butonlar:** "Yenile" ve "Hesap Oluştur" butonları düz `<button>`, `btn-tactile-*` veya `<TactileButton>` kullanılmamaktadır.
- **Form Alanları Yumuşak Değil:** Input, select alanları `rounded-xl` sınırlı, `shadow-2xs` ve squircle çerçeve yok.
- **Liste Öğeleri Homojen Değil:** Kullanıcı satırları `divide-y` ile basit liste, avatar + badge çipleri tactile standartta değil.

## 3. Fonksiyonel ve Görsel Gereksinimler

### 3.1. Dokunsal KPI Kartları (`StatCard`)

Kullanıcı tablosunu özetleyen 4 adet interaktif dokunsal kart:

1. **Toplam Kullanıcı:** Tüm aktif hesapların sayısı (teal vurgu, `Users` ikonu).
2. **Öğretmenler:** `TEACHER` rolündeki kullanıcı sayısı (info/mavi vurgu, `GraduationCap` ikonu).
3. **Veliler:** `PARENT` rolündeki kullanıcı sayısı (amber vurgu, `HeartHandshake` ikonu).
4. **Yöneticiler:** `ADMIN` + `SUPER_ADMIN` rol sayısı (rose vurgu, `Shield` ikonu).

### 3.2. Header & Yenile Butonu

- `<PageHeader icon={Users}>` standart header.
- `actions` slotunda `<TactileButton variant="secondary" size="sm">Yenile</TactileButton>`.

### 3.3. 3D Claymorphic Yeni Hesap Formu

- `TACTILE_CARD_CLASSES` ile form kartı yeniden yazılır.
- Input/select alanları squircle, `shadow-2xs`, focus state tutarlı.
- "Hesap Oluştur" → `<TactileButton variant="teal" size="md">`.
- Form alanları: E-posta, Geçici Şifre, Rol (`TEACHER`/`PARENT`).

### 3.4. 3D Claymorphic Kullanıcı Listesi

- Liste kartı `TACTILE_CARD_CLASSES` derinliğinde.
- Kullanıcı satırları sabit kart (`shadow-2xs`) içinde; avatar + e-posta + rol badge'i + "Aktif" çipi.
- Tek Etkileşimli Varlık İlkesi: kart sabit, içindeki öğeler durağan.
- Boş durum: mevcut `<EmptyState>` korunur.

### 3.5. Dokunsal Yeni Hesap Modalı (Opsiyonel)

- Mobil/tablet için "Yeni Hesap" butonuna basıldığında bir modal açılabilir; bu plan dışı tutulur (mevcut inline form korunur).

## 4. Kabul Kriterleri (Acceptance Criteria)

1. `/team` açıldığında 4 adet `StatCard` kullanıcı sayılarını anlık gösterir.
2. Header `<PageHeader>` + "Yenile" `<TactileButton>` standardına uyar.
3. Yeni hesap formu 3D claymorphic kartta, "Hesap Oluştur" `<TactileButton variant="teal">`.
4. Kullanıcı listesi 3D claymorphic kartta, sabit satırlar.
5. Boş durum, hata ve yükleniyor durumları korunur.
6. Vitest testleri (`TeamPage.test.tsx`) %100 geçmeli; yeni testler eklenir.
7. `./scripts/check.ps1` monorepo kapısından sıfır hata ile geçmeli.
