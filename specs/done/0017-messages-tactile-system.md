# Şartname 0017: Mesajlaşma & İletişim Dokunsal Dönüşümü (Messages & Communication Tactile System)

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Web Yönetim Panelinde **İletişim & Rutinler ➔ Mesajlaşma (`/messages`)** sayfasının KidsCare Dokunsal Tasarım Sistemine (Tactile Claymorphism) tam uyumlu hale getirilmesini; sohbet listesi, mesaj balonları, filtre sekmeleri ve yeni sohbet oluşturma akışının modern, dokunsal ve güvenli bir kullanıcı deneyimine kavuşturulmasını tanımlar.

## 2. Kullanıcı Hikayeleri ve Rol İhtiyaçları

- **Tüm Roller (Admin, SuperAdmin, Teacher, Parent):**
  - İki panelli akıcı bir arayüzle (Sol: Sohbet Listesi, Sağ: Mesajlaşma Akışı) hızlıca yazışabilmelidir.
  - Sohbetleri durumlarına (Tümü, Okunmamışlar, Acil & Sağlık, Kapananlar) göre filtreleyebilmelidir.
  - Gönderilen mesajlar sağda marka yeşili (Teal) balonda, gelen mesajlar solda keten/yulaf tonunda 3D balonda ayrışmalıdır.
  - Yeni bir görüşme başlatırken şık bir modal üzerinden kategori (Acil, Sağlık, İzin, Teslim, Günlük Bilgi, Duyuru vb.) ve öğrenci seçimi yapabilmelidir.
  - Yönetici veya öğretmen görüşmeyi tamamlandığında tek tıkla "Sohbeti Kapat" diyebilmelidir.

## 3. Fonksiyonel Gereksinimler

1. **Dokunsal KPI Özet Sayaçları (Tactile Stat Cards):**
   - Toplam Sohbet (Tüm yazışmalar - `blue`/`teal`)
   - Okunmamış Mesajlar (Öncelikli yanıt bekleyen diyaloglar - `amber`)
   - Acil Bildirimler (Acil ve sağlık etiketli kritik sohbetler - `rose`)
   - Çözülen / Kapanan (Arşivlenen veya kapatılan görüşmeler - `emerald`)
   - _Sayaçlara tıklandığında ilgili filtreyi otomatik aktif etme özelliği._

2. **Evrensel Sekme Standardı (`<TactileTabs />`):**
   - Sohbet listesi üstünde 4 sekme:
     - 💬 _Tüm Sohbetler_
     - 📬 _Okunmamışlar_
     - 🚨 _Acil & Sağlık_
     - 📁 _Kapananlar_
   - Pasif sekmelerde fiziksel 3D buton hissi, aktif sekmede 3D derinlik.

3. **Dokunsal Çift Panelli Mesajlaşma Arayüzü (Split-View):**
   - **Sol Panel (Sohbet Listesi):**
     - Dokunsal kartlar (`border-2 border-[#DDD4C4] dark:border-slate-800`), seçildiğinde `border-teal-700 bg-teal-50/60 dark:bg-teal-950/40`.
     - Kategori ikonu, acil uyarısı, konu başlığı, okunmamış mesaj sayısı rozeti ve zaman bilgisi.
   - **Sağ Panel (Yazışma Akışı & Gönderim Alanı):**
     - Başlık çubuğu: Konu, kategori rozeti, öğrenci ve durum bilgisi, dokunsal "Sohbeti Kapat" butonu.
     - Mesaj akışı: Göndericiye göre hizalanmış 3D ekstrüzyonlu mesaj balonları (kendi mesajları Teal, karşı taraf keten).
     - Mesaj gönderme alanı: Squircle textarea (`bg-[#FCFAF7] border-2 border-[#DDD4C4] rounded-2xl`) ve 3D dokunsal gönder butonu (`<TactileButton variant="teal">`).

4. **Yeni Sohbet Modalı (`ComposeConversationModal`):**
   - Sayfa akışını kesmeyen açılır 3D dokunsal modal.
   - Konu, kategori seçimi, opsiyonel öğrenci seçimi ve ilk mesaj metin kutusu.
   - İptal ve "Sohbeti Başlat" dokunsal butonları.

## 4. Kabul Kriterleri

- KidsCare Dokunsal Tasarım Sistemi (Tactile Claymorphism) kurallarına tam uyum.
- TypeScript tip denetimi (`tsc --noEmit`) 0 hata.
- Vitest birim testleri ve `./scripts/check.ps1` kalite kapısı %100 yeşil.
