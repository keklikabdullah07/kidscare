# KidsCare Uygulama Geliştirme Planı

## 1. Planın Amacı

Bu plan, `market-research-and-differentiation.md` içindeki ürün hipotezlerini mevcut KidsCare kod tabanına güvenli ve ölçülebilir biçimde uygulamak için hazırlanmıştır.

Ana hedef:

> Öğretmenin daha az veri girdiği, velinin daha anlamlı bilgi aldığı, adminin sorunları daha erken gördüğü web tabanlı kreş platformu.

## 2. Mevcut Kod Durumu

Mevcut projede temel yapıların önemli bölümü bulunuyor:

- NestJS API
- React + Vite admin web paneli
- Prisma + PostgreSQL
- Multi-tenancy altyapısı
- Auth ve rol bazlı erişim
- `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT` rolleri
- Öğrenci yönetimi
- Yoklama
- Günlük rapor
- Yemek menüsü
- Etkinlik galerisi
- Veli portalı
- Ekip/kullanıcı yönetimi
- Paylaşılan tip ve Zod şema paketleri

Mevcut Prisma modeli içinde günlük raporda yemek, uyku, tuvalet, etkinlik, ilaç ve öğretmen notu için JSON alanları bulunuyor. Bu yapı MVP için hızlı ilerlemeyi sağlar; güvenlik ve raporlama açısından kritik veriler büyüdükçe ayrı modellere taşınmalıdır.

## 3. Mimari Kurallar

Tüm fazlarda şu kurallar korunacak:

- Yalnızca web paneli ve backend geliştirilecek.
- `apps/mobile` değiştirilmeyecek ve test edilmeyecek.
- Tenant kapsamındaki her sorgu `withTenant` veya `runWithTenant` üzerinden çalışacak.
- Tenant-scoped endpoint'lerde `TenantGuard` kullanılacak.
- Controller içinde doğrudan Prisma sorgusu yazılmayacak.
- Repository katmanı kullanılacak.
- Controller, service, guard, middleware ve repository constructor bağımlılıklarında açık `@Inject(...)` kullanılacak.
- DTO ve modeller `shared-types` ile `shared-schemas` içinde tutulacak.
- `any` kullanılmayacak.
- Kullanıcıların mevcut değişiklikleri ezilmeyecek.

## 4. Uygulama Stratejisi

Özellikleri modül modül değil, kullanıcı akışı olarak geliştireceğiz.

### Öncelik sırası

1. Öğretmenin günlük işi
2. Velinin günlük bilgi ihtiyacı
3. Çocuk güvenliği
4. Adminin erken uyarı ihtiyacı
5. Gelişim hikâyesi
6. İleri otomasyon

Her faz şu döngüyle tamamlanacak:

1. Veri modeli ve API sözleşmesi
2. Repository ve service
3. Controller ve erişim kuralları
4. Web ekranı
5. Rol bazlı kullanım
6. Unit/integration testi
7. Gerçek kullanıcı senaryosu doğrulaması

## 5. Faz 0 — Güvenli Başlangıç ve Teknik Temel

### Amaç

Mevcut değişiklikleri korumak, çalışan özellikleri ölçmek ve yeni geliştirmeler için güvenli taban oluşturmak.

### Görevler

- Mevcut git değişikliklerini sınıflandırmak.
- API, admin web ve paylaşılan paketlerin mevcut testlerini çalıştırmak.
- Prisma migration ve seed akışını doğrulamak.
- Rol bazlı erişim matrisi çıkarmak.
- Tenant izolasyonu için kritik endpoint testlerini tamamlamak.
- Mevcut sayfalarda API hata, boş durum ve loading davranışlarını standardize etmek.
- Günlük akış için ortak tarih ve gün formatı yardımcılarını belirlemek.

### Çıkış kriterleri

- Mevcut testler biliniyor ve başlangıç sonucu kayıtlı.
- Demo kullanıcılarıyla dört rolün giriş akışı çalışıyor.
- Her rol yalnızca yetkili ekran ve verileri görüyor.
- Tenant dışı veri erişimini test eden senaryolar bulunuyor.
- Yeni migration çalıştırılabilir durumda.

## 6. Faz 1 — Günlük Akış MVP'si

### Amaç

Öğretmenin bir sınıfın günlük bakım kayıtlarını minimum dokunuşla tamamlaması ve velinin aynı gün anlamlı özet görmesi.

### 6.1. Gerekli veri modeli

Mevcut modelde bulunmayan veya güçlendirilmesi gereken yapılar:

- `Classroom`
  - tenant
  - ad
  - yaş grubu
  - aktiflik
- `ClassroomTeacher`
  - sınıf
  - öğretmen
  - görev başlangıç/bitiş tarihi
- Öğrenci-sınıf üyeliği
  - mevcut `Student` modeline doğrudan sınıf ilişkisi veya tarihçeli üyelik modeli
- Günlük kayıt durumları için ortak sabitler ve şemalar
- Günlük raporun kim tarafından son güncellendiği

Not: Öğrenciye yalnızca `classroom` string alanı eklemek kısa vadede kolay görünür; ancak öğretmen ataması, geçmiş sınıf bilgisi ve tenant güvenliği için ilişkisel model daha doğru çözümdür.

### 6.2. Öğretmen deneyimi

Yeni veya yenilenecek ekran:

- “Bugün” / “Sınıf Günlüğü” ekranı
- Sınıf seçimi
- Öğrenci listesi
- Tek dokunuşla yoklama
- Toplu yemek durumu
- Toplu uyku durumu
- Etkinlik seçimi
- Yalnızca farklı durumdaki çocuk için özel not
- Eksik kayıt göstergesi
- Gün sonunda sınıf tamamlanma özeti

### 6.3. Veli deneyimi

Veli portalında:

- Çocuğun bugünkü durumu
- Giriş ve çıkış bilgisi
- Yemek özeti
- Uyku özeti
- Etkinlikler
- Öğretmen notu
- Eksik kayıt varsa açık ve sakin durum mesajı

Otomatik günlük özet, yalnızca kaydedilmiş verileri birleştirmeli; kayıt olmayan bilgiyi tahmin etmemeli.

### 6.4. API ve testler

- Günlük sınıf görünümü endpoint'i
- Sınıf günlük kaydı toplu güncelleme endpoint'i
- Öğretmenin yalnızca atanmış sınıfları güncelleyebilmesi
- Velinin yalnızca kendi çocuğunu görebilmesi
- Adminin tenant içindeki tüm sınıfları görebilmesi
- Aynı gün tekrar kaydında idempotent upsert davranışı
- Eksik ve geçersiz değerler için Zod doğrulaması

### Çıkış kriterleri

- Öğretmen temel günlük kaydı tek akıştan tamamlayabiliyor.
- Veli aynı gün çocuk özetini görebiliyor.
- Aynı kayıt tekrar gönderildiğinde duplicate oluşmuyor.
- Öğretmen başka sınıf veya tenant verisine erişemiyor.
- API ve web testleri geçiyor.

## 7. Faz 2 — Güven Merkezi ve Sorun Çözme İletişimi

### Amaç

Teslim, ilaç, alerji, olay ve kritik iletişim kayıtlarını güvenli ve denetlenebilir hale getirmek.

### 7.1. Güvenlik veri modeli

Ayrı ve denetlenebilir modeller önerilir:

- `PickupContact`
  - öğrenci
  - ad-soyad
  - yakınlık
  - telefon
  - kimlik doğrulama bilgisi
  - aktiflik
- `PickupAuthorization`
  - veli talebi
  - admin onayı
  - geçerlilik aralığı
  - audit bilgisi
- `PickupEvent`
  - öğrenci
  - teslim alan kişi
  - teslim saati
  - teslimi yapan kullanıcı
  - doğrulama yöntemi
- `MedicationRecord`
  - öğrenci
  - ilaç bilgisi
  - doz talimatı
  - veli onayı
  - uygulama zamanı
  - uygulayan kullanıcı
- `IncidentRecord`
  - öğrenci
  - olay zamanı
  - kategori
  - açıklama
  - alınan aksiyon
  - veli bilgilendirme durumu
- Alerji ve acil durum bilgileri için kontrollü öğrenci profili alanları

Sağlık ve güvenlik verileri JSON içinde tutulmamalı; sorgulanabilir, erişimi sınırlı ve audit edilebilir modeller kullanılmalı.

### 7.2. İletişim veri modeli

- `Conversation`
- `Message`
- `MessageCategory`
- `MessageReadReceipt`
- `ParentRequest`

Mesaj kategorileri:

- Acil
- Sağlık
- İzin
- Teslim
- Günlük bilgi
- Duyuru
- Ödeme
- Randevu

### 7.3. Erişim kuralları

- Öğretmen kendi sınıfıyla ilgili kayıtları görebilir.
- Veli yalnızca kendi çocuğuyla ilgili kayıtları görebilir.
- Admin tenant içindeki kayıtları görebilir.
- Kritik sağlık ve olay kayıtları rol bazlı filtrelenir.
- Kritik mesajlarda okundu ve onaylandı durumları ayrılır.
- Değişiklik geçmişi tutulur.

### Çıkış kriterleri

- Yetkili kişi değişikliği onay akışından geçiyor.
- Teslim olayı saat, kişi ve görevli bilgisiyle kaydediliyor.
- İlaç uygulaması onaysız yapılamıyor.
- Olay kaydı veli bilgilendirme durumunu gösteriyor.
- Kritik mesajların okunma durumu takip ediliyor.

## 8. Faz 3 — Gelişim Hikâyesi ve Portfolyo

### Amaç

Gelişim raporunu yalnızca puan olmaktan çıkarıp gözlem, etkinlik ve zaman içindeki ilerlemeyle ilişkilendirmek.

### Veri modeli

- `DevelopmentDomain`
  - dil
  - motor
  - sosyal-duygusal
  - bilişsel
  - öz bakım
  - sanat
- `DevelopmentObservation`
  - öğrenci
  - öğretmen
  - alan
  - beceri
  - gözlem
  - gözlem tarihi
  - görünürlük durumu
- `PortfolioItem`
  - gözlem
  - etkinlik
  - medya veya çalışma örneği
  - veli görünürlüğü
- `HomeActivitySuggestion`
  - gelişim alanı
  - yaş grubu
  - kısa ev etkinliği

### Öğretmen akışı

1. Etkinlik seçilir.
2. Gözlenen beceri seçilir.
3. Kısa gözlem notu girilir.
4. İstenirse fotoğraf veya çalışma örneği bağlanır.
5. Sistem dönemsel taslak oluşturur.

### Veli akışı

- Zaman çizelgesi
- Gelişim alanları
- Somut gözlem örnekleri
- Güçlü yönler
- Destek önerileri
- Önceki dönemle karşılaştırma

### Çıkış kriterleri

- Öğretmen uzun raporu sıfırdan yazmıyor.
- Veli puan dışında somut örnek görebiliyor.
- Gelişim verisi öğretmenin kaydına dayanıyor.
- Hassas değerlendirmeler yetkili kullanıcılarla sınırlı kalıyor.

## 9. Faz 4 — Admin Erken Uyarı Merkezi

### Amaç

Adminin sorunları veli şikâyeti veya ay sonu raporu beklemeden görmesini sağlamak.

### İlk uyarı kuralları

- Yoklaması tamamlanmayan sınıf
- Üst üste devamsızlık
- Eksik günlük rapor
- Yanıt bekleyen kritik mesaj
- Bekleyen ilaç kaydı
- Süresi dolan teslim yetkisi
- Açık olay kaydı
- Dengesiz öğretmen/sınıf yükü
- Geciken ödeme veya eksik evrak

### Dashboard katmanları

1. **Şimdi müdahale et:** Kritik sağlık, teslim ve güvenlik durumu.
2. **Bugün tamamla:** Eksik yoklama, rapor ve yanıtlar.
3. **Trendleri izle:** Devamsızlık, personel yükü, ödeme ve veli geri bildirimi.

### Tasarım ilkesi

Uyarı sayısı mümkün olduğunca az ve anlamlı olmalı. Her uyarı şu bilgileri içermeli:

- Sorun ne?
- Ne zamandır bekliyor?
- Kim ilgilenmeli?
- Önerilen aksiyon ne?
- Çözüldüğünde nasıl kapatılacak?

## 10. Faz 5 — İleri Otomasyon

Bu faz, temel akışlar gerçek kullanıcılarla doğrulandıktan sonra başlayacak.

- Sesli nottan düzenlenebilir taslak
- Otomatik günlük/haftalık özet
- Personel yük tahmini
- Devam tahmini
- Çoklu şube karşılaştırması
- Veli geri bildirim analizi

### Yapay zekâ sınırları

- Tanı koymayacak.
- Öğretmen gözlemi yerine geçmeyecek.
- Kayıt bulunmayan bilgiyi üretmeyecek.
- Sağlık ve güvenlik kararını otomatik vermeyecek.
- Üretilen metin yayınlanmadan önce yetkili kullanıcı tarafından onaylanacak.

## 11. Önceliklendirilmiş Backlog

### P0 — İlk uygulanacaklar

- [ ] Mevcut test ve build taban çizgisini almak
- [ ] Sınıf modelini ve öğretmen atamasını tasarlamak
- [ ] Öğrenci-sınıf ilişkisini netleştirmek
- [ ] Ortak günlük akış API'si
- [ ] Öğretmen “Bugün” ekranı
- [ ] Toplu yoklama/yemek/uyku kaydı
- [ ] Veli günlük özet ekranı
- [ ] Rol ve tenant izolasyon testleri

### P1 — Güven ve iletişim

- [ ] Yetkili teslim kişileri
- [ ] Teslim olayları
- [ ] Alerji ve acil durum kartı
- [ ] İlaç kayıtları
- [ ] Olay kayıtları
- [ ] Kategorili mesajlaşma
- [ ] Okundu/onaylandı takibi

### P2 — Gelişim

- [x] Gelişim alanları
- [x] Gözlem kayıtları
- [x] Portfolyo
- [x] Veli gelişim görünümü
- [x] Ev etkinliği önerileri

### P3 — Yönetim zekâsı

- [x] Erken uyarı kuralları
- [x] Admin görev listesi (Eylem Merkezi)
- [ ] Personel yük görünümü
- [ ] Trend raporları
- [ ] Veli geri bildirim analizi

### P4 — İleri otomasyon

- [ ] Sesli not
- [ ] Otomatik rapor
- [ ] Tahminleme
- [ ] Çoklu şube analizleri

## 12. Her Özellik İçin Kabul Kriteri Şablonu

Her backlog maddesi geliştirilmeden önce şu sorular cevaplanmalı:

1. Hangi rol kullanıyor?
2. Hangi gerçek sorunu çözüyor?
3. Kullanıcı kaç adımda tamamlıyor?
4. Hangi veriyi oluşturuyor?
5. Bu veri kim tarafından görülebiliyor?
6. Tenant izolasyonu nasıl korunuyor?
7. Hata veya eksik veri nasıl gösteriliyor?
8. Audit kaydı gerekiyor mu?
9. API testi var mı?
10. Web ekranı testi var mı?
11. Kullanıcı açısından başarı nasıl ölçülüyor?

## 13. İlk Sprint Önerisi

İlk sprintte tüm ürünü geliştirmek yerine günlük akışın temelini tamamlamak en doğru adımdır.

### Sprint hedefi

Öğretmen, atanmış sınıfındaki çocuklar için tek ekrandan günlük yoklama ve temel bakım kayıtlarını girebilsin; veli kendi çocuğunun gününü görebilsin.

### Sprint görevleri

1. Mevcut `Student`, `Attendance` ve `DailyReport` akışını incelemek.
2. Sınıf/öğretmen ilişkisi için veri modeli kararı vermek.
3. Shared type ve Zod şemalarını tanımlamak.
4. Repository ve service katmanını oluşturmak.
5. Teacher yetki filtresini eklemek.
6. Günlük sınıf endpoint'ini yazmak.
7. Öğretmen günlük akış ekranını yapmak.
8. Veli günlük görünümünü bağlamak.
9. API ve component testlerini eklemek.
10. Demo seed verisini güncellemek.

### Sprint tamamlanmış sayılır, eğer:

- Teacher yalnızca atanmış sınıfını görür.
- Teacher günlük kayıtları tek akıştan kaydeder.
- Parent yalnızca kendi çocuğunu görür.
- Admin günlük tamamlanma durumunu görebilir.
- Aynı gün tekrar kayıt duplicate oluşturmaz.
- Tenant dışı veri erişimi testle engellenmiştir.

## 14. Doğrulama ve Başarı Metrikleri

İlk gerçek kullanıcı görüşmelerinden önce ve sonra şu metrikler ölçülebilir:

- Günlük kayıt tamamlama süresi
- Bir günlük kayıt için tıklama sayısı
- Eksik kayıt oranı
- Gün sonunda tamamlanan kayıt oranı
- Veli tarafından tekrarlanan bilgi soruları
- Kritik mesajların okunma süresi
- Teslim kaydı tamamlama süresi
- Öğretmen haftalık memnuniyet puanı
- Adminin sorun fark etme süresi

Öncelikli ürün hedefi:

> Öğretmenin günlük temel kaydını daha kısa sürede, daha az bölünmeyle ve daha az tekrar ile tamamlaması.

## 15. Uygulama Sırası Özeti

```text
Faz 0: Teknik taban ve mevcut sistem doğrulama
    ↓
Faz 1: Öğretmen günlük akışı + veli günlük özeti
    ↓
Faz 2: Teslim, sağlık, olay ve iletişim güvenliği
    ↓
Faz 3: Gelişim hikâyesi ve portfolyo
    ↓
Faz 4: Admin erken uyarı merkezi
    ↓
Faz 5: İleri otomasyon ve tahminleme
```

İlk gerçek geliştirme hedefi Faz 1'dir. Diğer fazlar, günlük akışın kullanıcılar tarafından gerçekten kullanıldığı doğrulandıktan sonra genişletilmelidir.
