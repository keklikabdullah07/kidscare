# Şartname 0053: Öğrenci TC/Ebeveyn Bilgileri, Beslenme Etiketi Onarımı ve Sınıf Düzenleme

## 1. Problem Tanımı ve Saha İhtiyacı
Google E-Tablo ve saha geri bildirim matrisindeki son 9 maddeden 6'sı (Teslim yetkileri, Ekip Ad/Soyad, Veli talepleri, Yemek listesi alerjen izolasyonu, Olay kayıtları ve Portfolyo izolasyonu) Spec 0047, 0050 ve 0052 ile başarıyla tamamlanmıştır.

Geriye kalan 3 kritik saha ihtiyacı şunlardır:
1. **Yeni Öğrenci Eklemede TC Kimlik No, Anne Adı ve Baba Adı (E-Tablo Satır 37):** Kreş kayıtlarında MEB zorunluluğu gereği öğrencinin TC kimlik numarası, anne ve baba adının zorunlu/seçimli olarak girilmesi ve hem öğrenci pasaportunda hem de detay kartında saklanıp görüntülenmesi gerekmektedir.
2. **Öğrenci Pasaportunda Beslenme Kısıtlamaları Görüntüleme Hatası (E-Tablo Satır 38):** `StudentPassportModal.tsx` içinde özel veya hazır beslenme kısıtlamaları eklendiğinde liste state'e alınıp kaydedilmekte, genel panelde görünmekte ancak düzenleme modalı içinde etiketler (çipler) render edilmediği için veli/yönetici eklenmedi sanmaktadır.
3. **Var Olan Sınıfları Düzenleyebilme Yeteneği (E-Tablo Satır 40):** Sistemde yeni sınıf eklenebilmekte ancak var olan sınıfların adı, yaş grubu ve atanmış öğretmeni güncellenememektedir. API'de var olan `PATCH /classrooms/:id` arayüze bağlanmalı ve dokunsal `Sınıfı Düzenle` modalı eklenmelidir.

---

## 2. Kapsam ve Teknik Değişiklikler

### A. TC Kimlik No, Anne Adı, Baba Adı
- `packages/shared-schemas/src/student.schema.ts`:
  - `studentPassportSchema` içine `identityNumber` (TCKN), `motherName`, `fatherName` alanları eklenir.
  - `studentCreateSchema` ve `studentUpdateSchema` bu alanları kabul eder.
- `apps/admin-web/src/features/students/StudentsPage.tsx`:
  - "Yeni Öğrenci Ekle" modalına TC Kimlik No (11 hane), Anne Adı ve Baba Adı giriş alanları eklenir.
  - Öğrenci detayında ve pasaport özetinde bu bilgiler şık rozetlerle gösterilir.
- `apps/admin-web/src/features/students/StudentPassportModal.tsx`:
  - Pasaport modalında "Kimlik & Aile Bilgileri" bölümü altında TC Kimlik No, Anne Adı ve Baba Adı düzenlenebilir hale getirilir.

### B. Beslenme Kısıtlamaları Görünürlük Onarımı
- `apps/admin-web/src/features/students/StudentPassportModal.tsx`:
  - Beslenme kısıtlamaları kutusu içerisine, seçili ve özel eklenmiş tüm diyetleri `dietaryRestrictions.map(...)` ile silinebilir (`×`) dokunsal çipler olarak listeleyen bölüm eklenir.

### C. Var Olan Sınıfları Düzenleme
- `apps/admin-web/src/api/classrooms.ts`:
  - `updateClassroom(id: string, payload: { name?: string; ageGroup?: string }): Promise<Classroom>` fonksiyonu eklenir.
- `apps/admin-web/src/features/students/StudentsPage.tsx`:
  - Yönetici (ADMIN/SUPER_ADMIN) için sınıf kartlarında ve sınıf hiyerarşisi bölümünde `✏️ Düzenle` butonu eklenir.
  - `ClassroomEditModal` açılarak sınıfın adı, yaş grubu ve sorumlu öğretmeni kolayca değiştirilir.

---

## 3. Doğrulama ve Kabul Kriterleri
1. Yeni öğrenci eklenirken TC No, Anne Adı ve Baba Adı girilebilmeli; kaydedildiğinde pasaportta ve tabloda görünmeli.
2. Öğrenci pasaportunda özel beslenme eklendiğinde hemen modal içinde etiketi belirmeli ve `×` ile silinebilmeli.
3. Sınıf kartındaki "Düzenle" butonuna tıklandığında mevcut sınıf adı, yaş grubu ve öğretmeni formda hazır gelmeli; güncellendiğinde sınıf anında yenilenmeli.
4. `./scripts/check.ps1` sıfır hata ile yeşil geçmeli.
