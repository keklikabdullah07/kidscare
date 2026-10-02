import type { ReactElement } from 'react';

export default function Footer(): ReactElement {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '4.5rem',
        paddingBottom: '3rem',
      }}
    >
      <div className="kc-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Column 1: Brand & Identity */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.65rem',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.03em',
                }}
              >
                Kids<span style={{ color: 'var(--color-accent)' }}>Care</span>
              </span>
            </div>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              Yeni nesil kreş, anaokulu ve çocuk kulübü yönetim ekosistemi. Çocuğunuzun kreş günü,
              tek bir uygulamada.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="kc-badge kc-badge-primary" style={{ fontSize: '0.7rem' }}>
                🛡️ KVKK Uyumlu
              </span>
              <span className="kc-badge kc-badge-accent" style={{ fontSize: '0.7rem' }}>
                🔒 256-bit SSL
              </span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                marginBottom: '1.25rem',
              }}
            >
              Platform
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <li>
                <a
                  href="#features"
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                >
                  Özellikler & Modüller
                </a>
              </li>
              <li>
                <a
                  href="#preview"
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                >
                  Mobil & Web Arayüzü
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                >
                  Paketler & Fiyatlar
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                >
                  Sıkça Sorulan Sorular
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Portals */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                marginBottom: '1.25rem',
              }}
            >
              Kullanıcı Girişleri
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <li>
                <a
                  href="https://kidscare-web.onrender.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Yönetici Web Paneli →
                </a>
              </li>
              <li>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Veli Mobil Girişi (iOS & Android)
                </span>
              </li>
              <li>
                <a href="#demo" style={{ color: 'var(--color-accent-hover)', fontWeight: 600 }}>
                  Yeni Kreş Demo Talebi →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                marginBottom: '1.25rem',
              }}
            >
              İletişim & Destek
            </h4>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}
            >
              📍 Maslak Teknoloji Vadisi, İstanbul
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}
            >
              ✉️ destek@kidscare.com
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              📞 0850 300 00 00
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <p>© {new Date().getFullYear()} KidsCare Technologies. Tüm hakları saklıdır.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'inherit' }}>
              Kullanım Koşulları
            </a>
            <a href="#" style={{ color: 'inherit' }}>
              Gizlilik Politikası
            </a>
            <a href="#" style={{ color: 'inherit' }}>
              KVKK Aydınlatma Metni
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
