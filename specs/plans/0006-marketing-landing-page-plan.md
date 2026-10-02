# Plan 0006 — Pazarlama ve Kurumsal Açılış Sitesi (Marketing Landing Page)

- Spec: `specs/active/0006-marketing-landing-page.md`
- Status: Draft
- Mode: lite

---

## 1. Değişecek veya Eklenecek Dosyalar (Files to Change or Add)

### `apps/marketing/`

- `apps/marketing/app/layout.tsx` — SEO meta etiketleri, Google Fonts (Plus Jakarta Sans) ve layout iskeleti.
- `apps/marketing/app/globals.css` — KidsCare Impeccable Design System stilleri, renk paleti ve animasyonlar.
- `apps/marketing/app/components/Navbar.tsx` — Sabit/yapışkan (sticky) navigasyon çubuğu ve logo.
- `apps/marketing/app/components/Hero.tsx` — Dikkat çekici giriş, çağrı butonları ve canlı arayüz maketi.
- `apps/marketing/app/components/Features.tsx` — 6 sütunlu modül ve yetenek tanıtım grid'i.
- `apps/marketing/app/components/ProductPreview.tsx` — Yönetici ve veli ekranları görsel önizlemesi.
- `apps/marketing/app/components/Pricing.tsx` — Karşılaştırmalı fiyatlandırma ve paket kartları.
- `apps/marketing/app/components/DemoForm.tsx` — İnteraktif demo talep formu (istemci tarafı doğrulama ve teşekkür modalı).
- `apps/marketing/app/components/Faq.tsx` — Açılır kapanır akordeon SSS bileşeni.
- `apps/marketing/app/components/Footer.tsx` — Kurumsal bağlantılar ve güvenlik rozetleri.
- `apps/marketing/app/page.tsx` — Ana açılış sayfası montajı.

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: Tasarım Sistemi ve Temel CSS Altyapısı

1. **Adım 1.1:** `apps/marketing/app/globals.css` dosyasında KidsCare renk token'larını (adaçayı çam yeşili `#0F4C3A`, bal kehribarı `#F59E0B`, keten arka plan `#FAF9F6`), cam morfolojisi ve kart gölgelerini tanımlama.
2. **Adım 1.2:** `apps/marketing/app/layout.tsx` dosyasında SEO başlıkları (`KidsCare — Yeni Nesil Kreş & Anaokulu Yönetim Sistemi`), meta açıklamaları ve favicon'u entegre etme.

### Aşama 2: Görsel Bileşenlerin Oluşturulması

1. **Adım 2.1:** `Navbar` bileşenini kodlama: Logo, menü bağlantıları, panel giriş butonu.
2. **Adım 2.2:** `Hero` bileşenini kodlama: Güçlü slogan, güven rozetleri, çift CTA ve canlı mobil bildirim/karne kartı simülasyonu.
3. **Adım 2.3:** `Features` bileşenini kodlama: 6 temel çekirdek yeteneğin detaylı açıklamaları ve simgeleri.
4. **Adım 2.4:** `ProductPreview` ve `Pricing` bileşenlerini kodlama: Paket fiyatları ve özellik kıyaslaması.

### Aşama 3: İnteraktif Akışlar ve Formlar

1. **Adım 3.1:** `DemoForm` bileşenini kodlama: Ziyaretçinin kreş bilgilerini girdiği, form validasyonunun yapıldığı ve başarılı kayıt sonrasında teşekkür ekranının açıldığı etkileşimli akış.
2. **Adım 3.2:** `Faq` akordeon bileşeni ve `Footer` entegrasyonu.
3. **Adım 3.3:** `apps/marketing/app/page.tsx` içinde tüm bileşenleri kusursuz bir ritimle birleştirme.

### Aşama 4: Derleme, Kalite ve Doğrulama

1. **Adım 4.1:** `pnpm --filter @kidscare/marketing build` ile Next.js production build testi yapma.
2. **Adım 4.2:** `./scripts/check.ps1` tam doğrulama kapısını koşma.
3. **Adım 4.3:** Şartnameyi `specs/done/` içine taşıma ve yerel commit oluşturma (asla push yok!).

---

## 3. Riskler ve Savunma Stratejisi

- **Risk 1 (Stil ve CSS Çakışmaları):** Harici kütüphane bağımlılığı olmadan saf, modern CSS & utility sınıfları kullanılarak hızlı ve sıfır çakışmalı bir yapı kurulacaktır.
- **Risk 2 (Mobil Duyarlılık):** Tüm grid ve form alanları mobil (`<640px`), tablet ve geniş ekranlar için `flex-col sm:flex-row` düzenleriyle test edilecektir.
