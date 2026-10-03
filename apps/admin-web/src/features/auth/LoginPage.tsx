import { useState, type FormEvent, type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { TactileButton } from '../../components/ui/TactileButton';

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

type DemoRole = 'ADMIN' | 'TEACHER' | 'PARENT';

const DEMO_PRESETS: Record<
  DemoRole,
  { label: string; email: string; pass: string; roleDesc: string }
> = {
  ADMIN: {
    label: 'Müdür (Admin)',
    email: 'admin@demo.test',
    pass: 'demo1234',
    roleDesc: 'Tüm kreş operasyonu, finans & ayarlar',
  },
  TEACHER: {
    label: 'Öğretmen',
    email: 'teacher@demo.test',
    pass: 'demo1234',
    roleDesc: 'Sınıf yoklaması & günlük aktivite bülteni',
  },
  PARENT: {
    label: 'Veli',
    email: 'parent@demo.test',
    pass: 'demo1234',
    roleDesc: 'Öğrenci karnesi, ilaç onayı & teslimat takibi',
  },
};

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  const theme = useSafeTheme();

  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<DemoRole>('ADMIN');

  const error = clientError || (state.status === 'unauthenticated' ? state.error : null);

  function applyPreset(role: DemoRole) {
    const preset = DEMO_PRESETS[role];
    setSlug('demo');
    setEmail(preset.email);
    setPassword(preset.pass);
    setActivePreset(role);
    setClientError(null);
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setClientError(null);
    if (!slug.trim()) {
      setClientError('Lütfen kreş slug alanını girin (Örn: demo)');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setIsWarmingUp(false);

    // If server takes longer than 2.5s (e.g. Render cold-start), warn user
    const timer = setTimeout(() => setIsWarmingUp(true), 2500);

    try {
      await login(slug.trim(), email.trim(), password);
      void navigate('/', { replace: true });
    } catch {
      // error already handled by auth state
    } finally {
      clearTimeout(timer);
      setIsWarmingUp(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-[#FAF9F6] dark:bg-[#090D16] p-4 sm:p-6 transition-colors overflow-hidden selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-950 dark:selection:text-teal-300">
      {/* Ambient background glow orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-36 -left-36 w-96 h-96 bg-teal-600/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-36 -right-36 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Theme Toggle (Always visible in top right as Tactile Pill) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={theme.toggleTheme}
          className="btn-tactile-secondary px-4 py-2 text-xs font-bold"
          title={theme.isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          aria-label={theme.isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
        >
          {theme.isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Açık Mod</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-teal-800" />
              <span>Koyu Mod</span>
            </>
          )}
        </button>
      </div>

      {/* Main Split Layout Container */}
      <div className="w-full max-w-6xl mx-auto my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-4 sm:py-8 lg:py-10">
        {/* LEFT COLUMN: Kocaman KidsCare Logo & Brand Showcase (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col items-start text-left space-y-6 pr-4">
          {/* Logo Badge with 3D Extruded Depth */}
          <div className="relative group">
            <div className="w-48 h-48 xl:w-52 xl:h-52 rounded-3xl bg-white dark:bg-[#131B2E] p-6 lg:p-7 border-2 border-[#DDD4C4] dark:border-slate-700 shadow-[0_6px_0_0_#D5CBB9,0_14px_30px_rgba(45,38,30,0.08)] dark:shadow-[0_6px_0_0_#1E293B,0_14px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-200 group-hover:-translate-y-1">
              <img
                src="/brand/kidscare-icon.png"
                alt="KidsCare Logo"
                className="w-full h-full object-contain filter drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {/* Ambient decorative blur behind badge */}
            <div className="absolute inset-0 bg-teal-500/15 dark:bg-amber-400/10 rounded-3xl blur-2xl -z-10 group-hover:bg-teal-500/25 transition-colors pointer-events-none" />
          </div>

          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Yeni Nesil Okul Öncesi Yönetim Sistemi</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Kids<span className="text-[#115e59] dark:text-teal-400">Care</span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800/60 shadow-2xs">
                Kreş Portalı
              </span>
            </div>

            <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Öğrencilerinizin güvenliği, günlük yoklama, gelişim karne takibi ve veli iletişimi tek
              bir sıcak ve dokunsal platformda.
            </p>
          </div>

          {/* Trust Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg pt-1 text-left">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/50 flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Canlı Yoklama & Karne
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Anlık durum ve aktivite bildirimi
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Güvenli Veli Erişimi
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  256-bit SSL & KVKK Uyumlu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Tactile Login Card */}
        <div className="lg:col-span-6 xl:col-span-5 w-full max-w-[440px] mx-auto">
          {/* Mobile-only clean brand mark */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#131B2E] p-3 border-2 border-[#DDD4C4] dark:border-slate-700 shadow-[0_4px_0_0_#D5CBB9] flex items-center justify-center mb-2.5">
              <img
                src="/brand/kidscare-icon.png"
                alt="KidsCare Logo"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Kids<span className="text-[#115e59] dark:text-teal-400">Care</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                Kreş
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Okul Öncesi Yönetim Portalı
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 shadow-[0_4px_0_0_#D5CBB9,0_12px_28px_-4px_rgba(45,38,30,0.08)] dark:shadow-[0_4px_0_0_#1E293B,0_12px_28px_-4px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-5">
            {/* Card Header */}
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight text-center lg:text-left">
                Giriş Yap
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center lg:text-left font-medium">
                Yönetici, öğretmen veya veli hesabınızla portala bağlanın
              </p>
            </div>

            {/* Quick Demo Credentials Assistant (Tactile Pills) */}
            <div className="bg-[#FCFAF7] dark:bg-slate-900/60 border border-[#DDD4C4] dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Hızlı Demo Girişi:
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset(activePreset)}
                  className="text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-bold text-[11px] hover:underline cursor-pointer"
                >
                  Bilgileri Doldur
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5">
                {(Object.keys(DEMO_PRESETS) as DemoRole[]).map((r) => {
                  const isSelected = activePreset === r;
                  return (
                    <TactileButton
                      key={r}
                      type="button"
                      variant={isSelected ? 'teal' : 'secondary'}
                      onClick={() => applyPreset(r)}
                      className="py-1.5 px-2 text-[11px]"
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      <span>{r === 'ADMIN' ? 'Müdür' : r === 'TEACHER' ? 'Öğretmen' : 'Veli'}</span>
                    </TactileButton>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                {DEMO_PRESETS[activePreset].roleDesc}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {/* Kreş slug */}
              <div>
                <label
                  htmlFor="login-slug"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Kreş slug
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    minLength={2}
                    maxLength={64}
                    pattern="[-a-z0-9]+"
                    autoComplete="off"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs disabled:opacity-50"
                    placeholder="demo"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs disabled:opacity-50"
                    placeholder="admin@demo.test"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={submitting}
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs disabled:opacity-50"
                    placeholder="••••••••"
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

              {/* Tactile Full-width Submit Button */}
              <div className="pt-1">
                <TactileButton
                  type="submit"
                  variant="teal"
                  disabled={submitting}
                  className="w-full py-3 text-sm shadow-[0_4px_0_0_#042f2e,0_8px_18px_rgba(17,94,89,0.30)]"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Giriş yapılıyor…</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Giriş Yap</span>
                    </>
                  )}
                </TactileButton>
              </div>

              {/* Cloud Cold Start Warning */}
              {isWarmingUp && (
                <p className="text-xs text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-800/60 p-2.5 rounded-2xl text-center animate-pulse font-medium shadow-2xs">
                  ⏳ Bulut sunucusu uyanıyor, lütfen birkaç saniye bekleyin…
                </p>
              )}

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-800 dark:text-rose-300 shadow-2xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-[#EFEAE0] dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Kreşiniz sisteme kayıtlı değil mi?{' '}
                <Link
                  to="/signup"
                  className="text-teal-800 dark:text-teal-400 font-bold hover:underline ml-1 inline-flex items-center gap-0.5"
                >
                  Kayıt ol
                </Link>
              </p>
            </div>
          </div>

          {/* Security & KVKK Footnote */}
          <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>256-bit SSL Güvenli Bağlantı · KVKK Uyumlu</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for centering */}
      <div className="w-full py-2 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} KidsCare Okul Öncesi Portalı. Tüm hakları saklıdır.
      </div>
    </div>
  );
}
