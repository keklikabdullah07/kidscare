import { useEffect, useState, type FormEvent, type JSX } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCw,
} from 'lucide-react';
import type {
  ParentRequest,
  ParentRequestStatus,
  ParentRequestType,
} from '@kidscare/shared-types';
import {
  createParentRequest,
  listParentRequests,
  resolveParentRequest,
} from '../../api/messaging';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function resolve(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    const note = window.prompt(status === 'APPROVED' ? 'Onay notu:' : 'Red sebebi:');
    if (note === null) return;
    setBusyId(id);
    try {
      await resolveParentRequest(id, {
        status,
        ...(note.trim() ? { resolutionNote: note.trim() } : {}),
      });
      showToast(status === 'APPROVED' ? 'Onaylandı.' : 'Reddedildi.', 'success');
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Veli Talepleri</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              İzin, bilgi talebi ve diğer veli başvuruları.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Yenile
          </button>
          {role === 'PARENT' && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Talep
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={submitCreate}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tür
              </label>
              <select
                value={fType}
                onChange={(e) => setFType(e.target.value as ParentRequestType)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Öğrenci (opsiyonel)
              </label>
              <select
                value={fStudentId}
                onChange={(e) => setFStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Konu
            </label>
            <input
              type="text"
              value={fSubject}
              onChange={(e) => setFSubject(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Açıklama
            </label>
            <textarea
              value={fDescription}
              onChange={(e) => setFDescription(e.target.value)}
              rows={3}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-slate-600 px-3 py-1.5"
            >
              İptal
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg"
            >
              Gönder
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-semibold">Talep yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{r.subject}</p>
                  <p className="text-[11px] text-slate-500">
                    {TYPE_LABEL[r.type]} · {studentName(r.studentId)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {r.description}
              </p>
              {r.resolutionNote && (
                <p className="text-[11px] text-slate-600 italic">
                  Not: {r.resolutionNote}
                </p>
              )}
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => void resolve(r.id, 'APPROVED')}
                    disabled={busyId === r.id}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => void resolve(r.id, 'REJECTED')}
                    disabled={busyId === r.id}
                    className="flex-1 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-100 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
