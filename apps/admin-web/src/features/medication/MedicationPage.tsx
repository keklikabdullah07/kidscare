import { useEffect, useState, useMemo, type JSX, type FormEvent } from 'react';
import {
  Pill,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Search,
  Calendar,
  AlertCircle,
  FileText,
  Check,
  Trash2,
} from 'lucide-react';
import type { MedicationRecord, StandaloneMedicationStatus, Student } from '@kidscare/shared-types';
import {
  listMedicationRecords,
  createMedicationRecord,
  approveMedicationRecord,
  rejectMedicationRecord,
  markMedicationGiven,
  markMedicationSkipped,
  deleteMedicationRecord,
} from '../../api/medication';
import { listStudents } from '../../api/students';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { PromptModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { TactileButton } from '../../components/ui/TactileButton';
import { TactileTabs, type TactileTabItem } from '../../components/ui/TactileTabs';

type TabKey = 'ALL' | 'REQUESTED' | 'TODAY' | 'GIVEN' | 'ARCHIVED';

const STATUS_LABEL: Record<StandaloneMedicationStatus, string> = {
  REQUESTED: 'Onay Bekliyor',
  APPROVED: 'Onaylandı',
  SCHEDULED: 'Planlandı',
  GIVEN: 'Verildi',
  SKIPPED: 'Atlandı',
  REJECTED: 'Reddedildi',
};

const STATUS_STYLE: Record<StandaloneMedicationStatus, string> = {
  REQUESTED:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  APPROVED:
    'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
  SCHEDULED:
    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
  GIVEN:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  SKIPPED:
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  REJECTED:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
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

export function MedicationPage(): JSX.Element {
  const { state } = useAuth();
  const role = state.status === 'authenticated' ? state.user.role : 'PARENT';
  const currentUserId = state.status === 'authenticated' ? state.user.id : '';

  const [records, setRecords] = useState<MedicationRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [administerRecord, setAdministerRecord] = useState<MedicationRecord | null>(null);
  const [administerTime, setAdministerTime] = useState(toLocalDatetimeInput());
  const [administerNote, setAdministerNote] = useState('');
  const [administerSubmitting, setAdministerSubmitting] = useState(false);

  // Delete modal state
  const [deleteRecord, setDeleteRecord] = useState<MedicationRecord | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Create form state
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formParentNote, setFormParentNote] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Prompt dialog for Reject or Skip
  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    type: 'reject' | 'skip';
    recordId: string;
    studentName: string;
    medicationName: string;
  } | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listMedicationRecords(), listStudents()]);
      setRecords(list);
      setStudents(studentsRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İlaç listesi yüklenemedi', 'error');
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

  function studentFullName(id: string): string {
    const s = getStudent(id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  // Summary Metrics
  const pendingCount = useMemo(
    () => records.filter((r) => r.status === 'REQUESTED').length,
    [records],
  );
  const todayPlanCount = useMemo(
    () => records.filter((r) => r.status === 'APPROVED' || r.status === 'SCHEDULED').length,
    [records],
  );
  const givenCount = useMemo(() => records.filter((r) => r.status === 'GIVEN').length, [records]);
  const archivedCount = useMemo(
    () => records.filter((r) => r.status === 'SKIPPED' || r.status === 'REJECTED').length,
    [records],
  );

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Tab filter
      if (activeTab === 'REQUESTED' && r.status !== 'REQUESTED') return false;
      if (activeTab === 'TODAY' && r.status !== 'APPROVED' && r.status !== 'SCHEDULED')
        return false;
      if (activeTab === 'GIVEN' && r.status !== 'GIVEN') return false;
      if (activeTab === 'ARCHIVED' && r.status !== 'SKIPPED' && r.status !== 'REJECTED')
        return false;

      // 2. Student dropdown filter
      if (selectedStudentFilter && r.studentId !== selectedStudentFilter) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sName = studentFullName(r.studentId).toLowerCase();
        const medName = r.medicationName.toLowerCase();
        const dosage = r.dosage.toLowerCase();
        const inst = (r.instructions || '').toLowerCase();
        if (
          !sName.includes(q) &&
          !medName.includes(q) &&
          !dosage.includes(q) &&
          !inst.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, selectedStudentFilter, searchQuery, students]);

  // Actions
  async function handleApprove(record: MedicationRecord): Promise<void> {
    setBusyId(record.id);
    try {
      await approveMedicationRecord(record.id, {});
      showToast(
        `${studentFullName(record.studentId)} için ${record.medicationName} onaylandı.`,
        'success',
      );
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Onay işlemi başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function handleOpenReject(record: MedicationRecord): void {
    setPromptDialog({
      isOpen: true,
      type: 'reject',
      recordId: record.id,
      studentName: studentFullName(record.studentId),
      medicationName: record.medicationName,
    });
  }

  function handleOpenSkip(record: MedicationRecord): void {
    setPromptDialog({
      isOpen: true,
      type: 'skip',
      recordId: record.id,
      studentName: studentFullName(record.studentId),
      medicationName: record.medicationName,
    });
  }

  async function handlePromptConfirm(reason: string): Promise<void> {
    if (!promptDialog) return;
    const { type, recordId, medicationName } = promptDialog;
    setPromptDialog(null);
    setBusyId(recordId);
    try {
      if (type === 'reject') {
        await rejectMedicationRecord(recordId, { reason });
        showToast(`${medicationName} talebi reddedildi.`, 'success');
      } else {
        await markMedicationSkipped(recordId, { reason });
        showToast(`${medicationName} dozu atlandı olarak kaydedildi.`, 'success');
      }
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteRecord) return;
    setDeleteSubmitting(true);
    try {
      await deleteMedicationRecord(deleteRecord.id);
      showToast(`${deleteRecord.medicationName} ilaç kaydı başarıyla silindi.`, 'success');
      setDeleteRecord(null);
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İlaç kaydı silinemedi', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  }

  function handleOpenAdminister(record: MedicationRecord): void {
    setAdministerRecord(record);
    setAdministerTime(toLocalDatetimeInput());
    setAdministerNote('');
  }

  async function handleSubmitAdminister(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!administerRecord) return;
    setAdministerSubmitting(true);
    try {
      await markMedicationGiven(administerRecord.id, {
        givenAt: administerTime ? new Date(administerTime) : undefined,
        note: administerNote.trim() || undefined,
      });
      showToast(
        `${administerRecord.medicationName} başarıyla uygulandı ve kaydedildi! 💊`,
        'success',
      );
      setAdministerRecord(null);
      await refresh();
      setActiveTab('GIVEN');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İlaç verme kaydı başarısız', 'error');
    } finally {
      setAdministerSubmitting(false);
    }
  }

  async function handleSubmitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!formStudentId) {
      showToast('Lütfen öğrenci seçin.', 'error');
      return;
    }
    if (!formName.trim() || !formDosage.trim()) {
      showToast('İlaç adı ve dozaj bilgisi zorunludur.', 'error');
      return;
    }

    setCreateSubmitting(true);
    try {
      await createMedicationRecord({
        studentId: formStudentId,
        medicationName: formName.trim(),
        dosage: formDosage.trim(),
        instructions: formInstructions.trim() || undefined,
        scheduledAt: formScheduledAt ? new Date(formScheduledAt) : undefined,
        parentApprovalNote: formParentNote.trim() || undefined,
      });

      showToast('İlaç kullanım talebi başarıyla oluşturuldu! 🛡️', 'success');
      setCreateOpen(false);
      setFormStudentId('');
      setFormName('');
      setFormDosage('');
      setFormInstructions('');
      setFormScheduledAt('');
      setFormParentNote('');
      await refresh();
      setActiveTab('REQUESTED');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Talep oluşturulamadı', 'error');
    } finally {
      setCreateSubmitting(false);
    }
  }

  const medicationTabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      { id: 'ALL', label: 'Tümü', count: records.length, activeVariant: 'teal' },
      {
        id: 'REQUESTED',
        label: 'Onay Bekleyenler',
        count: pendingCount,
        activeVariant: 'amber',
        badgeCls: 'bg-amber-100 text-amber-900 font-black',
      },
      { id: 'TODAY', label: 'Günün İlaçları', count: todayPlanCount, activeVariant: 'teal' },
      { id: 'GIVEN', label: 'Verilenler', count: givenCount, activeVariant: 'teal' },
      {
        id: 'ARCHIVED',
        label: 'Atlanan & Reddedilenler',
        count: archivedCount,
        activeVariant: 'purple',
      },
    ],
    [records.length, pendingCount, todayPlanCount, givenCount, archivedCount],
  );

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Aksiyonlar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 border-2 border-teal-600/30 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shadow-xs">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                İlaç Takibi & Sağlık Kütüğü
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100/80 dark:bg-teal-900/50 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-700">
                Güvenlik & Sağlık
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Veli talepleri, hekim/veli talimatları, öğretmen onayı ve anlık uygulama kütüğü.
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

          {(role === 'PARENT' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <TactileButton
              type="button"
              variant="teal"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Yeni İlaç Talebi</span>
            </TactileButton>
          )}
        </div>
      </div>

      {/* Dokunsal KPI Özet Sayaçları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Onay Bekleyenler"
          value={pendingCount}
          subtitle="İnceleme gereken veli talepleri"
          icon={AlertCircle}
          variant="amber"
        />
        <StatCard
          title="Günün Planları"
          value={todayPlanCount}
          subtitle="Verilecek onaylı/planlı dozlar"
          icon={Calendar}
          variant="blue"
        />
        <StatCard
          title="Tamamlanan / Verilen"
          value={givenCount}
          subtitle="Bugün başarıyla uygulananlar"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Atlanan / Reddedilen"
          value={archivedCount}
          subtitle="Verilemeyen veya iptal kayıtlar"
          icon={XCircle}
          variant="rose"
        />
      </div>

      {/* Arama, Filtreleme ve Sekmeler */}
      <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700/80 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Dokunsal Sekmeler (Kapsayıcı Ray & Tıklanabilir 3D Butonlar) */}
        <div className="overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          <TactileTabs
            tabs={medicationTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            ariaLabel="İlaç Durumu Sekmeleri"
          />
        </div>

        {/* Arama ve Dropdown Filtreleri */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlaç adı, talimat veya öğrenci ara..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
          <div className="inline-block w-9 h-9 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3.5" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">
            İlaç kütüğü ve talimatlar yükleniyor…
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Filtreye uygun ilaç kaydı bulunamadı"
          description={
            searchQuery || selectedStudentFilter || activeTab !== 'ALL'
              ? 'Arama kriterlerinize veya seçilen sekmeye uygun bir ilaç kaydı yok. Filtreleri temizlemeyi deneyin.'
              : 'Henüz aktif veya geçmiş bir ilaç kullanım talebi bulunmuyor.'
          }
          action={
            (role === 'PARENT' || role === 'ADMIN' || role === 'SUPER_ADMIN') && !createOpen ? (
              <TactileButton
                type="button"
                variant="teal"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Yeni İlaç Talebi Oluştur</span>
              </TactileButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filteredRecords.map((r) => {
            const student = getStudent(r.studentId);
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-[#131B2E] rounded-2xl border-2 border-[#DDD4C4] dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Üst Satır: İlaç İsmi & Durum */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {r.medicationName}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-slate-700">
                          {r.dosage}
                        </span>
                      </div>

                      {/* Öğrenci Etiketi */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-200">
                          {student ? student.firstName.charAt(0) : 'Ö'}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {studentFullName(r.studentId)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLE[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>

                  {/* Talimat Kutusu */}
                  {r.instructions && (
                    <div className="text-xs text-slate-700 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <FileText className="w-3 h-3" />
                        <span>Kullanım Talimatı</span>
                      </div>
                      <p className="font-medium">{r.instructions}</p>
                    </div>
                  )}

                  {/* Veli Onay Notu */}
                  {r.parentApprovalNote && (
                    <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/50">
                      <span className="font-bold">Veli Notu: </span>
                      <span>{r.parentApprovalNote}</span>
                    </div>
                  )}

                  {/* Planlanan & Gerçekleşen Zaman */}
                  <div className="space-y-1 text-xs">
                    {r.scheduledAt && (
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Planlanan Saat: </span>
                        <strong className="text-slate-700 dark:text-slate-200">
                          {new Date(r.scheduledAt).toLocaleString('tr-TR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </strong>
                      </p>
                    )}

                    {r.givenAt && (
                      <div className="text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Verildi:{' '}
                          {new Date(r.givenAt).toLocaleString('tr-TR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    )}

                    {r.rejectionReason && (
                      <div className="text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60 text-xs font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Ret Gerekçesi: {r.rejectionReason}</span>
                      </div>
                    )}

                    {r.skipReason && (
                      <div className="text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Atlama Sebebi: {r.skipReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Eylem Butonları (Altın Kural: Kart sabit, butonlar dokunsal) */}
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Admin Onayla / Reddet */}
                  {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'REQUESTED' && (
                    <>
                      <TactileButton
                        type="button"
                        variant="teal"
                        size="sm"
                        onClick={() => void handleApprove(r)}
                        disabled={busyId === r.id}
                        title="İlaç kullanım talebini onaylayın"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Onayla</span>
                      </TactileButton>

                      <TactileButton
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenReject(r)}
                        disabled={busyId === r.id}
                        title="Talebi gerekçe belirterek reddedin"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reddet</span>
                      </TactileButton>
                    </>
                  )}

                  {/* Öğretmen / Admin İlaç Verme & Atlama */}
                  {(role === 'TEACHER' || role === 'ADMIN' || role === 'SUPER_ADMIN') &&
                    (r.status === 'APPROVED' || r.status === 'SCHEDULED') && (
                      <>
                        <TactileButton
                          type="button"
                          variant="teal"
                          size="sm"
                          onClick={() => handleOpenAdminister(r)}
                          disabled={busyId === r.id}
                          title="İlacın öğrenciye verildiğini kayıt altına alın"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>İlacı Ver</span>
                        </TactileButton>

                        <TactileButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenSkip(r)}
                          disabled={busyId === r.id}
                          title="Bu dozun atlanma gerekçesini girin"
                        >
                          <span>Dozu Atla</span>
                        </TactileButton>
                      </>
                    )}

                  {/* Silme Butonu (Admin/SuperAdmin veya kendi henüz verilmemiş talebini silebilen Veli) */}
                  {(role === 'ADMIN' ||
                    role === 'SUPER_ADMIN' ||
                    (role === 'PARENT' &&
                      r.requestedById === currentUserId &&
                      r.status !== 'GIVEN')) && (
                    <TactileButton
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteRecord(r)}
                      disabled={busyId === r.id}
                      title="İlaç kaydını sistemden silin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sil</span>
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Yeni İlaç Talebi Oluştur */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Yeni İlaç Kullanım Talebi
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Öğrencinin kreşte alacağı ilacın detaylarını girin.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmitCreate(e)} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Öğrenci *
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
                    İlaç Adı *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Calpol Şurup 120mg"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Dozaj Bilgisi *
                  </label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="Örn: 1 ölçek (5 ml)"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Planlanan Uygulama Saati
                </label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={(e) => setFormScheduledAt(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Kullanım Talimatı (Opsiyonel)
                </label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  rows={2}
                  placeholder="Örn: Öğle yemeğinden sonra tok karnına, bol su ile verilecek..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Veli Notu / İmzası (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formParentNote}
                  onChange={(e) => setFormParentNote(e.target.value)}
                  placeholder="Örn: Doktor reçetesi çantada bulunmaktadır."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreateOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="teal" size="sm" disabled={createSubmitting}>
                  {createSubmitting ? 'Kaydediliyor…' : 'Talebi Oluştur'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: İlaç Dozunu Verme / Uygulama */}
      {administerRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  İlaç Uygulamasını Kaydet
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dozun verildiğini onaylayarak sağlık günlüğüne işleyin.
                </p>
              </div>
            </div>

            {/* İlaç ve Öğrenci Özeti */}
            <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-slate-800 border border-teal-200/80 dark:border-slate-700 space-y-1">
              <p className="text-xs font-bold text-teal-950 dark:text-teal-200">
                Öğrenci: {studentFullName(administerRecord.studentId)}
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                İlaç: {administerRecord.medicationName} ({administerRecord.dosage})
              </p>
              {administerRecord.instructions && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Talimat: {administerRecord.instructions}
                </p>
              )}
            </div>

            <form onSubmit={(e) => void handleSubmitAdminister(e)} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Uygulama Zamanı
                </label>
                <input
                  type="datetime-local"
                  value={administerTime}
                  onChange={(e) => setAdministerTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Uygulama Notu (Opsiyonel)
                </label>
                <textarea
                  value={administerNote}
                  onChange={(e) => setAdministerNote(e.target.value)}
                  rows={2}
                  placeholder="Örn: Tok karnına 5 ml verildi. Ateşi 36.8 ölçüldü."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAdministerRecord(null)}
                >
                  Vazgeç
                </TactileButton>
                <TactileButton
                  type="submit"
                  variant="teal"
                  size="sm"
                  disabled={administerSubmitting}
                >
                  {administerSubmitting ? 'Kaydediliyor…' : 'Verildi Olarak Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Ret ve Atlama Gerekçesi İsteme (PromptModal) */}
      {promptDialog && (
        <PromptModal
          isOpen={promptDialog.isOpen}
          title={
            promptDialog.type === 'reject'
              ? `İlaç Talebini Reddet: ${promptDialog.medicationName}`
              : `İlaç Dozunu Atla: ${promptDialog.medicationName}`
          }
          description={
            promptDialog.type === 'reject'
              ? `${promptDialog.studentName} için talep edilen ilacın veliye bildirilecek ret gerekçesini yazın.`
              : `${promptDialog.studentName} için bu dozun neden uygulanamadığını sağlık kütüğüne işleyin.`
          }
          inputLabel={promptDialog.type === 'reject' ? 'Ret Gerekçesi' : 'Atlama Sebebi'}
          placeholder={
            promptDialog.type === 'reject'
              ? 'Örn: İlaç son kullanma tarihi geçmiş veya hekim reçetesi bulunmuyor...'
              : 'Örn: Öğrenci uyuyordu, veli bilgilendirilerek sonraki doza ertelendi...'
          }
          confirmText={promptDialog.type === 'reject' ? 'Talebi Reddet' : 'Atlandı Olarak Kaydet'}
          cancelText="Vazgeç"
          requireInput={true}
          isTextarea={true}
          variant={promptDialog.type === 'reject' ? 'danger' : 'warning'}
          onConfirm={(val) => void handlePromptConfirm(val)}
          onCancel={() => setPromptDialog(null)}
        />
      )}

      {/* MODAL 4: İlaç Kaydı Silme Onayı */}
      {deleteRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-rose-300 dark:border-rose-900/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  İlaç Kaydını Sil
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <p>
                <strong className="text-rose-950 dark:text-rose-200">
                  {deleteRecord.medicationName}
                </strong>{' '}
                ({deleteRecord.dosage}) isimli ilaç kaydını sistemden silmek istediğinize emin
                misiniz?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Öğrenci: <strong>{studentFullName(deleteRecord.studentId)}</strong>
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <TactileButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDeleteRecord(null)}
                disabled={deleteSubmitting}
              >
                Vazgeç
              </TactileButton>
              <TactileButton
                type="button"
                variant="danger"
                size="sm"
                onClick={() => void handleConfirmDelete()}
                disabled={deleteSubmitting}
              >
                {deleteSubmitting ? 'Siliniyor…' : 'Evet, Sil'}
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
