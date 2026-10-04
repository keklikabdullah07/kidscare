import { useEffect, useState, useMemo, type JSX } from 'react';
import type { Attendance, AttendanceStatus, Student } from '@kidscare/shared-types';
import {
  CheckCheck,
  Search,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  LogOut,
  Clock,
  MinusCircle,
  HeartPulse,
  AlertTriangle,
} from 'lucide-react';
import { checkInStudent, getAttendanceByDate, updateStudentAttendance } from '../../api/attendance';
import { listStudents } from '../../api/students';
import { CheckOutModal } from './CheckOutModal';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { TactileButton } from '../../components/ui/TactileButton';

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
    lightBg: string;
    textClass: string;
  }
> = {
  PRESENT: {
    label: 'Giriş Yaptı (Mevcut)',
    icon: CheckCircle2,
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    lightBg:
      'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/60',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  LEFT: {
    label: 'Teslim Edildi (Ayrıldı)',
    icon: LogOut,
    badgeClass:
      'bg-blue-50 dark:bg-blue-950/50 text-teal-900 dark:text-teal-200 border-blue-200 dark:border-blue-800/80',
    lightBg: 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-800/60',
    textClass: 'text-blue-800 dark:text-blue-300',
  },
  EXCUSED: {
    label: 'İzinli / Raporlu',
    icon: Clock,
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    lightBg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/60',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  ABSENT: {
    label: 'Gelmedi',
    icon: MinusCircle,
    badgeClass:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    lightBg: 'bg-slate-50/80 dark:bg-slate-850 border-slate-200/80 dark:border-slate-700/80',
    textClass: 'text-slate-600 dark:text-slate-300',
  },
};

type ViewMode = 'table' | 'grid';
type StatusFilter = 'all' | AttendanceStatus;

export function AttendancePage(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);

  const { showToast } = useToast();

  function loadData(): void {
    setLoading(true);
    setError(null);

    Promise.all([listStudents(), getAttendanceByDate(selectedDate)])
      .then(([studentsList, attList]) => {
        setStudents(studentsList);
        const map: Record<string, Attendance> = {};
        for (const a of attList) {
          map[a.studentId] = a;
        }
        setAttendanceMap(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Yoklama verileri yüklenemedi');
        setLoading(false);
      });
  }

  useEffect(loadData, [selectedDate]);

  function changeDay(delta: number): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  async function handleQuickCheckIn(student: Student): Promise<void> {
    try {
      const saved = await checkInStudent(student.id, selectedDate);
      setAttendanceMap((prev) => ({ ...prev, [student.id]: saved }));
      showToast(
        `${student.firstName} ${student.lastName} giriş yaptı olarak işaretlendi.`,
        'success',
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş yapılamadı';
      setError(msg);
      showToast(msg, 'error');
    }
  }

  async function handleSetStatus(student: Student, status: AttendanceStatus): Promise<void> {
    try {
      const saved = await updateStudentAttendance(student.id, selectedDate, {
        status,
        ...(status === 'ABSENT' || status === 'EXCUSED'
          ? { checkInTime: null, checkOutTime: null }
          : {}),
      });
      setAttendanceMap((prev) => ({ ...prev, [student.id]: saved }));
      showToast(`${student.firstName} durumu: ${STATUS_CONFIG[status].label}`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Durum güncellenemedi';
      setError(msg);
      showToast(msg, 'error');
    }
  }

  const [showBulkPresentConfirm, setShowBulkPresentConfirm] = useState(false);

  // Bulk Check-in (Mark All Present)
  function handleMarkAllPresent(): void {
    const absentCount = students.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    }).length;

    if (absentCount === 0) {
      showToast('Sınıftaki tüm öğrenciler zaten mevcut veya işlem görmüş.', 'info');
      return;
    }

    setShowBulkPresentConfirm(true);
  }

  async function executeBulkMarkPresent(): Promise<void> {
    setShowBulkPresentConfirm(false);
    const absentStudents = students.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    });

    setBulkLoading(true);
    try {
      const results = await Promise.all(
        absentStudents.map((s) => checkInStudent(s.id, selectedDate)),
      );

      setAttendanceMap((prev) => {
        const next = { ...prev };
        for (const res of results) {
          next[res.studentId] = res;
        }
        return next;
      });

      showToast(`${results.length} öğrenci başarıyla sınıfa alındı.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toplu yoklama alınamadı';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBulkLoading(false);
    }
  }

  // Statistics
  const totalStudents = students.length;
  let presentCount = 0;
  let leftCount = 0;
  let excusedCount = 0;
  let absentCount = 0;

  for (const s of students) {
    const att = attendanceMap[s.id];
    const st = att?.status ?? 'ABSENT';
    if (st === 'PRESENT') presentCount++;
    else if (st === 'LEFT') leftCount++;
    else if (st === 'EXCUSED') excusedCount++;
    else absentCount++;
  }

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const contactMatch = s.passport?.emergencyContacts?.some((c) =>
          c.name.toLowerCase().includes(q),
        );
        if (!fullName.includes(q) && !contactMatch) return false;
      }

      if (statusFilter !== 'all') {
        const att = attendanceMap[s.id];
        const st = att?.status ?? 'ABSENT';
        if (st !== statusFilter) return false;
      }

      return true;
    });
  }, [students, attendanceMap, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <PageHeader
        title="Giriş-Çıkış, Güvenlik & Yoklama"
        description="Öğrenci yoklama durumlarını kaydedin, pasaport yetkilisi doğrulamasıyla güvenli teslimatı sağlayın."
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Picker Control */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700/80 p-1.5 rounded-2xl shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                onClick={() => changeDay(-1)}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FAF8F5] dark:hover:bg-slate-800 transition cursor-pointer"
                title="Önceki Gün"
                aria-label="Önceki Gün"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent px-2.5 py-1 outline-none cursor-pointer rounded-xl"
              />
              <button
                type="button"
                onClick={() => changeDay(1)}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FAF8F5] dark:hover:bg-slate-800 transition cursor-pointer"
                title="Sonraki Gün"
                aria-label="Sonraki Gün"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {!isToday && (
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedDate(todayStr)}
                  className="ml-1"
                >
                  Bugün
                </TactileButton>
              )}
            </div>

            <TactileButton
              variant="teal"
              size="md"
              disabled={bulkLoading || absentCount === 0}
              onClick={() => void handleMarkAllPresent()}
              title="Sınıftaki henüz gelmedi durumundaki tüm öğrencileri tek tıkla sınıfa al"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{bulkLoading ? 'İşleniyor…' : 'Tüm Sınıfı Geldi İşaretle'}</span>
            </TactileButton>
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Summary Cards with tactile 3D extrusion and claymorphic depth */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-3xl border-2 text-left p-5 transition-all duration-150 ease-out cursor-pointer active:translate-y-[3px] active:shadow-none ${
            statusFilter === 'all'
              ? 'border-[#0f766e] bg-[#115e59] text-white shadow-[0_4px_0_0_#042f2e,0_8px_20px_-2px_rgba(17,94,89,0.35)] font-bold'
              : 'border-[#DCD4C6] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] hover:-translate-y-1'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'all' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Toplam Öğrenci
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight tabular-nums">{totalStudents}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PRESENT')}
          className={`rounded-3xl border-2 text-left p-5 transition-all duration-150 ease-out cursor-pointer active:translate-y-[3px] active:shadow-none ${
            statusFilter === 'PRESENT'
              ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_4px_0_0_#064e3b,0_8px_20px_-2px_rgba(5,150,105,0.35)] font-bold'
              : 'border-[#DCD4C6] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] text-emerald-900 dark:text-emerald-300 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] hover:-translate-y-1'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusFilter === 'PRESENT' ? 'text-emerald-100' : 'text-emerald-800 dark:text-emerald-300'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mevcut (İçeride)</span>
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight tabular-nums">{presentCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('LEFT')}
          className={`rounded-3xl border-2 text-left p-5 transition-all duration-150 ease-out cursor-pointer active:translate-y-[3px] active:shadow-none ${
            statusFilter === 'LEFT'
              ? 'border-teal-800 bg-teal-800 text-white shadow-[0_4px_0_0_#042f2e,0_8px_20px_-2px_rgba(15,118,110,0.35)] font-bold'
              : 'border-[#DCD4C6] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] text-teal-900 dark:text-teal-300 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] hover:-translate-y-1'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusFilter === 'LEFT' ? 'text-teal-100' : 'text-teal-800 dark:text-teal-300'}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Teslim Edildi</span>
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight tabular-nums">{leftCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('EXCUSED')}
          className={`rounded-3xl border-2 text-left p-5 transition-all duration-150 ease-out cursor-pointer active:translate-y-[3px] active:shadow-none ${
            statusFilter === 'EXCUSED'
              ? 'border-amber-600 bg-amber-600 text-white shadow-[0_4px_0_0_#92400e,0_8px_20px_-2px_rgba(217,119,6,0.35)] font-bold'
              : 'border-[#DCD4C6] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] text-amber-900 dark:text-amber-300 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] hover:-translate-y-1'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusFilter === 'EXCUSED' ? 'text-amber-100' : 'text-amber-800 dark:text-amber-300'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>İzinli / Raporlu</span>
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight tabular-nums">{excusedCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ABSENT')}
          className={`rounded-3xl border-2 text-left p-5 transition-all duration-150 ease-out cursor-pointer active:translate-y-[3px] active:shadow-none ${
            statusFilter === 'ABSENT'
              ? 'border-slate-700 bg-slate-700 text-white shadow-[0_4px_0_0_#1e293b,0_8px_20px_-2px_rgba(71,85,105,0.35)] font-bold'
              : 'border-[#DCD4C6] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] text-slate-800 dark:text-slate-200 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] hover:-translate-y-1'
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusFilter === 'ABSENT' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Gelmedi</span>
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight tabular-nums">{absentCount}</p>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#131B2E] p-4.5 rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci veya veli adı ara..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 dark:focus:ring-amber-500/20 dark:focus:border-amber-500 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Gösterilen:{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {filteredStudents.length}
            </strong>{' '}
            / {students.length}
          </span>

          <div className="flex items-center bg-[#FCFAF7] dark:bg-slate-900 p-1 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 shadow-2xs text-teal-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Tablo Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-2xs text-teal-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Student Attendance List */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            Yoklama listesi yükleniyor…
          </p>
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Kayıtlı öğrenci bulunamadı."
          description="Yoklama alabilmek için önce sisteme öğrenci kaydetmelisiniz."
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Filtrelere uygun öğrenci bulunamadı."
          description="Arama kriterlerinizi değiştirebilir veya filtreleri sıfırlayabilirsiniz."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-teal-900 dark:text-teal-300 font-semibold hover:underline"
            >
              Filtreleri Temizle
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDD4C4]/70 dark:border-slate-800 bg-[#FCFAF7] dark:bg-slate-900/60 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <th className="py-4 px-4.5">Öğrenci</th>
                  <th className="py-4 px-4.5">Durum</th>
                  <th className="py-4 px-4.5">Giriş Saati</th>
                  <th className="py-4 px-4.5">Çıkış / Teslim Alan</th>
                  <th className="py-4 px-4.5 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD4C4]/50 dark:divide-slate-800/80 text-xs">
                {filteredStudents.map((student) => {
                  const att = attendanceMap[student.id];
                  const status = att?.status ?? 'ABSENT';
                  const statusInfo = STATUS_CONFIG[status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#F9F7F3] dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-200 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-slate-700 shadow-2xs">
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]"
                              title={`${student.firstName} ${student.lastName}`}
                            >
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-slate-600 dark:text-slate-300 text-[11px] shrink-0 font-medium">
                                {student.dateOfBirth}
                              </span>
                              {student.passport?.bloodType &&
                                student.passport.bloodType !== 'UNKNOWN' && (
                                  <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-900/60 shrink-0">
                                    <HeartPulse className="w-2.5 h-2.5" />
                                    <span>{student.passport.bloodType}</span>
                                  </span>
                                )}
                              {student.passport?.allergies &&
                                student.passport.allergies.length > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200/60 dark:border-rose-800/60 shrink-0">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                                    <span>{student.passport.allergies.length} Alerji</span>
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border text-xs shadow-2xs ${statusInfo.badgeClass}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Check In Info */}
                      <td className="py-4 px-4.5">
                        {att?.checkInTime ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                              {att.checkInTime}
                            </span>
                            {att.checkInBy && (
                              <span className="text-slate-600 dark:text-slate-300 block text-[11px] font-medium mt-0.5">
                                Getiren: {att.checkInBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400">—</span>
                        )}
                      </td>

                      {/* Check Out / Pickup Info */}
                      <td className="py-4 px-4.5">
                        {att?.checkOutTime ? (
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              <span className="tabular-nums">{att.checkOutTime}</span> ·{' '}
                              <span className="text-teal-900 dark:text-teal-300">
                                {att.checkOutBy}
                              </span>
                            </div>
                            {att.pickupNote && (
                              <span className="text-amber-800 dark:text-amber-300 italic block text-[11px] font-medium mt-0.5">
                                Not: {att.pickupNote}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {status !== 'PRESENT' && status !== 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => void handleQuickCheckIn(student)}
                              className="btn-tactile-teal px-3 py-1.5 text-xs font-bold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Giriş Yap</span>
                            </button>
                          )}

                          {status === 'PRESENT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="btn-tactile-amber px-3 py-1.5 text-xs font-bold"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Teslim Et</span>
                            </button>
                          )}

                          {status === 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="btn-tactile-secondary px-3 py-1.5 text-xs font-semibold"
                            >
                              Düzenle
                            </button>
                          )}

                          {/* Status Switch buttons */}
                          {status !== 'EXCUSED' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'EXCUSED')}
                              className="btn-tactile-secondary px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-300"
                              title="İzinli Olarak İşaretle"
                            >
                              İzinli
                            </button>
                          )}

                          {status !== 'ABSENT' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'ABSENT')}
                              className="btn-tactile-secondary px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200"
                              title="Gelmedi Olarak İşaretle"
                            >
                              Gelmedi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode (Touch & Tablet Optimized) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const att = attendanceMap[student.id];
            const status = att?.status ?? 'ABSENT';
            const statusInfo = STATUS_CONFIG[status];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={student.id}
                className="p-5 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-200 font-bold text-sm flex items-center justify-center shadow-xs border border-teal-200/60 dark:border-slate-700 shrink-0">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className="font-bold text-slate-900 dark:text-white text-sm truncate"
                          title={`${student.firstName} ${student.lastName}`}
                        >
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {student.dateOfBirth}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 shadow-2xs ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Timing & pickup note */}
                  <div className="mt-3.5 text-xs space-y-1.5 bg-[#FCFAF7] dark:bg-slate-900/60 p-3 rounded-2xl border border-[#DDD4C4]/70 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Giriş:</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums font-bold">
                        {att?.checkInTime || '—'}
                      </strong>
                    </div>
                    {att?.checkOutTime && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Çıkış:</span>
                        <strong className="text-teal-900 dark:text-teal-300 font-bold">
                          <span className="tabular-nums">{att.checkOutTime}</span> ({att.checkOutBy}
                          )
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Action Buttons */}
                <div className="mt-4 pt-3.5 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  {status !== 'PRESENT' && status !== 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => void handleQuickCheckIn(student)}
                      className="btn-tactile-teal flex-1 py-2 text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Giriş Yap</span>
                    </button>
                  )}

                  {status === 'PRESENT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="btn-tactile-amber flex-1 py-2 text-xs font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Teslim Et</span>
                    </button>
                  )}

                  {status === 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="btn-tactile-secondary flex-1 py-2 text-xs font-bold"
                    >
                      Düzenle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'EXCUSED')}
                    className="btn-tactile-secondary px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300"
                    title="İzinli"
                  >
                    İzinli
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'ABSENT')}
                    className="btn-tactile-secondary px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
                    title="Gelmedi"
                  >
                    Gelmedi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CheckOut Modal */}
      <CheckOutModal
        student={checkoutStudent}
        date={selectedDate}
        onClose={() => setCheckoutStudent(null)}
        onSaved={(updated) => {
          setAttendanceMap((prev) => ({ ...prev, [updated.studentId]: updated }));
          showToast('Güvenli teslimat başarıyla kaydedildi.', 'success');
        }}
      />

      {showBulkPresentConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Toplu Sınıf Girişi"
          description="Sınıftaki tüm gelmemiş öğrencilerin durumu 'Giriş Yaptı (Mevcut)' olarak güncellenecek. Onaylıyor musunuz?"
          confirmText="Evet, Tümünü Mevcut Yap"
          cancelText="Vazgeç"
          variant="success"
          onConfirm={() => void executeBulkMarkPresent()}
          onCancel={() => setShowBulkPresentConfirm(false)}
        />
      )}
    </div>
  );
}
