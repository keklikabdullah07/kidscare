import { useState, type FormEvent } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
      navigate('/', { replace: true });
    } catch {
      // error already on state
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          KidsCare — Kreş Kaydı
        </h1>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Kreş adı</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={128}
              disabled={submitting}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Yeni Kreş"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Kreş slug
              <span className="text-xs text-gray-500 font-normal ml-1">
                (URL'de görünecek, küçük harf, tire)
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="yeni-kres"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Admin e-posta</span>
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
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
              <span className="text-xs text-gray-500 font-normal ml-1">(min 8 karakter)</span>
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Kayıt yapılıyor…' : 'Kayıt ol'}
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Zaten kreşiniz var mı?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
