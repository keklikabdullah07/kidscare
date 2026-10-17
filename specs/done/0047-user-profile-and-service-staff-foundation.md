# Spec 0047 — Kullanıcı Profili, Fotoğraf Standardizasyonu ve Servis Personeli Altyapısı

- Status: Done
- Mode: lite
- Plan: `specs/plans/0047-plan.md`

## Intent

KidsCare platformunda kullanıcıların (yönetici, öğretmen, veli, servis personeli) sistem genelinde soğuk ve teknik e-posta adresleri (`teacher@demo.test`) yerine gerçek Ad, Soyad, Telefon ve Profil Fotoğrafı (Avatar) ile temsil edilmesini sağlamak. İsim çakışması durumlarında öğretmen veya velilerin yüzleri (avatar) ve unvan/sınıf rozetleriyle ayırt edilmesini garanti altına almak. Ayrıca kreş operasyonunun en kritik güvenlik ayaklarından biri olan servis operasyonu için `SERVICE_STAFF` (Servis Personeli / Rehberi) rolünü ve profil tamamlama (onboarding) altyapısını sisteme kazandırmak.

## Requirements

1. **User Varlık Genişletmesi:**
   - `User` tablosuna `firstName` (opsiyonel/string), `lastName` (opsiyonel/string), `avatarUrl` (opsiyonel/string) ve `phone` (opsiyonel/string) alanları eklendi.
   - `UserRole` enum'una `SERVICE_STAFF` (Servis Görevlisi / Rehberi) rolü eklendi.
2. **Kullanıcı Kendi Profilini Yönetebilmelidir:**
   - Giriş yapmış olan herhangi bir kullanıcı (Admin, Öğretmen, Veli, Servis Personeli) `GET /auth/me` ile kendi profil bilgilerini tam alabilmekte ve `PATCH /auth/profile` ile ad, soyad, telefon ve profil fotoğrafını güncelleyebilmektedir.
3. **Web Arayüzünde İsim & Avatar Standardizasyonu:**
   - Web panelinde sağ üst kullanıcı menüsünde, sınıf kartlarında, teslimat listesinde ve yoklama ekranında ham e-posta yerine kullanıcının Ad-Soyad'ı ve Avatarı gösterilmektedir.
   - Eğer profil fotoğrafı yoksa ad-soyad baş harflerinden oluşan dokunsal renkli bir avatar rozeti gösterilmektedir.
   - Sağ üstteki kullanıcı profil menüsüne "Profilimi Düzenle" modalı eklendi; kullanıcı buradan adını, soyadını, telefonunu ve profil fotoğrafı bağlantısını güncelleyebilmektedir.
4. **Seed ve Mevcut Veri Uyumluluğu:**
   - Mevcut demo seed kullanıcıları (`superadmin@demo.test`, `admin@demo.test`, `teacher@demo.test`, `parent@demo.test`, `service@demo.test`) Türkçe gerçekçi Ad Soyad ve hazır avatarlarla güncellendi.

## Constraints & Out of Scope

- Servis rotaları ve canlı GPS araç takibi bu şartnamenin kapsamı dışındadır (Faz 3/4 servis takip diliminde ele alınacaktır); bu şartnamede rol, veri modeli ve profil arayüzü temeli kuruldu.
- Dışarıdan yabancıların kontrolsüz fotoğraf yüklemesini önlemek için ("İyi Misafir Protokolü" - Kural 8), fotoğraf yükleme/güncelleme yalnızca kimliği doğrulanmış oturum sahiplerine açıktır.

## Acceptance Criteria

- [x] AC-1 — `prisma/schema.prisma` üzerinde `User` modeline `firstName`, `lastName`, `avatarUrl`, `phone` alanları ve `UserRole` içine `SERVICE_STAFF` eklendi; migration/client sorunsuz derlendi.
- [x] AC-2 — `packages/shared-types` ve `packages/shared-schemas` paketlerinde `User` tipi ve `UserProfileUpdateInput` şeması tanımlandı.
- [x] AC-3 — `apps/api` üzerinde `PATCH /auth/profile` endpoint'i çalışır, kullanıcının ad, soyad, telefon ve avatar güncellemelerini tenant izolasyonuyla kaydeder.
- [x] AC-4 — `apps/admin-web` sağ üst profil alanında ve modalında kullanıcının Adı, Soyadı ve Avatarı görüntülenir ve düzenlenebilir.
- [x] AC-5 — Sınıflar, yoklama ve teslimat ekranlarında e-posta prefix'leri (`Öğrt. Teacher`) yerine gerçek Ad Soyad ve Avatar rozeti gösterilir.
- [x] AC-6 — Mevcut tüm testler (`pnpm test` hem api hem web) ve build (`pnpm build`) hatasız ve %100 yeşil tamamlandı.

## Definition of Done

- [x] Tüm kabul kriterleri doğrulanmış
- [x] `scripts/check.ps1` ve testler yeşil (API: 40 suite / 223 test, Web: 30 suite / 127 test)
- [x] Bağımsız inceleme tamamlanmış
- [x] Şartname `specs/done/` dizinine taşınmış
