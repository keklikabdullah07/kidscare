import type { ReactElement } from 'react';

const FEATURES = [
  {
    icon: '⏰',
    title: 'Anlık Yoklama & Bildirimler',
    desc: 'Öğretmen sınıfa giren öğrenciyi işaretlediği anda velinin telefonuna sesli anlık bildirim gider. Sabah telaşında veliler huzur bulur.',
    badge: 'Anlık Expo Push',
  },
  {
    icon: '🚗',
    title: 'Güvenli Teslimat Protokolü',
    desc: 'Çocuğu yalnızca velinin önceden izin verdiği akraba veya servis personeli teslim alabilir. Teslim anı fotoğraflı ve saatli kaydedilir.',
    badge: 'Yetkili Kontrolü',
  },
  {
    icon: '🌟',
    title: 'Dijital Günlük Karne',
    desc: 'Kahvaltı, öğle yemeği porsiyonları, uyku süreleri, tuvalet rutini ve günün etkinlik notları tek dokunuşla veliyle paylaşılır.',
    badge: 'Kağıtsız Kreş',
  },
  {
    icon: '💊',
    title: 'Çift Teyitli İlaç Takibi',
    desc: 'Veli ilacın dozunu ve saatini sisteme girer, idare onaylar. Öğretmen ilacı içirdiği an veliye "İlaç verildi" bildirimi düşer.',
    badge: 'Sıfır Hata',
  },
  {
    icon: '📸',
    title: 'Güvenli Medya & Etkinlik Albümü',
    desc: 'Günün fotoğraf ve videoları kreşin kendi izole alanında saklanır. Başka kreşler veya yabancılar asla erişemez.',
    badge: 'Bulut & R2 İzolasyonu',
  },
  {
    icon: '🤖',
    title: 'AI Pedagojik Gelişim Takibi',
    desc: 'Öğretmenin gözlemleri yapay zeka ile harmanlanarak MEB okul öncesi gelişim alanlarına (dil, motor, sosyal) göre karne özeti üretir.',
    badge: 'Yapay Zeka Destekli',
  },
];

export default function Features(): ReactElement {
  return (
    <section
      id="features"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="kc-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 4.5rem auto' }}>
          <div className="kc-badge kc-badge-accent" style={{ marginBottom: '1rem' }}>
            Kapsamlı Modül Mimarisi
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
            Kreş Yönetiminde İhtiyacınız Olan Her Şey Tek Bir Çatıda.
          </h2>
          <p
            style={{
              fontSize: '1.075rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            KidsCare, öğretmenlerin iş yükünü yarıya indirirken kreş sahiplerine tam denetim,
            velilere ise 7/24 kesintisiz güven ortamı sağlar.
          </p>
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="kc-card"
              style={{
                padding: '2.25rem',
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
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: '1rem',
                      backgroundColor: 'var(--color-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <span className="kc-badge kc-badge-primary" style={{ fontSize: '0.75rem' }}>
                    {feat.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-main)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {feat.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.65,
                  }}
                >
                  {feat.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <span>Nasıl çalışır?</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
