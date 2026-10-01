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
