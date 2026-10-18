# Şartname 0056: Dijital Veli Memnuniyet & Etkinlik Oylama Modülü (Anketler)

## 1. Giriş ve Amaç

Kreş yönetiminde veli memnuniyeti, eğitim kalitesi geri bildirimleri, gezi/etkinlik tercihleri ve mezuniyet konsepti gibi konularda hızlı, dijital ve şeffaf karar alma mekanizması sunan **Dijital Anket ve Oylama Modülü (`/surveys`)** kurulmasıdır.

## 2. Kapsam ve Rol Davranışları

- **ADMIN / SUPER_ADMIN:**
  - Yeni anket oluşturma (Başlık, açıklama, son katılım tarihi, hedef kitle).
  - Farklı soru tipleri:
    - ⭐ 1-5 Yıldız Puanlama (Örn: "Yemek menüsü lezzet ve çeşitliliğinden memnun musunuz?")
    - 🔘 Tek Seçenekli Oylama (Örn: "Güz dönemi doğa gezisi nereye yapılsın? A: Arboryum, B: Doğa Parkı, C: Botanik Bahçesi")
    - ☑️ Çoktan Seçmeli Tercih
    - 📝 Açık Uçlu Yorum / Görüş
  - Hedef Kitle: Tüm Kreş veya Belirli Sınıf(lar).
  - Canlı katılım analitiği (Yanıtlayan veli sayısı, yüzdeler, soru bazlı bar grafikleri, ortalama puanlar).
  - Anket durum yönetimi: `DRAFT` (Taslak), `ACTIVE` (Yayında), `CLOSED` (Sonuçlandı).
- **TEACHER:**
  - Sınıfına tanımlı aktif anketleri ve katılım durumunu izleme.
- **PARENT:**
  - Aktif anketleri bildirim çanında ve Anket menüsünde görme.
  - Formu tek tıkla doldurma ve oylama.
  - Sonuçları kapandıktan sonra genel dağılım olarak inceleyebilme.

## 3. Mimari ve Veritabanı Modelleri

- `Survey`
  - `id`: CUID (Primary Key)
  - `tenantId`: Tenant ilişkisi (Multi-tenant izolasyonu)
  - `createdById`: Anketi oluşturan admin User ID
  - `title`: String
  - `description`: String?
  - `status`: SurveyStatus (`DRAFT`, `ACTIVE`, `CLOSED`)
  - `targetType`: BroadcastTargetType / SurveyTargetType (`ALL_DAYCARE`, `CLASSROOM`)
  - `targetClassroomId`: String?
  - `isAnonymous`: Boolean (Varsayılan: false)
  - `expiresAt`: DateTime?
  - `createdAt`, `updatedAt`
- `SurveyQuestion`
  - `id`: CUID
  - `surveyId`: Survey FK
  - `orderIndex`: Int
  - `questionText`: String
  - `questionType`: SurveyQuestionType (`RATING_1_5`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `OPEN_TEXT`)
  - `options`: String[] (Seçenekler listesi)
  - `isRequired`: Boolean
- `SurveyResponse`
  - `id`: CUID
  - `surveyId`: Survey FK
  - `respondentId`: User FK (Veli)
  - `studentId`: Student FK?
  - `createdAt`: DateTime
- `SurveyAnswer`
  - `id`: CUID
  - `responseId`: SurveyResponse FK
  - `questionId`: SurveyQuestion FK
  - `ratingValue`: Int?
  - `selectedOptions`: String[]
  - `textResponse`: String?

## 4. Web Yönetim Paneli Standartları (`apps/admin-web`)

- Menüde `İletişim & Rutinler` altında **"Anketler"** bağlantısı (`/surveys`, icon `Vote` veya `BarChart3`).
- KidsCare Dokunsal Tasarım Sistemi (Tactile claymorphic tokens, canlı sonuç barları, 3D butonlar).
- KPI Kartları:
  - Aktif Anketler
  - Toplam Katılım Oranı
  - Ortalama Memnuniyet Skoru
  - Tamamlanan Anketler
- Canlı oylama dağılım grafik çubukları ve veli yanıt dökümü.

## 5. Doğrulama Kriterleri

- Multi-tenant izolasyonu tam korunmalı (`tenant_id`).
- `@Inject(...)` tüm constructor parametrelerinde eksiksiz olmalı.
- Unit testler ve `./scripts/check.ps1` %100 yeşil çıktıyla doğrulanmalı.
