import { useState, type FormEvent, type ReactNode } from 'react';
import { forgotPassword } from '../../api/auth';
import { TactileButton } from '../../components/ui/TactileButton';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  initialSlug = '',
}: ForgotPasswordModalProps): ReactNode {
  const [slug, setSlug] = useState(initialSlug);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    const cleanSlug = slug.trim().toLowerCase();
    const cleanEmail = email.trim();

    if (!cleanSlug) {
      setError('Lütfen kreş kodunu (slug) giriniz.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ tenantSlug: cleanSlug, email: cleanEmail });
      setSubmitted(true);
    } catch (err) {
      // Even on network error, maintain safe feedback
      setError(err instanceof Error ? err.message : 'Bağlantı isteği gönderilemedi.');
    } finally {
      setLoading(false);
    }
  }

  function handleResetAndClose() {
    setError(null);
    setSubmitted(false);
    setEmail('');
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Kapat"
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-3xl shadow-sm">
              ✉️
            </div>
            <h3
              id="forgot-password-title"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Bağlantı Gönderildi!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Eğer <strong>{email}</strong> adresi <strong>{slug}</strong> kreşinde kayıtlıysa,
              şifre sıfırlama talimatları e-posta kutunuza iletilmiştir.
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-left">
              ⏳ <strong>Bilgi:</strong> Güvenlik sebebiyle sıfırlama linki{' '}
              <strong>15 dakika</strong> geçerlidir. Gelen kutusunda bulamazsanız spam / gereksiz
              klasörünü kontrol ediniz.
            </div>
            <div className="pt-2">
              <TactileButton
                variant="teal"
                onClick={handleResetAndClose}
                className="w-full justify-center py-3 text-sm font-semibold"
              >
                Giriş Ekranına Dön
              </TactileButton>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-5"
          >
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-2xl mb-2">
                🔑
              </div>
              <h3
                id="forgot-password-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Şifremi Unuttum
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kayıtlı kreş kodunuzu ve e-posta adresinizi giriniz.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-slug"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Kreş Kodu (Slug)
                </label>
                <input
                  id="forgot-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Örn: demo"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Kayıtlı E-posta Adresi
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="veli@ornek.com"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <TactileButton
                type="submit"
                variant="teal"
                disabled={loading}
                className="w-full justify-center py-3 text-sm font-semibold"
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </TactileButton>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
