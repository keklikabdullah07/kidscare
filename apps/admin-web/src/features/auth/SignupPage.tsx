import { useState, type FormEvent } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { KidsCareLogo } from '../../components/KidsCareLogo';

export function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const { signup, state } = useAuth();
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] p-4 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center justify-center gap-2">
          <KidsCareLogo size="lg" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Yeni Kreş Kaydı Oluşturun
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white dark:bg-[#131E3A] rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kreş adı
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={128}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-900 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              placeholder="Minik Adımlar Kreşi"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kreş slug
              <span className="text-[11px] text-slate-400 font-normal lowercase ml-1">
                (url uzantısı)
              </span>
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
              placeholder="minik-adimlar"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Admin e-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-900 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              placeholder="yonetici@kres.com"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Şifre
              <span className="text-[11px] text-slate-400 font-normal lowercase ml-1">
                (min 8 karakter)
              </span>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
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
            {submitting ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
          </button>
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
          Zaten kreşiniz var mı?{' '}
          <Link
            to="/login"
            className="text-blue-900 dark:text-amber-400 font-bold hover:underline ml-1"
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
