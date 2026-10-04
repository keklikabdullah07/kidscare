# Uygulama Planı 0018: Veli Talepleri (`/requests`) Dokunsal Sistem Harmonizasyonu

Bu plan, [`ParentRequestsPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/messages/ParentRequestsPage.tsx) sayfasının KidsCare Dokunsal Kil (Claymorphic) tasarım sistemine dönüştürülmesini adımlandırır.

## Kullanıcı İncelemesi Gerektiren Önemli Noktalar

- `TabKey`: `'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'`
- Buton kuralları: Kart içindeki Onayla/Reddet eylemleri için `<TactileButton variant="success" size="sm">` ve `<TactileButton variant="danger" size="sm">` kullanılacak; kartın kendisi statik (`shadow-2xs` / `shadow-sm`) kalacak.
- ESLint kuralı: Monorepo standartlarına uygun olarak `// eslint-disable-next-line react-hooks/exhaustive-deps` KULLANILMAYACAKTIR.

---

## Önerilen Değişiklikler

### 1. `apps/admin-web/src/features/messages/ParentRequestsPage.tsx`

- **Imports:** `PageHeader`, `StatCard`, `TactileTabs`, `TactileButton`, `EmptyState`, `Badge` ve ilgili Lucide ikonlarını (`Inbox`, `Filter`, `CheckCircle2`, `XCircle`, `Clock`, `User`, `FileText`, `Search`, vb.) içe aktar.
- **State Yönetimi:**
  - `activeTab`: `'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'`
  - `searchQuery`: `string`
  - `selectedStudentFilter`: `string` (Tüm öğrenciler veya belirli öğrenci)
  - `showForm`: Modal görünürlüğü
- **KPI Hesaplamaları (`useMemo`):**
  - Toplam Talep (`totalCount`)
  - Bekleyen (`pendingCount`)
  - Onaylanan (`approvedCount`)
  - Reddedilen (`rejectedCount`)
- **Filtrelenmiş Liste (`filteredRequests`):**
  - Durum filtresi (`activeTab`)
  - Arama filtresi (`searchQuery` -> konu, açıklama, öğrenci adı)
  - Öğrenci seçici filtresi (`selectedStudentFilter`)
- **Arayüz Yapısı:**
  - `PageHeader`: Sayfa başlığı, açıklaması, "Yenile" ve role göre "+ Yeni Talep" dokunsal butonları.
  - KPI Stat Grid: 4 adet tıklanabilir `<StatCard>`.
  - Sekme & Arama Çubuğu: Sol tarafta `<TactileTabs>`, sağ tarafta arama inputu ve öğrenci filtre seçicisi.
  - Talep Kartları Izgarası: 3D claymorphic squircle kartlar. Başlık, öğrenci/veli bilgisi, talep türü rozeti, açıklama metni, onay/ret notu ve yöneticiler için basılabilir Onayla/Reddet dokunsal butonları.
  - Boş Durum (`EmptyState`): Arama veya filtre sonucu boş kaldığında açıklayıcı boş durum bileşeni.
  - Dokunsal Yeni Talep Modalı: Form açıldığında squircle kenarlı, derin gölgeli 3D modal.

### 2. `apps/admin-web/src/features/messages/ParentRequestsPage.test.tsx`

- Sayfanın 4 KPI kartını, sekmelerini ve talep kartlarını doğru render ettiğini doğrulayan testler.
- Durum filtrelemesi ve sekme geçişi testleri.
- Onayla / Reddet butonlarının `resolve` modalını tetiklediğini doğrulayan testler.

---

## Doğrulama Planı

1. **Birim / Bileşen Testi:**
   ```powershell
   pnpm --filter @kidscare/admin-web test src/features/messages/ParentRequestsPage.test.tsx
   ```
2. **ESLint Doğrulaması:**
   ```powershell
   pnpm exec eslint apps/admin-web/src/features/messages/ParentRequestsPage.tsx
   ```
3. **Monorepo Kalite Kapısı:**
   ```powershell
   pwsh -File ./scripts/check.ps1
   ```
4. **Tarayıcı / Chrome DevTools Doğrulaması:**
   - `http://localhost:5173/requests` sayfasına gidilerek görsel düzenin, sekmelerin ve butonların doğrulanması.
