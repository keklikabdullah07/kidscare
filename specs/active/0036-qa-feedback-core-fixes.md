# Şartname 0036 — Saha & Öğretmen QA Bildirimleri Çekirdek Onarımları

## 1. Amaç ve Kapsam

Gerçek kullanıcı (Öğretmen ve Veli) testleri sonucunda Google Sheets QA matrisine girilen 24 adet kritik hatanın öncelikli çekirdek nedenlerini gidermek, veri akışını ve rol yetkilerini kusursuz hale getirmek.

Bu şartname şu 4 temel paketi kapsar:

1. **İlaç Takibi & Günlük Karne Senkronizasyonu (Tablo Satır 12, 26, 31, 32, 33):**
   - Veli portalında ve öğretmen panelinde ilaçların günlük tarih filtresine (`today` / `selectedDate`) göre listelenmesi; dünün ilaçlarının ertesi güne taşarak "Verildi" kalmasının önlenmesi.
   - İlaç kayıtlarında öğrenci adı ve soyadının getirilmesi (`student.firstName`, `student.lastName`).
   - Günlük karne (`DailyReportEditorModal`) açıldığında öğrencinin aktif/düzenli ilaçlarının otomatik olarak listelenmesi ve tek tıkla onay kutucuğuyla (checkbox) işaretlenebilmesi.
   - Öğretmen (`TEACHER`) rolünün ilaç talebini onaylayabilmesi (`approve`).
2. **Güvenli Teslimat Yetkilendirme İzolasyonu & Senkronizasyonu (Tablo Satır 11, 17, 25):**
   - `GET /pickup/authorizations` endpoint'ine `PARENT` rolünün yetkilendirilmesi (403 hatasının giderilmesi ve veli portalında onaylı teslimatçıların görüntülenmesi).
   - Öğrenci pasaportundaki acil/yetkili teslimatçıların teslimat ekranında bağlanması.
   - Öğretmen teslimat ekranında öğrenci seçimi değiştiğinde verilerin anında güncellenmesi.
3. **Öğrenci Sınıf Atama Onarımı (Tablo Satır 30):**
   - `StudentsService.create` ve `StudentsService.update` fonksiyonlarında `classroomId` alanının Prisma veri nesnesine dahil edilmesi ve sınıf atamasının veritabanına kaydedilmesi.
4. **Mesajlaşma & Veli İletişimi (Tablo Satır 15, 21, 22, 23, 27):**
   - Mesajlaşma sorgularına gönderici bilgisi (`sender: { id, firstName, lastName, role }`) ve öğrenci bilgisi (`student: { id, firstName, lastName }`) eklenmesi; öğretmenin mesajlaştığı velinin adını görmesi.
   - Öğretmenin veli talebine yanıt yazabilmesi ve durumunu güncelleyebilmesi.

---

## 2. Kabul Kriterleri (Acceptance Criteria)

- [ ] **Kriter 1 (İlaç Tarih İzolasyonu):** Bugün tarihi için verilen bir ilaç, ertesi güne geçildiğinde veli portalında veya öğretmende verilmiş olarak gözükmez; yeni günün ilacı olarak temiz başlar.
- [ ] **Kriter 2 (Karnede Otomatik İlaç):** Günlük karne düzenleyicide öğrencinin kayıtlı ilacı varsa otomatik yüklenir, öğretmenin her gün elle sıfırdan ilaç yazması gerekmez.
- [ ] **Kriter 3 (İlaçta Öğrenci Adı):** Öğretmen ilaç listesinde her ilacın kime ait olduğunu (Öğrenci Adı Soyadı) görür.
- [ ] **Kriter 4 (Veli Teslimatçıları):** Veli teslim alıcı eklediğinde ve admin onayladığında, veli portalında teslimatçı "✓ Onaylı Yetkili" olarak listelenir (403 hatası almaz).
- [ ] **Kriter 5 (Sınıf Atama):** Admin öğrencinin sınıfını değiştirdiğinde ve kaydettiğinde, veritabanında `student.classroomId` güncellenir ve sayfada doğru sınıf görünür.
- [ ] **Kriter 6 (Mesajda Veli Adı):** Öğretmen mesajlaşma sekmesinde velinin adı ve soyadını net olarak görür.
- [ ] **Kriter 7 (Doğrulama):** `./scripts/check.ps1` (Typecheck, Lint, Test) ve ilgili birim/entegrasyon testleri %100 geçer.
