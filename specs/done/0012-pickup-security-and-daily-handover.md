# Spec 0012 — Guvenlik & Teslimat Kontrolu (Pickup Security & Daily Handover) (mini)

- Status: Draft
- Mode: lite
- Plan: specs/plans/0012-pickup-security-and-daily-handover-plan.md
- Source: user-request-menu-pickup-security
- Supersedes: none

## Intent

KidsCare Guvenlik & Saglik menusunun ilk sayfasi olan Teslimat Kontrolu (/pickup), su anda yalnizca ham yetki IDlerini ve durumlarini gostermekte; teslim alacak kisinin adini/telefonunu cozmemekte ve gun sonu ogrenci teslim etme (handover/event) akisini barindirmamaktadir. Bu gelistirme ile ogretmen ve yoneticiler:

1. Ogrenciyi teslim almaya yetkili kisilerin adini, telefonunu, yakinlik derecesini ve kimlik notlarini kart uzerinde gorebilecek,
2. Kapiya gelen kisiye ogrenciyi teslim ederken dogrulama yontemini (Kimlik kontrolu, telefon teyidi, sifre) secip Ogrenciyi Teslim Et islemi yapabilecek (POST /pickup/events),
3. Teslimat Gunlugu sekmesinden gun icinde hangi ogrencinin kime, saat kacta ve hangi ogretmen tarafindan teslim edildigini anlik takip edebilecektir.

## Changed behavior

- [ ] CB-1 — Yetki kartlarinda ogrenci adinin yani sira yetkilendirilen kisinin adi (fullName), yakinligi (relation), telefonu (phone) ve varsa kimlik notu gosterilir.
- [ ] CB-2 — Sayfada Yetki Talepleri ve Gunun Teslimat Gunlugu olmak uzere 2 ana sekme yer alir. Teslimat gunlugu GET /pickup/events ile gunun teslim edilen ogrencilerini ve teslim alan kisileri listeler.
- [ ] CB-3 — Ogrenciyi Teslim Et butonu ve modali eklenir: Ogrenci, teslim alan kisi, dogrulama turu (ID_CHECK, PHONE_CONFIRM, KNOWN_FACE, PASSWORD, OTHER) secilip teslimat kaydi (POST /pickup/events) olusturulur.
- [ ] CB-4 — Yonetici/Ogretmen icin Yeni Yetkili Ekle modali ile hizli yetki tanimlama imkani saglanir (POST /pickup/contacts & POST /pickup/authorizations).

## Preserved behavior

- [ ] PB-1 — Mevcut yetki onaylama (reviewPickupAuthorization - APPROVED) ve reddetme (REJECTED) islevleri geriye donuk hatasiz calismaya devam eder.
- [ ] PB-2 — Filtreler (PENDING, APPROVED, REJECTED, ALL) ve rol korumalari (Yalnizca Admin/SuperAdmin onay verebilir) aynen korunur.

## Out of scope

- Mobil uygulama offline QR tarayici donanim entegrasyonu (Faz 3 mobil kapsaminda tutulacaktir).
- Turnike veya kapi otomasyonu MQTT/donanim tetikleyicisi.

## Definition of Done

- [ ] scripts/check.ps1 yesil (%100 test & tip dogrulamasi)
- [ ] PickupPage.test.tsx yeni sekme, teslim etme modali ve teslimatci bilgilerini kapsayacak sekilde guncellenmis ve gecmis
- [ ] Sartname specs/done/ dizinine tasinmis
