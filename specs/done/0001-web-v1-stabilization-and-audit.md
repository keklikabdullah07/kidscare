# Spec 0001 — Web Yönetim Paneli V1 Stabilizasyonu ve Kalite Denetimi

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0001-web-v1-stabilization-plan.md`

## Intent

KidsCare Web Yönetim Paneli (`apps/admin-web`), MVP aşamasında 14 sayfa ile hayata geçirilmiş ancak canlıda (`https://kidscare.abdullahkeklik.com`) resmi bir V1 kalite denetiminden geçmemiştir. Kullanıcı deneyiminde form gönderimleri, sayfa geçişleri, rol yetkileri ve API yanıtlarında hatalar yaşanmaktadır. Bu çalışma ile 14 web sayfasının tümü Admin, Öğretmen ve Veli rolleri için baştan sona denetlenecek, tespit edilen tüm API ve UI hataları çözülecek ve sistem "KidsCare Web V1" sertifikalı, kararlı bir sürüme ulaştırılacaktır.

## Requirements

1. **Rol Bazlı Erişim ve Navigasyon:**
   - Admin kullanıcısı kreşin tüm yönetimsel sayfalarına erişebilmeli ve veri kaydedebilmelidir.
   - Öğretmen kullanıcısı yalnızca kendi yetkili olduğu sınıfları, yoklama ve karne alanlarını yönetebilmelidir.
   - Veli kullanıcısı yalnızca kendi çocuğunun verilerini görebilmeli, yönetimsel menülere ve başka çocukların verilerine asla erişememelidir.
2. **Form ve Modal Güvenliği:**
   - Öğrenci ekleme/düzenleme, sınıf oluşturma, öğretmen atama formlarında tüm alanlar doğrulanmalı, API 400/500 hataları kullanıcıya anlaşılır bildirim (toast) ile gösterilmelidir.
   - Modal pencereler <kbd>Escape</kbd> veya backdrop tıklamasıyla sorunsuz kapanmalıdır.
3. **Savunmacı Arayüz Garantisi:**
   - Boş veri durumlarında asla boş veya kırık beyaz ekran gösterilmemeli, `<EmptyState>` bileşeni devreye girmelidir.
   - Sayfa yüklenirken düzgün yüklenme (skeleton/spinner) durumları çalışmalıdır.

## Constraints & out of scope

- **Kapsam İçi:** Web Yönetim Paneli (`apps/admin-web`) ve ona hizmet eden API endpoint'leri (`apps/api`).
- **Kapsam Dışı:** Bu şartname mobil uygulamayı (`apps/mobile`) kapsamaz; mobil stabilizasyonu ayrı bir iş paketi olarak yürütülecektir.

## Acceptance criteria

- [x] AC-1 — Kimlik doğrulama (Giriş, çıkış, oturum yenileme) hatasız çalışmalıdır. (Doğrulandı: Regex hatası çözüldü, auth lookup RLS güvenliği sağlandı)
- [x] AC-2 — `/students` sayfasında öğrenci listeleme, arama, filtreleme, yeni öğrenci kaydı ve silme hatasız çalışmalıdır. (Doğrulandı: Savunmacı EmptyState, Escape/backdrop erişilebilirliği, 5 birim testi yeşil)
- [x] AC-3 — `/attendance` sayfasında sınıf bazlı günlük yoklama alma ve güncelleme hatasız kaydedilmelidir. (Doğrulandı: CheckOutModal erişilebilirliği, EmptyState entegrasyonu, 4 birim testi yeşil)
- [x] AC-4 — `/tracking` sayfasında günlük karne (yemek, uyku, ruh hali, etkinlik) doldurma ve veliye yansıma testi geçmelidir. (Doğrulandı: DailyReportEditorModal Escape/backdrop ve EmptyState entegre, testler yeşil)
- [x] AC-5 — `/team` sayfasında öğretmen ve personel yönetimi sorunsuz çalışmalıdır. (Doğrulandı: EmptyState entegre, davet ve liste testi yeşil)
- [x] AC-6 — `/settings` sayfasında kreş ayarları ve sınıf yönetimi güncellenebilmelidir. (Doğrulandı: Kurum güncelleme ve 3 birim testi yeşil)
- [x] AC-7 — `/medication`, `/pickup`, `/incidents`, `/menus`, `/gallery` modülleri temel akışları hata vermeden tamamlamalıdır. (Doğrulandı: Tüm modüllerde EmptyState ve erişilebilirlik sağlandı, 18/18 admin-web test dosyası yeşil)
- [x] AC-8 — Veli portalında (`/portal`) veli kendi çocuğunun karnesini ve duyurularını görebilmelidir. (Doğrulandı: ParentDashboardPage savunmacı EmptyState entegre, testler yeşil)
- [x] AC-9 — Tarayıcı konsolunda (Chrome DevTools) çözülmemiş `Uncaught Error` veya kırmızı API çökmesi kalmamalıdır. (Doğrulandı: Vite SPA proxy bypass eklendi, tüm rotalarda 0 konsol hatası doğrulandı)

## Definition of Done

- [x] Tüm 9 kabul kriteri tarayıcı ve API testleriyle kanıtlanmış olmalı
- [x] `scripts/check.ps1` (Types + Lint + Test) yeşil olmalı (55 test suite, 210 test %100 yeşil)
- [x] İnceleme (Review) raporu oluşturulup bulunan hatalar giderilmiş olmalı
- [x] İlgili ADR veya dokümanlar güncellenmeli
- [x] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 2     |
| Fix rounds                    | 2     |
| Review findings: real / noise | 3 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
