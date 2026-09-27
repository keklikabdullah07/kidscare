import { useState, type FormEvent } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { KidsCareLogo } from '../../components/KidsCareLogo';

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const error = clientError || (state.status === 'unauthenticated' ? state.error : null);

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
      // error already on state
    } finally {
      clearTimeout(timer);
      setIsWarmingUp(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] p-4 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center justify-center gap-2">
          <KidsCareLogo size="lg" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center">
            KidsCare — Giriş
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Kreş Yönetim & Veli Bilgilendirme Platformu
          </p>
        </div>

        {/* Quick Demo Credentials Helper */}
        <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="font-semibold">Demo Kreş:</span> slug{' '}
            <code className="bg-white dark:bg-[#0B1120] px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono text-[11px] font-bold">
              demo
            </code>
          </div>
          <button
            type="button"
            onClick={() => {
              setSlug('demo');
              setEmail('admin@demo.test');
              setPassword('demo1234');
              setClientError(null);
            }}
            className="text-blue-700 dark:text-amber-400 hover:underline font-bold text-xs"
          >
            Bilgileri Doldur
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white dark:bg-[#131E3A] rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kreş slug
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              minLength={2}
              maxLength={64}
              pattern="[a-z0-9-]+"
              autoComplete="off"
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-900 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              placeholder="demo"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              E-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-900 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              placeholder="admin@demo.test"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Şifre
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-900 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black font-bold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50 shadow-xs mt-2"
          >
            {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
          {isWarmingUp && (
            <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-xl text-center animate-pulse">
              ⏳ Bulut sunucusu uyanıyor, lütfen birkaç saniye bekleyin…
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl text-center"
            >
              {error}
            </p>
          )}
        </form>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Kreşiniz yok mu?{' '}
          <Link
            to="/signup"
            className="text-blue-900 dark:text-amber-400 font-bold hover:underline ml-1"
          >
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
