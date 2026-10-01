# ADR 0005: Mobil Uygulamada Expo SDK 57 ve Standalone APK Mimarisi

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-09-30
- **Karar Vericiler:** Mobil & Mimari Ekibi

---

## Bağlam (Context)

Faz 2 kapsamında veliler ve öğretmenler için mobil uygulama geliştirilmesi kararlaştırıldı. Hızlı derleme, çapraz platform (Android & iOS) desteği ve monorepo paketlerine kolay erişim gerekiyordu.

## Karar (Decision)

1. **Teknoloji:** **Expo SDK 57** + React Native 0.86 tercih edildi.
2. **Derleme:** EAS Build (Expo Application Services) ile bağımsız (standalone) Android APK üretildi.
3. **Ağ & Güvenlik:** Android 9+ cihazlarda ağ isteklerinin kilitlenmemesi için `expo-build-properties` eklentisiyle `usesCleartextTraffic: true` ayarı eklendi; API istemcisi doğrudan canlı `https://kidscare.abdullahkeklik.com/api` adresine sabitlendi.
4. **Kullanıcı Deneyimi:** Giriş ekranından sunucu yapılandırma karmaşası kaldırıldı; kullanıcı sadece Kreş Kodu (Slug), E-posta ve Şifre ile doğrudan giriş yapabilir hale getirildi.

## Sonuçlar (Consequences)

- **Olumlu:** İlk çalışan APK başarıyla derlendi ve fiziksel cihazda test edildi.
- **Olumsuz:** Yeni native kütüphane eklendiğinde EAS üzerinden yeniden APK derlemesi gerekir.
