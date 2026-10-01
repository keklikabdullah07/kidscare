# KidsCare Geliştirme Standartları (Conventions & Guidelines)

Bu belge, KidsCare projesinde kod yazarken ve mimari tasarlarken uyulması **zorunlu** olan kuralları tanımlar.

---

## 1. Dil Tercihleri (Language Settings)

- **Sohbet Dili (Chat Language):** Türkçe (`chat=tr`)
- **Belgelendirme Dili (Documentation Language):** Türkçe (`docs=tr`)
- **Protokol ve Alan Adları:** Protokol anahtarları (`Status:`, `Approved by / on:`, `Next:`, kod değişkenleri ve fonksiyonlar) evrensel İngilizce kalır.

---

## 2. Backend Standartları (`apps/api`)

### NestJS + `tsx` Dependency Injection Kuralı (Hayati Önemde)

`apps/api` `tsx watch` altında çalışırken reflection metadata parametre tiplerini otomatik vermez. Bu nedenle:

> **ZORUNLU KURAL:** Tüm Controller, Service, Guard, Middleware ve Repository sınıflarının `constructor` parametrelerinde **açıkça `@Inject(SınıfAdı)` kullanılmalıdır.**

```ts
// DOĞRU:
constructor(
  @Inject(StudentsRepository) private readonly studentsRepository: StudentsRepository,
  @Inject(PrismaService) private readonly prisma: PrismaService,
  @Inject(Reflector) private readonly reflector: Reflector,
) {}

// YANLIŞ (Runtime'da undefined hatası verir):
constructor(private readonly prisma: PrismaService) {}
```

### Katmanlı Mimari ve Veri Tabanı Erişimi

- Controller'lar asla doğrudan Prisma sorgusu yazamaz.
- Tüm veritabanı erişimi `Repository` sınıfları üzerinden yürütülür.
- Tüm sorgularda `withTenant` veya `runWithTenant` kullanılarak çoklu kiracılı izolasyon korunur.

---

## 3. Frontend & Tasarım Sistemi Standartları (`apps/admin-web`)

### KidsCare Impeccable Design System (Tasarım Anayasası)

- **Ana Marka Rengi:** İskandinav Adaçayı (`text-teal-900`, `bg-teal-700`, koyu modda `dark:text-teal-300`, `dark:bg-slate-800`).
- **Vurgu & Sıcaklık Rengi:** Güneş Işığı & Bal Kehribarı (`bg-amber-500`, `text-amber-800`, koyu modda `dark:text-amber-300`, `dark:bg-amber-500/20`).
- **Koyu Mod Yüzeyleri:** Ana arka plan derin obsidyen `#090D16`, kart yüzeyleri `#131B2E`, kenarlıklar `border-slate-800/80`.
- **Açık Mod Yüzeyleri:** Ana arka plan keten/yulaf `#FAF9F6`, kart yüzeyleri `#FFFFFF`, kenarlıklar `border-slate-200/80`.
- **Yasak Renkler:** Çiğ saf kırmızı, çiğ yeşil, donuk kurumsal gri, çamurlu lacivert.

### Dayanıklı ve Savunmacı Arayüz (Defensive UI)

1. **İsim Taşmaları:** Öğrenci ve veli isimlerinde daima `min-w-0 flex-1 truncate` ve native `title="..."` kullanılır.
2. **Kırık Görseller:** Tüm `<img>` etiketlerinde `onError` koruması ve fallback avatar bulunmalıdır.
3. **Boş Durumlar (Empty State):** "Kayıt bulunamadı" soğukluğu yerine açıklayıcı ikon, başlık ve yönlendirici eylem butonu (`<EmptyState>`) kullanılır.
4. **Etkileşim:** Butonlarda `active:scale-95`, kartlarda `hover:-translate-y-1` mikro animasyonu uygulanır.

---

## 4. Tip Güvenliği ve Ortak Paketler (`packages/`)

- Asla `any` tipi kullanılmaz. Bilinmeyen tipler için `unknown` kullanılır ve tip daraltması (type narrowing) yapılır.
- DTO'lar daima `packages/shared-types` içinde tanımlanır; frontend veya backend içine kopyalanmaz.
- Form doğrulama şemaları `packages/shared-schemas` altında Zod ile tutulur.
