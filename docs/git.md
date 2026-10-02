# KidsCare Git ve Sürüm Kontrol Kuralları (Git Guidelines)

Bu belge, KidsCare projesinde branch yönetimi, commit standartları ve sürüm kontrol akışını tanımlar.

---

## 1. Dal (Branch) Stratejisi

- **`main`:** Canlı ortam (Production). Dokploy VPS burayı dinler. Asla doğrudan `main` üzerine commit atılmaz; sadece test edilmiş ve onaylanmış kodlar buraya merge edilir.
- **`developer`:** Aktif geliştirme dalı. Günlük özellikler, entegrasyon testleri ve düzeltmeler bu dalda toplanır.
- **Özellik Dalları (`feat/<feature-name>`):** Yeni bir ekran veya büyük bir modül geliştirilirken açılır, testler geçince `developer` dalına PR açılır.
- **Hata Düzeltme Dalları (`fix/<bug-name>`):** Hata çözümleri için kısa ömürlü dallar.

---

## 2. Commit Mesaj Standartları (Conventional Commits)

Tüm commit mesajları standart ve açıklayıcı formatta olmalıdır:

```
<tip>(<kapsam>): <kısa açıklama>
```

### Örnek Tipler:

- `feat(web)`: Yeni bir arayüz özelliği (Örn: `feat(web): add medication tracking modal`)
- `feat(api)`: Yeni bir endpoint veya servis (Örn: `feat(api): implement attendance statistics repository`)
- `fix(mobile)`: Mobil hatası düzeltmesi (Örn: `fix(mobile): resolve android cleartext traffic issue`)
- `docs(specs)`: Şartname veya mimari belge güncellemesi (Örn: `docs(specs): add web v1 audit spec`)
- `chore`: Bağımlılık, build veya konfigürasyon güncellemesi (Örn: `chore: update pnpm lockfile`)
- `test`: Birim veya E2E test ekleme (Örn: `test(e2e): add playwright login flow test`)

---

## 3. Pull Request ve Kalite Kapısı

Bir branch `developer` veya `main` dalına merge edilmeden önce:

1. `scripts/check.ps1` veya `scripts/check` yerel ortamda çalıştırılmış ve **tamamı yeşil** olmalıdır.
2. Kod stili `prettier` ve `eslint` kurallarına uymalıdır.
3. Kırıcı bir değişiklik (breaking change) varsa ilgili `ADR` belgesi güncellenmelidir.

---

## 4. Küçük / Trivial Değişiklik Politikası (Trivial-Change Policy)

KidsCare projesinde tek kişilik geliştirme ortamında hız ve disiplin dengesi şu kurallarla korunur:

1. **Hızlı Yol (Trivial Lane):**
   - İmla hataları (typo), buton metinleri, CSS renk/boşluk mikro-ayarları ve açıklama satırları gibi iş mantığını değiştirmeyen yüzeysel değişiklikler için tam şartname (`specs/`) açılması gerekmez.
   - Doğrudan ilgili dalda commit edilebilir.
2. **Özensizlik Yasağı (Kalite Kapısı Asla Atlanamaz):**
   - Tek kişi geliştirmek asla gevşek veya özensiz kod anlamına gelmez.
   - En ufak bir CSS veya metin değişikliğinde dahi `./scripts/check.ps1` (Typecheck + Lint + Test) çalıştırılmalı ve yeşil olduğu doğrulanmalıdır.
3. **Şartnameye Zorunlu Durumlar:**
   - Yeni bir özellik (feature), veri modeli değişikliği, API sözleşmesi, yetkilendirme veya iş mantığına dokunan her değişiklik **kesinlikle şartname (`specs/active/`) ve plan (`specs/plans/`) süzgecinden geçer.**
