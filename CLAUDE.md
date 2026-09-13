# KidsCare — Proje Kuralları (Claude Code için)

> **Not:** Bu proje şu anda MiniMax-M3 modeliyle çalıştırılıyor. Bu dosyadaki kurallar bilerek **çok somut ve az yoruma açık** yazıldı — model, mimariyi kendi inisiyatifiyle değil, buradaki şablonları birebir takip ederek uygulamalı. Belirsiz bir durumda agent **tahmin etmemeli**, bu dosyadaki en yakın örneğe bakmalı veya kullanıcıya sormalı.

## 1. Proje Özeti
- **Ürün:** Çoklu kreşe satılabilir multi-tenant SaaS (KidsCare)
- **Stack:** NestJS (backend) + PostgreSQL + Prisma + React/Vite (admin panel) + React Native/Expo (mobil) + Next.js (pazarlama sitesi)
- **Monorepo:** Turborepo, `/apps` ve `/packages` altında

## 2. Değiştirilemez Mimari Kararlar (agent bunları SORGULAMAZ, DEĞİŞTİRMEZ)
- Monorepo yapısı: `/apps/api`, `/apps/admin-web`, `/apps/marketing`, `/apps/mobile`, `/packages/shared-types`, `/packages/shared-schemas`
- Multi-tenancy: PostgreSQL Row-Level Security + Prisma middleware ile `tenant_id` filtrelemesi — **her tabloda `tenant_id` kolonu zorunlu** (global/lookup tabloları hariç)
- Backend mimarisi: NestJS modülerlik — her domain kendi modülü (`students`, `payments`, `tenants`, `auth`, `messages`, `attendance`)
- Veri paylaşımı: DTO/interface tanımları `packages/shared-types` içinde tanımlanır, hem backend hem frontend/mobil buradan import eder — **asla aynı tipi iki yerde ayrı ayrı tanımlama**

## 3. Modül Şablonu (HER yeni modül birebir bu yapıda olmalı)

Örnek: `students` modülü

```
apps/api/src/modules/students/
├── students.module.ts
├── controllers/
│   └── students.controller.ts
├── services/
│   └── students.service.ts
├── dto/
│   ├── create-student.dto.ts
│   ├── update-student.dto.ts
│   └── student-response.dto.ts
├── entities/
│   └── student.entity.ts
├── repositories/
│   └── students.repository.ts
└── students.spec.ts
```

**Kural:** Controller iş mantığı içermez, sadece service çağırır. Service, doğrudan Prisma client'ı kullanmaz — repository katmanı üzerinden erişir. Bu katman ayrımı SOLID'in Dependency Inversion prensibinin somut uygulamasıdır — agent bunu atlayıp controller içinde Prisma sorgusu yazmamalı.

## 4. İsimlendirme Standardı
- Dosyalar: `kebab-case.ts` (örn. `create-student.dto.ts`)
- Sınıflar: `PascalCase` (örn. `StudentsService`)
- Değişken/metod: `camelCase`
- Interface/DTO isimleri fiil içermez, isim içerir (`CreateStudentDto`, `StudentResponseDto` — `MakeStudentDto` gibi isimler kullanılmaz)
- Her modülün ana servis metodu isimlendirmesi: `create`, `findAll`, `findOne`, `update`, `remove` (NestJS CRUD konvansiyonu — tutarlılık için sapılmaz)

## 5. Tenant İzolasyon Kuralı (KRİTİK — güvenlik açığı riski)
- Her repository metodu, sorgusuna `tenant_id` filtresini **otomatik olarak** bir base repository/guard katmanından almalı, controller veya service seviyesinde manuel eklenmez
- Yeni bir endpoint yazılırken agent önce şunu kontrol eder: "Bu endpoint tenant-scoped mi?" — cevap evet ise `@UseGuards(TenantGuard)` decorator'ı zorunlu
- Test yazarken her yeni endpoint için en az bir "farklı tenant'ın verisine erişememeli" test senaryosu eklenir

## 6. SOLID Prensiplerinin Somut Uygulaması
- **Single Responsibility:** Bir service dosyası 200 satırı geçiyorsa, muhtemelen ikiye bölünmesi gerekiyor demektir — agent bunu fark ettiğinde kullanıcıya bildirir, sessizce büyütmez
- **Dependency Inversion:** Service'ler somut sınıflara değil, interface'lere bağımlı olur (örn. `IStudentsRepository`) — özellikle dış servis entegrasyonlarında (ödeme, dosya depolama) bu zorunlu
- **Open/Closed:** Yeni bir bildirim türü eklerken mevcut `NotificationService`'i değiştirmek yerine yeni bir strateji/handler eklenir

## 7. Yasaklı Kalıplar (agent bunları ASLA yapmaz)
- Controller içinde doğrudan Prisma/veritabanı sorgusu
- `any` tipi kullanımı (kesinlikle gerekliyse açıklama yorumu ile)
- Tenant filtresi olmadan doğrudan `findMany`/`findFirst` çağrısı
- Aynı DTO/interface'in birden fazla dosyada yeniden tanımlanması
- Bir modülün başka bir modülün repository'sine doğrudan erişmesi (aralarında her zaman service katmanı üzerinden iletişim kurulur)

## 8. Belirsizlik Durumunda Davranış
Bu dosyada karşılığı olmayan bir mimari karar gerektiğinde (yeni bir desen, yeni bir üçüncü parti servis entegrasyonu, DB şema değişikliği gibi), agent **kendi kararını uygulamaz** — seçenekleri kısaca özetleyip kullanıcıdan onay ister.

## 9. Test Beklentisi
- Her yeni service metodu için en az 1 mutlu senaryo + 1 hata senaryosu testi
- Tenant izolasyonu içeren her endpoint için izolasyon testi zorunlu (bkz. Bölüm 5)
