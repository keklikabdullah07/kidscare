# Şartname 0052: Uçtan Uca Rol İzolasyonu, Servis Personeli Ayrımı ve PDF Karantinası

## 1. Problem ve Gerekçe
KidsCare platformunda şu anda multi-tenancy (tenant izolasyonu) tam çalışmakta; ancak tenant içerisindeki **rol bazlı veri izolasyonu** (Yetkilendirme ve Kapsam Karantinası - Authorization Scoping) çeşitli API endpoint'lerinde ve frontend bileşenlerinde sızıntılara açıktır:
1. **Öğretmen (`TEACHER`) Sızıntıları:**
   - Öğretmen `GET /attendance` veya `GET /classrooms` çağırdığında okulun tüm sınıflarını ve tüm öğrencilerin yoklama kayıtlarını alabilmektedir.
   - Yoklama ekranındaki MEB Yoklama Çizelgesi PDF modalında öğretmen diğer sınıfları veya "Tüm Sınıflar"ı seçip çıktı alabilmektedir.
   - `assertStudentVisibleToUser` fonksiyonu öğretmenin atanmış sınıfını kontrol etmemektedir; bu nedenle başka sınıftaki bir öğrencinin detaylarına, sağlık veya karne verisine doğrudan ID ile erişebilmektedir.
   - Sınıf filtresi dropdown'larında diğer öğretmenlerin sınıfları listelenmektedir.
2. **Veli (`PARENT`) Sızıntıları:**
   - Veli sadece kendi öğrencisi/öğrencilerini görmelidir. Diğer velilerin isimleri, telefonları, çocukların fotoğrafları, aidat/borç bilgileri veya raporları kesinlikle veliye sızmamalıdır.
   - Veliye özel ekranlarda (Portal, Gelişim, İlaç, Aidat, Teslimat) çocuk seçici (child switcher) yalnızca kendi çocuklarını listelemelidir.
3. **Servis Personeli (`SERVICE_STAFF`) Sızıntıları:**
   - Servis personeli şu anda frontend'de öğretmen yetkisi gibi geniş bir menüye ve sayfalara düşmektedir.
   - Servis görevlisi yalnızca kendi servisine / rotasına atanmış öğrencileri, onların biniş-iniş durumlarını, acil veli irtibatlarını ve servis veli taleplerini görmelidir.
   - Başka bir servisin öğrencilerini, rotasını, kreşin pedagojik karne verilerini, revir kayıtlarını veya aidat bilgilerini ASLA görememelidir.
4. **PDF ve Çıktı Karantinası:**
   - Yazdırma ve PDF oluşturma fonksiyonları (MEB Çizelgesi, Gelişim Kartı, Servis Yolcu Listesi) kullanıcının rol kapsamı dışındaki hiçbir veriyi render etmemeli, modal seçicilerde izin verilmeyen sınıflar/servisler gizlenmelidir.

---

## 2. Kapsam ve Rol Matrisi

| Modül / Ekran | YÖNETİCİ (`ADMIN`/`SUPER_ADMIN`) | ÖĞRETMEN (`TEACHER`) | VELİ (`PARENT`) | SERVİS PERSONELİ (`SERVICE_STAFF`) |
| :--- | :--- | :--- | :--- | :--- |
| **Öğrenciler (`/students`)** | Tüm okul öğrencileri (Tam yetki) | Yalnızca kendi sınıfındaki öğrenciler | ERİŞİM YOK (403) | Yalnızca servise kayıtlı öğrenciler (salt okunur liste) |
| **Sınıflar (`/classrooms`)** | Tüm sınıflar | Yalnızca atandığı sınıflar | ERİŞİM YOK (403) | ERİŞİM YOK (403) |
| **Yoklama & Takip (`/attendance`)** | Tüm okul | Yalnızca kendi sınıfı | ERİŞİM YOK (403) | ERİŞİM YOK (403) |
| **MEB Yoklama PDF Çıktısı** | Tüm sınıflar seçilebilir | SADECE kendi sınıfı | ERİŞİM YOK (403) | ERİŞİM YOK (403) |
| **Günlük Karne (`/tracking`)** | Tüm okul | Yalnızca kendi sınıfı | Sadece kendi çocuğu (Portal'dan) | ERİŞİM YOK (403) |
| **İlaç Takibi (`/medication`)** | Tüm okul | Yalnızca kendi sınıfı | Yalnızca kendi çocuğu | ERİŞİM YOK (403) |
| **Olay/Revir (`/incidents`)** | Tüm okul | Yalnızca kendi sınıfı | Yalnızca kendi çocuğu (bildirildiyse) | ERİŞİM YOK (403) |
| **Gelişim & Portfolyo (`/development`)** | Tüm okul | Yalnızca kendi sınıfı | Yalnızca kendi çocuğu | ERİŞİM YOK (403) |
| **Servis & Teslimat (`/pickup`)** | Tüm servis ve teslimatlar | Kendi sınıfı teslimat onayları | Kendi çocuğu teslim yetkisi | SADECE kendi servis aracı/öğrencileri |
| **Mesajlaşma (`/messages`)** | Tüm veli ve personeller | Kendi sınıf velileri + Yönetim | Çocuğunun öğretmeni + Yönetim | Kendi servis velileri + Yönetim |
| **Veli Talepleri (`/requests`)** | Tüm talepler | Kendi sınıfının talepleri | Kendi açtığı talepler | Servis/ulaşım talepleri |
| **Yemek Menüsü (`/menus`)** | Düzenleme & Görüntüleme | Görüntüleme | Görüntüleme + Çocuğun alerjenleri | ERİŞİM YOK (veya salt okunur liste) |
| **Etkinlikler & Galeri (`/events`, `/gallery`)** | Tam yetki | Kendi sınıfı etkinlikleri | Çocuğunun sınıf etkinlikleri | ERİŞİM YOK (403) |
| **Aidat & Finans (`/finance`)** | Tam yetki (Tüm kurum) | KESİNLİKLE YASAK (403) | SADECE kendi çocuğunun aidatı | KESİNLİKLE YASAK (403) |
| **Ekip & Roller (`/team`)** | Tam yetki | KESİNLİKLE YASAK (403) | KESİNLİKLE YASAK (403) | KESİNLİKLE YASAK (403) |
| **Kurum Ayarları (`/settings`)** | Tam yetki | KESİNLİKLE YASAK (403) | KESİNLİKLE YASAK (403) | KESİNLİKLE YASAK (403) |

---

## 3. Mimari ve Teknik Tasarım

### 3.1. Backend İzolasyon Katmanı (API & Repository)
1. **Genişletilmiş `assertStudentVisibleToUser`:**
   - `studentId`, `role`, `userId`, `tenantId` bağlamında çalışır.
   - `TEACHER`: Öğrencinin `classroomId`'si öğretmenin `ClassroomTeacher` atamaları arasında mı kontrol edilir. Değilse `ForbiddenException(403)`.
   - `PARENT`: Öğrencinin `parentId === userId` mi kontrol edilir. Değilse `ForbiddenException(403)`.
   - `SERVICE_STAFF`: Öğrencinin servis görevlisi bu kullanıcı mı (`passport.serviceStaffId === userId` veya servis ataması) kontrol edilir. Değilse `ForbiddenException(403)`.
2. **Öğretmen Sınıf İzolasyonu (`ClassroomsService` & `AttendanceService`):**
   - `GET /classrooms`: Öğretmen çağırırsa sadece öğretmenin atandığı sınıfları döner. Yönetici çağırırsa tüm sınıfları döner.
   - `GET /attendance`: Öğretmen çağırırsa sadece öğretmenin sınıflarındaki yoklamaları filtreleyip döner.
   - `GET /attendance/range`: Öğretmen için sadece kendi sınıf öğrencilerinin tarih aralığı yoklamaları döner.
3. **Servis Personeli İzolasyonu (`PickupController` & `PickupService`):**
   - Servis personeli `GET /pickup` veya `/students` çağırdığında sadece kendi servisine tanımlı öğrencileri alır.

### 3.2. Frontend ve Navigasyon İzolasyonu
1. **`getNavGroupsForRole` Güncellemesi (`Layout.tsx`):**
   - `SERVICE_STAFF` için özel navigasyon:
     - Günlük Operasyon: `Servis & Teslimat (/pickup)` (Öncelikli ana ekran)
     - İletişim: `Mesajlaşma (/messages)`, `Servis Talepleri (/requests)`
     - Profil: `/profile`
     - KESİNLİKLE gizlenenler: Dashboard, Öğrenciler, Sınıflar, Yoklama, Günlük Takip, İlaç, Olaylar, Portfolyo, Finans, Ekip, Ayarlar.
2. **`AttendancePage.tsx` ve MEB PDF Modal Karantinası:**
   - Öğretmen giriş yaptığında `selectedClassroomId` yalnızca öğretmenin atandığı sınıf(lar)dan ilki olur.
   - Sınıf dropdown seçicisinde "Tüm Sınıflar" veya diğer sınıflar YER ALMAZ (sadece öğretmenin kendi sınıfları listelenir).
   - MEB Yoklama Çizelgesi Modalında (`AttendanceSheetPrint.tsx`):
     - Öğretmen için sınıf seçici kilitlidir / sadece kendi sınıflarını listeler.
     - "Tüm Sınıflar" seçeneği öğretmen için devre dışıdır.
     - Başka bir sınıfın çizelgesi asla render edilemez ve yazdırılamaz.
3. **`StudentsPage.tsx` İzolasyonu:**
   - Öğretmen sadece kendi sınıfındaki öğrencileri görür; sınıf kartlarında sadece kendi sınıfları yer alır.
   - Servis görevlisi bu sayfaya girerse yönlendirilir veya yalnızca servis listesi görünür.

---

## 4. Test ve Doğrulama Kriterleri (Acceptance Criteria)
1. **Öğretmen Testi:**
   - `teacher@demo.test` ile giriş yapıldığında Yoklama, Öğrenciler ve MEB Yazdırma modallarında sadece Zeynep Demir'in sınıfı ("Minik Yıldızlar") görünmeli.
   - Diğer 9 sınıfın öğrencileri, yoklama kayıtları veya MEB çizelgeleri seçilememeli ve listelenmemeli.
   - `teacher@demo.test` doğrudan API üzerinden başka sınıfın öğrencisini (`GET /students/:foreignStudentId`) isterse `403 Forbidden` almalı.
2. **Veli Testi:**
   - `parent@demo.test` ile giriş yapıldığında Veli Portalı'nda sadece Ada Yılmaz görünmeli.
   - Başka bir velinin çocuğunun verisi asla API'den veya arayüzden sızmamalı.
   - Finans sayfasında sadece Ada Yılmaz'ın faturaları ve ödeme geçmişi görünmeli.
3. **Servis Personeli Testi:**
   - `service@demo.test` ile giriş yapıldığında sol menüde sadece "Servis & Teslimat", "Mesajlaşma" ve "Talepler" görünmeli.
   - Teslimat listesinde sadece servisine kayıtlı öğrenciler çıkmalı.
   - Finans, revir, pedagojik karne menüleri görünmemeli, doğrudan URL girilirse `RoleGuard` veya 403 ile engellenmeli.
4. **Yönetici Testi:**
   - `admin@demo.test` ve `superadmin@demo.test` tüm sınıfları, tüm servisleri ve tüm finansal verileri filtreleyip raporlayabilmeli.
5. **Otomasyon Testleri:**
   - Tüm yeni kural ve izin kontrolleri için unit/integration testleri yazılmalı.
   - `./scripts/check.ps1` %100 yeşil çıktıyla tamamlanmalıdır.
