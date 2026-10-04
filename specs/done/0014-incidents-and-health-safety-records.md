# Şartname 0014: Olay Kayıtları ve Revir Takibi (Incidents & Health Safety Records)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Yönetim Panelinde **Güvenlik & Sağlık ➔ Olay Kayıtları (`/incidents`)** sayfasının KidsCare Dokunsal Tasarım Sistemine (Claymorphic / Tactile) tam uyumlu hale getirilmesini, düşme/yaralanma/hastalık tutanaklarının kategorik filtrelenmesini, veli bildirim takibini ve yeni tutanak oluşturma modal akışını tanımlar.

## 2. Kullanıcı Hikayeleri ve Rol İhtiyaçları

- **Yönetici (Admin / SuperAdmin) & Öğretmen (Teacher):**
  - Kreşte veya bahçede gerçekleşen düşme, yaralanma, hastalık veya davranış olaylarını anında kayıt altına alabilmeli (öğrenci, kategori, olay zamanı, detaylı açıklama, uygulanan ilk yardım).
  - Veliye telefonla veya yüz yüze bilgi verilip verilmediğini takip edebilmeli; henüz bildirilmemiş olayları ("Bildirim Bekliyor") tek tıkla veliye bildirildi olarak işaretleyebilmelidir.
  - Olayları kategorilerine (Düşme, Yaralanma, Hastalık/Revir, vb.) veya bildirim durumuna göre anında filtreleyebilmelidir.
  - Öğrenci adı veya olay açıklamasına göre arama yapabilmelidir.

## 3. Fonksiyonel Gereksinimler

1. **Dokunsal KPI Özet Sayaçları (Tactile Stat Cards):**
   - Toplam Tutanak (Tüm kayıtlar)
   - Bildirim Bekleyenler (Veliye henüz ulaşılmamış açık kayıtlar - Acil / Amber)
   - Yaralanma & Düşme (İlk yardım uygulanan fiziksel olaylar)
   - Veliye Bildirilenler (Tamamlanmış ve bilgilendirilmiş kayıtlar - Emerald)
2. **Kategori ve Durum Filtreleme Sekmeleri:**
   - _Tümü_
   - _Bildirim Bekleyenler_ (Acil veli araması gerektirenler)
   - _Düşme & Yaralanma_ (`DUSME` + `YARALANMA` + `KAZA`)
   - _Hastalık & Revir_ (`HASTALIK`)
   - _Davranış & Diğer_ (`DAVRANIS` + `DIGER`)
3. **Arama ve Öğrenci Filtreleme:**
   - Öğrenci adı, olay açıklaması veya ilk yardım notuna göre metin araması.
   - Öğrenci bazlı filtreleme dropdown'ı.
4. **Dokunsal Kartlar & Altın Kural Uyumu:**
   - Kartın kendisi sabit border ve hafif gölgeye sahip (`border-2 border-[#DDD4C4] dark:border-slate-700/80`); içerisindeki "Veliye Bildirildi Olarak İşaretle" butonu 3D dokunsal derinliğe (`TactileButton`) sahip.
   - Kategori ikonu ve renkli rozeti, öğrenci adı, olay saati, açıklama kutusu, ilk yardım aksiyonu ve veli durum etiketi.
5. **Yeni Olay Tutanağı Modalı (`CreateIncidentModal`):**
   - Sayfayı aşağı itmeyen, şık ve dokunsal açılır modal.
   - Öğrenci seçimi, kategori seçimi (ikonlu), olay zamanı (datetime-local), olay açıklaması, uygulanan ilk yardım/aksiyon ve veliye anında bilgi verildi checkbox'ı.
6. **Veli Bilgilendirme Aksiyonu:**
   - Henüz bildirilmemiş kayıtlarda tek tıkla "Veliye Bildirildi Olarak İşaretle" butonu (`PATCH /incidents/:id` ile `parentNotified: true`).

## 4. Kabul Kriterleri

- KidsCare Dokunsal Tasarım Sistemi renk ve derinlik kurallarına tam uyum.
- Sayfa TypeScript derlemesinden hatasız geçer.
- Vitest birim testleri ve `./scripts/check.ps1` %100 yeşil geçer.
