# Şartname 0055: Toplu Duyuru & Acil Push Bildirim Gönderim Merkezi (/broadcast)

## 1. Amaç ve Kapsam

KidsCare anaokulu/kreş yönetiminde, okul idaresinin (Müdür/Admin) ve sınıf öğretmenlerinin velilere veya personele acil, önemli ya da genel konularda (hava muhalefeti, servis rötarları, kıyafet/etkinlik hatırlatmaları, toplantı çağrıları vb.) tek tıkla toplu duyuru ve anlık mobil push bildirimi gönderebilmesini sağlayan merkezi duyuru yönetim sistemidir.

Bu modül; hedef kitle filtrelemesi (tüm kreş, sınıf bazlı, seçili veliler, personel), aciliyet seviyeleri (Normal, Önemli, Acil), hazır kreş operasyon şablonları, canlı telefon önizlemesi ve gönderim geçmişi (iletim raporu) sunar.

---

## 2. Roller ve Yetki Matrisi

| Rol                     | Yetki Kapsamı                                                                                                                                                                        |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SUPER_ADMIN / ADMIN** | Tüm kreşe (`ALL_DAYCARE`), herhangi bir sınıfa (`CLASSROOM`), seçili velilere (`SPECIFIC_STUDENTS`) veya personele (`TEACHERS_ONLY`) duyuru gönderebilir; tüm geçmişi inceleyebilir. |
| **TEACHER**             | Yalnızca kendi atandığı sınıflara veya bu sınıflardaki öğrencilerin velilerine sınıf içi duyuru gönderebilir.                                                                        |
| **PARENT**              | Gönderim yetkisi yoktur. Gelen duyuruları bildirim çanından, e-posta/push ile mobil cihazından ve veli portalından görüntüler.                                                       |

---

## 3. Fonksiyonel Gereksinimler

### 3.1. Hedef Kitle Seçimi (Target Audience)

- **Tüm Kreş (`ALL_DAYCARE`):** Kreşteki tüm kayıtlı aktif öğrencilerin velilerine ve personeline gider.
- **Sınıf Bazlı (`CLASSROOM`):** Seçilen sınıfa kayıtlı öğrencilerin velilerine gider. (Öğretmen yalnızca sorumlu olduğu sınıfları seçebilir).
- **Seçili Öğrenci Velileri (`SPECIFIC_STUDENTS`):** Çoklu öğrenci seçimi ile hedeflenen velilere özel duyuru.
- **Yalnızca Personel / Öğretmenler (`TEACHERS_ONLY`):** Okul içi öğretmen ve çalışan ekibine özel iç duyuru.

### 3.2. Aciliyet ve Öncelik Seviyeleri (Priority)

- **NORMAL:** Standart yeşil dokunsal rozet. Genel bilgilendirmeler, haftalık bültenler.
- **IMPORTANT:** Kehribar dokunsal rozet. Veli izinleri, ödeme hatırlatmaları, toplantılar.
- **URGENT:** Kırmızı dokunsal rozet + çan efekti. Servis arızası, yoğun kar yağışı/erken tatil, anlık tahliye veya sağlık uyarısı.

### 3.3. Hazır Kreş Şablonları (One-Click Templates)

İdarecilerin ve öğretmenlerin acil anlarda hızlıca doldurabilmesi için hazır şablonlar:

1. ❄️ **Hava Muhalefeti / Erken Kapanış:** Valilik/kaymakamlık kararıyla erken okul kapanışı ve servis hareket saati.
2. 🚌 **Servis Rötarı / Güzergah Değişikliği:** Trafik veya araç arızası kaynaklı 15-20 dakikalık gecikme bildirimi.
3. 🎭 **Etkinlik & Kostüm / Malzeme:** Yarınki etkinlik için getirilmesi gereken eşyalar veya giyilecek renk.
4. 🩺 **Mevsimsel Sağlık / Salgın Uyarısı:** Sınıfta görülen grip/suçiçeği vakaları ve veli kontrol ricası.
5. 📌 **Genel Veli Toplantısı:** Tarih, saat ve gündem maddeleriyle toplantı çağrısı.

### 3.4. Canlı Mobil Ekran Önizlemesi (Live Push Preview)

Gönderen yönetici başlığı ve mesajı yazarken, sağ tarafta dokunsal bir akıllı telefon çerçevesinde bildirimin velinin kilit ekranında ve bildirim çubuğunda tam olarak nasıl görüneceğini gerçek zamanlı simüle eder.

### 3.5. İletim Motoru ve Arka Plan İşlemleri

- Gönderilen her yayın için `BroadcastLog` tablosuna kayıt oluşturulur.
- Hedeflenen her kullanıcı için `Notification` tablosuna `ANNOUNCEMENT` tipiyle persistent kayıt yazılır.
- Varsa kullanıcının kayıtlı `UserPushToken` cihazlarına `ExpoPushService` üzerinden push bildirimi fırlatılır.
- Ulaşılan toplam alıcı ve iletilen push sayısı logda saklanır.

---

## 4. Teknik & Mimari Detaylar

- **Shared Types (`packages/shared-types`):** `BroadcastLog`, `BroadcastTargetType`, `BroadcastPriority`, `CreateBroadcastDto`.
- **Backend API (`apps/api/src/modules/notifications`):**
  - `POST /notifications/broadcast`: Yetkilendirilmiş toplu duyuru gönderim uç noktası.
  - `GET /notifications/broadcast/history`: Geçmiş gönderim listesi ve istatistikler.
  - `GET /notifications/broadcast/stats`: KPI özetleri (toplam, bu ay, acil bildirim, ulaşılan veli).
- **Web Paneli (`apps/admin-web`):**
  - `src/features/broadcast/BroadcastPage.tsx` sayfası.
  - `Layout.tsx` sol menüsüne "Duyuru & Bildirim" bağlantısı.
  - `vite.config.ts` ve API istemcisi entegrasyonu.

---

## 5. Doğrulama ve Kalite Kapısı

- Birim testleri (`BroadcastPage.test.tsx` ve backend servis testleri).
- `./scripts/check.ps1` ile sıfır hata ve %100 yeşil kalite onayı.
