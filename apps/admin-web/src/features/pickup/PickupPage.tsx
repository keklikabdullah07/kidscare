import { useEffect, useState, type JSX } from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle, RotateCw, Calendar } from 'lucide-react';
import type { PickupAuthorization, PickupAuthorizationStatus } from '@kidscare/shared-types';
import { listPickupAuthorizations, reviewPickupAuthorization } from '../../api/pickup';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';

const STATUS_LABEL: Record<PickupAuthorizationStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi doldu',
  REVOKED: 'İptal edildi',
};

const STATUS_STYLE: Record<PickupAuthorizationStatus, string> = {
  PENDING:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  APPROVED:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  REJECTED:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  EXPIRED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  REVOKED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export function PickupPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin =
    state.status === 'authenticated' &&
    (state.user.role === 'SUPER_ADMIN' || state.user.role === 'ADMIN');

  const [items, setItems] = useState<PickupAuthorization[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<PickupAuthorizationStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsList] = await Promise.all([
        listPickupAuthorizations(undefined, filter === 'ALL' ? undefined : filter),
        listStudents().catch(() => []),
      ]);
      setItems(list);
      setStudents(studentsList);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Liste yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [filter]);

  async function review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    setBusyId(id);
    try {
      await reviewPickupAuthorization(id, { status });
      showToast(status === 'APPROVED' ? 'Yetki onaylandı.' : 'Yetki reddedildi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-teal-900 dark:text-teal-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Teslim Yetkileri
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Veli taleplerini onayla veya reddet, geçmiş kayıtları görüntüle.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition"
        >
          <RotateCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filter === s
                ? 'bg-teal-700 text-white dark:bg-teal-600 dark:text-white border-teal-700 dark:border-teal-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {s === 'ALL' ? 'Tümü' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">
            Yetkiler yükleniyor…
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-slate-800 dark:text-white text-sm font-bold">
            Bu kategoride kayıt yok.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-sm mx-auto">
            Öğrenci teslimat talepleri ve onayları burada listelenir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {students.find((s) => s.id === item.studentId)
                        ? `${students.find((s) => s.id === item.studentId)!.firstName} ${students.find((s) => s.id === item.studentId)!.lastName}`
                        : `Öğrenci #${item.studentId.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                      Talep: {new Date(item.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                {item.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 leading-relaxed italic">
                    "{item.note}"
                  </p>
                )}
                {(item.validFrom || item.validUntil) && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Geçerlilik:</span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {item.validFrom ? new Date(item.validFrom).toLocaleDateString('tr-TR') : '—'}
                    </strong>
                    <span>→</span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {item.validUntil
                        ? new Date(item.validUntil).toLocaleDateString('tr-TR')
                        : '—'}
                    </strong>
                  </p>
                )}
              </div>

              {isAdmin && item.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => void review(item.id, 'APPROVED')}
                    disabled={busyId === item.id}
                    title="Öğrenciyi bu kişinin teslim almasına izin ver"
                    className="flex-1 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white text-xs font-bold transition active:scale-98 shadow-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectTargetId(item.id)}
                    disabled={busyId === item.id}
                    title="Bu teslimat yetkisi talebini reddet"
                    className="flex-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectTargetId && (
        <ConfirmModal
          isOpen={true}
          title="Teslim Yetkisini Reddet"
          description="Bu teslimat yetkisi talebini reddetmek istediğinize emin misiniz?"
          confirmText="Evet, Reddet"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => {
            const id = rejectTargetId;
            setRejectTargetId(null);
            if (id) void review(id, 'REJECTED');
          }}
          onCancel={() => setRejectTargetId(null)}
        />
      )}
    </div>
  );
}
