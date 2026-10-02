# Spec 0006 — Pazarlama ve Kurumsal Açılış Sitesi (Marketing Landing Page)

- Status: Done
- Mode: lite
- Plan: `specs/plans/0006-marketing-landing-page-plan.md`

## Intent

KidsCare platformunun kreş kurucularına, okul müdürlerine ve velilere profesyonelce tanıtılması, platformun sunduğu güçlü modüllerin (anlık bildirimler, yoklama, teslimat güvenliği, günlük karne ve pedagojik takip) görsel olarak sergilenmesi ve yeni kreş abonelikleri için potansiyel müşteri (lead) toplanması amacıyla modern, yüksek performanslı ve dönüştürücü bir pazarlama web sitesi (`apps/marketing`) kurulacaktır. Sayfa; KidsCare Impeccable Design System renklerine (İskandinav adaçayı/çam yeşili ve bal kehribarı) sadık, mobil uyumlu (responsive), SEO optimize ve interaktif bir demo talep akışına sahip olacaktır.

## Requirements

1. **Görsel Tasarım & Marka Bütünlüğü:**
   - KidsCare Impeccable Design System standartlarına tam uyum: Zemin PARLAMAYAN yulaf/keten `#FAF9F6`, kartlar `#FFFFFF`, birincil vurgu derin çam/adaçayı yeşili (`#0F4C3A`), sıcak kreş vurgusu bal kehribarı (`#F59E0B`).
   - Modern tipografi (Plus Jakarta Sans / Inter), cam morfolojisi (glassmorphism), mikro-animasyonlar (`hover:-translate-y-1`, `active:scale-95`).
   - Sıfır generic şablon; üst düzey premium SaaS açılış sayfası hissi.
2. **Temel Sayfa Bölümleri (Sections):**
   - **Hero Bölümü:** Güçlü değer önerisi, dinamik çağrı butonları (CTA: "Ücretsiz Demo Talep Et", "Giriş Yap") ve canlı ürün arayüz simülasyonu.
   - **Öne Çıkan Özellikler (Feature Matrix):** Mobil veli uygulaması, anlık check-in/out bildirimleri, dijital karne, ilaç takip protokolü, güvenli teslimat ve yapay zeka gelişim takibi.
   - **Etkileşimli Arayüz Vitrini (Interactive Product Preview):** Veli mobil ekranı ve yönetici web paneli önizlemeleri.
   - **Fiyatlandırma & Paketler (Pricing Tier):** Başlangıç (0-30 Öğrenci), Standart (30-100 Öğrenci - Popüler Rozetli), Kurumsal / Zincir Kreşler.
   - **İnteraktif Demo Talep Formu:** Kreş adı, yetkili adı, telefon, e-posta ve öğrenci kapasitesi içeren form doğrulama ve anında teyit ekranı.
   - **Sıkça Sorulan Sorular (Accordion FAQ):** KVKK, veri güvenliği, çoklu şube desteği ve kurulum süreci.
   - **Header & Footer:** Gezinme bağlantıları, demo butonu, panel giriş yönlendirmesi, telif ve güvenlik taahhütleri.
3. **SEO ve Performans:**
   - Sayfa başlığı, meta açıklamaları, OpenGraph etiketleri, semantik HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`).
   - Hızlı ilk yükleme süresi (Next.js SSR / App Router).
4. **Platformlar Arası Entegrasyon:**
   - "Giriş Yap" butonu kullanıcıyı doğrudan Admin Web Paneline (`/login`) yönlendirmelidir.

## Constraints & out of scope

- **Kapsam İçi:** `apps/marketing` Next.js 14 App Router sayfası, interaktif demo formu bileşeni, modern CSS/Tailwind stilleri, SEO meta etiketleri, responsive layout.
- **Kapsam Dışı:** Gerçek kredi kartı ile online ödeme alma (Stripe/Iyzico checkout bu spec'in kapsamı dışındadır, V2'de eklenecektir; bu aşamada demo talebi toplanır).

## Acceptance criteria

- [x] AC-1 — Hero & Tasarım Sistemi: Hero bölümü KidsCare marka renkleri, dinamik CTA'lar ve etkileyici ürün mockup'ı ile responsive olarak açılmalıdır.
- [x] AC-2 — Modül & Özellik Grid'i: Yoklama, karne, bildirim, ilaç ve güvenlik modülleri açıklayıcı ikon ve kartlarla sergilenmelidir.
- [x] AC-3 — Fiyatlandırma Kartları: 3 kademeli (Başlangıç, Standart, Kurumsal) fiyatlandırma tablosu responsive ve karşılaştırılabilir olmalıdır.
- [x] AC-4 — İnteraktif Demo Talep Formu: Ziyaretçi demo formunu doldurduğunda istemci tarafı validasyon çalışmalı ve teşekkür/onay durumu gösterilmelidir.
- [x] AC-5 — SSS Akordeon: Sıkça sorulan sorular tıklandığında açılıp kapanmalı, akıcı geçiş sağlanmalıdır.
- [x] AC-6 — SEO & Semantik Standartlar: Title, meta description, favicon ve semantik HTML hiyerarşisi (`<h1>`, `<h2>`) eksiksiz olmalıdır.
- [x] AC-7 — Kalite Kapısı & Test: Derleme hatası olmamalı, `pnpm --filter @kidscare/marketing build` ve `./scripts/check.ps1` %100 yeşil kalmalıdır.

## Definition of Done

- [x] Tüm 7 kabul kriteri tarayıcı ve derleme testleriyle doğrulanmış olmalı
- [x] `scripts/check.ps1` (Types + Lint + Test) %100 yeşil olmalı
- [x] Tasarım kalitesi KidsCare Impeccable Design System çıtasına uygun olmalı
- [x] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 0     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
