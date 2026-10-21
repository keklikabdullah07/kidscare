# Spec 0062 — Akıllı Adaptif Filtreler ve Tek Sınıf/Çocuk Kilitlenmesi (Smart Adaptive UI)

- Status: Done
- Mode: lite
- Plan: `specs/plans/0062-plan.md`

## Intent

Sektör lideri okul öncesi yönetim platformları (Brightwheel, HiMama/Lillio, Tadpoles) incelendiğinde; kullanıcılara tek bir seçenek varken sahte çoğul seçenekler sunmak ("Faux Choice / Ghost Selector" anti-deseni) ve veli ekranına sınıf filtreleri koymak ("Role Leakage") kabul edilemez birer UX hatasıdır.

KidsCare web panelinde:

1. **Tek Sınıflı Öğretmen (%85+):** Öğretmenin sorumlu olduğu tek bir sınıf varsa ("Minik Adımlar"), "Tüm Sınıflarım" seçeneği ve sınıf dropdown'ı tamamen kaldırılacaktır. Dropdown yerine sabit, şık bir sınıf rozeti (`🏫 Minik Adımlar`) gösterilecek; tüm veri doğrudan bu sınıfa kilitlenecektir. Sadece birden fazla sınıfı olan gezici/branş öğretmenlerinde sınıf seçici dropdown'ı gösterilecektir.
2. **Veli Ekranı (Child-Centric):** Veli ekranlarında (Veli Talepleri, Gelişim, İlaç, Yemek vb.) "Sınıf" filtresi KESİNLİKLE kaldırılacaktır (Veli kreşte sınıf seçmez). Tek çocuğu olan velilerde öğrenci dropdown'ı da kaldırılacak; doğrudan çocuğun adı/rozet gösterilecek ve "Tüm Öğrenciler" seçeneği asla yer almayacaktır. Birden fazla çocuğu olan velilerde ise sadece kendi çocukları arasında geçiş sunulacaktır.
3. **`ParentRequestsPage.tsx` ve Diğer Menüler:** `ParentRequestsPage` (Veli Talepleri), `MessagesPage` (Mesajlaşma) ve `IncidentsPage` (Olay/Revir) ekranları bu akıllı adaptif mantıkla standardize edilecektir.

## Requirements

### 1. `useStudentScope` Akıllı Adaptif Alanlarının Genişletilmesi

`apps/admin-web/src/hooks/useStudentScope.ts` içine şu adaptif mantıklar eklenir:

- `hasMultipleClassrooms`: `!isParent && availableClassrooms.length > 1` (Sadece birden fazla sınıf varsa dropdown açılır).
- `singleClassroom`: `!isParent && availableClassrooms.length === 1 ? availableClassrooms[0] : null` (Tek sınıf varsa rozet olarak sunulur).
- `hasMultipleChildren`: `isParent && availableStudents.length > 1` (Sadece birden fazla çocuk varsa dropdown açılır).
- `singleChild`: `isParent && availableStudents.length === 1 ? availableStudents[0] : null` (Tek çocuk varsa kilitli rozet olarak sunulur).
- `showClassroomFilter`: Yalnızca `isStaff` veya (`isTeacher && availableClassrooms.length > 1`) durumunda `true` döner. Tek sınıflı öğretmende ve velide kesinlikle `false` döner.
- `showStudentFilter`: Velide `availableStudents.length > 1` olduğunda `true`; öğretmende sınıfında öğrenci varsa `true`; tek çocuklu velide `false` döner.

### 2. Ortak UX Bileşeni: `<AdaptiveScopeBadge />`

Tek sınıflı öğretmen ve tek çocuklu veli için standart, dokunsal ve şık bir durum rozeti bileşeni oluşturulur:

- **Tek Sınıflı Öğretmen:** Yeşil/Teal zeminli rozet: `🏫 Minik Adımlar Sınıfı` (Dropdown yerine sabit bilgi).
- **Tek Çocuklu Veli:** Kehribar/Teal zeminli çocuk rozeti: `👶 Ada Yılmaz` (Dropdown yerine sabit bilgi).

### 3. Ekranların Adaptif Hale Getirilmesi

1. **`ParentRequestsPage.tsx` (Veli Talepleri — Fotoğraflardaki Ekran):**
   - Eski manuel `classrooms`/`students` filtreleri kaldırılıp `useStudentScope`'a bağlanır.
   - Veli görüntülüyorsa: Sınıf filtresi DOM'dan silinir. Öğrenci filtresinde "Tüm Öğrenciler" kaldırılır; tek çocuk varsa doğrudan çocuk rozeti görünür, 2+ çocuk varsa sadece kendi çocukları listelenir.
   - Öğretmen tek sınıflıysa: Sınıf dropdown'ı kaldırılır, "Tüm Sınıflarım" seçeneği silinir; yerine `🏫 Minik Adımlar` rozeti gösterilir. Öğrenci filtresinde yalnızca o sınıftaki öğrenciler listelenir.
2. **`DevelopmentPage.tsx`:**
   - Tek sınıflı öğretmen için sınıf dropdown'ı kaldırılarak sabit sınıf rozeti gösterilir.
3. **`IncidentsPage.tsx` & `MessagesPage.tsx`:**
   - Adaptif filtre kuralları uygulanır; veli sınıf görmez, tek sınıflı öğretmen sahte çoğul dropdown görmez.

## Acceptance Criteria

- [x] AC-1: `useStudentScope` hook'u tek sınıflı öğretmende `hasMultipleClassrooms: false`, `singleClassroom: { name: 'Minik Adımlar' }` ve `showClassroomFilter: false` değerlerini üretir.
- [x] AC-2: `ParentRequestsPage` açıldığında PARENT rolünde "Sınıf" dropdown'ı KESİNLİKLE render edilmez.
- [x] AC-3: `ParentRequestsPage` açıldığında tek sınıflı TEACHER rolünde "Tüm Sınıflarım" seçeneği ve sınıf dropdown'ı render edilmez; yerine sabit sınıf rozeti (`🏫 Minik Adımlar`) gösterilir.
- [x] AC-4: `ParentRequestsPage` açıldığında tek çocuklu PARENT rolünde "Tüm Öğrenciler" seçeneği ve öğrenci dropdown'ı render edilmez; yerine sabit çocuk rozeti gösterilir.
- [x] AC-5: `DevelopmentPage`, `MessagesPage` ve `IncidentsPage` üzerinde tek sınıflı öğretmen ve veli adaptif UX kurallarına uyar.
- [x] AC-6: Tüm vitest ve jest testleri güncellenir ve `./scripts/check.ps1` %100 yeşil geçer.

## Definition of Done

- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check.ps1` green (%100 Başarılı)
- [x] Independent review done; real findings fixed
- [x] Spec moved to `specs/done/`
