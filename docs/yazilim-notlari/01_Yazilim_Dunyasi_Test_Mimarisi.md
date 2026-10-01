# 🧪 Yazılım Dünyasında Test Mimarisi: Baştan Sona Rehber

> **"Test yazmayan yazılımcı, yazdığı her yeni satır kodda canlı sistemi (Production) patlatma korkusuyla yaşar. Test yazan yazılımcı ise Cuma akşamı canlıya güncelleme atıp huzurla kahvesini yudumlar."**

---

## 1. Giriş: Neden Test Yazarız? (Psikolojik ve Mühendislik Boyutu)

Yazılıma yeni başlayan veya orta seviyedeki geliştiriciler genellikle şu yanılgıya düşer:
_"Kodu yazdım, tarayıcıda açtım, bir kez tıkladım, çalıştı. Tamamdır, bitti!"_

Gerçek yazılım mühendisliğinde bu yeterli **değildir**. Çünkü:

1. **Regresyon (Bozulma) Riski:** Bugün eklediğin küçük bir özellik, 3 ay önce yazdığın öğrenci kayıt ekranını fark ettirmeden bozabilir.
2. **Korku Faktörü:** Kod büyüdükçe geliştiriciler eski koda dokunmaktan korkar ("Dokunursam bozulur"). Testler bu korkuyu yok eder.
3. **Canlıda Rezil Olma Maliyeti:** Hatayı geliştirme anında bulmak **1 lira**, test aşamasında bulmak **10 lira**, müşteri canlıda gördüğünde bulmak **1.000 lira ve itibar kaybıdır**.

---

## 2. Gerçek Hayat Analojisi: Araba Fabrikası 🚗

Test türlerini anlamanın en kolay yolu bir **otomobil fabrikasını** hayal etmektir:

```
          /\
         /  \        End-to-End (E2E) Test: Arabayı piste çıkarıp sürmek
        /----\
       /      \      Entegrasyon Testi: Motor, şanzıman ve tekerleklerin uyumu
      /--------\
     /          \    Birim (Unit) Test: Tek tek vidalar, fren balatası, pistonlar
    /------------\
```

1. **Birim Testi (Unit Test) -> Civata ve Balata Testi:**
   Mühendis masaya bir fren balatasını veya bir civatayı koyar. Kırılıyor mu, boyutları doğru mu bakar. Motor ya da araba henüz ortada yoktur; sadece o küçük parçanın sağlamlığı test edilir.
2. **Entegrasyon Testi (Integration Test) -> Motor ve Şanzıman Bağlantısı:**
   Motor ile şanzıman birleştirilir. Motor döndüğünde şanzıman gücü aksa iletiyor mu? İki parça birbiriyle konuşabiliyor mu?
3. **Uçtan Uca Test (E2E / Playwright) -> Arabayı Test Pistine Çıkarmak:**
   Kaput kapatılır, direksiyon başına bir robot (veya sürücü) oturur. Gaza basar, freni test eder, klimayı açar, virajı döner. Gerçek kullanıcının yapacağı her şeyi simüle eder.
4. **Stres / Yük Testi (Load & Stress) -> Çöl Sıcağında ve Kutup Soğuğunda Sürmek:**
   Araba 50 derece sıcakta veya -30 derecede saatlerce zorlanır; motor hararet yapıyor mu bakılır.
5. **Güvenlik Testi (Penetration) -> Hırsızlık ve Çarpışma Testi:**
   Arabaya kaza yaptırılır (Euro NCAP), kapıları levye ile zorlanır.

---

## 3. Test Piramidi (The Testing Pyramid)

Martin Fowler ve Mike Cohn tarafından ortaya atılan bu model, bir projedeki testlerin oranını belirler:

### 1. Katman: Birim Testleri (Unit Tests) — %70

- **Nedir?** Tek bir fonksiyonu veya metodun çıktısını test eder. Veritabanına veya internete bağlanmaz.
- **Hız:** Saliseler (10 milisaniye) içinde çalışır.
- **Maliyet:** Çok ucuzdur, saniyede binlerce çalıştırılabilir.
- **Örnek:** `hesaplaKDV(100)` fonksiyonu `120` dönüyor mu?
- **Popüler Araçlar:** Jest, Vitest, Mocha.

### 2. Katman: Entegrasyon Testleri (Integration Tests) — %20

- **Nedir?** İki veya daha fazla bileşenin birbiriyle uyumunu test eder.
- **Örnek:** Backend'deki `StudentController`, veritabanına gidip öğrenciyi kaydedip doğru JSON dönüyor mu?
- **Hız:** Birkaç saniye sürer (veritabanı sorguları içerir).
- **Popüler Araçlar:** Supertest, Testcontainers, Jest (DB bağlantılı).

### 3. Katman: Uçtan Uca Testler (End-to-End / E2E) — %10

- **Nedir?** Gerçek bir tarayıcı (Chrome/Safari) açılır, kullanıcı gibi formlar doldurulur, butonlara tıklanır.
- **Hız:** Dakikalar sürebilir, kaynak tüketir.
- **Maliyet:** En pahalı ve kırılgan (flaky) testlerdir, bu yüzden piramidin sadece tepesinde yer alırlar.
- **Popüler Araçlar:** Playwright (Modern kral), Cypress, Selenium (Eski nesil).

---

## 4. Yazılım Dünyasında Karşına Çıkacak Tüm Test Terimleri

| Test Türü                | Türkçe Anlamı       | Ne Yapar?                                                                  | Ne Zaman Yapılır?                     |
| ------------------------ | ------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| **Unit Test**            | Birim Testi         | Tek bir fonksiyon/fonksiyon parçasını dener.                               | Kod yazılırken anında.                |
| **Integration Test**     | Entegrasyon Testi   | API + DB gibi iki parçanın iletişimini test eder.                          | Servisler tamamlandığında.            |
| **E2E Test**             | Uçtan Uca Test      | Kullanıcı gibi tüm akışı baştan sona simüle eder.                          | Sayfa veya özellik bittiğinde.        |
| **Regression Test**      | Regresyon Testi     | "Yeni kod ekledik, eski sayfalar hala çalışıyor mu?" kontrolü.             | Her Pull Request / Deployment öncesi. |
| **Smoke Test**           | Duman Testi         | Yangın var mı? Sistem ayağa kalkıyor mu? En kritik 3 sayfa açılıyor mu?    | Canlıya çıktıktan hemen sonra.        |
| **Sanity Test**          | Akıl Sağlığı Testi  | Acil bir bug düzeltmesi (hotfix) sonrası o bug gerçekten çözüldü mü?       | Hotfix sonrası.                       |
| **RBAC Test**            | Yetkilendirme Testi | Veli admin ekranını görebiliyor mu? Öğretmen kreş ayarlarını silebilir mi? | Güvenlik denetimlerinde.              |
| **Load / Stress**        | Yük / Stres Testi   | Aynı anda 10.000 veli karneye bakarsa sunucu çöker mi?                     | Büyük lansman öncesi.                 |
| **Exploratory (Manuel)** | Keşifçi Test        | İnsan gözüyle garip senaryoları denemek (örn: isme 500 harf yazmak).       | Yayına çıkmadan önce QA tarafından.   |

---

## 5. Playwright Nedir ve Neden Dünyanın 1 Numaralı E2E Aracıdır?

Microsoft tarafından geliştirilen **Playwright**, günümüzde E2E test dünyasının altın standardıdır.

### Playwright'ın Süper Güçleri:

1. **Çoklu Motor Desteği:** Tek bir test koduyla Chromium (Chrome, Edge), Firefox ve WebKit (Safari) üzerinde aynı anda çalışır.
2. **Auto-Wait (Otomatik Bekleme):** Eski araçlar (Selenium) butonun yüklenmesini beklemediği için `sleep(3000)` yazmak zorunda kalırdınız. Playwright buton tıklanabilir olana kadar kendisi bekler!
3. **Trace Viewer (Zaman Makinesi):** Test çöktüğünde Playwright bir "röntgen" kaydeder. Hata anında DOM'un durumu, ağ istekleri ve ekran görüntüsü kare kare izlenebilir.
4. **Headless & Headful Mod:**
   - _Headless:_ Tarayıcı görünmeden arkada sessizce çalışır (CI/CD sunucuları için çok hızlı).
   - _Headful:_ Tarayıcı gözünün önünde açılır ve robot gibi tıklar (geliştirici seyreder).

### Örnek Bir Playwright Testi Nasıl Görünür?

```ts
import { test, expect } from '@playwright/test';

test('Veli sisteme giriş yapabilmeli ve çocuğunun karnesini görebilmeli', async ({ page }) => {
  // 1. Giriş sayfasına git
  await page.goto('https://kidscare.abdullahkeklik.com/login');

  // 2. Formu doldur
  await page.fill('input[type="email"]', 'parent@demo.test');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  // 3. Panelin açıldığını doğrula
  await expect(page.locator('h1')).toContainText('Veli Portalı');

  // 4. Çocuğun adına tıkla ve karneye git
  await page.click('text=Ada Yılmaz');
  await expect(page.locator('.daily-report-card')).toBeVisible();
});
```

---

## 6. Test Yazma Disiplini: AAA Kuralı (Arrange - Act - Assert)

Dünyadaki tüm profesyonel testler istisnasız **AAA** şablonuna uyar:

1. **Arrange (Hazırla):**
   Test ortamını kur. Değişkenleri tanımla, gerekiyorsa sahte veri üret (Mock).
2. **Act (Çalıştır / Eyleme Geç):**
   Test edilecek fonksiyonu çağır ya da butona tıkla.
3. **Assert (Doğrula / İddia Et):**
   Dönen sonuç ile beklediğin sonucun eşit olduğunu doğrula. Eşit değilse test patlar (Fail).

```ts
// Örnek:
test('Öğrenci devamsızlığı doğru hesaplanmalı', () => {
  // Arrange
  const student = { totalDays: 20, attendedDays: 18 };

  // Act
  const absenceRate = calculateAbsenceRate(student);

  // Assert
  expect(absenceRate).toBe(10); // %10 olmalı
});
```

---

## 7. TDD (Test-Driven Development) Nedir?

Birçok yazılımcının duyduğu ama az kişinin tam uygulayabildiği bir metodolojidir:
**"Kodu yazmadan önce testini yaz!"**

Döngü şu şekildedir: **Kırmızı -> Yeşil -> Refactor (Temizle)**

1. **Kırmızı (Red):** Henüz var olmayan bir fonksiyon için test yazarsın. Fonksiyon olmadığı için test doğal olarak kırmızı yanar (başarısız olur).
2. **Yeşil (Green):** Sadece testi geçecek kadar en minimal kodu yazarsın. Test yeşile döner.
3. **Refactor:** Kodu güzelleştirir, temizler, optimize edersin. Test yeşil kalmaya devam ettiği sürece için rahattır.

---

## 8. KidsCare Projesine Özel Test Stratejisi (Web V1 İçin Yol Haritası)

Bizim KidsCare projemizde testleri nereye koymalıyız?

1. **Backend (`apps/api`):**
   - `TenantGuard` testi: Demo kreşinin verisine başka bir kreş ID'si ile erişilemiyor olmalı!
   - `AuthService` testi: Yanlış şifrede 401 Unauthorized dönmeli, doğru şifrede JWT token üretmeli.
2. **Web Yönetim Paneli (`apps/admin-web`):**
   - Playwright E2E testi:
     - Admin girişi -> Yeni öğrenci ekle -> Listede göründü mü?
     - Öğretmen girişi -> Yoklama al (Geldi/Gelmedi) -> Kaydet -> Backend'e 200 gitti mi?
     - Veli girişi -> Kendi çocuğunu görüyor mu? Başkasının çocuğunu ASLA görmemeli!
3. **Mobil Uygulama (`apps/mobile`):**
   - API Client testi: BaseURL doğru mu, token interceptor başlığa `Authorization: Bearer ...` ekliyor mu?

---

## 9. 🧠 Altın Öğütler (Zihinde Kalması Gerekenler)

- **%100 Kod Kapsamı (Code Coverage) Bir Tuzaktır:** Her satıra test yazmaya çalışmak projeyi yavaşlatır. Önemli olan **iş mantığını (Business Logic)** ve kritik yolları (Para, Giriş, Veri Silme) test etmektir.
- **Flaky Test Düşmandır:** Bazen geçen bazen kalan test yazılımcının testlere olan güvenini yok eder. Testler deterministik (her zaman aynı sonucu veren) olmalıdır.
- **Bir Bug Bulduğunda Önce Testini Yaz:** Canlıda bir hata mı çıktı? Önce o hatayı simüle eden testi yaz (kırmızı olsun), sonra kodu düzeltip testi yeşile çevir. Böylece o hata hayat boyu bir daha geri gelemez!
