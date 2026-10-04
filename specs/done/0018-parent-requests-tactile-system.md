# Şartname 0018: Veli Talepleri (`/requests`) Dokunsal (Claymorphic) Tasarım Sistemi Harmonizasyonu

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Yönetim Paneli'nde yer alan **İletişim & Rutinler ➔ Veli Talepleri** (`/requests`) sayfasının ([`ParentRequestsPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/messages/ParentRequestsPage.tsx)) projenin dokunsal kil (claymorphic) tasarım sistemine, `TactileTabs`, `StatCard` ve `TactileButton` bileşenlerine tam uyumlu hale getirilmesini hedefler.

## 2. Mevcut Durum Analizi ve Sorunlar

- **Eksik KPI Göstergeleri:** Sayfada talep durumlarını (bekleyen, onaylanan, reddedilen) hızlıca özetleyen ve filtreleme imkanı veren statik/interaktif KPI kartları bulunmuyor.
- **Sekme Eksikliği:** Talepler düz bir liste halinde dökülmekte, durum bazında (`PENDING`, `APPROVED`, `REJECTED`, `ALL`) kolay geçiş sağlayan 3D sekmeler (`TactileTabs`) yer almamaktadır.
- **Düz Butonlar ve Arayüz:** Talep üzerindeki "Onayla" ve "Reddet" butonları düz `active:scale-98` kullanmakta, KidsCare'in 3D ekstrüzyon gölgeli basılabilir derinlik hissini taşımamaktadır.
- **Kart İçi Etkileşim Kuralı:** Dokunsal sistemin _"Kart içinde eylem butonu varsa kart sabittir, butonlar dokunsaldır"_ kuralına göre talep kartlarının çerçeve ve gölge hiyerarşisi netleştirilmelidir.
- **Arama ve Öğrenci Filtresi:** Talepler arasında konu, açıklama veya öğrenciye göre hızlı arama ve filtreleme çubuğu bulunmamaktadır.

## 3. Fonksiyonel ve Görsel Gereksinimler

### 3.1. Dokunsal KPI Kartları (`StatCard`)

Sayfanın en üstünde 4 adet tıklanabilir `StatCard` yer alacaktır:

1. **Toplam Talep:** Tüm taleplerin toplam sayısı. Tıklandığında tüm sekmeyi ve aramayı sıfırlar.
2. **Bekleyen Talepler:** İncelenmeyi bekleyen (`PENDING`) talep sayısı. Tıklandığında doğrudan `PENDING` sekmesine geçer (amber/kehribar vurgu).
3. **Onaylanan:** Çözülmüş ve onaylanmış (`APPROVED`) talep sayısı. Tıklandığında `APPROVED` sekmesine geçer (zümrüt/emerald yeşil vurgu).
4. **Reddedilen:** Uygun görülmemiş (`REJECTED`) talep sayısı. Tıklandığında `REJECTED` sekmesine geçer (gül/rose vurgu).

### 3.2. Global Dokunsal Sekmeler (`TactileTabs`)

Durum bazlı filtreleme için:

- **Tüm Talepler** (`ALL`)
- **Bekleyenler** (`PENDING`)
- **Onaylananlar** (`APPROVED`)
- **Reddedilenler** (`REJECTED`)
  Her sekmede o duruma ait toplam talep sayısı rozet (`count badge`) olarak gösterilecek; sekmeler 3D alt dudak ve basma efektine sahip olacaktır.

### 3.3. Arama ve Filtreleme Alanı

- Arama inputu: Konu, açıklama ve öğrenci adında anlık filtreleme.
- Öğrenci seçici: Belirli bir öğrenciye ait talepleri izole edebilme.

### 3.4. 3D Claymorphic Talep Kartları & Eylemler

- Kart tasarımı: Çift katmanlı squircle sınırlar, keten/obsidyen yüzey, tür ve durum çipleri (`Badge`).
- İnceleme notları: Onay/ret esnasında yazılan `resolutionNote` belirgin biçimde alıntı kutusunda gösterilecek.
- Eylem Butonları: Yönetici/Admin için bekleyen taleplerde "Onayla" (`TactileButton variant="success"`) ve "Reddet" (`TactileButton variant="danger"`).
- Çözüm Modalı: Mevcut `PromptModal` dokunsal tasarım standartlarıyla uyumlu kalacak.

## 4. Kabul Kriterleri (Acceptance Criteria)

1. `/requests` sayfası açıldığında 4 adet `StatCard` ve `TactileTabs` eksiksiz görüntülenmeli.
2. KPI kartlarına veya sekmelere tıklandığında talep listesi anında ilgili duruma göre filtrelenmeli.
3. Arama inputu ile konu/açıklama filtrelemesi sorunsuz çalışmalı.
4. Bekleyen talepleri Onayla/Reddet butonları çalışmalı ve durum anında güncellenmeli.
5. Yeni talep ekleme modalı dokunsal tasarıma uygun olmalı.
6. Vitest testleri (`ParentRequestsPage.test.tsx`) %100 geçmeli.
7. `./scripts/check.ps1` monorepo kapısından sıfır hata ile geçmeli.
