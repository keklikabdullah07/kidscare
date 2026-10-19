# Şartname 0059: İlaç Geçmişi Popup'ı, Sürekli/Süresi Dolan İlaç Takibi ve Olay Kartları Zenginleştirmesi (Paket 2)

## 1. Amaç ve Kapsam

Kreşlerde sağlık, ilaç takibi ve olay/kaza tutanakları hayati derecede kritik operasyonel süreçlerdir. Bu şartname aşağıdaki 4 kritik saha ihtiyacını çözer:

1. **İlaç Kartlarında Eksiksiz Bağlam:** İlaç kartlarında öğrencinin sınıfı, sorumlu sınıf öğretmeni ve ilacı teslim eden/onaylayan velinin adı-soyadı açıkça rozet ve etiketlerle gösterilecektir.
2. **İlaç Geçmişi Detay Modalı (Popup):** İlaç kartlarına "İlaç Geçmişi" butonu eklenecek; basıldığında açılan dokunsal popup (modal) içinde verilen dozlar, saatler, veren öğretmen notları ve geçmiş uygulama kütüğü kronolojik olarak sunulacaktır.
3. **Sürekli İlaçlar ve Süresi Dolan İlaç Uyarıları:**
   - Kronik/sürekli kullanılan ilaçlar özel bir rozetle ("Sürekli / Kronik İlaç") belirtilecek.
   - Bitiş tarihi geçmiş ilaçlar için kırmızı alarm rozeti ("Süresi Doldu - İlaç Kabul Edilemez") ve dikkat çekici görsel uyarı verilecektir.
4. **Olay ve Kayıt (İncidents) Kartlarında Eksiksiz Bağlam ve Günlük Görünüm:**
   - Olay kartlarında sınıf ismi, nöbetçi/tutanak tutan öğretmen ve bilgilendirilen veli isimleri eksiksiz yer alacaktır.
   - Sayfa ilk açıldığında varsayılan olarak "Bugün" filtrelenecek ve günlük olarak yenilenebilecektir.

---

## 2. Etkilenen Dosyalar ve Bileşenler

- `apps/admin-web/src/features/medication/MedicationPage.tsx`
- `apps/admin-web/src/features/medication/MedicationHistoryModal.tsx` (Yeni modal bileşeni)
- `apps/admin-web/src/features/incidents/IncidentsPage.tsx`
- Test dosyaları:
  - `apps/admin-web/src/features/medication/MedicationPage.test.tsx`
  - `apps/admin-web/src/features/incidents/IncidentsPage.test.tsx`

---

## 3. Kabul Kriterleri (Acceptance Criteria)

1. **AC-1 (İlaç Bağlamı):** İlaç kartlarında sınıf adı, öğretmen adı (`Öğrt. Ad Soyad`) ve veli adı (`Ad Soyad (Veli)`) net rozetlerle yer almalıdır.
2. **AC-2 (İlaç Geçmişi Popup):** İlaç kartındaki "Geçmiş / Kütük" butonuna tıklandığında popup açılmalı; doz geçmişi, saat ve uygulayan personel gösterilmelidir.
3. **AC-3 (Sürekli ve Süresi Dolan İlaçlar):** Bitiş tarihi geçmiş ilaçlar kırmızı `bg-rose-50 border-rose-300 text-rose-800` uyarısıyla belirtilmeli; sürekli ilaçlar kehribar rozetiyle vurgulanmalıdır.
4. **AC-4 (Olay Kartları Bağlamı ve Bugün Filtresi):** Olay kartlarında sınıf, öğretmen ve veli açıkça görünmeli; sayfa varsayılan olarak bugünü hedeflemelidir.
5. **AC-5 (Kalite Kapısı):** `./scripts/check.ps1` %100 yeşil tamamlanmalıdır.
