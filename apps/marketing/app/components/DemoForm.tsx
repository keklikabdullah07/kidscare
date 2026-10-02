'use client';

import { useState, type FormEvent, type ReactElement } from 'react';

export default function DemoForm(): ReactElement {
  const [kindergartenName, setKindergartenName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCapacity, setStudentCapacity] = useState('31-75');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated lead generation submission
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = (): void => {
    setIsSubmitted(false);
    setKindergartenName('');
    setContactName('');
    setEmail('');
    setPhone('');
  };

  return (
    <section
      id="demo"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="kc-container">
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            borderRadius: '1.5rem',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--color-primary-border)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Decorative Header Accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              backgroundColor: 'var(--color-primary)',
            }}
          />

          {!isSubmitted ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span className="kc-badge kc-badge-primary" style={{ marginBottom: '1rem' }}>
                  Hemen Tanışalım
                </span>
                <h2
                  style={{
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    letterSpacing: '-0.02em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Kreşiniz İçin 14 Günlük Ücretsiz Demo Başlatın
                </h2>
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '560px',
                    margin: '0 auto',
                  }}
                >
                  Bilgilerinizi bırakın, kreş danışmanımız aynı gün içinde arayarak kurulumunuzu
                  tamamlasın ve canlı demo hesabınızı teslim etsin.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="kindergartenName"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Kreş / Anaokulu Adı *
                    </label>
                    <input
                      id="kindergartenName"
                      type="text"
                      required
                      placeholder="Örn: Minik Kalpler Anaokulu"
                      value={kindergartenName}
                      onChange={(e) => setKindergartenName(e.target.value)}
                      className="kc-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactName"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      placeholder="Örn: Ayşe Yılmaz (Kurucu)"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="kc-input"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Kurumsal E-posta *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="bilgi@minikkalpler.k12.tr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="kc-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Telefon Numarası *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="kc-input"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="studentCapacity"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Mevcut / Hedeflenen Öğrenci Kapasitesi
                  </label>
                  <select
                    id="studentCapacity"
                    value={studentCapacity}
                    onChange={(e) => setStudentCapacity(e.target.value)}
                    className="kc-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="1-30">1 - 30 Öğrenci (Butik Kreş)</option>
                    <option value="31-75">31 - 75 Öğrenci (Orta Ölçekli)</option>
                    <option value="76-150">76 - 150 Öğrenci (Geniş Kapasite)</option>
                    <option value="150+">150+ Öğrenci veya Çoklu Şube</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="kc-btn kc-btn-primary"
                    style={{
                      width: '100%',
                      padding: '1.1rem',
                      fontSize: '1.05rem',
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? 'Kaydınız İletiliyor...' : 'Ücretsiz Demo Talebini Gönder →'}
                  </button>
                </div>

                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '0.775rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.5rem',
                  }}
                >
                  🔒 Bilgileriniz KVKK kapsamında korunur ve üçüncü taraflarla asla paylaşılmaz.
                </p>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                ✓
              </div>

              <h3
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--color-text-main)',
                  marginBottom: '0.75rem',
                }}
              >
                Talebiniz Başarıyla Alındı!
              </h3>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  maxWidth: '520px',
                  margin: '0 auto 2rem auto',
                }}
              >
                Teşekkür ederiz <strong>{contactName}</strong>. <strong>{kindergartenName}</strong>{' '}
                için demo ortamınız hazırlanıyor. Müşteri temsilcimiz en kısa sürede{' '}
                <strong>{phone}</strong> numarasından sizinle iletişime geçecektir.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="kc-btn kc-btn-outline"
                style={{ padding: '0.85rem 1.75rem' }}
              >
                Yeni Talep Formu Aç
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
