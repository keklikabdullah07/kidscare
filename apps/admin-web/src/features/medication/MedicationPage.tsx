import { useEffect, useState, type JSX, type FormEvent } from 'react';
import { Pill, Plus, CheckCircle2, XCircle, Clock, RotateCw } from 'lucide-react';
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
import { PromptModal } from '../../components/ui/PromptModal';

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
  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    type: 'reject' | 'skip';
    recordId: string;
  } | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listMedicationRecords(), listStudents()]);
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

  function reject(id: string): void {
    setPromptDialog({ isOpen: true, type: 'reject', recordId: id });
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

  function markSkipped(id: string): void {
    setPromptDialog({ isOpen: true, type: 'skip', recordId: id });
  }

  async function handlePromptConfirm(reason: string): Promise<void> {
    if (!promptDialog) return;
    const { type, recordId } = promptDialog;
    setPromptDialog(null);
    setBusyId(recordId);
    try {
      if (type === 'reject') {
        await rejectMedicationRecord(recordId, { reason });
        showToast('İlaç kaydı reddedildi.', 'success');
      } else {
        await markMedicationSkipped(recordId, { reason });
        showToast('İlaç atlandı.', 'success');
      }
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
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
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              İlaç Takibi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Veli talepleri, öğretmen onayı ve uygulama kayıtları.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition"
          >
            <RotateCw className="w-3.5 h-3.5" /> Yenile
          </button>
          {(role === 'PARENT' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition shadow-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Talep
            </button>
          )}
        </div>
      </div>

      {createOpen && (
        <form
          onSubmit={(e) => {
            void submitCreate(e);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Öğrenci
              </label>
              <select
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
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
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Planlanan Saat
              </label>
              <input
                type="datetime-local"
                value={formScheduledAt}
                onChange={(e) => setFormScheduledAt(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                İlaç Adı
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Örn: Parol Şurup"
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Doz
              </label>
              <input
                type="text"
                value={formDosage}
                onChange={(e) => setFormDosage(e.target.value)}
                placeholder="Örn: 5 ml (1 ölçek)"
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Talimat (Opsiyonel)
            </label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              rows={2}
              placeholder="Örn: Yemekten sonra tok karnına verilecek..."
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 px-3 py-1.5 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50 active:scale-98"
            >
              {submitting ? 'Kaydediliyor…' : 'Talep Oluştur'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            İlaç kayıtları yükleniyor…
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
            Aktif ilaç kaydı bulunmuyor.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Öğrencilerin güncel ilaç talepleri burada listelenir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {r.medicationName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                        {studentName(r.studentId)}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {r.dosage}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                {r.instructions && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                    {r.instructions}
                  </p>
                )}
                {r.scheduledAt && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Plan: {new Date(r.scheduledAt).toLocaleString('tr-TR')}</span>
                  </p>
                )}
                {r.givenAt && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verildi: {new Date(r.givenAt).toLocaleString('tr-TR')}</span>
                  </p>
                )}
                {r.rejectionReason && (
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Ret gerekçesi: {r.rejectionReason}</span>
                  </p>
                )}
                {r.skipReason && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Atlama sebebi: {r.skipReason}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800">
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'REQUESTED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => void approve(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => void reject(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
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
                        className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verildi
                      </button>
                      <button
                        type="button"
                        onClick={() => void markSkipped(r.id)}
                        disabled={busyId === r.id}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition disabled:opacity-50"
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

      {promptDialog && (
        <PromptModal
          isOpen={promptDialog.isOpen}
          title={promptDialog.type === 'reject' ? 'İlaç Talebini Reddet' : 'İlaç Dozunu Atla'}
          description={
            promptDialog.type === 'reject'
              ? 'Lütfen veliye iletilecek ret gerekçesini belirtin.'
              : 'İlacın bu dozunun neden verilmediğini kayıt altına alın.'
          }
          inputLabel={promptDialog.type === 'reject' ? 'Ret Gerekçesi' : 'Atlama Sebebi'}
          placeholder={
            promptDialog.type === 'reject'
              ? 'Örn: İlaç tarihi geçmiş veya dozaj talimatı yetersiz...'
              : 'Örn: Öğrenci uyuyordu, veli isteğiyle ertelendi...'
          }
          confirmText={promptDialog.type === 'reject' ? 'Reddet' : 'Atlandı Olarak İşaretle'}
          cancelText="Vazgeç"
          requireInput={true}
          isTextarea={true}
          variant={promptDialog.type === 'reject' ? 'danger' : 'warning'}
          onConfirm={(val) => void handlePromptConfirm(val)}
          onCancel={() => setPromptDialog(null)}
        />
      )}
    </div>
  );
}
