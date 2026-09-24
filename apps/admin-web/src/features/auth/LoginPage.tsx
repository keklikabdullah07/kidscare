import { useState, type FormEvent } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">KidsCare — Giriş</h1>

        {/* Quick Demo Credentials Helper */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="font-semibold">Demo Kreş:</span> slug{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
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
            className="text-blue-700 hover:text-blue-900 font-bold underline text-xs"
          >
            Bilgileri Doldur
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Kreş slug</span>
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="demo"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={submitting}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={submitting}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
          {isWarmingUp && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center animate-pulse">
              ⏳ Bulut sunucusu (Render) uyanıyor, lütfen birkaç saniye bekleyin…
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Kreşiniz yok mu?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
