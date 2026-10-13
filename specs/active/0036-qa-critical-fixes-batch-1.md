# Şartname 0036 — Saha QA Kritik Hatalar Paketi 1 (Batch 1)

## 1. Amaç ve Kapsam

Öğretmen ve veli testlerinden Google Sheets QA tablosuna yansıyan en acil 5 kritik çekirdek hatanın giderilmesidir:

1. **Yemek Menüsü 500 Çökmesi ve Rol Yetkisi (Tablo Satır 14, 16, 20):**
   - `DailyMenusService` constructor'ında eksik `@Inject(AllergenMatcher)` dekoratörünün eklenmesi ve 500 çökmesinin önlenmesi.
   - `DailyMenuPage.tsx` üzerinde menü düzenleme yetkisinin sadece `ADMIN` ve `SUPER_ADMIN` rollerine sınırlandırılması; `TEACHER` rolünün salt okunur (read-only) yapılması.
2. **Öğrenci Sınıf Atamasının Kaydedilmemesi (Tablo Satır 30):**
   - `StudentsService.create` ve `StudentsService.update` fonksiyonlarında `input.classroomId` alanının Prisma nesnesine bağlanması ve öğrenci sınıf güncellemesinin veritabanına yansıması.
3. **Veli Teslimatçılarında 403 Yetki Engeli (Tablo Satır 25):**
   - `PickupController.listAuthorizations` endpoint'ine `PARENT` rolünün eklenmesi; veli portalının kendi onaylı teslimatçılarını listeleyebilmesi.
4. **Öğretmenin Veli Talebini Onaylayamaması (Tablo Satır 27):**
   - `ParentRequestsPage.tsx` üzerindeki "Onayla" ve "Reddet" butonlarının `TEACHER` rolüne de açılması; öğretmenin inceleme notuyla birlikte talebi sonuçlandırabilmesi.
5. **İlaç Ertesi Güne Geçince Sıfırlanmama & Karnede Otomatik İlaç (Tablo Satır 31, 33):**
   - `ParentDashboardPage.tsx` üzerinde ilaçların seçilen gün (`selectedDate`) bazında filtrelenmesi; dünün ilacının bugüne taşınmaması.
   - `DailyReportEditorModal.tsx` açıldığında öğrencinin onaylı ilaçlarının otomatik yüklenmesi.

---

## 2. Kabul Kriterleri (Acceptance Criteria)

- [ ] **Kriter 1 (Yemek Menüsü):** Admin menü kaydettiğinde veya veli menüyü görüntülediğinde 500 çökmesi yaşanmaz. Öğretmen giriş yaptığında "Menüyü Kaydet / Düzenle" butonları gizlenir, sadece okuma yapabilir.
- [ ] **Kriter 2 (Sınıf Atama):** Admin öğrencinin sınıfını değiştirdiğinde `PATCH /students/:id` veritabanında `classroomId`'yi günceller ve sayfayı yenileyince yeni sınıf korunur.
- [ ] **Kriter 3 (Teslimatçılar):** Veli `GET /pickup/authorizations` çağırdığında 403 almaz; onaylanmış teslimat yetkilisi "✓ Onaylı Yetkili" rozetiyle listelenir.
- [ ] **Kriter 4 (Veli Talepleri):** Öğretmen `ParentRequestsPage` açtığında bekleyen taleplerde "Onayla" ve "Reddet" butonlarını görür ve tıklayarak not yazıp sonuçlandırabilir.
- [ ] **Kriter 5 (İlaç ve Karne):** Veli ertesi günün tarihini seçtiğinde dün verilen ilaçlar "Verildi" olarak görünmez. Öğretmen günlük karne açtığında öğrencinin ilaçları otomatik listelenir.
- [ ] **Kriter 6 (Doğrulama):** `./scripts/check.ps1` (Typecheck, Lint, Test) %100 yeşil çıktıyla tamamlanır.
