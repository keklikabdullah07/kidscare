# Spec 0009 — admin-web-tactile-3d-buttons (mini)

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0009-admin-web-tactile-3d-buttons-plan.md`
- Source: USER-REQUEST-20261003-TACTILE-BUTTONS

## Intent

KidsCare Web Yönetim Paneli'nde (`apps/admin-web`) onaylanan dokunsal (tactile / Morrow 3D extruded pill) basılabilir buton stilini tüm sayfalardaki (Öğrenciler, Yoklama, Günlük Takip, Yemek Menüleri, Veli Portalı) butonlara ve seçim haplarına entegre etmek. Butonlar fiziksel taban kalınlığı (`0 3px 0 0 ...`) ve tıklandığında içeri gömülme hissi (`active:translate-y-[2.5px] active:shadow-none`) kazanacaktır.

## Changed behavior

- [ ] CB-1 — **Genel Buton Stilleri (`index.css`)**: `.btn-tactile-amber`, `.btn-tactile-teal`, `.btn-tactile-secondary`, `.btn-tactile-danger` sınıfları tanımlanır.
- [ ] CB-2 — **Öğrenciler Sayfası (`/students`)**: Yeni öğrenci ekleme, filtreleme hapları, kart içi işlem butonları 3D tactile pill formatına taşınır.
- [ ] CB-3 — **Yoklama Sayfası (`/attendance`)**: "Yoklamayı Kaydet", sınıf seçim hapları ve "Geldi/Gelmedi/İzinli" butonları dokunsal basılabilir hale getirilir.
- [ ] CB-4 — **Günlük Takip Sayfası (`/tracking`)**: "Bülteni Kaydet", duygu/yemek/uyku seçim hapları ve hızlı aksiyon butonları güncellenir.
- [ ] CB-5 — **Yemek Menüleri (`/menus`) ve Veli Portalı (`/portal`)**: Menü düzenleme, tarih butonları ve veli aksiyon butonları güncellenir.

## Preserved behavior

- [ ] PB-1 — Sayfaların mevcut KidsCare marka renkleri, kart düzeni, responsive yapısı ve veri akışları aynen korunur.
- [ ] PB-2 — Karanlık mod ve erişilebilirlik kontrastları korunur.

## Definition of Done

- [ ] Tüm alt sayfalardaki butonlar 3D tactile pill standardına kavuşturulur.
- [ ] TypeScript kontrolleri (`tsc --noEmit`) hatasız geçer.
- [ ] `./scripts/check.ps1` yeşil tamamlanır.
