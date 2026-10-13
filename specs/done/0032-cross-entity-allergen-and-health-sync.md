# Spec 0032 — Çapraz Varlık Alerji & Sağlık Güvenliği Senkronizasyonu (mini)

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0032-cross-entity-allergen-and-health-sync-plan.md`
- Source: `docs/qa-matrix.md` (Senaryo 3.1: Öğrenci Alerji & Sağlık Güncellemesi)
- Supersedes: None

## Intent

KidsCare platformunda bir öğrenciye tanımlanan alerji ve sağlık pasaportu verilerinin (örn. Fıstık, Laktoz alerjisi), öğretmenin yoklama ekranında (tablo ve kart modlarında), ilaç teslim/dozaj yönetim modallarında ve veli portalı çocuk profilinde anlık, hatasız ve belirgin uyarı rozetleriyle görünmesini sağlamak. Böylece kreşte hiçbir çocuğun alerjisi gözden kaçmayacak ve operasyonel sağlık güvenliği sağlanacaktır.

## Changed behavior

- [x] CB-1 — **Yoklama Ekranı Alerji Bilgilendirmesi (`/attendance`):** Tablo görünümünde alerji rozetine hover edildiğinde (`title` tooltip) öğrencinin tüm alerjileri virgülle ayrılarak listelenir; Kart (Grid) görünümünde ise öğrenci adının altına alerji rozeti (`AlertTriangle` ikonu ve alerji sayısı) eklenir.
- [x] CB-2 — **İlaç Ekranı Alerji Uyarı Kalkanı (`/medication`):** Yeni ilaç oluşturma modalında öğrenci seçildiğinde, öğrencinin alerjileri varsa formun hemen altında amber/rose zeminli belirgin bir dikkat uyarısı (`Dikkat: Bu öğrencinin kayıtlı alerjisi bulunmaktadır: [...]`) çıkar. İlaç listesindeki kartlarda da alerjisi olan çocukların yanında alerji uyarı rozeti gösterilir.
- [x] CB-3 — **Veli Portalı Sağlık & Alerji Kartı (`/portal`):** Veli portalında seçili çocuğun özet alanında kan grubu (`bloodType`) ve kayıtlı alerjilerini (`allergies`) listeleyen dokunsal bir Sağlık Kartı bileşeni yer alır; alerji yoksa "Kayıtlı alerji bulunmuyor" bilgisi verilir.

## Preserved behavior

- [x] PB-1 — Yoklama alma, giriş-çıkış saatleri ve yoklama durumu değiştirme akışı mevcut yapısını ve testlerini bozmadan çalışmaya devam etmelidir.
- [x] PB-2 — İlaç talebi oluşturma, onaylama, verme ve silme (Spec 0029) akışları mevcut yetkilendirmeleriyle korunmalıdır.
- [x] PB-3 — Veli portalındaki mevcut karne, yemek menüsü ve aktivite akışları kesintisiz çalışmalıdır.

## Out of scope

- Mobil uygulama (`apps/mobile`) kodları kapsam dışıdır.
- Yeni bir veritabanı şeması veya Prisma migration'ı eklenmeyecektir (mevcut `passport.allergies` ve `passport.bloodType` kullanılacaktır).

## Definition of Done

- [x] `specs/plans/0032-cross-entity-allergen-and-health-sync-plan.md` adımları TDD ile tamamlandı.
- [x] `./scripts/check.ps1` %100 yeşil (TypeScript, ESLint, Unit Testler).
- [x] `docs/qa-matrix.md` içerisindeki Senaryo 3.1 kontrol maddeleri işaretlendi.
- [x] Şartname `specs/done/0032-cross-entity-allergen-and-health-sync.md` dizinine taşındı.
