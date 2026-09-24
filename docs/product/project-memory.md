# KidsCare Proje Hafızası

> Bu dosya, uzun süreli geliştirmede ana bağlam kaynağıdır. Yeni oturum başında önce okunmalıdır.

## Güncel Durum

- Proje: Kreş yönetim ve günlük bakım platformu
- Kapsam: Yalnızca web paneli ve backend
- Mobil uygulama: Kapsam dışı, değiştirilmeyecek
- Mimari: Nx monorepo, NestJS API, React/Vite web, Prisma/PostgreSQL
- Roller: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`
- Multi-tenancy: Zorunlu

## Mevcut Temel Modüller

- Auth ve rol bazlı erişim
- Tenant yönetimi
- Öğrenci yönetimi
- Yoklama
- Günlük rapor
- Yemek menüsü
- Etkinlik galerisi
- Veli portalı
- Ekip/kullanıcı yönetimi

## Ürün Vizyonu

> Öğretmen daha az veri girsin, veli daha anlamlı bilgi alsın, admin sorunları daha erken görsün.

KidsCare yalnızca yoklama, aidat ve mesajlaşma kopyası olmayacak. Farklılaşma alanları:

- Hızlı öğretmen günlük akışı
- Anlamlı veli günlük özeti
- Güven merkezi
- Gelişim hikâyesi
- Admin erken uyarı sistemi

## Kararlaştırılmış Geliştirme Sırası

1. Teknik taban ve mevcut sistem doğrulama
2. Öğretmen günlük akışı + veli günlük özeti
3. Teslim, sağlık, ilaç, olay ve iletişim güvenliği
4. Gelişim hikâyesi ve portfolyo
5. Admin erken uyarı merkezi
6. İleri otomasyon ve tahminleme

Ayrıntılı plan: `docs/product/implementation-plan.md`

Piyasa ve ürün analizi: `docs/product/market-research-and-differentiation.md`

## Sıradaki İş

Faz 1, Sprint 1 devam ediyor:

1. Mevcut `Student`, `Attendance` ve `DailyReport` akışını doğrulamak — tamamlandı
2. Sınıf ve öğretmen ilişkisi için veri modeli kararı vermek — tamamlandı
3. Öğrenci-sınıf ilişkisini tasarlamak — tamamlandı
4. Shared type ve Zod şemalarını tanımlamak — tamamlandı
5. Öğretmen günlük akışı API'sini oluşturmak — temel classroom daily-flow endpoint'i tamamlandı
6. Öğretmen “Bugün” ekranını oluşturmak — sınıf seçimi ve daily-flow bağlantısı tamamlandı
7. Veli günlük özetini bağlamak
8. Rol ve tenant izolasyon testlerini yazmak

## Mimari Kurallar

- Tenant sorguları `withTenant` veya `runWithTenant` kullanmalı.
- Tenant-scoped endpoint'lerde `TenantGuard` zorunlu.
- Controller içinde Prisma sorgusu yazılmamalı.
- Repository katmanı kullanılmalı.
- Constructor bağımlılıklarında açık `@Inject(...)` kullanılmalı.
- DTO ve modeller `shared-types` / `shared-schemas` içinde olmalı.
- `any` kullanılmamalı.
- Mobil koduna dokunulmamalı.
- Kullanıcının mevcut değişiklikleri ezilmemeli.

## Veri Modeli Kararları

- Sınıf ve öğretmen ilişkisi için ilişkisel model tercih edilecek.
- Öğrencinin sınıf geçmişi gerekiyorsa tarihçeli üyelik modeli kullanılacak.
- Günlük kayıtlar MVP'de mevcut yapı ile ilerleyebilir.
- Sağlık, ilaç, teslim ve olay kayıtları güvenlik/audit ihtiyacı nedeniyle ayrı modeller olmalı.
- Otomatik özet yalnızca kaydedilmiş veriyi kullanmalı; veri uydurmamalı.

## Ürün İlkeleri

- Özellik sayısı değil, gerçek sorun çözümü öncelikli.
- Öğretmeni uzun formlara zorlamamak.
- Kritik bildirimleri rutin bildirimlerden ayırmak.
- Aynı veri üç kez girilmemeli:
  - Öğretmen hızlı giriş yapar.
  - Veli anlamlı çıktı görür.
  - Admin kontrol ve uyarı görür.
- Yapay zekâ tanı koymaz, öğretmen gözleminin yerine geçmez.

## Son Oturum Notu

- **Tarih:** 2026-09-24
- **Yapılan İş:** V1 Kapsam donduruldu ve mevcut tüm 15 menünün uçtan uca hatasız çalışması sağlandı.
  - Mesajlaşma katılımcı boşluğu giderildi: `resolveDefaultParticipants` mekanizmasıyla ilgili veli, sınıf öğretmeni ve yöneticiler sohbetlere otomatik katılımcı olarak ekleniyor.
  - Veli taleplerinin öğretmenler tarafından da onaylanabilmesi (`TEACHER` yetkisi) sağlandı.
  - Öğrenci ve sınıf ilişkisi (`classroomId`) `shared-types`, `shared-schemas`, API entity ve `StudentsPage` modal/kart/tablo bileşenlerine tam olarak bağlandı.
  - `PickupPage` içinde raw ID yerine gerçek öğrenci adlarının gösterimi sağlandı.
  - Yoklama, Günlük Takip, Veli Portalı, Mesajlar, İlaç, Olay Kayıtları, Yemek Listesi, Galeri ve Ayarlar sayfaları doğrulandı.
- **Değiştirilen Dosyalar:**
  - `packages/shared-types/src/student.ts`
  - `packages/shared-schemas/src/student.schema.ts`
  - `apps/api/src/modules/students/entities/student.entity.ts`
  - `apps/api/src/modules/parent/services/parent.service.ts`
  - `apps/api/src/modules/messaging/repositories/messaging.repository.ts`
  - `apps/api/src/modules/messaging/services/messaging.service.ts`
  - `apps/api/src/modules/messaging/controllers/messaging.controller.ts`
  - `apps/api/src/modules/messaging/services/messaging.service.spec.ts`
  - `apps/admin-web/src/api/students.ts`
  - `apps/admin-web/src/features/students/StudentsPage.tsx`
  - `apps/admin-web/src/features/pickup/PickupPage.tsx`
- **Test & Derleme Sonucu:**
  - `apps/api` TypeScript derleme: 0 HATA ✅
  - `apps/admin-web` TypeScript derleme: 0 HATA ✅
  - Backend API Unit Testleri: 27 suite, 127 test BAŞARILI (%100) ✅
  - Web Vitest Testleri: 16 dosya, 35 test BAŞARILI (%100) ✅
  - Toplam 162/162 test yeşil!
- **Canlı Ortam (Render) Düzeltmesi:**
  - Canlı bulut PostgreSQL veritabanında eksik olan son 4 migration (`classrooms`, `pickup/medication`, `grants/RLS`, `messaging/incidents`) uygulandı.
  - Migration sıralama bağımlılığı düzeltildi (`conversations` RLS yetkileri tablo oluşturma sonrasına taşındı).
  - Canlıdaki `500 Internal server error` hatası tamamen giderildi; tüm canlı uç noktalar 200 OK ile doğrulanmıştır.
- **Açık Sorunlar:** Yok, canlı ortam ve yerel ortam %100 senkron ve çalışır durumda.
- **Sıradaki Tek Görev:** Tasarım / UI cilalama ve kullanıcı deneyimi geliştirmeleri.

## Oturum Güncelleme Şablonu

Her önemli çalışma sonunda şu alanlar güncellenmeli:

- Tarih:
- Yapılan iş:
- Değiştirilen dosyalar:
- Alınan kararlar:
- Test sonucu:
- Açık sorunlar:
- Sıradaki tek görev:
