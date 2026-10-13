# Spec 0031 — Web Paneli Bildirim Merkezi (Web Notifications Center)

## 1. Amaç ve Kapsam

Faz 3 Yol Haritası kapsamında, veli, öğretmen ve yöneticilere yönelik üretilen anlık bildirimlerin (Yoklama giriş/çıkış, Günlük Karne, İlaç saati vb.) Web Paneli (`apps/admin-web`) üzerinde modern, dokunsal ve anlık olarak sunulması.

### Kapsam Dahili:

1. **İstemci API Katmanı (`apps/admin-web/src/api/notifications.ts`):**
   - `getNotifications(limit?: number)`: Kullanıcının bildirim listesini çeker (`GET /notifications`).
   - `markNotificationAsRead(id: string)`: Bildirimi okundu olarak işaretler (`PATCH /notifications/:id/read`).
   - `registerPushToken(token: string, platform?: 'web')`: Web bildirim token kaydı (`POST /notifications/token`).
2. **Bildirim Zili & Rozeti (`NotificationBell.tsx`):**
   - Üst menü barında (`Header` / `Layout.tsx`) tema butonunun yanında yer alır.
   - Okunmamış bildirim olduğunda dokunsal kırmızı/kehribar rozet (`badge`) ve bildirim sayısı gösterilir.
   - Okunmamış bildirim varsa hafif bir nabız/dikkat çekici animasyon (pulse dot) barındırır.
3. **Bildirim Açılır Paneli / Çekmecesi (`NotificationPopover.tsx`):**
   - Zile tıklandığında açılan şık, dokunsal panel (Dropdown / Popover).
   - Bildirim türüne göre ikon ve renk rozeti (🎒 Giriş, 👋 Çıkış, 📝 Karne, 💊 İlaç, 📢 Duyuru, 🔔 Sistem).
   - Zaman formatı (göreli zaman: "5 dk önce", "2 saat önce" veya saat formatı).
   - Tıklanan bildirimi anında okundu yapma.
   - Bildirimler boşsa `<EmptyState>` dokunsal tasarımı.
   - "Tümünü Okundu İşaretle" hızlı aksiyonu.
   - Bildirim türüne göre ilgili rotaya yönlendirme (örneğin karne için `/tracking` veya `/portal`, yoklama için `/attendance`, ilaç için `/medication`).
4. **Periyodik Güncelleme & Tarayıcı Web Notification İzni:**
   - Sayfa açıkken 30 saniyelik hafif polling ile yeni bildirimleri denetleme.
   - Kullanıcı tarayıcıda izin verirse standart Web `Notification` API ile masaüstü bildirimi gönderme.
5. **Dokunsal Tasarım & Savunmacı UI:**
   - KidsCare Dokunsal Tasarım Sistemi (`#115e59`, amber accent, dark mode uyumu).
   - Boş durum, hata durumları ve yüklenme durumları korumalı.

### Kapsam Dışı:

- Mobil push sertifikaları (Expo push mobil tarafta zaten kurulu).

---

## 2. Kullanıcı Hikayeleri

- **Veli (Parent):** Öğretmen yoklama aldığında veya ilaç verdiğinde web panelini açık tuttuğunda üst barda zil üzerinde kırmızı rozet belirir, açıp tıkladığında detayları görür ve bildirim okundu olur.
- **Öğretmen (Teacher):** Yönetimden veya veliden talep/duyuru geldiğinde zil üzerinden anında haberdar olur.
- **Yönetici (Admin):** Kurum içi tüm sistem bildirimlerini tek merkezden takip edebilir.

---

## 3. Doğrulama ve Test Kriterleri

- `./scripts/check.ps1` sıfır hata ile yeşil sonuç vermelidir (TypeScript, ESLint, Vitest, Nx build).
- Unit testler: `notifications.ts`, `NotificationBell.test.tsx`, `NotificationPopover.test.tsx`.
