# Şartname 0016: Gelişim Hikâyesi & Öğrenci Portfolyosu Dokunsal Dönüşümü (Development & Portfolio Tactile System)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Yönetim Panelinde **Güvenlik & Sağlık ➔ Gelişim & Portfolyo (`/development`)** sayfasının KidsCare Dokunsal Tasarım Sistemine (Tactile Claymorphism) tam uyumlu hale getirilmesini; pedagojik gözlemler, dijital öğrenci portfolyosu ve ev etkinlik havuzunun yeni `<TactileTabs />` standardı, dokunsal KPI sayaçları, modern modal yapıları ve erişilebilir kartlarla donatılmasını tanımlar.

## 2. Kullanıcı Hikayeleri ve Rol İhtiyaçları

- **Öğretmen (Teacher) & Yönetici (Admin / SuperAdmin):**
  - Öğrencilerin 5 temel pedagojik alandaki (Dil, Motor, Sosyal-Duygusal, Bilişsel, Özbakım) gelişim gözlemlerini kayıt altına alabilmeli, veliye açık olup olmadığını belirleyebilmelidir.
  - Öğrencilerin yaptıkları resim, proje ve etkinlik ürünlerini fotoğraflarıyla dijital portfolyoya ekleyebilmelidir.
  - Velilere evde uygulayabilecekleri pedagojik aktivite önerileri sunabilmeli ve yaş grubuna göre filtreleyebilmelidir.
  - Sayfadaki sekmeler arasında fiziksel buton hissi (`<TactileTabs />`) ile akıcı geçiş yapabilmeli, öğrenci ve gelişim alanına göre anında filtreleme uygulayabilmelidir.
- **Veli (Parent):**
  - Veli portalından veya gelişim sayfasından yalnızca kendi çocuğu için "Veli Görür" olarak işaretlenmiş onaylı pedagojik gözlemleri ve portfolyo çalışmalarını görebilmelidir.

## 3. Fonksiyonel Gereksinimler

1. **Dokunsal KPI Özet Sayaçları (Tactile Stat Cards):**
   - Toplam Gözlem (Tüm kayıtlı pedagojik gözlemler)
   - Portfolyo Eserleri (Öğrencilerin görsel ve proje çalışmaları)
   - Ev Etkinlikleri (Önerilen aile aktiviteleri havuzu)
   - Veli Paylaşımı (Veliye açık kayıtların oranı/sayısı)

2. **Evrensel Sekme Standardı (`<TactileTabs />`):**
   - Kapsül kanal (`.tactile-tab-track`) içerisinde 3 ana sekme:
     - 📖 _Pedagojik Gözlemler_
     - 🎨 _Öğrenci Portfolyosu_
     - 💡 _Ev Etkinlik Havuzu_
   - Pasif sekmelerde net 3D buton affordance'ı (`#FFFFFF` yüzey, `#DDD4C4` sınır, 2px 3D alt dudak).
   - Aktif sekmede 3D derinlik ve Teal teması.

3. **Dokunsal Filtreleme ve Arama Çubuğu:**
   - Öğrenci seçim dropdown'ı (`bg-[#FCFAF7] border-[#DDD4C4] rounded-2xl`).
   - Gelişim alanı filtreleme (Tüm Alanlar, Dil, Motor, Sosyal-Duygusal, Bilişsel, Özbakım).

4. **Dokunsal Kart Mimarisi (Altın Kural Uyumu):**
   - Gözlem Kartları: Renkli gelişim alanı rozeti, tarih, beceri adı, gözlem notu kutusu, öğrenci adı ve veli görünürlük rozeti (`Veli Görür` / `Yalnızca Kurum`).
   - Portfolyo Kartları: Görsel önizleme (hata korumalı `onError`), başlık, açıklama, öğrenci ve veli görünürlük etiketi.
   - Ev Etkinlik Kartları: Yaş grubu etiketi, gelişim alanı rozeti, aktivite başlığı ve uygulama önerisi.
   - Boş durumlarda `<EmptyState />` kullanımı.

5. **Dokunsal Modallar (`PromptModal` / Claymorphic Modal Yapısı):**
   - "Yeni Gözlem Ekle", "Yeni Portfolyo Çalışması Ekle", "Yeni Etkinlik Önerisi Ekle" modalları.
   - Squircle form kontrolleri (`bg-[#FCFAF7] border-[#DDD4C4] rounded-2xl`), `<TactileButton>` onay ve iptal butonları.

## 4. Kabul Kriterleri

- KidsCare Dokunsal Tasarım Sistemi (Tactile Claymorphism) kurallarına ve Tek Etkileşimli Varlık İlkesine %100 uyum.
- TypeScript tip kontrolü (`tsc --noEmit`) 0 hata.
- Vitest birim testleri ve `./scripts/check.ps1` kalite kapısı %100 yeşil.
