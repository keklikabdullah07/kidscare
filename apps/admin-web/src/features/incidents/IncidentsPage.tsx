import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { AlertTriangle, Plus, CheckCheck, RotateCw } from 'lucide-react';
import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import { createIncident, listIncidents, updateIncident } from '../../api/incidents';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';

const CATEGORY_LABEL: Record<IncidentCategory, string> = {
  DUSME: '🤕 Düşme',
  YARALANMA: '🩹 Yaralanma',
  HASTALIK: '🤒 Hastalık',
  DAVRANIS: '😤 Davranış',
  KAZA: '⚠️ Kaza',
  DIGER: '📋 Diğer',
};

export function IncidentsPage(): JSX.Element {
  const [items, setItems] = useState<IncidentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  // form
  const [fStudentId, setFStudentId] = useState('');
  const [fCategory, setFCategory] = useState<IncidentCategory>('DUSME');
  const [fOccurredAt, setFOccurredAt] = useState(
    () => new Date().toISOString().slice(0, 16),
  );
  const [fDescription, setFDescription] = useState('');
  const [fActionTaken, setFActionTaken] = useState('');
  const [fParentNotified, setFParentNotified] = useState(false);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listIncidents(), listStudents()]);
      setItems(list);
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
    if (!fStudentId || !fDescription.trim()) {
      showToast('Öğrenci ve açıklama zorunlu.', 'error');
      return;
    }
    try {
      await createIncident({
        studentId: fStudentId,
        category: fCategory,
        occurredAt: new Date(fOccurredAt),
        description: fDescription.trim(),
        ...(fActionTaken.trim() ? { actionTaken: fActionTaken.trim() } : {}),
        parentNotified: fParentNotified,
      });
      showToast('Olay kaydı oluşturuldu.', 'success');
      setShowForm(false);
      setFDescription('');
      setFActionTaken('');
      setFParentNotified(false);
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kayıt oluşturulamadı', 'error');
    }
  }

  async function markParentNotified(id: string): Promise<void> {
    setBusyId(id);
    try {
      await updateIncident(id, { parentNotified: true });
      showToast('Veli bilgilendirildi olarak işaretlendi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Olay Kayıtları</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Düşme, yaralanma ve diğer güvenlik olayları.
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
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni Olay
          </button>
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
                Öğrenci
              </label>
              <select
                value={fStudentId}
                onChange={(e) => setFStudentId(e.target.value)}
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
                Kategori
              </label>
              <select
                value={fCategory}
                onChange={(e) => setFCategory(e.target.value as IncidentCategory)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Olay zamanı
              </label>
              <input
                type="datetime-local"
                value={fOccurredAt}
                onChange={(e) => setFOccurredAt(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={fParentNotified}
                  onChange={(e) => setFParentNotified(e.target.checked)}
                />
                Veli bilgilendirildi
              </label>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Açıklama
            </label>
            <textarea
              value={fDescription}
              onChange={(e) => setFDescription(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Alınan aksiyon (opsiyonel)
            </label>
            <textarea
              value={fActionTaken}
              onChange={(e) => setFActionTaken(e.target.value)}
              rows={2}
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
              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-semibold">Olay kaydı yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {CATEGORY_LABEL[i.category]}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {studentName(i.studentId)} ·{' '}
                    {new Date(i.occurredAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                {i.parentNotified ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                    ✓ Veli Bilgili
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                    Bekliyor
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {i.description}
              </p>
              {i.actionTaken && (
                <p className="text-[11px] text-slate-600 italic">
                  Aksiyon: {i.actionTaken}
                </p>
              )}
              {!i.parentNotified && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => void markParentNotified(i.id)}
                    disabled={busyId === i.id}
                    className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Veli Bilgilendirildi
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
