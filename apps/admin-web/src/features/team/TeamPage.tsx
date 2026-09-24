import { useEffect, useState, type FormEvent, type JSX } from 'react';
import type { User } from '@kidscare/shared-types';
import { UserPlus, Users, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';
import { ApiError } from '../../api/client';
import { inviteUser, listUsers } from '../../api/users';
import { useToast } from '../../components/Toast';

type Status = 'loading' | 'ready' | 'error';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Yönetici / Müdür',
  TEACHER: 'Sınıf Öğretmeni',
  PARENT: 'Öğrenci Velisi',
};

const roleBadges: Record<string, string> = {
  SUPER_ADMIN:
    'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  ADMIN:
    'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
  TEACHER:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  PARENT:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/40 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Ekip & Veliler
            </h1>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              Öğretmen ve veli hesaplarını yönetin; öğrenci kayıtlarında veli eşleştirmesi yapın
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#23312c] bg-white dark:bg-[#151e1b] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-stone-200 hover:bg-slate-50 dark:hover:bg-[#1c2824] shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yenile
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Create Form */}
        <form
          onSubmit={(e) => void handleInvite(e)}
          className="lg:col-span-2 rounded-2xl border border-slate-200/90 dark:border-[#23312c] bg-white dark:bg-[#151e1b] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Yeni Hesap Oluştur
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1.5">
              E-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-[#283832] bg-white dark:bg-[#1c2824] px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="veli@ornek.com"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1.5">
              Geçici Şifre
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-200 dark:border-[#283832] bg-white dark:bg-[#1c2824] px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="En az 8 karakter"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1.5">
              Rol
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'TEACHER' | 'PARENT')}
              className="w-full rounded-xl border border-slate-200 dark:border-[#283832] px-3 py-2 text-xs bg-white dark:bg-[#1c2824] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="TEACHER">Öğretmen</option>
              <option value="PARENT">Veli</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={inviting}
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 text-xs font-bold text-white transition shadow-xs disabled:opacity-50"
          >
            {inviting ? 'Oluşturuluyor…' : 'Hesap Oluştur'}
          </button>
        </form>

        {/* Users List */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/90 dark:border-[#23312c] bg-white dark:bg-[#151e1b] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#23312c] flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Aktif Kullanıcılar</span>
            </div>
            {users.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                {users.length} Kayıt
              </span>
            )}
          </div>

          {status === 'loading' && (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-stone-400 animate-pulse">
              Yükleniyor…
            </div>
          )}
          {status === 'error' && (
            <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{errorMsg ?? 'Hata'}</p>
          )}
          {status === 'ready' && users.length === 0 && (
            <p className="p-6 text-sm text-slate-500 dark:text-stone-400">Henüz kullanıcı yok.</p>
          )}
          {status === 'ready' && users.length > 0 && (
            <ul className="divide-y divide-slate-100 dark:divide-[#23312c]">
              {users.map((u) => {
                const badge =
                  roleBadges[u.role] ??
                  'bg-slate-50 text-slate-800 border-slate-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700';
                const initial = (u.email.charAt(0) || 'U').toUpperCase();

                return (
                  <li
                    key={u.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-[#1c2824]/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-xs shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {u.email}
                        </p>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge}`}
                          >
                            {roleLabels[u.role] ?? u.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      Aktif
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
