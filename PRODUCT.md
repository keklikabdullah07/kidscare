# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Kreş Yöneticileri / Müdürler (ADMIN):** Kurum operasyonu, kontenjan, sınıf/öğrenci/ekip yönetimi, güvenlik protokolleri ve genel sağlık takibi.
- **Sınıf Öğretmenleri (TEACHER):** Sabah 10 saniyelik hızlı yoklama, yemek/uyku/etkinlik günlük akışı, veli mesajları, ilaç ve teslimat doğrulaması.
- **Veliler (PARENT):** Çocuğunun anlık katılımı, günün yemek menüsü, alerjen uyarıları, günlük karne ve etkinlik fotoğrafları.
- **Platform Kurucuları (SUPER_ADMIN):** Çoklu kurum denetimi ve sistem geneli yapılandırma.

## Product Purpose

KidsCare, kreş ve gündüz bakımevi yönetiminde öğretmenin veri giriş yükünü en aza indiren, veliye çocuğunun güvenliği ve gün içerisindeki durumu hakkında şeffaf ve anlamlı bir özet sunan, yöneticinin ise tüm kurum operasyonunu tek bakışta kontrol etmesini sağlayan yeni nesil bir web yönetim platformudur.

## Positioning

Geleneksel, hantal ve karmaşık okul yönetim yazılımlarının aksine; KidsCare "öğretmen daha az veri girsin, veli daha anlamlı bilgi alsın, yönetici riskleri erkenden görsün" felsefesiyle çalışan, yüksek kullanılabilirliğe sahip, modern ve sıcak bir SaaS çözümüdür.

## Operating Context

- Sabah giriş saatlerinde hızlı yoklama ve teslimat kontrolü.
- Gün içerisinde yemek, uyku ve aktivite akışının hızlıca kaydedilmesi.
- İlaç saatleri, alerjen riskleri ve acil olay kayıtlarının yüksek dikkatle yönetilmesi.
- Masaüstü, tablet ve mobil tarayıcılarda tam responsive çalışan web arayüzü (`apps/admin-web`).

## Capabilities and Constraints

- **Web-Only İlkesi:** Platform yalnızca web paneli ve backend API üzerinden çalışır; harici mobil kod tabanına dokunulmaz.
- **Multi-Tenancy:** Her kreş bağımsız `tenant_id` altında tam veri izolasyonuna sahiptir.
- **Rol Yetkilendirmesi:** Her kullanıcı rolü (Admin, Teacher, Parent) kendine özel yetki ve arayüz hiyerarşisine sahiptir.
- **Mevcut 15 Menü:** Dashboard, Öğrenciler, Sınıflar, Yoklama, Günlük Takip, Veli Portalı, Mesajlar, Talepler, Teslimat, İlaç, Olay Kayıtları, Yemek Listesi, Galeri, Ekip ve Ayarlar.

## Brand Commitments

- **Renk Dünyası:** Sıcak, güven veren, göz yormayan doğal tonlar (zümrüt/adaçayı yeşili, yumuşak amber/mercan, sıcak süt-krem zeminler, dengeli arduvaz/kömür metinler). Jenerik mor/mavi yapay zeka klişelerinden kesinlikle kaçınılır.
- **Tasarım Dili:** Yuvarlatılmış modern kartlar, nefes alan mekânsal ritim, belirgin durum rozetleri, çocuk dünyasını yansıtan ama kurumsal güveni hissettiren tipografi.

## Product Principles

1. **Öğretmeni Yorma:** Öğretmenin asıl görevi çocuktur; veri girişi 1-2 dokunuşla tamamlanabilmelidir.
2. **Kritik Olanı Ayır:** İlaç, alerji ve teslimat gibi güvenlik unsurları rutin akışlardan görsel olarak anında ayrışmalıdır.
3. **Mekânsal Nefes:** Kart üstüne kart yığmak yerine, ferah ve okunabilir bir hiyerarşi kurulmalıdır.
4. **Veliye Anlamlı İçerik:** Veliyi gereksiz detaylarla boğmak yerine, günün hikayesini ve güven hissini veren özetler sunulmalıdır.
