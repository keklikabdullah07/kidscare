import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { ClipboardList, Plus, CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import type { ParentRequest, ParentRequestStatus, ParentRequestType } from '@kidscare/shared-types';
import { createParentRequest, listParentRequests, resolveParentRequest } from '../../api/messaging';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { PromptModal } from '../../components/ui/PromptModal';

const TYPE_LABEL: Record<ParentRequestType, string> = {
  IZIN: 'İzin Talebi',
  BILGI_TALEP: 'Bilgi Talebi',
  DEGISIKLIK: 'Değişiklik',
  DIGER: 'Diğer',
};

const STATUS_LABEL: Record<ParentRequestStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

const STATUS_STYLE: Record<ParentRequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
};

export function ParentRequestsPage(): JSX.Element {
  const { state } = useAuth();
  const role = state.status === 'authenticated' ? state.user.role : 'PARENT';

  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [resolveDialog, setResolveDialog] = useState<{
    isOpen: boolean;
    requestId: string;
    status: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const { showToast } = useToast();

  // form
  const [fType, setFType] = useState<ParentRequestType>('IZIN');
  const [fStudentId, setFStudentId] = useState('');
  const [fSubject, setFSubject] = useState('');
  const [fDescription, setFDescription] = useState('');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listParentRequests(), listStudents()]);
      setRequests(list);
      setStudents(studentsRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Liste yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!fSubject.trim() || !fDescription.trim()) {
      showToast('Konu ve açıklama zorunlu.', 'error');
      return;
    }
    try {
      await createParentRequest({
        type: fType,
        subject: fSubject.trim(),
        description: fDescription.trim(),
        ...(fStudentId ? { studentId: fStudentId } : {}),
      });
      showToast('Talep oluşturuldu.', 'success');
      setShowForm(false);
      setFSubject('');
      setFDescription('');
      setFStudentId('');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Talep oluşturulamadı', 'error');
    }
  }

  function resolve(id: string, status: 'APPROVED' | 'REJECTED'): void {
    setResolveDialog({ isOpen: true, requestId: id, status });
  }

  async function handleResolveConfirm(note: string): Promise<void> {
    if (!resolveDialog) return;
    const { requestId, status } = resolveDialog;
    setResolveDialog(null);
    setBusyId(requestId);
    try {
      await resolveParentRequest(requestId, {
        status,
        ...(note.trim() ? { resolutionNote: note.trim() } : {}),
      });
      showToast(status === 'APPROVED' ? 'Talep onaylandı.' : 'Talep reddedildi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function studentName(id?: string | null): string {
    if (!id) return '—';
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Veli Talepleri
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              İzin, bilgi talebi ve diğer veli başvuruları.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
          >
            <RotateCw className="w-3.5 h-3.5" /> Yenile
          </button>
          {role === 'PARENT' && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Talep
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            void submitCreate(e);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Tür
              </label>
              <select
                value={fType}
                onChange={(e) => setFType(e.target.value as ParentRequestType)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Öğrenci (opsiyonel)
              </label>
              <select
                value={fStudentId}
                onChange={(e) => setFStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">—</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Konu
            </label>
            <input
              type="text"
              value={fSubject}
              onChange={(e) => setFSubject(e.target.value)}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Açıklama
            </label>
            <textarea
              value={fDescription}
              onChange={(e) => setFDescription(e.target.value)}
              rows={3}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-1.5"
            >
              İptal
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              Gönder
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Yükleniyor…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Talep yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {r.subject}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {TYPE_LABEL[r.type]} · {studentName(r.studentId)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed">
                {r.description}
              </p>
              {r.resolutionNote && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Not: {r.resolutionNote}
                </p>
              )}
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => void resolve(r.id, 'APPROVED')}
                    disabled={busyId === r.id}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => void resolve(r.id, 'REJECTED')}
                    disabled={busyId === r.id}
                    className="flex-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {resolveDialog && (
        <PromptModal
          isOpen={resolveDialog.isOpen}
          title={resolveDialog.status === 'APPROVED' ? 'Talebi Onayla' : 'Talebi Reddet'}
          description={
            resolveDialog.status === 'APPROVED'
              ? 'Veliye iletilecek bilgilendirme veya onay notunu girebilirsiniz (isteğe bağlı).'
              : 'Lütfen veliye iletilecek ret gerekçesini belirtin.'
          }
          inputLabel={resolveDialog.status === 'APPROVED' ? 'Onay Notu' : 'Ret Gerekçesi'}
          placeholder={
            resolveDialog.status === 'APPROVED'
              ? 'Örn: Talebiniz uygun görülmüş ve onaylanmıştır...'
              : 'Örn: İlgili tarihte sınıf kontenjanı dolu olduğundan dolayı...'
          }
          confirmText={resolveDialog.status === 'APPROVED' ? 'Onayla' : 'Reddet'}
          cancelText="Vazgeç"
          requireInput={resolveDialog.status === 'REJECTED'}
          isTextarea={true}
          variant={resolveDialog.status === 'APPROVED' ? 'success' : 'danger'}
          onConfirm={(val) => void handleResolveConfirm(val)}
          onCancel={() => setResolveDialog(null)}
        />
      )}
    </div>
  );
}
