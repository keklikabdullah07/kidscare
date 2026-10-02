import type { ReactElement } from 'react';

const TIERS = [
  {
    name: 'Butik Kreş',
    desc: 'Yeni açılan veya 30 öğrenciye kadar butik anaokulları için ideal başlangıç paketi.',
    price: '₺1.490',
    period: '/ ay',
    popular: false,
    features: [
      '30 Öğrenciye Kadar Kapasite',
      'Sınırsız Veli & Öğretmen Hesabı',
      'Anlık Yoklama & Bildirimler',
      'Dijital Günlük Karne & Menü',
      'Mobil Veli Uygulaması (iOS & Android)',
      'E-posta ile Teknik Destek',
    ],
    ctaText: 'Hemen Başla',
    ctaClass: 'kc-btn-outline',
  },
  {
    name: 'Büyüyen Anaokulu',
    desc: '30-100 öğrenci kapasiteli, veli iletişiminde profesyonelleşmek isteyen kreşler.',
    price: '₺2.990',
    period: '/ ay',
    popular: true,
    features: [
      '100 Öğrenciye Kadar Kapasite',
      'Tüm Butik Kreş Özellikleri',
      'Güvenli QR Kodlu Teslimat Protokolü',
      'Çift Teyitli İlaç Takip Sistemi',
      'Bulut Fotoğraf & Etkinlik Albümü',
      'Öğrenci Sağlık Pasaportu',
      'Öncelikli WhatsApp Destek Hattı',
    ],
    ctaText: '14 Gün Ücretsiz Dene',
    ctaClass: 'kc-btn-primary',
  },
  {
    name: 'Zincir & Kurumsal',
    desc: 'Çok şubeli kreşler, kolejler ve franchise anaokulu zincirleri için tam çözüm.',
    price: 'Özel Teklif',
    period: '',
    popular: false,
    features: [
      'Sınırsız Şube & Öğrenci Kapasitesi',
      'Merkezi Çoklu Şube Yönetim Konsolu',
      'AI Destekli Pedagojik Gelişim Raporu',
      'Özel Alan Adı & Kurumsal Kimlik Giydirme',
      'Özel Sunucu & RLS Veri İzolasyonu',
      '7/24 Kesintisiz Özel Danışman',
    ],
    ctaText: 'Teklif Alın',
    ctaClass: 'kc-btn-outline',
  },
];

export default function Pricing(): ReactElement {
  return (
    <section
      id="pricing"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="kc-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4.5rem auto' }}>
          <div className="kc-badge kc-badge-accent" style={{ marginBottom: '1rem' }}>
            Şeffaf Fiyatlandırma
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
            Sürpriz Maliyet Yok. Büyüklüğünüze Uygun Paketler.
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            Tüm paketlerde 14 gün koşulsuz ücretsiz deneme hakkı dahildir. Kurulum ücreti veya gizli
            aidat bulunmaz.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="kc-card"
              style={{
                padding: '2.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: tier.popular
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                boxShadow: tier.popular ? 'var(--shadow-xl)' : 'var(--shadow-md)',
              }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span
                    className="kc-badge kc-badge-accent"
                    style={{
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    ★ En Çok Tercih Edilen
                  </span>
                </div>
              )}

              <div>
                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {tier.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '1.75rem',
                    minHeight: '42px',
                  }}
                >
                  {tier.desc}
                </p>

                {/* Price Display */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.35rem',
                    marginBottom: '2rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {tier.period}
                  </span>
                </div>

                {/* Features List */}
                <div
                  style={{
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--color-border-subtle)',
                    marginBottom: '2rem',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem',
                    }}
                  >
                    Paket Kapsamı
                  </span>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    {tier.features.map((item) => (
                      <li
                        key={item}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          fontSize: '0.9rem',
                          color: 'var(--color-text-main)',
                        }}
                      >
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <a
                  href="#demo"
                  className={`kc-btn ${tier.ctaClass}`}
                  style={{ width: '100%', padding: '0.95rem 1.5rem' }}
                >
                  {tier.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
