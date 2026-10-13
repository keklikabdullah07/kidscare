# Uygulama Planı — Spec 0031: Web Paneli Bildirim Merkezi

## 1. Mimari Tasarım & Dosya Yerleşimi

```
apps/admin-web/src/
├── api/
│   └── notifications.ts          # API fetch wrapper (getNotifications, markNotificationAsRead)
├── components/
│   ├── notifications/
│   │   ├── NotificationBell.tsx   # Üst bar zil ikonu + okunmamış sayısı rozeti + popover tetikleyici
│   │   ├── NotificationBell.test.tsx
│   │   ├── NotificationPopover.tsx # Bildirim listesi, filtreler, okundu yapma, boş durum
│   │   ├── NotificationPopover.test.tsx
│   │   └── useNotifications.ts    # React hook: polling, bildirim listesi, okundu state yönetimi
│   └── Layout.tsx                 # Header sağ üst alana NotificationBell entegrasyonu
```

---

## 2. Adım Adım İşlem Sırası

### Adım 1: API İstemcisi (`apps/admin-web/src/api/notifications.ts`)

- `getNotifications(limit?: number): Promise<NotificationItem[]>`
- `markNotificationAsRead(id: string): Promise<{ success: boolean }>`
- `registerPushToken(token: string, platform?: 'web'): Promise<{ success: boolean }>`

### Adım 2: State & Polling Hook'u (`useNotifications.ts`)

- Aktif oturum varsa (`isAuthenticated`) ilk yüklemede ve her 30 saniyede bir `getNotifications()` çağrılır.
- `unreadCount` hesaplanır (`list.filter(n => !n.isRead).length`).
- `markAsRead(id)` çağrıldığında optimistik güncelleme yapılır ve API'ye istek atılır.
- `markAllAsRead()` ile tüm okunmamışlar sırayla işaretlenir.
- Yeni bildirim geldiğinde (tarayıcı izin vermişse `Notification` API tetiklenir).

### Adım 3: Dokunsal Bildirim Bileşenleri (`NotificationPopover.tsx` & `NotificationBell.tsx`)

- Dokunsal KidsCare tasarım sistemi standartları (`#115e59`, amber accent, dark mode uyumu).
- Dışarı tıklayınca kapanma (`useRef` + `mousedown` listener).
- Bildirim türlerine göre rozetler ve yönlendirmeler:
  - `ATTENDANCE_CHECK_IN` / `ATTENDANCE_CHECK_OUT` -> 🎒 / 👋
  - `DAILY_REPORT_SAVED` -> 📝
  - `MEDICATION_GIVEN` -> 💊
  - `ANNOUNCEMENT` -> 📢
  - `SYSTEM` -> 🔔
- Göreli zaman hesaplayıcı (Türkçe: "şimdi", "5 dk önce", "3 saat önce", "dün").

### Adım 4: `Layout.tsx` Entegrasyonu

- Üst barın sağ kısmında, tema değiştirme (Güneş/Ay) butonunun hemen soluna `<NotificationBell />` yerleştirilmesi.

### Adım 5: TDD & Birim Testleri

- `NotificationBell.test.tsx` (Zil renderı, rozet gösterimi, tıklandığında popover açılması).
- `NotificationPopover.test.tsx` (Bildirimlerin listelenmesi, okundu işaretleme, boş durum).
- API mock testleri.

### Adım 6: Doğrulama

- `./scripts/check.ps1` çalıştırılarak TypeScript, Lint ve Vitest testlerinin tamamının yeşil olduğunun kanıtlanması.
