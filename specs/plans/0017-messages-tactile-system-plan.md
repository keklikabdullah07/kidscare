# Uygulama Planı 0017: Mesajlaşma & İletişim Dokunsal Dönüşümü (Messages & Communication Tactile System)

## 1. Mimari ve Değişiklik Özeti

`apps/admin-web/src/features/messages` dikey diliminde yer alan `MessagesPage.tsx` sayfasını KidsCare Dokunsal Tasarım Sistemine (Tactile Claymorphism) tam uyumlu hale getiriyoruz. Sayfada:

1. Üst başlık alanı ve dokunsal aksiyon butonları (`<TactileButton>`)
2. 4 adet tıklanabilir dokunsal KPI özet kartı (`StatCard` ile)
3. Yeni evrensel dokunsal sekme standardı (`<TactileTabs />`)
4. Dokunsal iki bölmeli (split-view) sohbet ve mesaj akış paneli
5. 3D ekstrüzyonlu konuşma balonları ve squircle mesaj gönderme çubuğu
6. Açılır şık ve dokunsal "Yeni Sohbet Başlat" modalı
7. Hata ve boş durum yönetimi (`<EmptyState />`)

## 2. Yapılacak Adımlar

### Adım 1: Sayfa İskeleti & API İncelemesi

- `MessagesPage.tsx` bileşenlerini, veri akışını (`listConversations`, `listMessages`, `sendMessage`, `createConversation`, `updateConversationStatus`) incelemek.
- Durum filtre sekmelerini (`ALL`, `UNREAD`, `CRITICAL`, `CLOSED`) planlamak.

### Adım 2: `MessagesPage.tsx` Dokunsal Dönüşümü

- **Başlık & Aksiyon:** İskandinav keten/obsidyen zemin, 3D mesaj ikonu kutusu, dokunsal "Yenile" ve "Yeni Sohbet Başlat" butonları.
- **4'lü KPI Sayaçları (`StatCard`):** Toplam Sohbet, Okunmamışlar, Acil Bildirimler, Kapananlar. Kartlara tıklandığında ilgili sekmeye anında geçiş.
- **Sekmeler:** `<TactileTabs />` entegrasyonu (Tüm Sohbetler, Okunmamışlar, Acil & Sağlık, Kapananlar).
- **Sohbet Listesi (Sol Panel):** 3D claymorphic kartlar, aktif sohbet vurgusu, okunmamış bildirim rozetleri ve kategori etiketleri.
- **Yazışma Akışı (Sağ Panel):** Başlık çubuğu, "Sohbeti Kapat" butonu, sağ/sol 3D mesaj balonları, zaman damgaları, form input ve dokunsal Gönder butonu.
- **Yeni Sohbet Modalı:** Açılır şık 3D dokunsal modal formatına dönüştürme.

### Adım 3: Testler & Doğrulama

- `apps/admin-web/src/features/messages/MessagesPage.test.tsx` testlerini güncel sekme ve KPI yapılarına göre genişletmek.
- `pnpm --filter admin-web exec vitest run src/features/messages/MessagesPage.test.tsx` ile test etmek.
- `./scripts/check.ps1` kalite kapısını çalıştırmak ve %100 yeşil sonucu doğrulamak.

### Adım 4: Kullanıcı Test Raporu & Şartnamenin Taşınması

- Şartnameyi `specs/done/` dizinine taşımak.
- Değişiklikleri git ile commit'lemek.
- Kullanıcıya tarayıcı test adımlarını içeren ayrıntılı rapor sunmak.
