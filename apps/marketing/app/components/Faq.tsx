'use client';

import { useState, type ReactElement } from 'react';

const FAQS = [
  {
    q: 'Kurulum ve geçiş süreci ne kadar sürer?',
    a: 'KidsCare’e geçiş oldukça hızlıdır. Mevcut öğrenci ve veli listelerinizi Excel ile içeri aktarabilir, sınıflarınızı 1 saat içinde oluşturup aynı gün içinde velilerinize davet gönderebilirsiniz.',
  },
  {
    q: 'Veliler uygulamayı nasıl indirip kullanacak?',
    a: 'Velileriniz iOS (App Store) veya Android (Google Play) üzerinden "KidsCare" uygulamasını tamamen ücretsiz indirir. Kreş yetkilisinin belirlediği e-posta ve güvenli geçici şifre ile ilk oturumlarını saniyeler içinde açarlar.',
  },
  {
    q: 'Öğrenci ve veli verileri ne kadar güvende? (KVKK)',
    a: 'KidsCare, kurumsal çok kiracılı (multi-tenant) veri mimarisine sahiptir. Her kreşin veritabanı alanı PostgreSQL Row-Level Security (RLS) ile diğerlerinden katı şekilde izole edilmiştir. Verileriniz şifrelenir ve üçüncü şahıslarla asla paylaşılmaz.',
  },
  {
    q: '14 Günlük ücretsiz deneme sürecinde kısıtlama var mı?',
    a: 'Hayır, deneme süreniz boyunca tüm modüller (Anlık Push Bildirimler, QR Teslimat, Günlük Karne, İlaç Takibi ve Fotoğraf Depolama) hiçbir özellik kısıtlaması olmaksızın kullanılabilir.',
  },
  {
    q: 'Öğretmenlerimizin sisteme alışması zor olur mu?',
    a: 'KidsCare arayüzü öğretmenlerin sınıf içindeki yoğun temposu düşünülerek tasarlandı. Yoklama almak 10 saniye, günlük karneleri kaydetmek ise sınıf başına yalnızca 2-3 dakika sürer.',
  },
];

export default function Faq(): ReactElement {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number): void => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="kc-container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4.5rem auto' }}>
          <div className="kc-badge kc-badge-primary" style={{ marginBottom: '1rem' }}>
            Merak Edilenler
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Sıkça Sorulan Sorular
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            Aklınıza takılan tüm soruların cevapları burada. Başka bir sorunuz varsa bize
            dilediğiniz zaman ulaşabilirsiniz.
          </p>
        </div>

        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="kc-card"
                style={{
                  padding: '1.5rem 2rem',
                  cursor: 'pointer',
                  borderColor: isOpen ? 'var(--color-primary-border)' : 'var(--color-border)',
                }}
                onClick={() => toggle(idx)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.075rem',
                      fontWeight: 700,
                      color: isOpen ? 'var(--color-primary)' : 'var(--color-text-main)',
                      transition: 'color 0.2s',
                    }}
                  >
                    {faq.q}
                  </h3>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isOpen
                        ? 'var(--color-primary-light)'
                        : 'var(--color-bg-base)',
                      color: isOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isOpen ? '−' : '+'}
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
