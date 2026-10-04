import { useEffect, useMemo, useState, type FormEvent, type JSX } from 'react';
import type { User } from '@kidscare/shared-types';
import {
  UserPlus,
  Users,
  RefreshCw,
  Mail,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Shield,
} from 'lucide-react';
import { ApiError } from '../../api/client';
import { inviteUser, listUsers } from '../../api/users';
import { useToast } from '../../components/Toast';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { TactileButton } from '../../components/ui/TactileButton';

type Status = 'loading' | 'ready' | 'error';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Yönetici / Müdür',
  TEACHER: 'Sınıf Öğretmeni',
  PARENT: 'Öğrenci Velisi',
};

const roleVariants: Record<string, BadgeVariant> = {
  SUPER_ADMIN: 'brand',
  ADMIN: 'brand',
  TEACHER: 'info',
  PARENT: 'warning',
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
  const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | 'TEACHER' | 'PARENT' | 'ADMIN'>(
    'ALL',
  );

  const totalCount = useMemo(() => users.length, [users]);
  const teacherCount = useMemo(() => users.filter((u) => u.role === 'TEACHER').length, [users]);
  const parentCount = useMemo(() => users.filter((u) => u.role === 'PARENT').length, [users]);
  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    switch (activeRoleFilter) {
      case 'TEACHER':
        return users.filter((u) => u.role === 'TEACHER');
      case 'PARENT':
        return users.filter((u) => u.role === 'PARENT');
      case 'ADMIN':
        return users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
      default:
        return users;
    }
  }, [users, activeRoleFilter]);

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
      <PageHeader
        title="Ekip & Veliler"
        description="Öğretmen ve veli hesaplarını yönetin; öğrenci kayıtlarında veli eşleştirmesi yapın"
        icon={Users}
        actions={
          <TactileButton variant="secondary" size="sm" onClick={loadUsers}>
            <RefreshCw className="w-3.5 h-3.5" />
            Yenile
          </TactileButton>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={totalCount}
          subtitle="Aktif Hesap"
          icon={Users}
          variant="teal"
          onClick={() => setActiveRoleFilter('ALL')}
          className={
            activeRoleFilter === 'ALL'
              ? 'ring-2 ring-offset-2 ring-teal-500/60 dark:ring-teal-400/60'
              : ''
          }
        />
        <StatCard
          title="Öğretmenler"
          value={teacherCount}
          subtitle="Sınıf Öğretmeni"
          icon={GraduationCap}
          variant="indigo"
          onClick={() => setActiveRoleFilter('TEACHER')}
          className={
            activeRoleFilter === 'TEACHER'
              ? 'ring-2 ring-offset-2 ring-indigo-500/60 dark:ring-indigo-400/60'
              : ''
          }
        />
        <StatCard
          title="Veliler"
          value={parentCount}
          subtitle="Öğrenci Velisi"
          icon={HeartHandshake}
          variant="amber"
          onClick={() => setActiveRoleFilter('PARENT')}
          className={
            activeRoleFilter === 'PARENT'
              ? 'ring-2 ring-offset-2 ring-amber-500/60 dark:ring-amber-400/60'
              : ''
          }
        />
        <StatCard
          title="Yöneticiler"
          value={adminCount}
          subtitle="Admin & Süper Admin"
          icon={Shield}
          variant="rose"
          onClick={() => setActiveRoleFilter('ADMIN')}
          className={
            activeRoleFilter === 'ADMIN'
              ? 'ring-2 ring-offset-2 ring-rose-500/60 dark:ring-rose-400/60'
              : ''
          }
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Create Form */}
        <form
          onSubmit={(e) => void handleInvite(e)}
          className="lg:col-span-2 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] p-6 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <UserPlus className="w-4 h-4 text-teal-900 dark:text-teal-300" />
            Yeni Hesap Oluştur
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              E-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
              placeholder="veli@ornek.com"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Geçici Şifre
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
              placeholder="En az 8 karakter"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Rol
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'TEACHER' | 'PARENT')}
              className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 px-3.5 py-2.5 text-xs bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
            >
              <option value="TEACHER">Öğretmen</option>
              <option value="PARENT">Veli</option>
            </select>
          </label>

          <TactileButton
            type="submit"
            variant="teal"
            size="md"
            disabled={inviting}
            className="w-full"
          >
            {inviting ? 'Oluşturuluyor…' : 'Hesap Oluştur'}
          </TactileButton>
        </form>

        {/* Users List */}
        <div className="lg:col-span-3 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-900 dark:text-teal-300" />
              <span>Aktif Kullanıcılar</span>
            </div>
            {filteredUsers.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                {filteredUsers.length} Kayıt
              </span>
            )}
          </div>

          {status === 'loading' && (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-300 animate-pulse">
              Yükleniyor…
            </div>
          )}
          {status === 'error' && (
            <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{errorMsg ?? 'Hata'}</p>
          )}
          {status === 'ready' && users.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="Henüz kullanıcı yok."
                description="Sol taraftaki formu kullanarak öğretmen veya veli hesabı oluşturabilirsiniz."
              />
            </div>
          )}
          {status === 'ready' && users.length > 0 && filteredUsers.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="Bu filtreye uygun kullanıcı yok."
                description="Başka bir KPI kartına tıklayarak filtreyi değiştirebilirsiniz."
              />
            </div>
          )}
          {status === 'ready' && filteredUsers.length > 0 && (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((u) => {
                const variant = roleVariants[u.role] ?? 'neutral';
                const initial = (u.email.charAt(0) || 'U').toUpperCase();

                return (
                  <li
                    key={u.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-slate-700 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {u.email}
                        </p>
                        <div className="mt-0.5">
                          <Badge variant={variant} size="sm">
                            {roleLabels[u.role] ?? u.role}
                          </Badge>
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
