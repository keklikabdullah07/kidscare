# KidsCare — Tasarım Anayasası (DESIGN.md)

Bu dosya, KidsCare Web Yönetim Paneli (`apps/admin-web`) için **değiştirilemez görsel tasarım anayasasıdır**.
Tüm sayfalar, bileşenler ve modlar bu belgedeki renk disiplinine, tipografi kurallarına ve hiyerarşiye kesinlikle uymak zorundadır.

---

## 1. Tasarım Felsefesi & Yüzey Modu: "OPERATE"

KidsCare bir pazarlama/satış sitesi değildir; okul öncesi eğitimcilerinin, kreş yöneticilerinin ve öğretmenlerin gün boyu iş yürüttüğü bir **Operasyonel Yönetim Paneli (SaaS)**dir.

- **Hedef:** Sakin, güven veren, göz yormayan, yüksek okunabilirlik ve hızlı taranabilirlik.
- **Yasak:** Rastgele "gökkuşağı" renkleri (aynı sayfada mor, yeşil, mavi, sarı, turkuazın aynı anda bağırması KESİNLİKLE YASAKTIR).
- **Karakter:** Modern İskandinav & Hümanist Eğitim Yazılımı — sıcak, düzenli, kurumsal yetkinlik taşıyan arayüz.

---

## 2. Renk Sistemi (The 60-30-10 Kuralı)

Marka kimliği, resmi KidsCare logosundaki **Asil Mavi (Royal Blue)** ve **Sıcak Bal / Kehribar (Honey Amber)** temeline oturur.

### A) Aydınlık Mod (Light Mode)

- **%60 Nötr Zeminler & Kartlar:**
  - Sayfa Ana Zemini: `#F8FAFC` (Slate 50 — Gözü yormayan yumuşak fildişi/buz beyazı)
  - Kart ve Yüzeyler: `#FFFFFF` (Saf beyaz, `shadow-xs` veya hafif ambient gölge)
  - Kart İçi Gömülü Kutular: `#F1F5F9` (Slate 100 — Yemek, uyku, filtre gibi iç bölmeler)
  - Kenarlıklar: `#E2E8F0` (Slate 200 — 1px zarif sınırlar)
- **%30 Birincil Marka Rengi (Royal Blue):**
  - `#1E3A8A` (Deep Blue 900) ve `#1D4ED8` (Blue 700)
  - Kullanım: Sol sidebar navigasyonu, aktif menü göstergesi, birincil butonlar, aktif sekme alt çizgileri.
- **%10 Sıcak Vurgu Rengi (Honey Amber):**
  - `#F59E0B` (Amber 500) ve `#D97706` (Amber 600)
  - Kullanım: Bekleyen işler, rozetler, bildirimler, kreş sıcaklığını yansıtan küçük dokunuşlar.
- **Metin Hiyerarşisi:**
  - Ana Başlıklar & İsimler: `#0F172A` (Slate 900 — Net, kontrastlı koyu mürekkep)
  - Gövde & Etiketler: `#475569` (Slate 600)
  - İkincil & İpuçları: `#94A3B8` (Slate 400)

---

### B) Karanlık Mod (Dark Mode) — "Nocturne Hearth"

**KURAL:** Karanlık modda KESİNLİKLE bembeyaz parlayan kart bırakılamaz!

- **Zemin & Kart Katmanları:**
  - Sayfa Ana Zemini: `#0B1120` (Obsidian Midnight Slate — Gerçek gece zemini)
  - Sol Sidebar: `#0F172A` (Derin Slate 900, `border-r border-slate-800/80`)
  - Kartlar & Yüzeyler: `#131E3A` (Gece mavisi-slate derin kartlar, `border border-slate-700/60`)
  - Kart İçi Gömülü Kutular: `#0F172A` / `#0A0F1D` (`border border-slate-800/70`)
- **Vurgu & Butonlar:**
  - Birincil Aksiyon Butonları: `#F59E0B` (Sıcak Kehribar dolgu, üzerinde koyu yazı `#0B1120`, gece modunda parlayan okunabilirlik)
  - Aktif Menü / Linkler: `#1E293B` arka plan + kehribar gösterge veya doğrudan kehribar hap.
- **Metin Hiyerarşisi:**
  - Ana Başlıklar & İsimler: `#F8FAFC` (Slate 50 — Gözü kamaştırmayan yumuşak beyaz)
  - Gövde & Etiketler: `#CBD5E1` (Slate 300)
  - İkincil & İpuçları: `#64748B` (Slate 500)

---

### C) Semantik / Durum Renkleri (Sadece Anlamı Varsa)

- **Başarılı / Geldi / Tamam:** Zümrüt Yeşili (`#10B981`) — Yoklama var, karne tamamlandı, sistem aktif.
- **Beklemede / Dikkat:** Kehribar (`#F59E0B`) — Rapor bekliyor, onay bekleniyor.
- **Kritik / Olay / İlaç:** Gül Kırmızısı (`#EF4444`) — Olay kaydı, acil sağlık uyarısı.

---

## 3. Tipografi & Boşluk Standartları

- **Font Ailesi:** `Lexend` veya `Plus Jakarta Sans`, sans-serif.
- **Hiyerarşi:**
  - Sayfa Başlığı: `text-2xl font-bold tracking-tight` (24px)
  - Kart Başlığı / Öğrenci Adı: `text-base font-bold` (16px)
  - Gövde / Etiket: `text-sm font-medium` (14px)
  - Küçük Rozetler / Alt Bilgi: `text-xs` (12px) veya `text-[11px] font-semibold`
- **Kenar Yuvarlama (Border Radius):**
  - Kartlar & Konteynerlar: `rounded-2xl` (16px)
  - Butonlar, Inputlar & İç Bölmeler: `rounded-xl` (12px)
  - Rozetler & Durum Hapları: `rounded-full` (tam yuvarlak)

---

## 4. Bileşen Şablonları

1. **Öğrenci Günlük Kartı:**
   - Aydınlıkta: `bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs`
   - Karanlıkta: `dark:bg-[#131E3A] dark:border-slate-700/60`
   - İç Satırlar (Yemek/Uyku/Bez): Aydınlıkta `bg-slate-50/70 border border-slate-100 rounded-xl`, Karanlıkta `dark:bg-slate-900/80 dark:border-slate-800`
   - Aksiyon Butonu: Aydınlıkta `bg-blue-900 hover:bg-blue-800 text-white`, Karanlıkta `dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-bold`

2. **İstatistik (KPI) Kartı:**
   - 3'lü eşit grid (`grid-cols-1 sm:grid-cols-3 gap-4`)
   - Yumuşak tek renk ikon kutusu, net büyük sayaç sayısı (`text-2xl font-bold`), açıklayıcı alt etiket.
