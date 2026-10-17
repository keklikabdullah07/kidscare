import { useEffect, useState, useMemo, type JSX } from 'react';
import type { Attendance, AttendanceStatus, Classroom, Student, User } from '@kidscare/shared-types';
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
  FileText,
  School,
  GraduationCap,
} from 'lucide-react';
import {
  checkInStudent,
  getAttendanceByDate,
  getAttendanceRange,
  updateStudentAttendance,
} from '../../api/attendance';
import { listStudents } from '../../api/students';
import { listClassrooms } from '../../api/classrooms';
import { listUsers } from '../../api/users';
import { CheckOutModal } from './CheckOutModal';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { TactileButton } from '../../components/ui/TactileButton';
import { PrintPreviewModal, AttendanceSheetPrint } from '../../components/print';

function formatTeacherName(email?: string): string {
  if (!email) return 'Öğretmen Atanmadı';
  const prefix = email.split('@')[0] ?? email;
  const parts = prefix.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return email;
  const capitalized = parts
    .map((p) => p.charAt(0).toLocaleUpperCase('tr-TR') + p.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ');
  return `Öğrt. ${capitalized}`;
}

function getTeacherDisplayName(teacher?: User | null): string {
  if (!teacher) return 'Öğretmen Atanmadı';
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return `Öğrt. ${fullName}`;
  return formatTeacherName(teacher.email);
}


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
  const { state: authState } = useAuth();
  const authUser = authState.status === 'authenticated' ? authState.user : null;
  const isAdmin =
    authState.status === 'authenticated' &&
    (authState.user.role === 'ADMIN' || authState.user.role === 'SUPER_ADMIN');
  const isTeacher = authState.status === 'authenticated' && authState.user.role === 'TEACHER';

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);
  const [showMebPrint, setShowMebPrint] = useState(false);
  const [printClassroomId, setPrintClassroomId] = useState<string>('ALL');
  const [printYear, setPrintYear] = useState<number>(() => parseInt(selectedDate.slice(0, 4), 10));
  const [printMonth, setPrintMonth] = useState<number>(() => parseInt(selectedDate.slice(5, 7), 10));
  const [monthlyAttendances, setMonthlyAttendances] = useState<Attendance[]>([]);
  const [loadingMonthlyAtt, setLoadingMonthlyAtt] = useState(false);

  const { showToast } = useToast();

  // MEB Modal açıldığında sayfa filtresini varsayılan olarak devralır
  useEffect(() => {
    if (showMebPrint) {
      if (isTeacher && classrooms.length > 0) {
        const validClass = classrooms.some((c) => c.id === selectedClassroomId)
          ? selectedClassroomId
          : classrooms[0]?.id ?? 'ALL';
        setPrintClassroomId(validClass);
      } else {
        setPrintClassroomId(selectedClassroomId);
      }
      setPrintYear(parseInt(selectedDate.slice(0, 4), 10));
      setPrintMonth(parseInt(selectedDate.slice(5, 7), 10));
    }
  }, [showMebPrint, selectedClassroomId, selectedDate, isTeacher, classrooms]);

  // MEB modalı açıkken seçili ayın tüm yoklama kayıtlarını aralık API'si ile çeker
  useEffect(() => {
    if (!showMebPrint) return;

    let isMounted = true;
    setLoadingMonthlyAtt(true);

    const daysInMonth = new Date(printYear, printMonth, 0).getDate();
    const startDate = `${printYear}-${String(printMonth).padStart(2, '0')}-01`;
    const endDate = `${printYear}-${String(printMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    getAttendanceRange(startDate, endDate)
      .then((records) => {
        if (isMounted) {
          setMonthlyAttendances(records);
          setLoadingMonthlyAtt(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error('Failed to load monthly attendance for MEB print', err);
          setMonthlyAttendances(Object.values(attendanceMap));
          setLoadingMonthlyAtt(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showMebPrint, printYear, printMonth, attendanceMap]);

  // Öğretmen için sadece kendi sınıfı izole edilir
  const teacherClassrooms = useMemo(() => {
    if (!isTeacher) return classrooms;
    if (!authUser) return [];
    const assigned = classrooms.filter((cls) =>
      cls.teachers?.some((t) => t.teacherId === authUser.id),
    );
    if (assigned.length > 0) return assigned;
    if (classrooms.length === 1) return classrooms;
    const studentClassIds = new Set(students.map((s) => s.classroomId).filter(Boolean));
    const matched = classrooms.filter((c) => studentClassIds.has(c.id));
    if (matched.length > 0) return matched;
    return [];
  }, [isTeacher, classrooms, authUser, students]);

  // Öğretmen ilk girdiğinde otomatik olarak kendi sınıfına odaklansın
  useEffect(() => {
    if (isTeacher && teacherClassrooms.length > 0) {
      if (selectedClassroomId === 'ALL' || !teacherClassrooms.some((c) => c.id === selectedClassroomId)) {
        const firstClass = teacherClassrooms[0];
        if (firstClass) setSelectedClassroomId(firstClass.id);
      }
    }
  }, [isTeacher, teacherClassrooms, selectedClassroomId]);

  function loadData(): void {
    setLoading(true);
    setError(null);

    Promise.all([
      listStudents(),
      getAttendanceByDate(selectedDate),
      listClassrooms().catch(() => []),
      listUsers('TEACHER').catch(() => []),
    ])
      .then(([studentsList, attList, classList, teacherList]) => {
        setStudents(studentsList);
        setClassrooms(classList);
        setTeachers(teacherList);
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

  // Seçili sınıfa göre kapsam öğrencileri (Kullanıcı bir sınıfa tıkladığında tüm alt istatistikler o sınıfa göre güncellenir)
  const scopedStudents = useMemo(() => {
    if (isTeacher) {
      if (teacherClassrooms.length > 0) {
        const allowedIds = new Set(teacherClassrooms.map((c) => c.id));
        return students.filter((s) => s.classroomId && allowedIds.has(s.classroomId));
      }
      return [];
    }
    if (selectedClassroomId === 'UNASSIGNED') {
      return students.filter((s) => !s.classroomId);
    }
    if (selectedClassroomId !== 'ALL') {
      return students.filter((s) => s.classroomId === selectedClassroomId);
    }
    return students;
  }, [isTeacher, teacherClassrooms, students, selectedClassroomId]);

  const selectedClassroom = useMemo(() => {
    return (isTeacher ? teacherClassrooms : classrooms).find((c) => c.id === selectedClassroomId) ?? null;
  }, [isTeacher, teacherClassrooms, classrooms, selectedClassroomId]);

  const printClassroom = useMemo(() => {
    return (isTeacher ? teacherClassrooms : classrooms).find((c) => c.id === printClassroomId) ?? null;
  }, [isTeacher, teacherClassrooms, classrooms, printClassroomId]);

  const printScopedStudents = useMemo(() => {
    if (isTeacher) {
      if (
        printClassroomId &&
        printClassroomId !== 'ALL' &&
        teacherClassrooms.some((c) => c.id === printClassroomId)
      ) {
        return students.filter((s) => s.classroomId === printClassroomId);
      }
      return students.filter((s) => teacherClassrooms.some((c) => c.id === s.classroomId));
    }
    if (printClassroomId === 'UNASSIGNED') {
      return students.filter((s) => !s.classroomId);
    }
    if (printClassroomId !== 'ALL') {
      return students.filter((s) => s.classroomId === printClassroomId);
    }
    return students;
  }, [students, printClassroomId, isTeacher, teacherClassrooms]);

  const printTeacherName = useMemo(() => {
    if (printClassroom && printClassroom.teachers && printClassroom.teachers.length > 0) {
      const firstAssignment = printClassroom.teachers[0];
      const teacherUser = teachers.find((t) => t.id === firstAssignment?.teacherId);
      if (teacherUser) {
        const full = [teacherUser.firstName, teacherUser.lastName].filter(Boolean).join(' ');
        if (full) return full;
      }
    }
    if (isTeacher && authUser) {
      const full = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ');
      if (full) return full;
    }
    return 'Sınıf Öğretmeni';
  }, [printClassroom, teachers, isTeacher, authUser]);

  // Bulk Check-in (Mark All Present in Selected Scope)
  function handleMarkAllPresent(): void {
    const absentCountInScope = scopedStudents.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    }).length;

    if (absentCountInScope === 0) {
      showToast('Seçili kapsamdaki tüm öğrenciler zaten mevcut veya işlem görmüş.', 'info');
      return;
    }

    setShowBulkPresentConfirm(true);
  }

  async function executeBulkMarkPresent(): Promise<void> {
    setShowBulkPresentConfirm(false);
    const absentStudentsInScope = scopedStudents.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    });

    setBulkLoading(true);
    try {
      const results = await Promise.all(
        absentStudentsInScope.map((s) => checkInStudent(s.id, selectedDate)),
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

  // Statistics (Seçili sınıfa / kapsama göre canlı hesaplanır)
  const totalStudents = scopedStudents.length;
  let presentCount = 0;
  let leftCount = 0;
  let excusedCount = 0;
  let absentCount = 0;

  for (const s of scopedStudents) {
    const att = attendanceMap[s.id];
    const st = att?.status ?? 'ABSENT';
    if (st === 'PRESENT') presentCount++;
    else if (st === 'LEFT') leftCount++;
    else if (st === 'EXCUSED') excusedCount++;
    else absentCount++;
  }

  // Tüm kreş genel sayaçları (Üstteki "Tüm Kreş" kartı her zaman genel toplamı yansıtır)
  const overallPresentCount = useMemo(() => {
    return students.filter((s) => {
      const st = attendanceMap[s.id]?.status;
      return st === 'PRESENT' || st === 'LEFT';
    }).length;
  }, [students, attendanceMap]);

  const overallExcusedCount = useMemo(() => {
    return students.filter((s) => {
      const st = attendanceMap[s.id]?.status;
      return st === 'EXCUSED';
    }).length;
  }, [students, attendanceMap]);

  const overallAbsentCount = useMemo(() => {
    return students.filter((s) => {
      const st = attendanceMap[s.id]?.status ?? 'ABSENT';
      return st === 'ABSENT';
    }).length;
  }, [students, attendanceMap]);

  // Sınıf Bazlı Canlı Katılım Metrikleri (Admin Paneli İçin)
  const classroomBreakdown = useMemo(() => {
    return classrooms.map((cls) => {
      const clsStudents = students.filter((s) => s.classroomId === cls.id);
      const total = clsStudents.length;
      let present = 0;
      let absent = 0;
      let excused = 0;

      for (const s of clsStudents) {
        const att = attendanceMap[s.id];
        const st = att?.status ?? 'ABSENT';
        if (st === 'PRESENT' || st === 'LEFT') {
          present++;
        } else if (st === 'EXCUSED') {
          excused++;
        } else {
          absent++;
        }
      }

      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      const teacherAssignment = cls.teachers?.[0];
      const assignedTeacher = teacherAssignment
        ? teachers.find((t) => t.id === teacherAssignment.teacherId)
        : null;

      return {
        classroom: cls,
        total,
        present,
        absent,
        excused,
        rate,
        assignedTeacher,
      };
    });
  }, [classrooms, students, attendanceMap, teachers]);

  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !s.classroomId);
  }, [students]);

  const unassignedPresent = useMemo(() => {
    return unassignedStudents.filter((s) => {
      const st = attendanceMap[s.id]?.status ?? 'ABSENT';
      return st === 'PRESENT' || st === 'LEFT';
    }).length;
  }, [unassignedStudents, attendanceMap]);

  const unassignedExcused = useMemo(() => {
    return unassignedStudents.filter((s) => {
      const st = attendanceMap[s.id]?.status;
      return st === 'EXCUSED';
    }).length;
  }, [unassignedStudents, attendanceMap]);

  const unassignedAbsent = useMemo(() => {
    return unassignedStudents.filter((s) => {
      const st = attendanceMap[s.id]?.status ?? 'ABSENT';
      return st === 'ABSENT';
    }).length;
  }, [unassignedStudents, attendanceMap]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return scopedStudents.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const contactMatch = s.passport?.emergencyContacts?.some((c) =>
          c.name.toLowerCase().includes(q),
        );
        if (!fullName.includes(q) && !contactMatch) return false;
      }

      if (!isTeacher) {
        if (selectedClassroomId === 'UNASSIGNED') {
          if (s.classroomId) return false;
        } else if (selectedClassroomId !== 'ALL' && s.classroomId !== selectedClassroomId) {
          return false;
        }
      }

      if (statusFilter !== 'all') {
        const att = attendanceMap[s.id];
        const st = att?.status ?? 'ABSENT';
        if (st !== statusFilter) return false;
      }

      return true;
    });
  }, [scopedStudents, isTeacher, attendanceMap, searchQuery, selectedClassroomId, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <PageHeader
        title="Giriş-Çıkış, Güvenlik & Yoklama"
        description="Öğrenci yoklama durumlarını kaydedin, pasaport yetkilisi doğrulamasıyla güvenli teslimatı sağlayın."
        icon={ShieldCheck}
        colorTheme="emerald"
        badges={
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/80 dark:border-emerald-800/60">
              {presentCount} Sınıfta
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 font-bold text-[11px] border border-rose-200/80 dark:border-rose-800/60">
              {absentCount} Gelmedi
            </span>
          </>
        }
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
              variant="secondary"
              size="md"
              onClick={() => setShowMebPrint(true)}
              title="Seçili ay için Millî Eğitim Bakanlığı resmi formatında aylık yoklama çizelgesini yazdır"
            >
              <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>📄 MEB Çizelgesi Yazdır</span>
            </TactileButton>

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

      {/* Sınıf Bazlı Canlı Katılım & Yoklama Kartları (Yalnızca Admin/SuperAdmin) */}
      {isAdmin && classrooms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Sınıflara Göre Canlı Katılım & Yoklama Dağılımı</span>
            </h2>
            {selectedClassroomId !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedClassroomId('ALL')}
                className="text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:underline cursor-pointer"
              >
                Tüm Sınıfları Göster (Filtreyi Kaldır)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Tüm Kreş Kartı */}
            <button
              type="button"
              onClick={() => setSelectedClassroomId('ALL')}
              className={`p-4 rounded-3xl border-2 text-left transition-all duration-150 ease-out flex flex-col justify-between cursor-pointer active:translate-y-[3px] active:shadow-none ${
                selectedClassroomId === 'ALL'
                  ? 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-[0_4px_0_0_#0f766e,0_8px_20px_-2px_rgba(17,94,89,0.25)] ring-2 ring-teal-500/20'
                  : 'border-[#DDD4C4] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Tüm Kreş
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200">
                    Genel Bakış
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Toplam <strong className="text-sm font-black text-slate-900 dark:text-white">{students.length}</strong> Öğrenci
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {overallPresentCount} Geldi
                  </span>
                  {overallExcusedCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {overallExcusedCount} İzinli
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300">
                    <MinusCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    {overallAbsentCount} Gelmedi
                  </span>
                </div>

                <div className="w-full bg-[#EFECE6] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${students.length > 0 ? Math.round((overallPresentCount / students.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </button>

            {/* Dinamik Sınıf Kartları */}
            {classroomBreakdown.map((item) => {
              const isSelected = selectedClassroomId === item.classroom.id;

              return (
                <button
                  key={item.classroom.id}
                  type="button"
                  onClick={() =>
                    setSelectedClassroomId(isSelected ? 'ALL' : item.classroom.id)
                  }
                  className={`p-4 rounded-3xl border-2 text-left transition-all duration-150 ease-out flex flex-col justify-between cursor-pointer active:translate-y-[3px] active:shadow-none ${
                    isSelected
                      ? 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-[0_4px_0_0_#0f766e,0_8px_20px_-2px_rgba(17,94,89,0.25)] ring-2 ring-teal-500/20'
                      : 'border-[#DDD4C4] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-xs font-black text-slate-900 dark:text-white truncate"
                        title={item.classroom.name}
                      >
                        {item.classroom.name}
                      </span>
                      {item.classroom.ageGroup && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          {item.classroom.ageGroup}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.assignedTeacher?.avatarUrl ? (
                        <img
                          src={item.assignedTeacher.avatarUrl}
                          alt="Öğretmen Avatar"
                          className="w-4 h-4 rounded-full object-cover shrink-0 border border-teal-600/40"
                        />
                      ) : (
                        <GraduationCap
                          className={`w-3.5 h-3.5 shrink-0 ${
                            item.assignedTeacher ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <span
                        className="truncate font-semibold text-[10px]"
                        title={item.assignedTeacher ? item.assignedTeacher.email : 'Öğretmen Atanmadı'}
                      >
                        {getTeacherDisplayName(item.assignedTeacher)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {item.present} Geldi
                      </span>
                      {item.excused > 0 && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {item.excused} İzinli
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300">
                        <MinusCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        {item.absent} Gelmedi
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-[#EFECE6] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.rate >= 80
                              ? 'bg-emerald-600 dark:bg-emerald-500'
                              : item.rate >= 50
                              ? 'bg-amber-600 dark:bg-amber-500'
                              : 'bg-rose-600 dark:bg-rose-500'
                          }`}
                          style={{ width: `${item.rate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>{item.total} Öğrenci</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          %{item.rate} Katılım
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Sınıf Atanmamış Öğrenciler (Varsa) */}
            {unassignedStudents.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedClassroomId(
                    selectedClassroomId === 'UNASSIGNED' ? 'ALL' : 'UNASSIGNED',
                  )
                }
                className={`p-4 rounded-3xl border-2 text-left transition-all duration-150 ease-out flex flex-col justify-between cursor-pointer active:translate-y-[3px] active:shadow-none ${
                  selectedClassroomId === 'UNASSIGNED'
                    ? 'border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-[0_4px_0_0_#92400e,0_8px_20px_-2px_rgba(217,119,6,0.25)] ring-2 ring-amber-500/20'
                    : 'border-[#DDD4C4] dark:border-slate-800/90 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Sınıfı Olmayanlar
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      Bekleyen
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Toplam <strong className="text-sm font-black text-slate-900 dark:text-white">{unassignedStudents.length}</strong> Öğrenci
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {unassignedPresent} Geldi
                  </span>
                  {unassignedExcused > 0 && (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {unassignedExcused} İzinli
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300">
                    <MinusCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    {unassignedAbsent} Gelmedi
                  </span>
                </div>
              </button>
            )}
          </div>
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
            className={`text-xs font-bold uppercase tracking-wider truncate ${statusFilter === 'all' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}
            title={
              selectedClassroom
                ? `${selectedClassroom.name} Mevcudu`
                : selectedClassroomId === 'UNASSIGNED'
                ? 'Sınıfsızlar'
                : 'Toplam Öğrenci'
            }
          >
            {selectedClassroom
              ? selectedClassroom.name
              : selectedClassroomId === 'UNASSIGNED'
              ? 'Sınıfsızlar'
              : 'Toplam Öğrenci'}
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

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {(isTeacher ? teacherClassrooms : classrooms).length > 0 && (
            <div className="relative">
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-2xl px-3 py-2 pr-8 focus:outline-hidden appearance-none shadow-2xs cursor-pointer"
                title="Sınıfa Göre Filtrele"
              >
                {!isTeacher && <option value="ALL">Tüm Sınıflar</option>}
                {(isTeacher ? teacherClassrooms : classrooms).map((c) => {
                  const brk = classroomBreakdown.find((b) => b.classroom.id === c.id);
                  const suffix = brk
                    ? ` (${brk.present} Geldi${brk.excused > 0 ? ` / ${brk.excused} İzinli` : ''} / ${brk.absent} Gelmedi)`
                    : '';
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name}{suffix}
                    </option>
                  );
                })}
                {!isTeacher && unassignedStudents.length > 0 && (
                  <option value="UNASSIGNED">
                    Sınıfsız Öğrenciler ({unassignedPresent} Geldi{unassignedExcused > 0 ? ` / ${unassignedExcused} İzinli` : ''} / {unassignedAbsent} Gelmedi)
                  </option>
                )}
              </select>
              <School className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]"
                                title={`${student.firstName} ${student.lastName}`}
                              >
                                {student.firstName} {student.lastName}
                              </span>
                              {classrooms.find((c) => c.id === student.classroomId) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200/80 dark:border-slate-700 shrink-0">
                                  <School className="w-2.5 h-2.5" />
                                  <span>{classrooms.find((c) => c.id === student.classroomId)?.name}</span>
                                </span>
                              )}
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
                                  <span
                                    title={student.passport.allergies.join(', ')}
                                    className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200/60 dark:border-rose-800/60 shrink-0"
                                  >
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
                        {status === 'EXCUSED' && att?.note && (
                          <div
                            className="text-[11px] text-amber-800 dark:text-amber-300 font-medium mt-1 max-w-[200px] truncate"
                            title={att.note}
                          >
                            {att.note}
                          </div>
                        )}
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className="font-bold text-slate-900 dark:text-white text-sm truncate"
                            title={`${student.firstName} ${student.lastName}`}
                          >
                            {student.firstName} {student.lastName}
                          </h4>
                          {classrooms.find((c) => c.id === student.classroomId) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-lg border border-teal-200/80 dark:border-slate-700 shrink-0">
                              <School className="w-2.5 h-2.5" />
                              <span>{classrooms.find((c) => c.id === student.classroomId)?.name}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            {student.dateOfBirth}
                          </p>
                          {student.passport?.allergies && student.passport.allergies.length > 0 && (
                            <span
                              title={student.passport.allergies.join(', ')}
                              className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200/60 dark:border-rose-800/60 shrink-0"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                              <span>{student.passport.allergies.length} Alerji</span>
                            </span>
                          )}
                        </div>
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
                    {status === 'EXCUSED' && att?.note && (
                      <div className="flex items-start justify-between text-amber-800 dark:text-amber-300">
                        <span className="font-medium">Mazeret:</span>
                        <strong className="font-bold text-right ml-2">{att.note}</strong>
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
                      className="btn-tactile-teal flex-1 min-h-[44px] py-2 text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Giriş Yap</span>
                    </button>
                  )}

                  {status === 'PRESENT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="btn-tactile-amber flex-1 min-h-[44px] py-2 text-xs font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Teslim Et</span>
                    </button>
                  )}

                  {status === 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="btn-tactile-secondary flex-1 min-h-[44px] py-2 text-xs font-bold"
                    >
                      Düzenle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'EXCUSED')}
                    className="btn-tactile-secondary min-h-[44px] px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300"
                    title="İzinli"
                  >
                    İzinli
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'ABSENT')}
                    className="btn-tactile-secondary min-h-[44px] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
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

      {/* MEB Monthly Attendance Sheet Print Preview Modal */}
      {showMebPrint && (
        <PrintPreviewModal
          isOpen={showMebPrint}
          onClose={() => setShowMebPrint(false)}
          title={`MEB Aylık Resmî Yoklama Çizelgesi — ${printClassroom ? printClassroom.name : 'Tüm Sınıflar & Gruplar'}`}
          subtitle={`${printMonth}. Ay ${printYear} • Toplam ${printScopedStudents.length} Kayıtlı Öğrenci • Resmî Teftiş & Arşiv Formatı`}
          orientation="landscape"
        >
          {/* Modal Toolbar - Hidden during printing */}
          <div className="print:hidden mb-4 p-3 bg-stone-50 dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <label className="font-semibold text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                <School className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                Sınıf / Grup:
                <select
                  value={printClassroomId}
                  onChange={(e) => setPrintClassroomId(e.target.value)}
                  className="ml-1 bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-stone-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-teal-600"
                >
                  {!isTeacher && (
                    <option value="ALL">Tüm Sınıflar & Gruplar ({students.length} Öğrenci)</option>
                  )}
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({students.filter((s) => s.classroomId === c.id).length} Öğrenci)
                    </option>
                  ))}
                  {!isTeacher && students.some((s) => !s.classroomId) && (
                    <option value="UNASSIGNED">
                      Sınıfsız Öğrenciler ({students.filter((s) => !s.classroomId).length} Öğrenci)
                    </option>
                  )}
                </select>
              </label>

              <div className="flex items-center gap-1.5 border-l border-stone-200 dark:border-slate-700 pl-3">
                <span className="font-semibold text-stone-700 dark:text-slate-300">Dönem:</span>
                <select
                  value={printMonth}
                  onChange={(e) => setPrintMonth(parseInt(e.target.value, 10))}
                  className="bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-600 rounded-lg px-2 py-1 text-stone-800 dark:text-slate-200 font-medium"
                >
                  {[
                    'Ocak',
                    'Şubat',
                    'Mart',
                    'Nisan',
                    'Mayıs',
                    'Haziran',
                    'Temmuz',
                    'Ağustos',
                    'Eylül',
                    'Ekim',
                    'Kasım',
                    'Aralık',
                  ].map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
                <select
                  value={printYear}
                  onChange={(e) => setPrintYear(parseInt(e.target.value, 10))}
                  className="bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-600 rounded-lg px-2 py-1 text-stone-800 dark:text-slate-200 font-medium"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400">
              {loadingMonthlyAtt ? (
                <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium animate-pulse">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Veriler güncelleniyor...
                </span>
              ) : (
                <span className="text-[11px]">
                  {monthlyAttendances.length} yoklama kaydı hazır
                </span>
              )}
            </div>
          </div>

          <AttendanceSheetPrint
            classroomName={printClassroom ? printClassroom.name : 'Tüm Okul & Gruplar'}
            year={printYear}
            month={printMonth}
            students={printScopedStudents}
            attendances={monthlyAttendances}
            teacherName={printTeacherName}
          />
        </PrintPreviewModal>
      )}
    </div>
  );
}
