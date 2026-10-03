# 🎨 Sıfırdan Kaliteli, Dokunsal ve Premium Tasarım Çıkarma Kılavuzu

> **Yazılım Projeleri İçin İleri Seviye UI/UX, Görsel Hiyerarşi ve Tasarım Sistemi İnşa Rehberi**  
> _KidsCare mimarisinden ve modern dokunsal (tactile/claymorphic) tasarım pratiklerinden ilham alınarak hazırlanmıştır._

---

## 📌 Giriş: Zihniyet Dönüşümü (The Mindset Shift)

Çoğu yazılım projesi kod olarak harika çalışsa bile görsel olarak ya **"öğrenci projesi"** gibi çiğ kalır ya da **"ruhsuz kurumsal şablonlar"** gibi soğuk görünür. Bunun temel sebebi geliştiricilerin ekranı sadece iki boyutlu pikseller ve standart HTML kutuları olarak görmesidir.

**Temel Kural:**

> _"Ekranı düz bir cam veya boyalı bir tuval gibi değil; kullanıcının çalışma masasındaki kaliteli, sıcak, dokunulabilir fiziksel nesneler (ahşap, kil, işlenmiş deri ve tuşlar) gibi kurgulayın."_

Bu kılavuz, ister bir **E-Ticaret**, ister **B2B SaaS**, ister **Mobil Uygulama** ya da **Kurumsal Portal** geliştirin; sıfırdan başlarken adım adım kusursuz bir tasarım mimarisi kurmanızı sağlar.

---

## 1. Renk ve Yüzey Mimarisi (Color & Surface Architecture)

### 1.1. Asla Saf Beyaz (`#FFFFFF`) Zemin Kullanmayın

Gözü yoran, çiğ ve parlak `#FFFFFF` arka planlar tasarıma ucuz ve bitmemiş bir his verir.

- **Açık Mod İçin Doğru Yaklaşım:** Mat keten, sıcak yulaf veya hafif mineral tonları seçin.
  - Örnek (KidsCare): `#FAF9F6` (Linen / Oat)
  - Diğer alternatifler: `#F8F9FA`, `#F5F5F0`, `#FBFBFA`
- **Kart Yüzeyleri:** Saf beyazı (`#FFFFFF`) yalnızca ana zemin üzerine konulan **kartların ve modalların yüzeyi** olarak kullanın. Bu sayede doğal bir katman derinliği (elevation) oluşur.
- **İç Alanlar (Inputlar / Arama Kutuları):** `#FCFAF7` gibi çok hafif renkli ve sıcak bir iç zemin tercih edin.

### 1.2. Asla Saf Siyah (`#000000`) Koyu Mod Yapmayın

Saf siyah OLED ekranlarda dahi pikselleri aşırı keskinleştirir ve yorar.

- **Koyu Mod Zemini:** Derin obsidyen veya lacivert-füme tonları (`#090D16`, `#0B0F19`, `#0D1117`).
- **Koyu Mod Kartları:** `#131B2E`, `#161F36` veya `#1E293B`.
- **Koyu Mod Sınırları:** Göz tırmalamayan çok ince yarı saydam çizgiler (`rgba(255, 255, 255, 0.08)` veya `#1E293B`).

### 1.3. 60-30-10 Kuralı ile Renk Dağılımı

1. **%60 Hakim Zemin:** Keten/yulaf açık zemin veya obsidyen gece zemini.
2. **%30 Taşıyıcı Yüzeyler & Sıcak Sınırlar:** Beyaz kartlar, sıcak mineral sınır çizgileri (`#DDD4C4`).
3. **%10 Karakter & Vurgu Rengi:**
   - Birincil Aksiyon: İskandinav Adaçayı / Çam Yeşili (`#115e59`)
   - Sıcaklık & Dikkat: Bal Kehribarı (`#f59e0b`)
   - Özel Vurgu / Hero: Sıcak Şeftali Terracotta (`#F3D5C3`)

---

## 2. 3D Doku, Ekstrüzyon ve Fiziksel Hissiyat (Tactile Depth)

Klasik düz (flat) butonlar kullanıcıya bir tuşa bastığı hissini vermez. Dokunsal (tactile) tasarımda butonlar fiziksel birer klavye tuşu gibi çalışır.

### 2.1. 3D Alt Dudak Matematiği (Extrusion Shadow)

Bir butona 3 boyutlu kalınlık kazandırmak için CSS `box-shadow` özelliği kullanılır:

```css
/* Formül: [X: 0] [Y: Sert Dudak] [Blur: 0] [Spread: 0] [Koyu Ton] + [Yumuşak Difüz Gölge] */
box-shadow:
  0 3px 0 0 #042f2e,
  /* 3D Renkli Sert Alt Dudak */ 0 6px 14px rgba(17, 94, 89, 0.25); /* Zemine Düşen Ortam Gölgesi */
```

### 2.2. Fiziksel Basılma Dinamiği (Active State Physics)

Kullanıcı butona tıkladığında (`:active`):

1. Buton fiziksel olarak 3px aşağı çöker (`transform: translateY(3px)`).
2. Altındaki 3px'lik dudak ezilir ve sıfırlanır (`box-shadow: 0 0 0 0 #042f2e`).
3. Böylece kullanıcı gerçek bir mekanik anahtara basmış gibi net bir geribildirim alır.

```css
.btn-tactile:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 0 0 #042f2e,
    0 8px 18px rgba(17, 94, 89, 0.3);
}
.btn-tactile:active {
  transform: translateY(3px);
  box-shadow: 0 0 0 0 #042f2e;
}
```

---

## 3. 🚨 Altın Kural: Tek Etkileşimli Varlık İlkesi (Single Interactive Entity Rule)

> **EN BÜYÜK TASARIM HATASI:**  
> Bir kartın üzerine gelindiğinde (hover) kart yukarı kalkarken, içerisindeki "İncele" veya "Satın Al" butonunun da ayrıca yukarı kalkmasıdır!  
> İki nesne aynı anda hareket ettiğinde arayüzde dengesizlik, titreme ve ucuz bir oyun hissi oluşur.

### Çözüm Matrisi:

| Senaryo                                              | Kartın Davranışı                                     | Butonun Davranışı                                          | Doğru Tasarım             |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------- |
| **Kartın İçinde Buton Varsa**                        | **SABİT (Grounded)**<br>`shadow-sm`, hareket etmez.  | **DOKUNSAL**<br>Hover'da kalkar, tıklanınca içeri gömülür. | ✅ Eylem netleşir         |
| **Kartın İçinde Buton Yoksa** (Örn: KPI, Özet Kartı) | **DOKUNSAL**<br>Kartın kendisi 3D kalkar ve basılır. | Buton yok                                                  | ✅ Kartın tamamı tuştur   |
| **Hem Kart Hem Buton Kalkıyorsa**                    | _YASAK (Anti-Pattern)_                               | _YASAK (Anti-Pattern)_                                     | ❌ Çift hareket karmaşası |

---

## 4. CSS Taşması ve Kırpılma (Overflow Clipping) Tuzağı

Dokunsal butonlar ve kartlar altlarında 3px-6px 3D dudak ve difüz gölge taşır.

- Bir filtre toolbar'ına veya yatay çubuğa `overflow-x: auto` ve yetersiz dikey padding (`pb-0` veya `pb-1`) verirseniz; tarayıcı alt gölgeleri ve butonun yuvarlak tabanını **jiletle kesilmiş gibi düz keser (clipping)**.
- **Kural:** Buton içeren kapsayıcılarda daima `flex-wrap` ve en az `py-1.5` veya `py-2` dikey boşluk kullanın.

---

## 5. Tipografi ve Görsel Hiyerarşi

- **Font Seçimi:** Tarayıcının varsayılan Arial/Times fontlarını asla kullanmayın. Karakterli ve modern bir font ailesi seçin:
  - _Tavsiyeler:_ `Lexend`, `Plus Jakarta Sans`, `Outfit`, `Inter`.
- **Ağırlık Hiyerarşisi:**
  - Başlıklar: `font-black` (900) veya `font-extrabold` (800) ile güçlü ve iddialı.
  - Etiketler ve Buton Metinleri: `font-bold` (700).
  - Gövde Metinleri ve Açıklamalar: `font-medium` (500) — Asla çok soluk veya çok ince (`font-thin`) kullanmayın.
- **Rozetler (Badges & Pills):**
  - Kategorileri ve durumları küçük harfli metin yerine hap biçimli (`rounded-full`) mikro-rozetlerle gösterin. İçine mutlaka mini bir durum ikonu (`CheckCircle2`, `Sparkles`, `AlertTriangle`) ekleyin.

---

## 6. Formlar, Giriş Alanları ve Savunmacı UI (Defensive Design)

1. **Input Tasarımı:**
   - Köşeler yumuşak ve organik olmalıdır (`rounded-2xl`).
   - Sınırlar `#DDD4C4` tonunda olmalıdır.
   - Odaklanıldığında (Focus) çiğ mavi yerine projenin ana renginde bir hale oluşmalıdır:
     `focus:border-teal-700 focus:ring-2 focus:ring-teal-500/20 focus:bg-white`
2. **Kırık Görsel Koruması:**
   - Kullanıcı veya internet kaynaklı görsellerin bozulma ihtimaline karşı daima `onError` handler ile yedek bir avatar veya gizleme mantığı kurun.
3. **Metin Taşması Koruması:**
   - Uzun isimlerde kartın patlamaması için `min-w-0 flex-1 truncate` ve üzerine gelindiğinde tam ismi gösteren `title` özniteliğini kullanın.
4. **Boş Durumlar (Empty State):**
   - Veri olmadığında asla boş beyaz bir sayfa göstermeyin. İllüstratif bir ikon, samimi bir açıklama ve dokunsal bir eylem butonu barındıran `<EmptyState />` bileşeni sunun.

---

## 7. Bu Tasarım Sistemini Yeni Projelere Uyarlama Rehberi

### A. E-Ticaret Projesine Uyarlama

- **Ürün Kartı:** Kart sabittir (grounded `#FFFFFF`, sınır `#DDD4C4`).
- **Sepete Ekle Butonu:** Kartın sağ altında kehribar/turuncu renkte 3D dokunsal buton (`btn-tactile-amber`). Müşteri tıklayınca buton içeri gömülür ve fiziksel bir satın alma tatmini verir.
- **Beden/Renk Seçimi:** Hap biçimli dokunsal butonlar (`S`, `M`, `L`, `XL`). Seçili olan adaçayı yeşiline döner.
- **Ödeme (Checkout) Butonu:** Dev boyutlu (`size="lg"`), yeşil 3D dudaklı buton.

### B. B2B / SaaS / CRM Projesine Uyarlama

- **KPI İstatistik Kartları:** İçinde buton barındırmayan bağımsız dokunsal kartlar (`TACTILE_CARD_CLASSES`). Hover'da hafifçe yükselir.
- **Veri Tabloları:** Tablo satırları sabittir; satır sonundaki "Düzenle", "Yetkilendir" düğmeleri minik dokunsal butonlardır (`size="sm"`).
- **Arama Çubuğu:** Sıcak keten zeminli (`#FCFAF7`), solunda büyüteç ikonu olan zarif input.

### C. Mobil Uygulamaya Uyarlama (React Native / Expo)

- `active:translate-y` mantığını React Native tarafında `Animated.spring` veya `react-native-reanimated` ile `scale: 0.96` olarak uygulayın.
- Butona basıldığında `expo-haptics` ile `Haptics.impactAsync(ImpactFeedbackStyle.Light)` tetikleyerek gerçek bir fiziksel tuş hissi verin.

---

## 8. Bir Projeye Başlarken 7 Adımlık Tasarım Kontrol Listesi (Design Checklist)

1. [ ] **Zemin Belirlendi mi?** Saf beyaz yerine keten/mineral tonu (`#FAF9F6`) seçildi.
2. [ ] **3 Renk Sınırı Konuldu mu?** 60-30-10 kuralına göre ana renk, vurgu rengi ve nötr yüzeyler belirlendi.
3. [ ] **3D Butonlar Tanımlandı mı?** Renkli alt dudak (`box-shadow: 0 3px 0 0 ...`) ve basılma hareketi (`active:translate-y`) yazıldı.
4. [ ] **Tek Etkileşim Kuralı Korundu mu?** Buton içeren kartların hover hareketi kapatıldı; kart sabitlendi.
5. [ ] **CSS Taşması Önlendi mi?** Buton kapsayıcılarına `flex-wrap py-1.5` verildi; dudaklar tıraşlanmadı.
6. [ ] **Inputlar ve Formlar Özelleştirildi mi?** Çiğ tarayıcı çizgileri yerine sıcak sınırlar ve yumuşak odaklanma halkaları eklendi.
7. [ ] **Karanlık Mod Eşlendi mi?** Gece modunda saf siyah yerine derin obsidyen (`#090D16`) ve koyu kartlar (`#131B2E`) uygulandı.

---

_KidsCare Dokunsal Tasarım Mimarisi Referans Belgesidir._
