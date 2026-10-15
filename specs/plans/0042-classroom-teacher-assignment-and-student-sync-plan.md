# 0042 — Yeni Sınıf Öğretmen Ataması & Öğrenci Sınıf Senkronizasyonu Planı

> **İlgili Şartname:** `specs/active/0042-classroom-teacher-assignment-and-student-sync.md`  
> **Kapsam:** `apps/api`, `apps/admin-web`, `packages/shared-types`

---

## 1. Mimari ve Değişiklik Adımları

### 1.1. Backend API (`apps/api/src/modules/students/controllers/students.controller.ts`)

- `toResponse(s: Student): StudentResponse` metoduna eksik olan `classroomId: s.classroomId` alanı eklenecek.
- Böylece `updateStudent` endpoint'i yanıt döndüğünde öğrencinin güncel `classroomId`'si frontend'e eksiksiz iletilecek.

### 1.2. Frontend API İstemcisi (`apps/admin-web/src/api/classrooms.ts`)

- `assignTeacherToClassroom(classroomId: string, teacherId: string): Promise<Classroom>` fonksiyonu eklenecek (`POST /classrooms/:id/teachers`).

### 1.3. Frontend UI (`apps/admin-web/src/features/students/StudentsPage.tsx`)

- Öğretmenleri çekmek için `listUsers('TEACHER')` çağrısı yapılacak.
- `+ Yeni Sınıf Oluştur` modalına `Sorumlu Öğretmen (İsteğe Bağlı)` select kutusu eklenecek.
- Sınıf oluşturulunca öğretmen seçilmişse hemen `assignTeacherToClassroom` çağrılacak.
- Öğrenci güncellendiğinde (`onSaved`):
  - Öğrenci güncellenir güncellenmez `students` listesindeki `classroomId` doğru güncellenecek,
  - Üstteki Sınıf Kartlarındaki (`classrooms.map`) öğrenci sayıları anında senkronize olacak.

### 1.4. Doğrulama ve E-Tablo Güncellemesi

- Birim testleri yazılacak/güncellenecek.
- `powershell.exe -ExecutionPolicy Bypass -Command ".\scripts\check.ps1"` çalıştırılacak (%100 yeşil kanıtı).
- Google E-Tablo Webhook ile Satır 27 ve 28 `✅ Çözüldü` olarak güncellenecek.

---

## 2. Risk ve Güvenlik Değerlendirmesi

- `toResponse` değişikliği geriye dönük tam uyumludur, kırıcı değişiklik içermez.
- Çoklu kiracı (TenantGuard) ve rol yetkilendirmeleri (RolesGuard) korunmaktadır.
