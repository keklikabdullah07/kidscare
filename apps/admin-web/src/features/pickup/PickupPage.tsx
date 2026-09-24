import { useEffect, useState, type JSX } from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import type { PickupAuthorization, PickupAuthorizationStatus } from '@kidscare/shared-types';
import { listPickupAuthorizations, reviewPickupAuthorization } from '../../api/pickup';
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
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
  EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
  REVOKED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function PickupPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin =
    state.status === 'authenticated' &&
    (state.user.role === 'SUPER_ADMIN' || state.user.role === 'ADMIN');

  const [items, setItems] = useState<PickupAuthorization[]>([]);
  const [filter, setFilter] = useState<PickupAuthorizationStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const list = await listPickupAuthorizations(undefined, filter === 'ALL' ? undefined : filter);
      setItems(list);
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teslim Yetkileri</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Veli taleplerini onayla veya reddet, geçmiş kayıtları görüntüle.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
              filter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'ALL' ? 'Tümü' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-semibold">Bu kategoride kayıt yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    Öğrenci #{item.studentId.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Talep: {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[item.status]}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              {item.note && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{item.note}"
                </p>
              )}
              {(item.validFrom || item.validUntil) && (
                <p className="text-[11px] text-slate-500">
                  Geçerlilik:{' '}
                  {item.validFrom ? new Date(item.validFrom).toLocaleDateString('tr-TR') : '—'} →{' '}
                  {item.validUntil ? new Date(item.validUntil).toLocaleDateString('tr-TR') : '—'}
                </p>
              )}
              {isAdmin && item.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => void review(item.id, 'APPROVED')}
                    disabled={busyId === item.id}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectTargetId(item.id)}
                    disabled={busyId === item.id}
                    className="flex-1 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-100 transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
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
