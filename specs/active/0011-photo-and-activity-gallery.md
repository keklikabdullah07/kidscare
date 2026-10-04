# Spec 0011 — Fotoğraf & Etkinlik Galerisi (Web & Veli Portalı)

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0011-photo-and-activity-gallery-plan.md`
- Source: user-request-content-focus

## Intent

KidsCare platformunda öğretmen ve yöneticilerin kreş aktivitelerini, sanatsal çalışmaları ve günlük özel anları fotoğraflayıp etiketleyerek kreş galerisine yükleyebilmesi; velilerin ise çocuklarının gün içindeki etkinlik fotoğraflarını ve sınıf albümlerini hem Veli Portalı (`/portal`) hem de Galeri ekranı (`/gallery`) üzerinden lightbox önizlemesi ile görüntüleyebilmesini sağlamak.

## Changed behavior

- [ ] CB-1 — **API Veli Erişim İzni (`GET /media`):** `MediaController` içindeki `GET /media` listeleme endpoint'ine `PARENT` rolü eklenmeli; kiracı izolasyonu (`tenantId`) korunarak velilerin kendi kreşlerine ait etkinlik (`ACTIVITY`), portfolyo (`PORTFOLIO`) ve genel (`GENERAL`) medya kayıtlarını listelemesi sağlanmalıdır.
- [ ] CB-2 — **Web Paneli Galeri Sayfası (`/gallery`):** Sol kenar çubuğunda "Fotoğraf Galerisi" menü öğesi yer almalı; sayfada kategori filtreleri (Tümü, Etkinlikler, Portfolyo, Genel), fotoğraf ızgarası (grid) ve yükleme tarihi gösterilmelidir.
- [ ] CB-3 — **Medya Yükleme Arayüzü:** Yönetici ve öğretmenler için galeri sayfasında dosya seçici / sürükle-bırak yükleme alanı sunulmalı, kategori seçimi ile `POST /media/upload` API'sine görsel yüklenip anında listede gösterilmelidir.
- [ ] CB-4 — **Lightbox Görsel İnceleme Modalı:** Galerideki veya portaldaki herhangi bir fotoğrafa tıklandığında görseli tam boyutta gösteren, dosya adı, yükleyen ve tarih bilgilerini içeren şık bir Lightbox modalı açılmalıdır.
- [ ] CB-5 — **Medya Silme İşlevi:** Admin ve öğretmen rolündeki kullanıcılar için fotoğraf üzerinde silme butonu bulunmalı, `ConfirmModal` ile onay alındıktan sonra `DELETE /media/:id` çağrısı yapılarak görsel silinebilmelidir.
- [ ] CB-6 — **Veli Portalı Galeri Bölümü:** `/portal` sayfasında veliler için güncel etkinlik ve aktivite fotoğraflarını gösteren bir galeri vitrini bulunmalı, tıklandığında Lightbox ile incelenebilmelidir.

## Preserved behavior

- [ ] PB-1 — Çok kiracılı medya depolama motoru (`MediaService`, `LocalDiskDriver`, `S3Driver`) ve dosya boyut/tür kısıtlamaları (maksimum 10MB görsel) aynen korunmalıdır.
- [ ] PB-2 — Mevcut Veli Portalı karneleri, yoklama takibi, yemek menüsü ve diğer tüm modüller sıfır regresyon ile çalışmaya devam etmelidir.
- [ ] PB-3 — Dokunsal Kleyomorfik Tasarım Sistemi standartları (`border-2 border-[#DDD4C4]`, 3D butonlar, obsidyen koyu mod) yeni sayfa ve bileşenlerde eksiksiz uygulanmalıdır.

## Out of scope

- Gerçek zamanlı video akışı (video streaming) veya video dönüştürme bu paketin kapsamı dışındadır (sadece resim/fotoğraf formatları).
- Yüz tanıma ile otomatik çocuk etiketleme (Faz 4 AI kapsamına bırakılmıştır).

## Definition of Done

- [ ] `scripts/check.ps1` (Typecheck + Lint + Test) %100 yeşil
- [ ] Admin Web vitest testleri yeni galeri bileşeni ve API fonksiyonu için eklenmeli / güncellenmeli
- [ ] Şartname `specs/done/` klasörüne taşınmalı
