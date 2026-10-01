# KidsCare Güvenlik ve İzolasyon Modeli (Security & Multi-Tenancy)

Bu belge, KidsCare projesinde uygulanan güvenlik mimarisini, veri mahremiyetini ve çoklu kiracılı (multi-tenancy) izolasyon kurallarını tanımlar.

---

## 1. Multi-Tenancy İzolasyon Prensipleri

KidsCare, SaaS tabanlı bir kreş yönetim sistemidir. Farklı kreşlerin (kiracıların) verileri aynı PostgreSQL veritabanında saklanır; ancak yazılımsal olarak mutlak bir duvarla ayrılmıştır:

1. **Zorunlu `tenant_id`:** Veritabanındaki global tablolar hariç (`Tenant`, `SystemAdmin` vb.) tüm tablolarda `tenant_id` kolonu zorunludur.
2. **`tenant-context` Motoru:** Node.js `AsyncLocalStorage` kullanılarak her HTTP isteğinin kiracı bağlamı istek yaşam döngüsü boyunca izole edilir.
3. **Repository Katmanı Garantisi:** Veritabanı sorguları asla doğrudan Prisma üzerinden yapılmaz; daima `withTenant` veya `runWithTenant` metotlarıyla filtrelenir.
4. **`TenantGuard`:** Kiracıya özel tüm endpoint'ler `@UseGuards(TenantGuard)` ile korunur. Token içindeki kiracı ile URL'deki veya istekteki kiracı uyuşmazsa `403 Forbidden` fırlatılır.

---

## 2. Kimlik Doğrulama ve Oturum Yönetimi (Authentication)

- **Şifreleme:** Kullanıcı şifreleri `bcrypt` (10 tuzlama turu) ile hashlenerek saklanır. Asla düz metin (plain-text) şifre tutulmaz.
- **JWT (JSON Web Token):**
  - Başarılı girişte imzalı JWT token üretilir.
  - Token yükü (payload): `{ userId, email, role, tenantId }`.
  - Her korumalı API isteğinde `Authorization: Bearer <token>` başlığı aranır.
- **Şifre Sıfırlama & Token Süresi:** Süresi dolmuş token'lar sunucu tarafında anında reddedilir.

---

## 3. Rol Tabanlı Yetkilendirme (RBAC)

Endpoint ve sayfa düzeyinde 4 rol hiyerarşisi uygulanır:

- `@Roles(Role.SUPERADMIN)`: Sadece platform yöneticileri erişebilir.
- `@Roles(Role.ADMIN)`: Kreş müdürleri ve kurucuları.
- `@Roles(Role.TEACHER)`: Sınıf öğretmenleri (öğrenci karne, yoklama).
- `@Roles(Role.PARENT)`: Veliler (sadece kendi çocuklarının karne ve bildirimleri).

---

## 4. Çocuk Verisi ve KVKK / GDPR Hassasiyeti

Kreş yazılımları en hassas kişisel verileri (çocuk fotoğrafları, sağlık/ilaç bilgileri, alerjiler, veli iletişim detayları) barındırır:

1. **Fotoğraf Gizliliği:** Bir sınıfta çekilen fotoğraflar yalnızca o sınıftaki öğrencilerin velilerine ve öğretmenine gösterilir.
2. **Sağlık & İlaç Kayıtları:** İlaç talimatı sadece kayıtlı veli tarafından verilebilir; ilacın verildiği saat ve öğretmen bilgisi denetim günlüğünde (audit log) kilitlenir.
3. **Teslim Güvenliği:** Öğrenci teslim alma yetkilisi listesinde olmayan hiç kimseye çocuk teslim edilemez; teslim anında SMS/anlık bildirim tetiklenir.

---

## 5. Ağ ve Altyapı Güvenliği

- Tüm trafik **Cloudflare SSL / TLS 1.3** üzerinden `https://` ile şifrelenir.
- Nginx ters vekili gereksiz portları kapatır; PostgreSQL ve Redis dış dünyaya doğrudan açık değildir (Docker iç ağındadır).
- CORS (Cross-Origin Resource Sharing) politikası yalnızca yetkili web paneli ve mobil istemcilere izin verir.
