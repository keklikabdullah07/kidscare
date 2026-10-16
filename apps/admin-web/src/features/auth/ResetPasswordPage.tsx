import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { verifyResetToken, resetPassword } from '../../api/auth';
import { TactileButton } from '../../components/ui/TactileButton';

export function ResetPasswordPage(): ReactNode {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setTokenValid(false);
          setInvalidReason(
            'Sıfırlama kodu bulunamadı. Lütfen e-postanızdaki bağlantıyı tam olarak kopyalayınız.',
          );
          setVerifying(false);
        }
        return;
      }

      try {
        const res = await verifyResetToken(token);
        if (isMounted) {
          if (res.valid) {
            setTokenValid(true);
            setRecipientEmail(res.email ?? null);
          } else {
            setTokenValid(false);
            if (res.reason === 'EXPIRED') {
              setInvalidReason('Bu şifre sıfırlama bağlantısının 15 dakikalık süresi dolmuş.');
            } else if (res.reason === 'ALREADY_USED') {
              setInvalidReason('Bu şifre sıfırlama bağlantısı daha önce kullanılmış.');
            } else {
              setInvalidReason('Geçersiz veya hatalı sıfırlama bağlantısı.');
            }
          }
          setVerifying(false);
        }
      } catch {
        if (isMounted) {
          setTokenValid(false);
          setInvalidReason(
            'Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol ediniz.',
          );
          setVerifying(false);
        }
      }
    }

    void checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown redirect on success
  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, navigate]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 8) {
      setFormError('Şifreniz en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#090D16] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <Link to="/login" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#131B2E] p-2 border border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex items-center justify-center">
            <img
              src="/brand/kidscare-icon.png"
              alt="KidsCare"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Kids<span className="text-[#115e59] dark:text-teal-400">Care</span>
          </span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="rounded-3xl bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 shadow-[0_4px_0_0_#D5CBB9,0_12px_28px_-4px_rgba(45,38,30,0.08)] dark:shadow-[0_4px_0_0_#1E293B,0_12px_28px_-4px_rgba(0,0,0,0.5)] p-6 sm:p-8">
          {verifying ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Sıfırlama bağlantısı doğrulanıyor...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Geçersiz veya Süresi Dolmuş Bağlantı
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {invalidReason}
              </p>
              <div className="pt-2">
                <Link to="/login" className="block w-full">
                  <TactileButton
                    variant="teal"
                    className="w-full justify-center py-3 text-sm font-semibold"
                  >
                    Giriş Ekranına Dön
                  </TactileButton>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Şifreniz Güncellendi!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Yeni şifreniz başarıyla kaydedildi. {countdown} saniye içinde giriş ekranına
                yönlendiriliyorsunuz...
              </p>
              <div className="pt-2">
                <Link to="/login" className="block w-full">
                  <TactileButton
                    variant="teal"
                    className="w-full justify-center py-3 text-sm font-semibold"
                  >
                    Şimdi Giriş Yap <ArrowRight className="w-4 h-4 ml-1.5" />
                  </TactileButton>
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-2xl mb-2">
                  🔐
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Yeni Şifre Belirleyin
                </h1>
                {recipientEmail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <strong className="text-slate-700 dark:text-slate-300">{recipientEmail}</strong>{' '}
                    hesabı için şifre güncelleniyor.
                  </p>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={submitting}
                      className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs"
                      placeholder="En az 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showPassword ? 'Gizle' : 'Göster'}
                      aria-label={showPassword ? 'Gizle' : 'Göster'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Yeni Şifre Tekrarı
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs"
                      placeholder="Şifrenizi doğrulayın"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <TactileButton
                  type="submit"
                  variant="teal"
                  disabled={submitting}
                  className="w-full justify-center py-3 text-sm font-semibold"
                >
                  {submitting ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
                </TactileButton>
              </div>
            </form>
          )}
        </div>

        {/* Security Footnote */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          <span>256-bit SSL Güvenli Bağlantı · KidsCare</span>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-2 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} KidsCare Okul Öncesi Portalı. Tüm hakları saklıdır.
      </div>
    </div>
  );
}
