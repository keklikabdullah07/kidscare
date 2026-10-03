# Spec 0008 — admin-web-design-system-harmonization (mini)

- Status: Completed
- Mode: lite
- Plan: `specs/plans/0008-admin-web-design-system-harmonization-plan.md`
- Source: USER-REQUEST-20261003-DESIGN-HARMONIZATION

## Intent

KidsCare Admin Web arayüzünde Ana Panel (`/dashboard`) için başarıyla uygulanan ve onaylanan Apple standartlarındaki "Warm Paper & Frosted Glass" (Sıcak Kaşmir Kağıt `#F6F3EC`, tanımlı `#DDD4C4` kenarlıklar, çok katmanlı ortam gölgeleri ve `rounded-3xl` squircle kartlar) tasarım dilini tüm alt sayfalara (Öğrenciler, Yoklama, Günlük Takip, Yemek Listesi ve Veli Portalı) uyarlamak. Bu sayede tüm platformda tutarlı, mat, göz dinlendiren ve lüks bir kreş yönetim deneyimi sunulacaktır.

## Changed behavior

- [x] CB-1 — **Öğrenciler Sayfası (`/students`)**: Filtre çubuğu, `StudentCard` ızgara kartları, modal pencereleri ve liste tablosu `#DDD4C4` sınır, `rounded-3xl` kavis ve çok katmanlı Apple ortam gölgeleri ile güncellendi.
- [x] CB-2 — **Yoklama Sayfası (`/attendance`)**: Sınıf seçici, toplu aksiyon çubukları, yoklama durum rozetleri ve öğrenci yoklama kartları aynı tasarım diline kavuşturuldu.
- [x] CB-3 — **Günlük Takip Sayfası (`/tracking`)**: Günlük bülten kartları, ruh hali/yemek/uyku seçim hapları ve karne formları yeni görsel hiyerarşi ile uyumlu hale getirildi.
- [x] CB-4 — **Yemek Listesi Sayfası (`/menus`)**: Menü takvimi ve öğün kutuları (kahvaltı, öğle, ikindi) `#DDD4C4` sınır ve yükseltilmiş kart mimarisine geçirildi.
- [x] CB-5 — **Veli Portalı (`/portal`)**: Veli paneli ana kartları, çocuk karne özeti ve günlük akış kartları sıcak kaşmir tuval ile uyumlu squircle derinliğe taşındı.

## Preserved behavior

- [x] PB-1 — Tüm API istekleri, veri yüklemeleri, öğrenci ekleme/düzenleme/silme, yoklama kaydetme ve karne doldurma fonksiyonları eksiksiz çalışmaya devam eder.
- [x] PB-2 — Karanlık mod (`dark:`) renkleri, erişilebilirlik kontrastları (`WCAG AA`) ve mobil uyumluluk (`responsive design`) korunur.

## Out of scope

- Backend (`apps/api`) veya mobil uygulama (`apps/mobile`) kodlarında değişiklik yapılmaz; değişiklikler yalnızca `apps/admin-web` stil ve bileşen katmanıyla sınırlıdır.

## Definition of Done

- [x] Beş ana sayfa (Öğrenciler, Yoklama, Günlük Takip, Yemek Menüleri, Veli Portalı) yeni tasarım diliyle güncellendi ve ekran görüntüleriyle doğrulandı.
- [x] TypeScript kontrolleri (`tsc --noEmit`) hatasız geçti.
- [x] `./scripts/check.ps1` yeşil tamamlandı.
- [x] Şartname `specs/done/` dizinine taşındı.
