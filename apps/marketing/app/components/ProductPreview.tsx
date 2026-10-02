import type { ReactElement } from 'react';

export default function ProductPreview(): ReactElement {
  return (
    <section
      id="preview"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="kc-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4.5rem auto' }}>
          <div className="kc-badge kc-badge-primary" style={{ marginBottom: '1rem' }}>
            Kusursuz Deneyim
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
            Hem Web’de Hem Cepte. Herkes İçin Tasarlandı.
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            İdareciler için büyük ekranda hızlı yönetim paneli; veliler ve öğretmenler için ise iOS
            ve Android’de saniyeler içinde açılan akıcı bir mobil uygulama.
          </p>
        </div>

        {/* Dual Preview Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Admin Web Console */}
          <div
            className="kc-card"
            style={{
              padding: '2rem',
              border: '2px solid var(--color-primary-border)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary)',
                  }}
                >
                  Yönetici & Öğretmen Paneli (Web)
                </span>
                <span className="kc-badge kc-badge-primary">Masaüstü & Tablet</span>
              </div>

              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--color-text-main)',
                  marginBottom: '0.75rem',
                }}
              >
                Tüm Kreşi Kuşbakışı Yönetin
              </h3>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                Sınıflar arası yoklama oranları, öğrenci sağlık pasaportları, yemek menüleri ve
                öğretmen yetkilendirmeleri tek ekranda.
              </p>

              {/* UI Simulation Component */}
              <div
                style={{
                  borderRadius: '0.875rem',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                    }}
                  >
                    Bugünkü Yoklama Özeti
                  </span>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}
                  >
                    %94 Katılım
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-border)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '94%',
                      height: '100%',
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span>
                    Geldi: <strong>48 Öğrenci</strong>
                  </span>
                  <span>
                    İzinli: <strong>3 Öğrenci</strong>
                  </span>
                  <span>
                    Raporlu: <strong>1 Öğrenci</strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <a
                href="https://kidscare-web.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="kc-btn kc-btn-outline"
                style={{ width: '100%' }}
              >
                Web Panelini Canlı İncele →
              </a>
            </div>
          </div>

          {/* Card 2: Mobile Parent Experience */}
          <div
            className="kc-card"
            style={{
              padding: '2rem',
              border: '2px solid var(--color-accent-border)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-accent-hover)',
                  }}
                >
                  Veli Mobil Uygulaması (iOS & Android)
                </span>
                <span className="kc-badge kc-badge-accent">Expo SDK 54</span>
              </div>

              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--color-text-main)',
                  marginBottom: '0.75rem',
                }}
              >
                Velilerin Cebinde 7/24 Huzur
              </h3>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                Çocuk kreşe girdiği anda sesli bildirim, öğlen yemek ve uyku detayları, akşam
                teslimat teyidi ve günün fotoğrafları tek ekranda.
              </p>

              {/* Mobile Card Simulation */}
              <div
                style={{
                  borderRadius: '0.875rem',
                  backgroundColor: 'var(--color-accent-light)',
                  border: '1px solid var(--color-accent-border)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>🌟</span>
                  <div>
                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--color-text-main)',
                      }}
                    >
                      Günün Karnesi Paylaşıldı!
                    </h4>
                    <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                      Ada bugün resim atölyesinde çok eğlendi.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="kc-badge kc-badge-primary" style={{ fontSize: '0.7rem' }}>
                    🥣 Kahvaltı: %100
                  </span>
                  <span className="kc-badge kc-badge-primary" style={{ fontSize: '0.7rem' }}>
                    😴 Uyku: 2 Saat
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <a href="#demo" className="kc-btn kc-btn-accent" style={{ width: '100%' }}>
                Mobil Uygulamayı Deneyimle →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
