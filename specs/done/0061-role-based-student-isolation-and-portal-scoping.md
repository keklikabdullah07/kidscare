# Spec 0061 — Rol Bazlı Öğrenci & Veri İzolasyonu ve Portal Kapsamı Standartlaştırması

- Status: Done
- Mode: lite
- Plan: `specs/plans/0061-plan.md`

## Intent

KidsCare okul öncesi kreş yönetim sisteminde KVKK, MEB Özel Öğretim Kurumları Yönetmeliği ve çocuk güvenliği/mahremiyeti esastır. Sistemde hiçbir koşulda bir veli (PARENT) veya sınıf öğretmeni (TEACHER) kreşin tüm öğrencilerini göremez, filtreleyemez veya erişemez.

- **SUPER_ADMIN & ADMIN:** Tüm kreş genelindeki tüm sınıfları, tüm öğrencileri ve istatistikleri görebilir, yönetebilir.
- **TEACHER (Öğretmen):** Yalnızca atandığı / sorumlu olduğu sınıf(lar)ın öğrencilerini görebilir. Sınıf filtresinde kreşin diğer sınıfları listelenemez; tek sınıfı varsa doğrudan o sınıfa kilitlenir. Öğrenci filtrelerinde başka sınıfların öğrencileri asla yer alamaz ("Tüm Öğrenciler" seçeneği kreş geneli değil, sadece öğretmenin sınıfındaki tüm öğrencileri ifade eder).
- **PARENT (Veli):** Yalnızca kendi linked çocuk/çocuklarını görebilir (`student.parentId === user.id` veya `secondaryParentId === user.id`). Veli ekranlarında "Sınıf" seçici dropdown'ı bulunamaz. Öğrenci seçicide "Tüm Öğrenciler" seçeneği KESİNLİKLE YASAKTIR; velinin 1 çocuğu varsa doğrudan o çocuk kilitlidir (dropdown gösterilmez veya kilitli rozet sunulur), birden fazla çocuğu varsa sadece kendi çocukları arasında geçiş yapılır. Başka bir öğrencinin varlığı, adı, sağlık bilgisi, alerjisi, ilacı, karnesi veya fotoğrafı veliye asla sızdırılamaz.

Bu şartname, `/development` ekranındaki hatayı (`SINIF: Tüm Sınıflar, ÖĞRENCİ: Tüm Öğrenciler (0)`) düzeltmekle kalmayıp, sistemdeki tüm 20 menü ve API uç noktasında katı rol bazlı veri izolasyonunu standartlaştırır ve otomatik testlerle güvenceye alır.

## Requirements

### 1. Backend Güvenlik & İzolasyon Katmanı

1. **`GET /students` Endpoint'i (Parent Scoping):**
   - `@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'SERVICE_STAFF')` olarak güncellenir.
   - `StudentsService.findAll`: Kullanıcı `PARENT` rolündeyse, tüm öğrenciler yerine doğrudan velinin kendi çocukları (`this.findByParent(tenantId, user.userId)`) döner.
   - Kullanıcı `TEACHER` rolündeyse, yalnızca öğretmenin atandığı sınıflardaki öğrenciler döner.
   - Böylece frontend'de `listStudents()` çağrısı yapan tüm ortak sayfalarda veli 403 hatası almaz; doğrudan ve sadece kendi çocuklarına ait güvenli listeye ulaşır.
2. **`GET /classrooms` Endpoint'i:**
   - Öğretmen için yalnızca öğretmenin sorumlu olduğu sınıflar döner.
   - Veli için çocuğunun/çocuklarının kayıtlı olduğu sınıflar döner veya sınıf bilgisi çocuk üzerinden çekilir.
3. **`DevelopmentController`, `MedicationController`, `IncidentsController`, `DailyMenuController`:**
   - Backend servislerinde `getScopedStudentIdsForUser` kontrolü eksiksiz işletilir; veli veya öğretmen parametre olarak başka öğrencinin ID'sini gönderse dahi `403 Forbidden` veya boş liste döner.

### 2. Frontend Konsolide Rol İzolasyonu (`useStudentScope` Hook'u)

Tüm sayfalarda tekrarlanan ve hata üreten manuel kontroller yerine merkezi bir `useStudentScope` hook'u oluşturulur:

- **Dönen Değerler:**
  - `role`: Kullanıcının rolü (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`, `SERVICE_STAFF`).
  - `isStaff`, `isTeacher`, `isParent`.
  - `availableClassrooms`: Kullanıcının yetkili olduğu sınıflar (Admin: hepsi, Öğretmen: sadece kendi sınıfları, Veli: boş veya çocuğunun sınıfı).
  - `availableStudents`: Kullanıcının yetkili olduğu öğrenciler (Admin: hepsi, Öğretmen: kendi sınıfı, Veli: sadece kendi çocukları).
  - `selectedClassroomId`, `setSelectedClassroomId`: Seçili sınıf (Öğretmenin 1 sınıfı varsa otomatik seçili).
  - `selectedStudentId`, `setSelectedStudentId`: Seçili öğrenci (Velinin 1 çocuğu varsa doğrudan kilitli/seçili, "Tüm Öğrenciler" seçeneği velide kapalı).
  - `showClassroomFilter`: Boolean (Veli için `false`).
  - `showStudentFilter`: Boolean (Velinin 1 çocuğu varsa `false` - doğrudan çocuk başlığı gösterilir, 2+ çocuğu varsa `true`).

### 3. Ekran Bazlı Katı İzolasyon Kuralları

1. **Gelişim Hikayesi & Portfolyo (`/development`):**
   - Veli rolünde: "Sınıf" dropdown'ı KESİNLİKLE kaldırılır. Öğrenci dropdown'ında "Tüm Öğrenciler" seçeneği yer alamaz; doğrudan velinin çocuğu seçilidir. Yalnızca `isParentVisible: true` olan kayıtlar listelenir. "Gözlem Ekle", "Çalışma Ekle" butonları velide görünmez.
   - Öğretmen rolünde: Sınıf filtresi sadece öğretmenin sınıflarını listeler; tek sınıfı varsa kilitlidir. Öğrenci filtresinde sadece o sınıfın öğrencileri listelenir.
   - Admin rolünde: Tüm kreş, tüm sınıflar ve tüm öğrenciler seçilebilir.
2. **İlaç Takibi (`/medication`):**
   - Veli rolünde: Sadece kendi çocuğunun ilaç kayıtları listelenir. Yeni ilaç talebi modalında öğrenci seçicide sadece velinin çocukları yer alır. Başka çocukların sağlık ve ilaç kayıtları asla görünmez.
   - Öğretmen rolünde: Sadece kendi sınıfındaki öğrencilerin ilaçları listelenir ve doz veriliş kaydı girilebilir.
3. **Yemek Listesi & Alerjen Denetimi (`/menus`):**
   - Veli rolünde: Alerjen uyarıları bölümünde yalnızca velinin kendi çocuğuna ait alerji eşleşmesi gösterilir; başka öğrencilerin adı ve alerjen bilgisi KESİNLİKLE filtrelenir. Çocuğun alerjeni yoksa "Çocuğunuz için bugün menüde riskli bir alerjen bulunmamaktadır" mesajı verilir.
   - Öğretmen rolünde: Yalnızca kendi sınıfındaki öğrencilerin alerjen uyarıları gösterilir.
4. **Etkinlik Galerisi (`/gallery`):**
   - Veli rolünde: Sadece çocuğunun sınıfına ait fotoğraflar ve okul geneli (`Tüm Kreş`) fotoğraflar listelenir. Diğer sınıfların albümleri veliye gösterilmez.
   - Öğretmen rolünde: Kendi sınıfının fotoğrafları listelenir ve varsayılan sınıf olarak seçilir.
5. **Dış Geziler & Etkinlik İzinleri (`/events`):**
   - Veli rolünde: Sadece kendi çocuğuna ait gezi onay/izin kartları gösterilir. Tüm kreşin katılım kütüğü (roster) veliye gizlidir.
   - Öğretmen rolünde: Kendi sınıfındaki öğrencilerin katılım ve izin listesi görünür.
6. **Teslimat Kontrolü (`/pickup`):**
   - Veli rolünde: Sadece kendi çocuğuna ait teslimat yetkilileri ve teslim geçmişi gösterilir.
   - Öğretmen rolünde: Kendi sınıfının öğrencileri ve teslimat akışı listelenir.
7. **Mesajlaşma & Veli Talepleri (`/messages` & `/requests`):**
   - Veli rolünde: Sadece kendi çocuğuyla ilişkili sınıf öğretmeni ve idare ile yazışabilir.
   - Öğretmen rolünde: Sadece kendi sınıfındaki velilerle iletişim kurabilir.
8. **Öğrenci Listesi, Yoklama, Günlük Takip, Olay/Revir (`/students`, `/attendance`, `/tracking`, `/incidents`):**
   - Veli rolünde: Bu sayfalar RoleGuard ile engellidir (erişilirse `/portal`'a yönlendirilir).
   - Öğretmen rolünde: Bu sayfaların tamamında sınıf ve öğrenci seçicileri yalnızca öğretmenin sorumlu olduğu sınıfa kilitlidir. "Tüm Sınıflar" seçeneği kaldırılarak başka sınıfa müdahale engellenir.
9. **Ana Panel (`/dashboard`):**
   - Öğretmen için KPI sayaçları (mevcut, devamsız, revir, veli talebi) kreş geneli değil, yalnızca öğretmenin sınıfı bazında toplanır.

## Acceptance Criteria

- [x] AC-1: `GET /students` endpoint'i PARENT rolüyle çağrıldığında 200 döner ve yalnızca o velinin kendi çocuklarını (`student.parentId === user.id` veya `secondaryParentId === user.id`) içerir.
- [x] AC-2: `DevelopmentPage` açıldığında PARENT rolünde "Sınıf" dropdown'ı render edilmez; öğrenci filtresinde "Tüm Öğrenciler" seçeneği bulunmaz, velinin çocuğu doğrudan seçilidir ve diğer öğrencilerin verileri görünmez.
- [x] AC-3: `DevelopmentPage` açıldığında TEACHER rolünde sınıf filtresi yalnızca öğretmenin atandığı sınıfları listeler; "Tüm Sınıflar" (kreş geneli) seçeneği yer almaz; tek sınıflı öğretmende sınıf otomatik kilitlidir.
- [x] AC-4: `MedicationPage` üzerinde PARENT rolü yalnızca kendi çocuğuna ait ilaç kayıtlarını görür ve yeni talep açarken yalnızca kendi çocuğunu seçebilir.
- [x] AC-5: `DailyMenuPage` üzerinde Alerjen Denetimi sekmesinde PARENT rolü yalnızca kendi çocuğuna ait alerji uyarısını görür; diğer çocukların adı ve alerjenleri görünmez.
- [x] AC-6: `ActivityGalleryPage` üzerinde PARENT rolünde sınıf filtresi diğer sınıfları listelemez; yalnızca kendi çocuğunun sınıfı ve okul geneli fotoğraflar listelenir.
- [x] AC-7: `EventsPage`, `MessagesPage` ve `ParentRequestsPage` üzerinde veli ve öğretmen izolasyon kuralları tam işletilir.
- [x] AC-8: Staff-only sayfalara (`/students`, `/attendance`, `/tracking`, `/incidents`) PARENT girdiğinde yetkisiz erişim engellenir; TEACHER girdiğinde veriler sadece öğretmenin sınıfına filtrelenir.
- [x] AC-9: Tüm roller (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`) için birim ve entegrasyon testleri yazılır ve `./scripts/check.ps1` %100 yeşil geçer.

## Definition of Done

- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check.ps1` green (%100 Başarılı)
- [x] Independent review done; real findings fixed
- [x] Spec moved to `specs/done/`
