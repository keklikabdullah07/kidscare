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

- Piyasa araştırması ve detaylı ürün analizi tamamlandı.
- Uygulama planı oluşturuldu.
- `Classroom` ve `ClassroomTeacher` Prisma modelleri eklendi.
- Öğrenciye nullable `classroomId` ilişkisi eklendi.
- Sınıf listeleme, oluşturma, güncelleme ve öğretmen atama API'si eklendi.
- Demo seed'e `Minik Yıldızlar` sınıfı, öğretmen ataması ve Ada'nın sınıf ilişkisi eklendi.
- Migration ve seed başarıyla çalıştı.
- `pnpm exec tsc -p apps/api/tsconfig.json --noEmit` başarıyla çalıştı.
- Temel `GET /classrooms/:id/daily-flow?date=YYYY-MM-DD` endpoint'i eklendi.
- Admin web günlük takip ekranı sınıf seçimi ve daily-flow API'sine bağlandı.
- Endpoint sınıf, aktif öğrenciler, günlük yoklama ve günlük raporu birlikte döndürüyor.
- Teacher yalnızca atanmış aktif sınıfın daily-flow verisini görebiliyor.
- `pnpm exec tsc -p apps/api/tsconfig.json --noEmit` başarıyla çalıştı.
- `pnpm exec nx test api --runInBand` mevcut Jest ESM/CommonJS yapılandırması nedeniyle başarısız oldu; 23 suite test başlamadan hata verdi.
- `pnpm exec tsc -p apps/admin-web/tsconfig.json --noEmit` başarıyla çalıştı.
- İlk kod görevi: Veli günlük özetini bağlamak ve günlük akış ekranı testlerini eklemek.

## Oturum Güncelleme Şablonu

Her önemli çalışma sonunda şu alanlar güncellenmeli:

- Tarih:
- Yapılan iş:
- Değiştirilen dosyalar:
- Alınan kararlar:
- Test sonucu:
- Açık sorunlar:
- Sıradaki tek görev:
