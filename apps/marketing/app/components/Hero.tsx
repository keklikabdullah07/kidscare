import type { ReactElement } from 'react';

export default function Hero(): ReactElement {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: '5rem',
        paddingBottom: '6rem',
        overflow: 'hidden',
      }}
    >
      <div className="kc-radial-glow" />

      <div className="kc-container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headlines & CTA */}
          <div>
            <div className="kc-badge kc-badge-primary" style={{ marginBottom: '1.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                }}
              />
              Yeni Nesil Kreş & Anaokulu Yönetimi
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-main)',
                marginBottom: '1.5rem',
              }}
            >
              Kreşinizi Tek Merkezden Yönetin,{' '}
              <span
                style={{
                  color: 'var(--color-primary)',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                Velilerinizin
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    right: 0,
                    height: '6px',
                    backgroundColor: 'var(--color-accent)',
                    borderRadius: '4px',
                    opacity: 0.8,
                  }}
                />
              </span>{' '}
              Güvenini Kazanın.
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
                marginBottom: '2.5rem',
                maxWidth: '540px',
              }}
            >
              Yoklamadan günlük karneye, anlık veli push bildirimlerinden güvenli teslimat
              protokolüne — kreşinizin tüm operasyonel karmaşasını dijitalleştirin. WhatsApp
              gruplarına ve kağıt formlara veda edin.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '3rem',
              }}
            >
              <a
                href="#demo"
                className="kc-btn kc-btn-primary"
                style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
              >
                Ücretsiz Demo Başlat
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="#features"
                className="kc-btn kc-btn-outline"
                style={{ fontSize: '1.05rem', padding: '1rem 1.75rem' }}
              >
                Özellikleri İncele
              </a>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                  }}
                >
                  %100
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                  }}
                >
                  KVKK Uyumlu İzolasyon
                </span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '2rem',
                  backgroundColor: 'var(--color-border)',
                }}
              />
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-accent-hover)',
                  }}
                >
                  Anlık
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                  }}
                >
                  Sesli Push Bildirimleri
                </span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '2rem',
                  backgroundColor: 'var(--color-border)',
                }}
              />
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                  }}
                >
                  Sıfır
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                  }}
                >
                  Kağıt & WhatsApp Kargaşası
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interface Mockup Simulation */}
          <div style={{ position: 'relative' }}>
            {/* Background Decorative Blob */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                bottom: '-20px',
                left: '-20px',
                background:
                  'linear-gradient(135deg, rgba(15, 76, 58, 0.12) 0%, rgba(245, 158, 11, 0.15) 100%)',
                borderRadius: '2rem',
                transform: 'rotate(-2deg)',
                zIndex: 0,
              }}
            />

            {/* Main Interactive Card */}
            <div
              className="kc-card"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '2rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.75rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    👧
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--color-text-main)',
                      }}
                    >
                      Ada Yılmaz
                    </h3>
                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Papatyalar Sınıfı (4 Yaş)
                    </p>
                  </div>
                </div>
                <span className="kc-badge kc-badge-accent">Bugün Aktif</span>
              </div>

              {/* Simulated Push Notification Toast */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1rem',
                  borderRadius: '0.875rem',
                  backgroundColor: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-border)',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      Anlık Bildirim
                    </span>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Şimdi
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--color-text-main)',
                      fontWeight: 500,
                    }}
                  >
                    ⏰ Ada kreşe giriş yaptı. Öğretmeni Elif karşıladı.
                  </p>
                </div>
              </div>

              {/* Daily Report Miniature Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--color-bg-base)',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Yemek
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                    }}
                  >
                    Tamamı Bitti 🥣
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--color-bg-base)',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Öğle Uykusu
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--color-accent-hover)',
                    }}
                  >
                    1s 45dk 😴
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--color-bg-base)',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Modu
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                    }}
                  >
                    Çok Neşeli 🎨
                  </span>
                </div>
              </div>

              {/* Medication Protocol Simulation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>💊</span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                    }}
                  >
                    Alerji Şurubu (1 Ölçek)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                >
                  ✓ 13:30 Verildi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
