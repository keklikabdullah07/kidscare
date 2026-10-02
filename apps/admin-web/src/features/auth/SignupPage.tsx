import { useState, type FormEvent, type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  Link as LinkIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from '../../components/ThemeContext';

function useSafeTheme() {
  try {
    return useTheme();
  } catch {
    return {
      isDark:
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
      toggleTheme: () => {
        if (typeof document !== 'undefined') {
          const isDark = document.documentElement.classList.toggle('dark');
          localStorage.setItem('kidscare_theme_v2', isDark ? 'dark' : 'light');
        }
      },
    };
  }
}

export function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const { signup, state } = useAuth();
  const theme = useSafeTheme();

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const error = state.status === 'unauthenticated' ? state.error : null;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await signup(slug, name, email, password);
      void navigate('/', { replace: true });
    } catch {
      // error already on state
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-[#faf9f6] dark:bg-[#090D16] p-4 sm:p-6 transition-colors overflow-hidden selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-950 dark:selection:text-teal-300">
      {/* Ambient background glow orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/12 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/12 rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Theme Toggle (Always visible in top right) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={theme.toggleTheme}
          className="px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-md backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs font-bold cursor-pointer"
          title={theme.isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          aria-label={theme.isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
        >
          {theme.isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Açık Mod</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-teal-700" />
              <span>Koyu Mod</span>
            </>
          )}
        </button>
      </div>

      {/* Top Header Toolbar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 py-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 p-1.5 shadow-2xs border border-teal-100/80 dark:border-slate-700/80 flex items-center justify-center">
            <img
              src="/brand/kidscare-icon.png"
              alt="KidsCare"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white">
            Kids<span className="text-teal-700 dark:text-teal-400">Care</span>
          </span>
        </div>
      </div>

      {/* Main Split Layout Container */}
      <div className="w-full max-w-6xl mx-auto my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4 sm:py-8 lg:py-10">
        {/* LEFT COLUMN: Kocaman KidsCare Logo & Brand Showcase (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col items-start text-left space-y-6 pr-4">
          {/* Kocaman Logo Badge with Ambient Glow */}
          <div className="relative group">
            <div className="w-52 h-52 xl:w-56 xl:h-56 rounded-4xl bg-white dark:bg-[#FAF8F5] p-6 lg:p-7 shadow-2xl border border-teal-100/90 dark:border-amber-200/40 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <img
                src="/brand/kidscare-icon.png"
                alt="KidsCare Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-teal-500/20 dark:bg-amber-400/15 rounded-4xl blur-2xl -z-10 group-hover:bg-teal-500/30 transition-colors pointer-events-none" />
          </div>

          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dakikalar İçinde Kurulum</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Kids<span className="text-teal-700 dark:text-teal-400">Care</span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                Kreş Kayıt
              </span>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Kreşinizi KidsCare bulut platformuna taşıyın. Öğrenci, veli ve öğretmen yönetimini tek
              bir modern merkezden yürütün.
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg pt-1 text-left">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#131B2E]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Hemen Başlayın
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Anında aktif kreş paneli
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#131B2E]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  %100 Güvenli & KVKK
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  İzole tenant veri tabanı
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Signup Card */}
        <div className="lg:col-span-6 xl:col-span-5 w-full max-w-[430px] mx-auto">
          {/* Mobile-only clean brand mark */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center mb-5">
            <div className="w-18 h-18 rounded-2xl bg-white dark:bg-[#FAF8F5] p-3 shadow-md border border-teal-100/90 dark:border-amber-200/40 flex items-center justify-center mb-2.5">
              <img
                src="/brand/kidscare-icon.png"
                alt="KidsCare Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Kids<span className="text-teal-700 dark:text-teal-400">Care</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                Kayıt
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Yeni Kreş Portalı Kaydı
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-700/80 shadow-xl dark:shadow-2xl dark:shadow-black/50 p-6 sm:p-8 space-y-5">
            {/* Card Header */}
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight text-center lg:text-left">
                Yeni Kreş Hesabı
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center lg:text-left">
                Kurumunuzu KidsCare ailesine dahil edin
              </p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
              {/* Kreş adı */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Kreş adı
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={128}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="Minik Adımlar Kreşi"
                  />
                </div>
              </div>

              {/* Kreş slug */}
              <div>
                <label
                  htmlFor="signup-slug"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Kreş slug
                  <span className="text-[11px] text-slate-400 font-normal lowercase ml-1">
                    (url uzantısı)
                  </span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    minLength={2}
                    maxLength={64}
                    pattern="[a-z0-9-]+"
                    autoComplete="off"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="minik-adimlar"
                  />
                </div>
              </div>

              {/* Admin e-posta */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Admin e-posta
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="yonetici@kres.com"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Şifre
                  <span className="text-[11px] text-slate-400 font-normal lowercase ml-1">
                    (min 8 karakter)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={submitting}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? 'Gizle' : 'Göster'}
                    aria-label={showPassword ? 'Gizle' : 'Göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 font-bold rounded-xl py-3 text-sm transition-all duration-200 shadow-md shadow-teal-900/10 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Kayıt yapılıyor…</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Kayıt Ol</span>
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zaten kreşiniz var mı?{' '}
                <Link
                  to="/login"
                  className="text-teal-700 dark:text-teal-400 font-bold hover:underline ml-1 inline-flex items-center gap-0.5"
                >
                  Giriş yap
                </Link>
              </p>
            </div>
          </div>

          {/* Security & KVKK Footnote */}
          <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>256-bit SSL Güvenli Bağlantı · KVKK Uyumlu</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for centering */}
      <div className="w-full py-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} KidsCare Okul Öncesi Portalı. Tüm hakları saklıdır.
      </div>
    </div>
  );
}
