import type { ReactElement } from 'react';

export default function Navbar(): ReactElement {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
      }}
      className="kc-glass"
    >
      <div
        className="kc-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(15, 76, 58, 0.25)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Kids<span style={{ color: 'var(--color-accent)' }}>Care</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '-3px',
              }}
            >
              Ecosystem
            </span>
          </div>
        </a>

        {/* Nav Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <a
            href="#features"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              transition: 'color 0.2s',
            }}
          >
            Özellikler
          </a>
          <a
            href="#preview"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              transition: 'color 0.2s',
            }}
          >
            Arayüz Vitrini
          </a>
          <a
            href="#pricing"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              transition: 'color 0.2s',
            }}
          >
            Paketler
          </a>
          <a
            href="#faq"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              transition: 'color 0.2s',
            }}
          >
            Sıkça Sorulanlar
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <a
            href="https://kidscare-web.onrender.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="kc-btn kc-btn-outline"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            Giriş Yap
          </a>
          <a
            href="#demo"
            className="kc-btn kc-btn-primary"
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.9rem' }}
          >
            Demo Talep Et
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
