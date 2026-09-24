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
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    lightBg:
      'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  LEFT: {
    label: 'Teslim Edildi (Ayrıldı)',
    icon: LogOut,
    badgeClass:
      'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    lightBg: 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/70 dark:border-teal-800/50',
    textClass: 'text-teal-700 dark:text-teal-400',
  },
  EXCUSED: {
    label: 'İzinli / Raporlu',
    icon: Clock,
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    lightBg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/50',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  ABSENT: {
    label: 'Gelmedi',
    icon: MinusCircle,
    badgeClass:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    lightBg: 'bg-slate-50/80 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Giriş-Çıkış, Güvenlik & Yoklama
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Öğrenci yoklama durumlarını kaydedin, pasaport yetkilisi doğrulamasıyla güvenli
                teslimatı sağlayın.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Fast Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker Control */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => changeDay(-1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent px-2 py-1 outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={() => changeDay(1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded-lg ml-1 transition"
              >
                Bugün
              </button>
            )}
          </div>

          {/* Quick Action: Mark All Present */}
          <button
            type="button"
            disabled={bulkLoading || absentCount === 0}
            onClick={() => void handleMarkAllPresent()}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sınıftaki henüz gelmedi durumundaki tüm öğrencileri tek tıkla sınıfa al"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{bulkLoading ? 'İşleniyor…' : 'Tüm Sınıfı Geldi İşaretle'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
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

      {/* Stats Summary Cards with warm icons and high contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'all'
              ? 'border-slate-800 bg-slate-900 text-white ring-2 ring-slate-800 dark:border-slate-700 dark:bg-slate-800'
              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100'
          }`}
        >
          <p
            className={`text-xs font-medium ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Toplam Öğrenci
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight tabular-nums">{totalStudents}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PRESENT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'PRESENT'
              ? 'border-emerald-600 bg-emerald-700 text-white ring-2 ring-emerald-600'
              : 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 ${statusFilter === 'PRESENT' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mevcut (İçeride)</span>
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight tabular-nums">{presentCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('LEFT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'LEFT'
              ? 'border-teal-700 bg-teal-800 text-white ring-2 ring-teal-700'
              : 'border-teal-200/80 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-900 dark:text-teal-200'
          }`}
        >
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 ${statusFilter === 'LEFT' ? 'text-teal-100' : 'text-teal-700 dark:text-teal-400'}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Teslim Edildi</span>
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight tabular-nums">{leftCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('EXCUSED')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'EXCUSED'
              ? 'border-amber-600 bg-amber-700 text-white ring-2 ring-amber-600'
              : 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200'
          }`}
        >
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 ${statusFilter === 'EXCUSED' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>İzinli / Raporlu</span>
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight tabular-nums">{excusedCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ABSENT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'ABSENT'
              ? 'border-slate-600 bg-slate-700 text-white ring-2 ring-slate-600'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 ${statusFilter === 'ABSENT' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Gelmedi</span>
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight tabular-nums">{absentCount}</p>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci veya veli adı ara..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Gösterilen:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {filteredStudents.length}
            </strong>{' '}
            / {students.length}
          </span>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-teal-700 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tablo Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-teal-700 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Yoklama listesi yükleniyor…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Kayıtlı öğrenci bulunamadı.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">Filtrelere uygun öğrenci bulunamadı.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3.5 px-4">Öğrenci</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Giriş Saati</th>
                  <th className="py-3.5 px-4">Çıkış / Teslim Alan</th>
                  <th className="py-3.5 px-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.map((student) => {
                  const att = attendanceMap[student.id];
                  const status = att?.status ?? 'ABSENT';
                  const statusInfo = STATUS_CONFIG[status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60">
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-slate-400 text-[11px]">
                                {student.dateOfBirth}
                              </span>
                              {student.passport?.bloodType &&
                                student.passport.bloodType !== 'UNKNOWN' && (
                                  <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-900/60">
                                    <HeartPulse className="w-2.5 h-2.5" />
                                    <span>{student.passport.bloodType}</span>
                                  </span>
                                )}
                              {student.passport?.allergies &&
                                student.passport.allergies.length > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200/60 dark:border-rose-800/60">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                                    <span>{student.passport.allergies.length} Alerji</span>
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-xs ${statusInfo.badgeClass}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Check In Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkInTime ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                              {att.checkInTime}
                            </span>
                            {att.checkInBy && (
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                                Getiren: {att.checkInBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Check Out / Pickup Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkOutTime ? (
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              <span className="tabular-nums">{att.checkOutTime}</span> ·{' '}
                              <span className="text-teal-700 dark:text-teal-400">
                                {att.checkOutBy}
                              </span>
                            </div>
                            {att.pickupNote && (
                              <span className="text-amber-700 dark:text-amber-300 italic block text-[11px]">
                                Not: {att.pickupNote}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'PRESENT' && status !== 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => void handleQuickCheckIn(student)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition active:scale-98"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Giriş Yap</span>
                            </button>
                          )}

                          {status === 'PRESENT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition active:scale-98"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Teslim Et</span>
                            </button>
                          )}

                          {status === 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg font-medium text-xs transition"
                            >
                              Düzenle
                            </button>
                          )}

                          {/* Status Switch buttons */}
                          {status !== 'EXCUSED' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'EXCUSED')}
                              className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 px-2 py-1.5 rounded-lg font-medium text-xs transition"
                              title="İzinli Olarak İşaretle"
                            >
                              İzinli
                            </button>
                          )}

                          {status !== 'ABSENT' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'ABSENT')}
                              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg font-medium text-xs transition"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const att = attendanceMap[student.id];
            const status = att?.status ?? 'ABSENT';
            const statusInfo = STATUS_CONFIG[status];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition shadow-xs flex flex-col justify-between ${statusInfo.lightBg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold text-sm flex items-center justify-center shadow-xs border border-teal-200/60 dark:border-teal-800/60">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {student.dateOfBirth}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Timing & pickup note */}
                  <div className="mt-3 text-xs space-y-1 bg-white/80 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Giriş:</span>
                      <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                        {att?.checkInTime || '—'}
                      </strong>
                    </div>
                    {att?.checkOutTime && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Çıkış:</span>
                        <strong className="text-teal-700 dark:text-teal-400">
                          <span className="tabular-nums">{att.checkOutTime}</span> ({att.checkOutBy}
                          )
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  {status !== 'PRESENT' && status !== 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => void handleQuickCheckIn(student)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Giriş Yap</span>
                    </button>
                  )}

                  {status === 'PRESENT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Teslim Et</span>
                    </button>
                  )}

                  {status === 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-xl text-xs font-medium transition"
                    >
                      Düzenle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'EXCUSED')}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-medium transition"
                    title="İzinli"
                  >
                    İzinli
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'ABSENT')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition"
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
