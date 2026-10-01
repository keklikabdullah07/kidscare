# ADR 0003: NestJS + tsx watch Altında Açık @Inject Kullanımı

- **Durum:** Kabul Edildi (Accepted - Değiştirilemez Kural)
- **Tarih:** 2026-09-20
- **Karar Vericiler:** Mimari Ekip

---

## Bağlam (Context)

NestJS normalde TypeScript'in `emitDecoratorMetadata` özelliğini kullanarak constructor parametre tiplerini otomatik çözer. Ancak hızlı geliştirme için `tsx watch` kullanıldığında, esbuild tabanlı dönüştürücü metadata tiplerini eksik verebilmekte ve NestJS DI konteyneri parametreleri `undefined` olarak görerek çalışma zamanında çökmektedir.

## Karar (Decision)

Tüm Controller, Service, Repository, Guard ve Middleware sınıflarının constructor parametrelerinde **açıkça `@Inject(SınıfAdı)` kullanılacaktır**.

```ts
// KURAL:
constructor(
  @Inject(PrismaService) private readonly prisma: PrismaService,
  @Inject(StudentsRepository) private readonly repo: StudentsRepository
) {}
```

## Sonuçlar (Consequences)

- **Olumlu:** `tsx watch` ile saliseler içinde sıcak yeniden başlatma (hot reload) sağlanırken hiçbir çalışma zamanı DI hatası yaşanmaz.
- **Olumsuz:** Yeni servis enjekte ederken `@Inject(...)` yazma disiplini elden bırakılmamalıdır.
