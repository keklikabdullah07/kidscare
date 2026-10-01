# ADR 0006: KidsCare Impeccable Design System Standartları

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-10-01
- **Karar Vericiler:** UI/UX & Frontend Ekibi

---

## Bağlam (Context)

Yönetim paneli soğuk kurumsal şablonlardan veya rastgele Bootstrap/Tailwind renklerinden arındırılmalı; kreş ortamının sıcaklığını, güvenini ve dünya standartlarında bir yazılımın zarafetini yansıtmalıdır.

## Karar (Decision)

1. **Renk Paleti:**
   - İskandinav Adaçayı / Derin Çam Yeşili (`bg-teal-700`, `text-teal-900`, `dark:bg-slate-800`) birincil renk.
   - Bal Kehribarı / Güneş Işığı (`bg-amber-500`, `text-amber-800`) vurgu rengi.
   - Koyu modda derin obsidyen `#090D16` ve `#131B2E`.
2. **Dayanıklı UI (Hardening):**
   - İsim taşmalarında `min-w-0 flex-1 truncate` + `title="..."`.
   - Tüm görsellerde `onError` koruması ve yedek avatar.
   - Soğuk "Veri yok" yerine ikonlu ve yönlendirici `<EmptyState>`.
   - Kartlarda mikro hover (`hover:-translate-y-1`), butonlarda mikro basma hissi (`active:scale-95`).

## Sonuçlar (Consequences)

- **Olumlu:** Kullanıcı memnuniyeti ve görsel güven hissi üst seviyeye çıkarıldı.
- **Olumsuz:** Yeni bileşen ekleyen geliştiriciler ad-hoc renk kullanamaz, tasarım kurallarına uymak zorundadır.
