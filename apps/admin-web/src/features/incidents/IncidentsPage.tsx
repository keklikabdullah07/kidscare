import { useEffect, useState, useMemo, type FormEvent, type JSX } from 'react';
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
  Calendar,
  Search,
  AlertCircle,
} from 'lucide-react';
import type { IncidentCategory, IncidentRecord, Student } from '@kidscare/shared-types';
import { createIncident, listIncidents, updateIncident } from '../../api/incidents';
import { listStudents } from '../../api/students';
import { useToast } from '../../components/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { TactileButton } from '../../components/ui/TactileButton';
import { TactileTabs, type TactileTabItem } from '../../components/ui/TactileTabs';

type TabKey = 'ALL' | 'PENDING_PARENT' | 'INJURIES' | 'ILLNESS' | 'BEHAVIOR';

interface CategoryMeta {
  label: string;
  icon: typeof AlertTriangle;
  badgeCls: string;
  accentBorder: string;
  iconBg: string;
}

const CATEGORY_META: Record<IncidentCategory, CategoryMeta> = {
  DUSME: {
    label: 'Düşme',
    icon: Activity,
    badgeCls:
      'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700',
    accentBorder: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  },
  YARALANMA: {
    label: 'Yaralanma',
    icon: Bandage,
    badgeCls:
      'bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700',
    accentBorder: 'border-l-rose-500',
    iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  },
  HASTALIK: {
    label: 'Hastalık / Ateş',
    icon: HeartPulse,
    badgeCls:
      'bg-sky-100/90 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-700',
    accentBorder: 'border-l-sky-500',
    iconBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
  },
  DAVRANIS: {
    label: 'Davranış',
    icon: ShieldAlert,
    badgeCls:
      'bg-purple-100/90 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700',
    accentBorder: 'border-l-purple-500',
    iconBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
  },
  KAZA: {
    label: 'Kaza',
    icon: AlertTriangle,
    badgeCls:
      'bg-orange-100/90 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-700',
    accentBorder: 'border-l-orange-500',
    iconBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400',
  },
  DIGER: {
    label: 'Diğer',
    icon: FileText,
    badgeCls:
      'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    accentBorder: 'border-l-stone-500',
    iconBg: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
  },
};

function toLocalDatetimeInput(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

export function IncidentsPage(): JSX.Element {
  const [items, setItems] = useState<IncidentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { showToast } = useToast();

  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // Create form state
  const [fStudentId, setFStudentId] = useState('');
  const [fCategory, setFCategory] = useState<IncidentCategory>('DUSME');
  const [fOccurredAt, setFOccurredAt] = useState(toLocalDatetimeInput());
  const [fDescription, setFDescription] = useState('');
  const [fActionTaken, setFActionTaken] = useState('');
  const [fParentNotified, setFParentNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listIncidents(), listStudents()]);
      setItems(list);
      setStudents(studentsRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kayıtlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function getStudent(id: string): Student | undefined {
    return students.find((x) => x.id === id);
  }

  function studentName(id: string): string {
    const s = getStudent(id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  // Summary Metrics
  const totalCount = items.length;
  const pendingNotificationCount = useMemo(
    () => items.filter((i) => !i.parentNotified).length,
    [items],
  );
  const injuryCount = useMemo(
    () =>
      items.filter(
        (i) => i.category === 'DUSME' || i.category === 'YARALANMA' || i.category === 'KAZA',
      ).length,
    [items],
  );
  const notifiedCount = useMemo(() => items.filter((i) => i.parentNotified).length, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      // 1. Tab filter
      if (activeTab === 'PENDING_PARENT' && i.parentNotified) return false;
      if (
        activeTab === 'INJURIES' &&
        i.category !== 'DUSME' &&
        i.category !== 'YARALANMA' &&
        i.category !== 'KAZA'
      )
        return false;
      if (activeTab === 'ILLNESS' && i.category !== 'HASTALIK') return false;
      if (activeTab === 'BEHAVIOR' && i.category !== 'DAVRANIS' && i.category !== 'DIGER')
        return false;

      // 2. Student filter
      if (selectedStudentFilter && i.studentId !== selectedStudentFilter) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sName = studentName(i.studentId).toLowerCase();
        const desc = i.description.toLowerCase();
        const action = (i.actionTaken || '').toLowerCase();
        const catLabel = (CATEGORY_META[i.category]?.label || '').toLowerCase();
        if (
          !sName.includes(q) &&
          !desc.includes(q) &&
          !action.includes(q) &&
          !catLabel.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, selectedStudentFilter, searchQuery, students]);

  async function submitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!fStudentId) {
      showToast('Lütfen olayın yaşandığı öğrenciyi seçin.', 'error');
      return;
    }
    if (!fDescription.trim()) {
      showToast('Lütfen olay açıklamasını girin.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createIncident({
        studentId: fStudentId,
        category: fCategory,
        occurredAt: new Date(fOccurredAt),
        description: fDescription.trim(),
        ...(fActionTaken.trim() ? { actionTaken: fActionTaken.trim() } : {}),
        parentNotified: fParentNotified,
      });

      showToast('Olay tutanağı başarıyla kaydedildi! 🛡️', 'success');
      setIsCreateOpen(false);
      setFStudentId('');
      setFDescription('');
      setFActionTaken('');
      setFParentNotified(false);
      setFOccurredAt(toLocalDatetimeInput());
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kayıt oluşturulamadı', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function markParentNotified(id: string): Promise<void> {
    setBusyId(id);
    try {
      await updateIncident(id, { parentNotified: true });
      showToast('Veli bilgilendirildi olarak kaydedildi. 📞', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  const incidentTabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      { id: 'ALL', label: 'Tüm Tutanaklar', count: totalCount, activeVariant: 'teal' },
      {
        id: 'PENDING_PARENT',
        label: 'Bildirim Bekleyenler',
        count: pendingNotificationCount,
        activeVariant: 'amber',
        badgeCls: 'bg-amber-100 text-amber-900 font-extrabold',
      },
      {
        id: 'INJURIES',
        label: 'Düşme & Yaralanma',
        count: injuryCount,
        activeVariant: 'rose',
      },
      { id: 'ILLNESS', label: 'Hastalık & Revir', activeVariant: 'sky' },
      { id: 'BEHAVIOR', label: 'Davranış & Diğer', activeVariant: 'purple' },
    ],
    [totalCount, pendingNotificationCount, injuryCount],
  );

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Dokunsal Aksiyonlar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-600/30 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Olay Kayıtları & Revir Takibi
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                Güvenlik & Sağlık
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Düşme, yaralanma, revir müdahaleleri, ilk yardım ve acil veli bildirim raporları.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <TactileButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refresh()}
            title="Kayıtları Yenile"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Yenile</span>
          </TactileButton>

          <TactileButton
            type="button"
            variant="amber"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Tutanak Oluştur</span>
          </TactileButton>
        </div>
      </div>

      {/* Dokunsal KPI Özet Sayaçları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Tutanak"
          value={totalCount}
          subtitle="Tüm kayıtlı olaylar"
          icon={FileText}
          variant="blue"
        />
        <StatCard
          title="Bildirim Bekleyenler"
          value={pendingNotificationCount}
          subtitle="Veliye henüz bildirilmemiş açık olaylar"
          icon={AlertCircle}
          variant="amber"
        />
        <StatCard
          title="Düşme & Yaralanma"
          value={injuryCount}
          subtitle="Fiziksel müdahale gerektirenler"
          icon={Bandage}
          variant="rose"
        />
        <StatCard
          title="Veliye Bildirildi"
          value={notifiedCount}
          subtitle="Ailesine iletilmiş kayıtlar"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Arama, Filtreleme ve Sekmeler */}
      <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700/80 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Dokunsal Sekmeler (Kapsayıcı Ray & Tıklanabilir 3D Butonlar) */}
        <div className="overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          <TactileTabs
            tabs={incidentTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            ariaLabel="Olay Kategorisi Sekmeleri"
          />
        </div>

        {/* Arama & Öğrenci Filtresi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Olay açıklaması, ilk yardım notu veya öğrenci ara..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tüm Öğrenciler ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kayıtlar Grid Listesi */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 shadow-xs">
          <div className="inline-block w-9 h-9 border-3 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin mb-3.5" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">
            Olay tutanakları yükleniyor…
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Filtreye uygun olay kaydı bulunamadı"
          description={
            searchQuery || selectedStudentFilter || activeTab !== 'ALL'
              ? 'Seçtiğiniz sekme veya arama kriterine uygun bir tutanak yok.'
              : 'Kreşinizde henüz bildirilmiş bir kaza veya yaralanma kaydı bulunmuyor.'
          }
          action={
            !isCreateOpen ? (
              <TactileButton
                type="button"
                variant="amber"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Tutanak Oluştur</span>
              </TactileButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filteredItems.map((i) => {
            const meta = CATEGORY_META[i.category] ?? CATEGORY_META.DIGER;
            const CategoryIcon = meta.icon;
            const student = getStudent(i.studentId);

            return (
              <div
                key={i.id}
                className="bg-white dark:bg-[#131B2E] rounded-2xl border-2 border-[#DDD4C4] dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-150"
              >
                <div className="space-y-3.5">
                  {/* Kart Üst Başlık: Kategori ve Veli Bildirim Rozeti */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${meta.iconBg}`}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${meta.badgeCls}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {/* Öğrenci İsmi */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                            {student ? student.firstName.charAt(0) : 'Ö'}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {studentName(i.studentId)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Veli Bildirim Etiketi */}
                    {i.parentNotified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Veliye Bildirildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Bildirim Bekliyor
                      </span>
                    )}
                  </div>

                  {/* Olay Açıklaması Kutusu */}
                  <div className="text-xs text-slate-800 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed font-medium">
                    <p>{i.description}</p>
                  </div>

                  {/* İlk Yardım / Müdahale Aksiyonu Kutusu */}
                  {i.actionTaken && (
                    <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                      <Bandage className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px] text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Uygulanan İlk Yardım / Aksiyon
                        </span>
                        <p className="mt-0.5 leading-relaxed font-medium">{i.actionTaken}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alt Satır: Tarih & Dokunsal Aksiyon Butonu */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(i.occurredAt).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!i.parentNotified && (
                    <TactileButton
                      type="button"
                      variant="teal"
                      size="sm"
                      onClick={() => void markParentNotified(i.id)}
                      disabled={busyId === i.id}
                      title="Veliye kaza/olay hakkında bilgi verildiğini kaydet"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Veliye Bildirildi Olarak İşaretle</span>
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Yeni Olay Tutanağı Oluştur */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Yeni Olay / Kaza Tutanağı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Düşme, yaralanma veya revir müdahalesini kayıt altına alın.
                </p>
              </div>
            </div>

            <form onSubmit={(e) => void submitCreate(e)} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Öğrenci *
                </label>
                <select
                  value={fStudentId}
                  onChange={(e) => setFStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">Öğrenci Seçiniz…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Olay Kategorisi *
                  </label>
                  <select
                    value={fCategory}
                    onChange={(e) => setFCategory(e.target.value as IncidentCategory)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {Object.entries(CATEGORY_META).map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Olay Zamanı *
                  </label>
                  <input
                    type="datetime-local"
                    value={fOccurredAt}
                    onChange={(e) => setFOccurredAt(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Olay Açıklaması *
                </label>
                <textarea
                  value={fDescription}
                  onChange={(e) => setFDescription(e.target.value)}
                  rows={2}
                  placeholder="Olayın nerede, nasıl ve ne zaman gerçekleştiğini detaylandırın…"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Uygulanan İlk Yardım / Aksiyon (Opsiyonel)
                </label>
                <textarea
                  value={fActionTaken}
                  onChange={(e) => setFActionTaken(e.target.value)}
                  rows={2}
                  placeholder="Örn: Soğuk kompres uygulandı, revir hemşiresi kontrol etti, yara temizlendi…"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fParentNotified}
                    onChange={(e) => setFParentNotified(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Veliye anında bilgi verildi (Telefonla arandı veya yüz yüze görüşüldü)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="amber" size="sm" disabled={submitting}>
                  {submitting ? 'Kaydediliyor…' : 'Tutanağı Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
