# Plan: Spec 0012 — Guvenlik & Teslimat Kontrolu (Pickup Security & Daily Handover)

## 1. Kapsam ve Amac

Bu plan, KidsCare Guvenlik & Saglik menusunun ilk sayfasi olan /pickup sayfasini gercek kreş ihtiyaclarina tam yanit verecek seviyeye getirmeyi hedefler.

## 2. Eksikler ve Cozum Adimlari

### Adim 1: API Istemcisine Eksik Endpointleri Ekleme (apps/admin-web/src/api/pickup.ts)

- listPickupContacts(studentId): Ogrencinin yetkili kisilerini getirme
- createPickupContact(data): Yeni yetkili kisi ekleme
- createPickupAuthorization(data): Yetki talebi baslatma
- listPickupEvents(studentId, date): Gunun veya ogrencinin teslimat loglarini getirme
- recordPickupEvent(data): Ogrenciyi teslim etme (POST /pickup/events)

### Adim 2: PickupPage Bilesenine 2 Sekmeli Yapi ve Gelismis Kartlar

- Sekme 1: Yetki Talepleri & Listesi (Onay bekleyenler, onaylilar, kisi detaylari: isim, telefon, yakinlik, not)
- Sekme 2: Teslimat Gunlugu & Kutuk (Bugun hangi ogrenci kime teslim edildi, saat, dogrulayan personel, dogrulama yontemi)

### Adim 3: Ogrenciyi Teslim Et (RecordPickupModal)

- Ogrenci secimi
- Teslim alan kisi (Yetkili listeden veya ozel ad-soyad/telefon)
- Dogrulama yontemi (Kimlik kontrolu, telefon teyidi, sifre, taninan yuz)
- Teslimat notu
- Basarili kayitta aninda Gunluk sekmesine dusme ve bildirim

### Adim 4: Yeni Yetkili Ekleme Modali (AddPickupContactModal)

- Ogrenci secimi, ad soyad, yakinlik derecesi (Anneanne, Dede, Servis Soforu, Komsu vb.), telefon ve kimlik notu

### Adim 5: Testler ve Dogrulama

- PickupPage.test.tsx vitest testleri
- ./scripts/check.ps1 ile 31/31 paket tam gecis kaniti
