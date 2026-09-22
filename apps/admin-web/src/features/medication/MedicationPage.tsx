import { useEffect, useState, type JSX, type FormEvent } from 'react';
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
} from 'lucide-react';
import type { MedicationRecord, StandaloneMedicationStatus } from '@kidscare/shared-types';
import {
  listMedicationRecords,
  createMedicationRecord,
  approveMedicationRecord,
  rejectMedicationRecord,
  markMedicationGiven,
  markMedicationSkipped,
} from '../../api/medication';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';

const STATUS_LABEL: Record<StandaloneMedicationStatus, string> = {
  REQUESTED: 'Onay Bekliyor',
  APPROVED: 'Onaylı',
  SCHEDULED: 'Planlandı',
  GIVEN: 'Verildi',
  SKIPPED: 'Atlandı',
  REJECTED: 'Reddedildi',
};

const STATUS_STYLE: Record<StandaloneMedicationStatus, string> = {
  REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200',
  APPROVED: 'bg-blue-50 text-blue-800 border-blue-200',
  SCHEDULED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  GIVEN: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SKIPPED: 'bg-slate-100 text-slate-600 border-slate-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
};

export function MedicationPage(): JSX.Element {
  const { state } = useAuth();
  const role = state.status === 'authenticated' ? state.user.role : 'PARENT';

  const [records, setRecords] = useState<MedicationRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { showToast } = useToast();

  // Create form
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([
        listMedicationRecords(),
        listStudents(),
      ]);
      setRecords(list);
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

  async function approve(id: string): Promise<void> {
    setBusyId(id);
    try {
      await approveMedicationRecord(id, {});
      showToast('İlaç kaydı onaylandı.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Onay başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string): Promise<void> {
    const reason = window.prompt('Red sebebi:');
    if (!reason || !reason.trim()) return;
    setBusyId(id);
    try {
      await rejectMedicationRecord(id, { reason: reason.trim() });
      showToast('İlaç kaydı reddedildi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Reddetme başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function markGiven(id: string): Promise<void> {
    setBusyId(id);
    try {
      await markMedicationGiven(id, {});
      showToast('İlaç verildi olarak işaretlendi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşaretleme başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function markSkipped(id: string): Promise<void> {
    const reason = window.prompt('Atlama sebebi:');
    if (!reason || !reason.trim()) return;
    setBusyId(id);
    try {
      await markMedicationSkipped(id, { reason: reason.trim() });
      showToast('İlaç atlandı.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşaretleme başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function submitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!formStudentId || !formName.trim() || !formDosage.trim()) {
      showToast('Öğrenci, ilaç adı ve doz zorunlu.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createMedicationRecord({
        studentId: formStudentId,
        medicationName: formName.trim(),
        dosage: formDosage.trim(),
        instructions: formInstructions.trim() || undefined,
        scheduledAt: formScheduledAt ? new Date(formScheduledAt) : undefined,
      });
      showToast('İlaç talebi oluşturuldu.', 'success');
      setCreateOpen(false);
      setFormName('');
      setFormDosage('');
      setFormInstructions('');
      setFormScheduledAt('');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Talep oluşturulamadı', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function studentName(id: string): string {
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">İlaç Takibi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Veli talepleri, öğretmen onayı ve uygulama kayıtları.
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
          {(role === 'PARENT' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Talep
            </button>
          )}
        </div>
      </div>

      {createOpen && (
        <form
          onSubmit={submitCreate}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Öğrenci
              </label>
              <select
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">Seçin…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Planlanan saat
              </label>
              <input
                type="datetime-local"
                value={formScheduledAt}
                onChange={(e) => setFormScheduledAt(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                İlaç adı
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Parol"
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Doz
              </label>
              <input
                type="text"
                value={formDosage}
                onChange={(e) => setFormDosage(e.target.value)}
                placeholder="5 ml"
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Talimat (opsiyonel)
            </label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="text-xs font-semibold text-slate-600 px-3 py-1.5"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor…' : 'Talep Oluştur'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor…</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-semibold">İlaç kaydı yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {r.medicationName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {studentName(r.studentId)} · {r.dosage}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              {r.instructions && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {r.instructions}
                </p>
              )}
              {r.scheduledAt && (
                <p className="text-[11px] text-slate-500">
                  Plan: {new Date(r.scheduledAt).toLocaleString('tr-TR')}
                </p>
              )}
              {r.givenAt && (
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Verildi: {new Date(r.givenAt).toLocaleString('tr-TR')}
                </p>
              )}
              {r.rejectionReason && (
                <p className="text-[11px] text-rose-700 font-medium">
                  ✕ {r.rejectionReason}
                </p>
              )}
              {r.skipReason && (
                <p className="text-[11px] text-slate-600 font-medium">
                  ⏸ {r.skipReason}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'REQUESTED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => void approve(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => void reject(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reddet
                    </button>
                  </>
                )}
                {(role === 'TEACHER' || role === 'ADMIN' || role === 'SUPER_ADMIN') &&
                  (r.status === 'APPROVED' || r.status === 'SCHEDULED') && (
                    <>
                      <button
                        type="button"
                        onClick={() => void markGiven(r.id)}
                        disabled={busyId === r.id}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verildi
                      </button>
                      <button
                        type="button"
                        onClick={() => void markSkipped(r.id)}
                        disabled={busyId === r.id}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        Atlandı
                      </button>
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
