# KidsCare İş Alanı ve Sözlük (Domain & Ubiquitous Language)

Bu belge, KidsCare projesinde kullanılan iş kurallarını, rollerini, varlıklarını (entities) ve tüm ekip ile yapay zekanın ortak konuşması gereken **Alan Dili (Ubiquitous Language)** sözlüğünü tanımlar.

---

## 1. Temel Roller ve Yetki Matrisi (Roles & Permissions)

Sistemde 4 temel kullanıcı rolü bulunur:

| Rol                      | Kod          | Kapsam               | Temel Yetkileri                                                                   |
| ------------------------ | ------------ | -------------------- | --------------------------------------------------------------------------------- |
| **Süper Yönetici**       | `SUPERADMIN` | Platform Geneli      | Yeni kreş (tenant) açma, sistem geneli metrikler, abonelik yönetimi.              |
| **Kreş Müdürü / Kurucu** | `ADMIN`      | Kendi Kreşi (Tenant) | Kreş ayarları, sınıf/öğrenci/öğretmen yönetimi, faturalandırma, raporlar.         |
| **Sınıf Öğretmeni**      | `TEACHER`    | Kendi Sınıfları      | Günlük yoklama alma, günlük karne doldurma, etkinlik/yemek/uyku girişi.           |
| **Veli / Ebeveyn**       | `PARENT`     | Sadece Kendi Çocuğu  | Çocuğunun karnesi, yoklama durumu, yemek menüsü, ilaç talimatı verme, mesajlaşma. |

---

## 2. Varlıklar ve Kavramlar Sözlüğü (Domain Entities)

### Tenant & Organizasyon

- **Tenant (Kreş):** Sisteme üye olan bağımsız anaokulu veya kreş. Her kiracının benzersiz bir `slug` değeri (`demo`, `neseli-adımlar`) ve `tenant_id`'si vardır.
- **Branch (Şube):** Bir kreşin farklı lokasyonlardaki şubeleri.
- **Classroom (Sınıf):** Yaş grubuna göre ayrılmış öğrenci grupları (Örn: Papatyalar Sınıfı, 3-4 Yaş).

### Öğrenci ve Aile

- **Student (Öğrenci):** Kreşte eğitim alan çocuk. TC kimlik, alerjiler, kan grubu, özel durumlar içerir.
- **Guardian (Veli / Ebeveyn):** Öğrencinin anne, baba veya yasal vasisi. Bir öğrenciye birden fazla veli bağlanabilir.
- **PickUp Authorization (Teslim Alma İzni):** Çocuğu okuldan almaya yetkili kişilerin listesi (Büyükanne, amca, servis şoförü). Kimlik no ve telefon doğrulaması içerir.

### Günlük Operasyonlar

- **Attendance (Yoklama):** Öğrencinin o günkü katılım durumu.
  - `PRESENT` (Geldi)
  - `ABSENT` (Gelmedi)
  - `EXCUSED` (İzinli / Raporlu)
  - `LATE` (Geç Kaldı)
- **DailyReport (Günlük Karne):** Öğretmenin her gün çocuk için doldurduğu gelişim ve bakım formu:
  - _Mood (Ruh Hali):_ Neşeli, sakin, yorgun, huzursuz.
  - _Meals (Yemekler):_ Sabah kahvaltısı, öğle yemeği, ikindi kahvaltısı (Hepsini yedi, yarısını yedi, yemedi).
  - _Sleep (Uyku / Dinlenme):_ Uyudu (başlangıç-bitiş saati), dinlendi, uyumadı.
  - _Activities (Etkinlikler):_ Gün içinde yapılan oyun, sanat ve motor beceri aktiviteleri.
  - _Health Notes (Sağlık Notları):_ Ateş ölçümleri, genel durum.
- **Medication (İlaç Takibi):** Velinin sisteme girdiği ilaç kullanım talimatı (İlaç adı, doz, verilme saati) ve öğretmenin ilacı verip onayladığı saat damgası.
- **Incident (Olay / Kaza Tutanağı):** Okulda gerçekleşen ufak kazalar (düşme, çizilme vb.). Açıklama, müdahale ve veli bilgilendirme kaydı tutulur.
- **MealMenu (Yemek Menüsü):** Aylık/haftalık olarak yayınlanan yemek listesi.
- **Gallery (Fotoğraf Galerisi):** Gün içinde etkinliklerde çekilen ve velilere paylaşılan fotoğraflar (gizlilik ve KVKK gereği sadece sınıfın velilerine açıktır).
