# 0041 — Gezi & Etkinlik İzin Yönetimi Modülü (Admin, Öğretmen, Veli)

## 1. Kapsam ve Gerekçe

Kreşlerde müze, tiyatro, doğa gezisi gibi okul dışı etkinliklerde kağıt izin formlarının toplanması, servis yolcu listesinin hazırlanması ve velilerin geçmiş izin kayıtlarını inceleyebilmesi için 3 role (Admin, Öğretmen, Veli) hizmet veren bağımsız bir `🎪 Geziler & İzinler` modülü oluşturulması.

## 2. Kullanıcı Hikayeleri

- **Yönetici (Admin):** Yeni gezi tanımlayabilmeli, hedef sınıfları belirleyebilmeli, anlık izin istatistiklerini (onaylayan/katılmayan/bekleyen) izleyebilmeli ve servis listesi çıktısı alabilmelidir.
- **Öğretmen (Teacher):** Sınıfının geziye katılım durumunu görebilmeli, veli özel notlarını (astım, alerji, hassasiyet) takip edebilmeli ve gezi günü biniş yoklaması yapabilmelidir.
- **Veli (Parent):** Sol menüden tüm aktif ve geçmiş gezileri görebilmeli, detayları inceleyip tek dokunuşla dijital izin/ret verebilmeli, ana sayfada ise yalnızca bekleyen onaylar için yönlendirici bildirim almalıdır.

## 3. İlgili Belgeler

- Plan: `specs/plans/0041-events-and-consents-management-page-plan.md`
- Veritabanı Modelleri: `EventConsent`, `EventConsentResponse`
