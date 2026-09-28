import { useEffect, useState, type FormEvent, type JSX } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCheck,
  RotateCw,
  Activity,
  Bandage,
  HeartPulse,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import { createIncident, listIncidents, updateIncident } from '../../api/incidents';
import { listStudents } from '../../api/students';
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';

interface CategoryMeta {
  label: string;
  icon: typeof AlertTriangle;
  badgeCls: string;
}

const CATEGORY_META: Record<IncidentCategory, CategoryMeta> = {
  DUSME: {
    label: 'Düşme',
    icon: Activity,
    badgeCls:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  },
  YARALANMA: {
    label: 'Yaralanma',
    icon: Bandage,
    badgeCls:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  },
  HASTALIK: {
    label: 'Hastalık',
    icon: HeartPulse,
    badgeCls:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
  },
  DAVRANIS: {
    label: 'Davranış',
    icon: ShieldAlert,
    badgeCls:
      'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  },
  KAZA: {
    label: 'Kaza',
    icon: AlertTriangle,
    badgeCls:
      'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
  },
  DIGER: {
    label: 'Diğer',
    icon: FileText,
    badgeCls:
      'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700',
  },
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
  const [fOccurredAt, setFOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white dark:bg-slate-800 dark:text-teal-300 dark:border dark:border-slate-700 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Olay Kayıtları
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Düşme, yaralanma ve acil durum güvenlik raporları
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-2xs transition active:scale-98"
          >
            <RotateCw className="w-3.5 h-3.5" /> Yenile
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni Olay Kaydı
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void submitCreate(e)}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
                Öğrenci
              </label>
              <select
                value={fStudentId}
                onChange={(e) => setFStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-amber-500/20"
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
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
                Kategori
              </label>
              <select
                value={fCategory}
                onChange={(e) => setFCategory(e.target.value as IncidentCategory)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-amber-500/20"
              >
                {Object.entries(CATEGORY_META).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
                Olay Zamanı
              </label>
              <input
                type="datetime-local"
                value={fOccurredAt}
                onChange={(e) => setFOccurredAt(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-amber-500/20"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fParentNotified}
                  onChange={(e) => setFParentNotified(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-teal-700 dark:text-amber-500 focus:ring-teal-500"
                />
                Veliye anında bilgi verildi
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-300 ml-5 mt-0.5">
                Veli telefonla arandıysa veya yüz yüze bildirildiyse işaretleyin
              </span>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
              Olay Açıklaması
            </label>
            <textarea
              value={fDescription}
              onChange={(e) => setFDescription(e.target.value)}
              placeholder="Olayın nerede, nasıl ve ne zaman gerçekleştiğini detaylandırın…"
              rows={2}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider block mb-1.5">
              Uygulanan İlk Yardım / Aksiyon
            </label>
            <textarea
              value={fActionTaken}
              onChange={(e) => setFActionTaken(e.target.value)}
              placeholder="Örn: Soğuk kompres uygulandı, revir hemşiresi kontrol etti…"
              rows={2}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-amber-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-3.5 py-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              İptal
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white px-4 py-2 rounded-xl shadow-xs transition active:scale-98"
            >
              Olayı Kaydet
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">
            Olay kayıtları yükleniyor…
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-slate-700 dark:text-white text-sm font-bold">
            Kayıtlı Olay Bulunmuyor
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-sm mx-auto">
            Kreşinizde henüz bildirilmiş bir kaza veya yaralanma kaydı yok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((i) => {
            const meta = CATEGORY_META[i.category] ?? CATEGORY_META.DIGER;
            const CategoryIcon = meta.icon;

            return (
              <div
                key={i.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl border ${meta.badgeCls}`}
                    >
                      <CategoryIcon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <User className="w-3 h-3 text-slate-400" />
                      {studentName(i.studentId)}
                    </span>
                  </div>

                  {i.parentNotified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Veli Bilgili
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Bildirim Bekliyor
                    </span>
                  )}
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {i.description}
                  </p>
                </div>

                {i.actionTaken && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      İlk Yardım / Aksiyon:{' '}
                    </span>
                    <span>{i.actionTaken}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700/80">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(i.occurredAt).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!i.parentNotified && (
                    <button
                      type="button"
                      onClick={() => void markParentNotified(i.id)}
                      disabled={busyId === i.id}
                      title="Veliye kaza/olay hakkında bilgi verildiğini kaydet"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 inline-flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50 active:scale-98"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Veliye Bildirildi Olarak İşaretle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
