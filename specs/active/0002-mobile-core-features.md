# Spec 0002 — Mobil Uygulama (Expo) V1 Stabilizasyonu ve Entegrasyonu

- Status: Draft
- Mode: lite
- Plan: `specs/plans/0002-mobile-core-features-plan.md`

## Intent

KidsCare mobil uygulaması (`apps/mobile`), kreş yöneticileri, sınıf öğretmenleri ve velilerin cebinden kreş süreçlerini anlık olarak yönetebilmesi için Expo SDK 57 ve React Native 0.86 tabanında geliştirilmektedir. Web paneli V1 stabilizasyonu tamamlandığından, mobil uygulamanın tüm temel iş akışlarının (Kimlik doğrulama, yoklama alma, günlük karne doldurma, veli takip akışı ve çocuk pasaportu) API ile tam entegre, hatasız, KidsCare Tasarım Sistemi'ne uygun ve savunmacı UI ile kararlı bir V1 sürümüne kavuşturulması hedeflenmektedir.

## Requirements

1. **Rol Bazlı Mobil Deneyim:**
   - Öğretmen ve Yöneticiler için `StaffTabs` (Yoklama, Günlük Takip, Mesajlar, Daha Fazla) navigasyonu.
   - Veliler için `ParentTabs` (Ana Ekran, Bakım/Gelişim, Keşfet/Galeri, Mesajlar, Profil) navigasyonu.
   - Giriş yapan kullanıcının rolüne göre doğru arayüze sıfır gecikmeyle yönlendirilmesi.
2. **Offline/Hata Toleransı ve Savunmacı UI:**
   - Ağ bağlantısı koptuğunda veya sunucu hatasında uygulamanın çökmesini engelleyen `ErrorBoundary` ve anlaşılır bildirimler.
   - Veri bulunmayan durumlarda boş/kırık ekran yerine standart `<EmptyState>` bileşeni.
3. **KidsCare Tasarım Sistemi Uyumu (Impeccable Design):**
   - İskandinav Adaçayı / Derin Çam Yeşili (`#0F4C3A` / `#134E4A`) ve Bal Kehribarı (`#F59E0B`) marka paleti.
   - Keten/Yulaf (`#FAF9F6`) açık arka plan, derin obsidyen koyu arka plan standartları.
   - Dokunma mikro-etkileşimleri (`activeOpacity={0.8}`).
4. **Temel İş Akışları:**
   - Öğretmenin sınıf yoklamasını tek dokunuşla alabilmesi.
   - Günlük karne (yemek, uyku, tuvalet, ruh hali) kaydı oluşturabilmesi.
   - Velinin çocuğuna ait günlük karne, yemek menüsü ve yoklama geçmişini izleyebilmesi.

## Constraints & out of scope

- **Kapsam İçi:** `apps/mobile` içerisindeki tüm ekranlar, bileşenler, navigasyon ve `apps/api` mobil endpoint'leri ile entegrasyonu.
- **Kapsam Dışı:** Push notification servisi altyapısı (APNs / FCM prod sertifikaları) bu fazda simüle edilecek, harici ödeme geçidi (IAP) Faz 3'e bırakılacaktır.

## Acceptance criteria

- [ ] AC-1 — Kimlik Doğrulama: Admin, Öğretmen ve Veli seed kullanıcıları ile giriş yapılabilmeli; token AsyncStorage'a kaydedilmeli; çıkış yapıldığında oturum güvenle sonlandırılmalıdır.
- [ ] AC-2 — Rol Bazlı Navigasyon: Öğretmen/Admin `StaffTabs`'a, Veli `ParentTabs`'a hatasız yönlenmeli; yetkisiz sekmeler gizlenmelidir.
- [ ] AC-3 — Öğretmen Yoklama Akışı: Sınıf öğrencileri listelenmeli; Geldi / Gelmedi / Geç durumları güncellenebilmeli ve backend'e anında yansımalıdır.
- [ ] AC-4 — Günlük Karne (Tracking): Öğretmen yemek, uyku ve duygu durumunu kaydedebilmeli; backend'e başarıyla POST/PATCH edilmelidir.
- [ ] AC-5 — Veli Bakım & Takip: Veli çocuğunun bugünkü ve geçmiş karnelerini, yemek menüsünü ve yoklama özetini görüntüleyebilmelidir.
- [ ] AC-6 — Savunmacı UI & Empty States: Veri olmayan tüm listelerde (boş sınıf, girilmemiş karne, duyurusuz gün) `<EmptyState>` düzgün görüntülenmeli, hiçbir ekranda beyaz boşluk kalmamalıdır.
- [ ] AC-7 — Tasarım ve Tema Tutarlılığı: Tüm buton, kart, metin ve simgeler `theme.ts` ve KidsCare Impeccable Design System ile tam uyumlu olmalıdır.
- [ ] AC-8 — Tip Güvenliği ve Sıfır Regresyon: `pnpm exec tsc -p apps/mobile/tsconfig.json --noEmit` hatasız geçmeli ve monorepo `./scripts/check.ps1` %100 yeşil kalmalıdır.

## Definition of Done

- [ ] Tüm 8 kabul kriteri simülatör / test ve API çağrılarıyla doğrulanmış olmalı
- [ ] `scripts/check.ps1` (Types + Lint + Test) yeşil olmalı
- [ ] Bağımsız inceleme (Review) tamamlanıp bulgular çözülmüş olmalı
- [ ] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                |       |
| Fix rounds                    |       |
| Review findings: real / noise |       |
| Regressions introduced        |       |
| Bugs escaped to production    |       |
