import { useEffect, useState, type FormEvent, type JSX } from 'react';
import type { User } from '@kidscare/shared-types';
import { UserPlus, Users, RefreshCw, Mail, Shield } from 'lucide-react';
import { ApiError } from '../../api/client';
import { inviteUser, listUsers } from '../../api/users';
import { useToast } from '../../components/Toast';

type Status = 'loading' | 'ready' | 'error';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Yönetici',
  TEACHER: 'Öğretmen',
  PARENT: 'Veli',
};

export function TeamPage(): JSX.Element {
  const { showToast } = useToast();
  const [status, setStatus] = useState<Status>('loading');
  const [users, setUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [inviting, setInviting] = useState(false);

  const loadUsers = () => {
    setStatus('loading');
    setErrorMsg(null);
    listUsers()
      .then((rows) => {
        setUsers(rows);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Kullanıcı listesi yüklenemedi');
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleInvite(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (inviting) return;
    setInviting(true);
    try {
      const created = await inviteUser({
        email: email.trim(),
        password,
        role,
      });
      setUsers((prev) => [...prev, created].sort((a, b) => a.email.localeCompare(b.email, 'tr')));
      setEmail('');
      setPassword('');
      showToast(`${created.email} hesabı oluşturuldu`, 'success');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 409
            ? 'Bu e-posta zaten kayıtlı'
            : `API ${err.status}`
          : 'Davet gönderilemedi';
      showToast(msg, 'error');
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ekip & Veliler</h1>
          <p className="text-sm text-slate-500 mt-1">
            Öğretmen ve veli hesaplarını oluşturun; öğrenci kaydında veli ataması yapın.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form
          onSubmit={(e) => void handleInvite(e)}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Yeni hesap
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="veli@ornek.com"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Geçici şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="En az 8 karakter"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Rol</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'TEACHER' | 'PARENT')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="TEACHER">Öğretmen</option>
              <option value="PARENT">Veli</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={inviting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {inviting ? 'Oluşturuluyor…' : 'Hesap oluştur'}
          </button>
        </form>

        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-bold text-sm text-slate-900">
            <Users className="w-4 h-4 text-indigo-600" />
            Aktif kullanıcılar
          </div>

          {status === 'loading' && (
            <p className="p-6 text-sm text-slate-500 animate-pulse">Yükleniyor…</p>
          )}
          {status === 'error' && (
            <p className="p-6 text-sm text-rose-600">{errorMsg ?? 'Hata'}</p>
          )}
          {status === 'ready' && users.length === 0 && (
            <p className="p-6 text-sm text-slate-500">Henüz kullanıcı yok.</p>
          )}
          {status === 'ready' && users.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li key={u.id} className="px-6 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {u.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{roleLabels[u.role] ?? u.role}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                    <Shield className="w-3 h-3" />
                    Aktif
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
