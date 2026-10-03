# KidsCare Dokunsal Tasarım Sistemi Rehberi (Tactile Claymorphic Design System)

> **BU BELGENİN AMACI:**  
> Bu kılavuz, KidsCare platformunda oluşturulan ve standartlaştırılan **İskandinav Dokunsal (Nordic Tactile Claymorphism)** tasarım dilinin anayasasıdır.  
> KidsCare içindeki tüm yeni sayfalar, mobil arayüzler ve gelecekte geliştirilecek **yeni projeler (E-Ticaret, SaaS, B2B Portalları, CRM vb.)** bu kılavuzdaki prensipleri, renk kodlarını ve etkileşim kurallarını referans almalıdır.

---

## 1. Tasarım Felsefesi ve İlham

Klasik web siteleri ve modern yazılımlar genellikle iki uç noktadadır:

1. **Düz ve soğuk kurumsal arayüzler:** Beyaz zemin üzerine jenerik mavi/mor butonlar.
2. **Aşırı yapay neomorphic/glassmorphic denemeler:** Kontrastı düşük, erişilebilirliği zayıf, göz yoran tasarımlar.

**KidsCare Felsefesi:** _"Ekrana değil, masadaki kaliteli ahşap ve kil nesnelere dokunma hissi."_

- **Sıcaklık ve Güven:** Kreş ortamının doğallığı, mat keten zeminler, sıcak sınır çizgileri ve yumuşak bal kehribarı tonları.
- **Fiziksel Basma Duygusu:** Tıklanan her butonun altında 3D renkli bir dudak (extruded lip) bulunur; basıldığında buton fiziksel bir tuş gibi içeri çöker.
- **Göz Yormayan Netlik:** Saf çiğ beyaz yerine keten/yulaf tonu (`#FAF9F6`), saf siyah yerine derin obsidyen (`#090D16`).

---

## 2. Renk Paleti ve Zemin Tokenları

### A. Açık Mod (Light Mode)

| Token Adı                 | HEX Kodu  | Kullanım Alanı                                 |
| ------------------------- | --------- | ---------------------------------------------- |
| **Linen Canvas**          | `#FAF9F6` | Ana sayfa arka planı (parlamayan, mat keten)   |
| **Card Surface**          | `#FFFFFF` | Ana içerik kartları                            |
| **Subtle Inset Surface**  | `#FCFAF7` | Form inputları, iç kutular, filtre zeminleri   |
| **Warm Border (Primary)** | `#DDD4C4` | Standart kart ve input sınırları (1.5px / 2px) |
| **Warm Lip / Extrusion**  | `#D5CBB9` | Nötr kartların ve butonların 3D alt dudağı     |

### B. Koyu Mod (Obsidian Dark Mode)

| Token Adı              | HEX Kodu                             | Kullanım Alanı                    |
| ---------------------- | ------------------------------------ | --------------------------------- |
| **Obsidian Canvas**    | `#090D16`                            | Derin, göz almayan obsidyen zemin |
| **Card Surface Dark**  | `#131B2E`                            | Gece modu kart yüzeyleri          |
| **Dark Inset Surface** | `#0F172A`                            | Gece modu input ve form alanları  |
| **Dark Border**        | `#1E293B` / `rgba(255,255,255,0.08)` | Koyu mod kart sınırları           |
| **Dark Lip Extrusion** | `#1E293B`                            | Koyu mod 3D alt dudak gölgesi     |

### C. Marka ve Vurgu Renkleri

| Renk Grubu                          | HEX Kodu                     | Tailwind Sınıfı                   | Anlamı ve Görevi                             |
| ----------------------------------- | ---------------------------- | --------------------------------- | -------------------------------------------- |
| **İskandinav Adaçayı / Teal**       | `#115e59` (hover `#0f766e`)  | `bg-[#115e59]` / `text-teal-900`  | Birincil aksiyonlar, onay, ana marka         |
| **Bal Kehribarı / Amber**           | `#f59e0b` (hover `#fbbf24`)  | `bg-[#f59e0b]` / `text-amber-800` | Kreş sıcaklığı, öne çıkan eylemler, rozetler |
| **Şeftali / Pişmiş Toprak (Peach)** | `#F3D5C3` (border `#E5C1AE`) | `bg-[#F3D5C3]`                    | Özel tanıtım kartları, sıcak kutlamalar      |
| **Gül Kurusu / Rose Danger**        | `#f43f5e` (hover `#fb7185`)  | `bg-[#f43f5e]`                    | Kritik silme, iptal, acil durumlar           |

---

## 3. Altın Kural: Tek Etkileşimli Varlık İlkesi (Single Interactive Entity Rule)

> 🚨 **HAYATİ ETKİLEŞİM KURALI (ASLA İHLAL EDİLEMEZ):**  
> Kullanıcı bir bileşenle etkileşime girdiğinde **hangisinin tepki verdiği kesin ve net olmalıdır**.  
> **Asla hareket eden bir kartın içerisine ayrıca hareket eden buton koyulamaz!**

### Senaryo 1: Kartın İçinde Aksiyon Butonu Varsa ➔ KART SABİTTİR

- **Kart:** Zeminlenmiş, statik bir taşıyıcıdır (`border border-[#DDD4C4] shadow-sm` veya `shadow-2xs`). Hover'da havaya KALKMAZ.
- **Buton:** Kartın içindeki buton dokunsaldır (`TactileButton` veya `btn-tactile-*`). Hover'da hafifçe yükselir, tıklandığında içeri gömülür.
- _Neden?_ Eğer hem kart hem de buton hareket ederse, kullanıcı butona basmaya çalışırken kart da altından kayar; bu da arayüzde dengesizlik ve ucuz bir titreme hissi oluşturur.

### Senaryo 2: Kartın İçinde Başka Buton Yoksa ➔ KARTIN KENDİSİ DOKUNSALDIR

- KPI istatistik kartları, hızlı özet kartları veya doğrudan tıklanıp detaya giden liste elemanlarında kartın kendisi `TACTILE_CARD_CLASSES` taşır.
- Kart tek başına hover'da `-translate-y-1` yükselir, tıklandığında `active:translate-y-[3px]` ile basılır.

---

## 4. 3D Ekstrüzyon & Dokunsal Buton Anatomisi

Her buton düz bir boyalı alan değil; derinliği olan somut bir tuştur:

```css
/* Örnek: Teal Dokunsal Buton */
.btn-tactile-teal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 2px solid #0f766e;
  background-color: #115e59;
  color: #ffffff;
  font-weight: 800;
  /* 3D Dudak: [x, y, blur, spread, renk] + difüz zemin gölgesi */
  box-shadow:
    0 3px 0 0 #042f2e,
    0 6px 14px rgba(17, 94, 89, 0.25);
  transition:
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  user-select: none;
}

/* Hover: Hafifçe yukarı esner, dudak 4px'e çıkar */
.btn-tactile-teal:hover {
  background-color: #0f766e;
  transform: translateY(-1px);
  box-shadow:
    0 4px 0 0 #042f2e,
    0 8px 18px rgba(17, 94, 89, 0.3);
}

/* Active / Click: Fiziksel tuş basması — 3px içeri gömülür, dudak sıfırlanır */
.btn-tactile-teal:active {
  transform: translateY(3px);
  box-shadow: 0 0 0 0 #042f2e;
}
```

### Standart Bileşen Kullanımı: `<TactileButton />`

```tsx
import { TactileButton } from '@/components/ui/TactileButton';

<TactileButton variant="teal" size="md">
  <span>Kaydet</span>
</TactileButton>

<TactileButton variant="amber" size="sm">
  <span>+ Yeni Ekle</span>
</TactileButton>

<TactileButton variant="secondary" size="md">
  <span>Filtrele</span>
</TactileButton>
```

---

## 5. CSS Taşma (Overflow) ve Kırpılma Önleme Kuralı

> ⚠️ **DİKKAT:** Dokunsal butonlar altlarında 3px-4px fiziksel dudak ve 8px-14px yayılma gölgesi taşır.  
> Eğer butonlar bir kapsayıcı içerisine konulduğunda kapsayıcıya `overflow-x: auto` ve `pb-0` verilirse, tarayıcı butonun altındaki yuvarlak dudağı **jilet gibi düz keser (clipping)**.

**Çözüm Formülü:**

- Toolbar ve buton gruplarında daima `flex-wrap` ve en az `py-1.5` dikey iç boşluk kullanın.
- Örnek: `className="flex flex-wrap items-center gap-2 py-1.5"`

---

## 6. Formlar ve Giriş Alanları (Inputs)

- Form alanlarında soğuk beyaz yerine `#FCFAF7` sıcak keten iç tonu kullanılır.
- Kenarlıklar `#DDD4C4` rengindedir.
- Odaklanıldığında (Focus) çiğ mavi yerine markanın adaçayı rengi devreye girer:
  ```html
  focus:border-teal-700 focus:ring-2 focus:ring-teal-500/20 focus:bg-white
  ```
- Köşe yuvarlaklığı: `rounded-2xl` (organik ve yumuşak).

---

## 7. Yeni Projelere (E-Ticaret, SaaS, Finans vb.) Uyarlama Rehberi

Bu tasarım dili yalnızca kreş yönetimine özgü değildir. Başka bir projede kullanmak istediğinizde şu dönüşümleri yapabilirsiniz:

### E-Ticaret Projesine Uyarlama:

1. **Ürün Kartı (Grounded):** Ürün kartı sabit tutulur (`shadow-sm`, `rounded-3xl`, `#DDD4C4` sınır).
2. **"Sepete Ekle" Butonu:** Kartın sağ altında 3D turuncu veya zümrüt `btn-tactile-amber` butonu yer alır. Müşteri sepete eklerken butonun basılma hissini yaşar.
3. **Kategori ve Beden Filtreleri:** Beden (S, M, L, XL) veya kategori seçimlerinde `btn-tactile-secondary` hap butonları kullanılır; seçilen beden `btn-tactile-teal`'e dönüşür.
4. **Ödeme (Checkout) Butonu:** Dev boyutlu (`size="lg"`), yeşil 3D ekstrüzyonlu güven veren bir satın alma butonu.

### SaaS / CRM Projesine Uyarlama:

1. **Metrik / KPI Kartları:** Tamamı bağımsız dokunsal kart (`TACTILE_CARD_CLASSES`).
2. **Tablo Eylem Düğmeleri:** Tablo satırları statiktir; satırdaki "Düzenle" / "Yetkilendir" düğmeleri minik dokunsal butonlardır (`size="sm"`).
3. **Modal Onay Butonları:** Modal kartı zeminlenmiş obsidyen/keten, altındaki "Kaydet" butonu dokunsal dudaklı.

---

## 8. Canlı Kod ve Storybook Referansı

Tüm bileşenlerin canlı etkileşimli demonstrasyonu Storybook içinde yer almaktadır:

- `apps/admin-web/src/components/ui/TactileButton.stories.tsx`
- `apps/admin-web/src/components/ui/DesignSystem.stories.tsx` (Living Design Guide)
- Storybook'u çalıştırmak için: `pnpm --filter @kidscare/admin-web storybook`
