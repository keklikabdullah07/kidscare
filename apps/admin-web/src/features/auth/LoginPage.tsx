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

function useSafeTheme() {
  try {
    return useTheme();
  } catch {
    return null;
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
    roleDesc: 'Tüm kreş operasyonu & ayarlar',
  },
  TEACHER: {
    label: 'Öğretmen',
    email: 'teacher@demo.test',
    pass: 'demo1234',
    roleDesc: 'Yoklama & günlük karne girişi',
  },
  PARENT: {
    label: 'Veli',
    email: 'parent@demo.test',
    pass: 'demo1234',
    roleDesc: 'Öğrenci karnesi & teslimat takibi',
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

      {/* Top Header Toolbar: Theme Toggle */}
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

        {theme && (
          <button
            type="button"
            onClick={theme.toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            title={theme.isDark ? 'Açık Mod' : 'Koyu Mod'}
            aria-label={theme.isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {theme.isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Açık</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-teal-700" />
                <span className="hidden sm:inline">Koyu</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[430px] mx-auto my-auto z-10">
        <div className="rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-700/80 shadow-xl dark:shadow-2xl dark:shadow-black/50 p-6 sm:p-8 space-y-6">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-3xl bg-white dark:bg-slate-800 p-3.5 shadow-md border border-teal-100 dark:border-slate-700 flex items-center justify-center shrink-0 mb-4 transition-transform hover:scale-105">
              <img
                src="/brand/kidscare-icon.png"
                alt="KidsCare Emblem"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="inline-flex items-center gap-2.5 mb-1.5">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Kids<span className="text-teal-700 dark:text-teal-400">Care</span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                Kreş
              </span>
            </div>

            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Yönetim & Veli Portalı Girişi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kreşinizin günlük akışını ve operasyonunu yönetin
            </p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hızlı Demo Girişi:
              </span>
              <button
                type="button"
                onClick={() => applyPreset(activePreset)}
                className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-bold text-[11px] hover:underline"
              >
                Bilgileri Doldur
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(DEMO_PRESETS) as DemoRole[]).map((r) => {
                const isSelected = activePreset === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => applyPreset(r)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-2xs dark:bg-teal-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                    <span>{r === 'ADMIN' ? 'Müdür' : r === 'TEACHER' ? 'Öğretmen' : 'Veli'}</span>
                  </button>
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
                  pattern="[a-z0-9-]+"
                  autoComplete="off"
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all disabled:opacity-50"
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
                  <span>Giriş yapılıyor…</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Giriş yap</span>
                </>
              )}
            </button>

            {/* Cloud Cold Start Warning */}
            {isWarmingUp && (
              <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 p-2.5 rounded-xl text-center animate-pulse">
                ⏳ Bulut sunucusu uyanıyor, lütfen birkaç saniye bekleyin…
              </p>
            )}

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
              Kreşiniz sisteme kayıtlı değil mi?{' '}
              <Link
                to="/signup"
                className="text-teal-700 dark:text-teal-400 font-bold hover:underline ml-1 inline-flex items-center gap-0.5"
              >
                Kayıt ol
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

      {/* Bottom spacer for centering */}
      <div className="w-full py-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} KidsCare Okul Öncesi Portalı. Tüm hakları saklıdır.
      </div>
    </div>
  );
}
