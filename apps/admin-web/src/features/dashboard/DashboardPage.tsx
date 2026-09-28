import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  BookOpenCheck,
  Utensils,
  ArrowRight,
  AlertTriangle,
  Heart,
  Coffee,
  Sun,
  Cookie,
  ShieldAlert,
  Pill,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { listStudents } from '../../api/students';
import { getAttendanceByDate } from '../../api/attendance';
import { getDailyReportsByDate } from '../../api/daily-reports';
import { getDailyMenu, type DailyMenuResponse } from '../../api/daily-menus';
import { getOperationalAlerts } from '../../api/tenants';
import type {
  Attendance,
  DailyReport,
  OperationalAlertsResponse,
  Student,
  StudentPassport,
} from '@kidscare/shared-types';

export function DashboardPage(): JSX.Element {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [menuData, setMenuData] = useState<DailyMenuResponse | null>(null);
  const [alerts, setAlerts] = useState<OperationalAlertsResponse | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void Promise.allSettled([
      listStudents(),
      getAttendanceByDate(today),
      getDailyReportsByDate(today),
      getDailyMenu(today),
      getOperationalAlerts(),
    ]).then(([studentsRes, attRes, repRes, menuRes, alertsRes]) => {
      if (cancelled) return;

      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value);
      if (attRes.status === 'fulfilled') setAttendances(attRes.value);
      if (repRes.status === 'fulfilled') setReports(repRes.value);
      if (menuRes.status === 'fulfilled') setMenuData(menuRes.value);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [today]);

  const totalStudents = students.length;
  const presentCount = attendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LEFT',
  ).length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;
  const excusedCount = attendances.filter((a) => a.status === 'EXCUSED').length;
  const filledReportsCount = reports.length;
  const targetReportCount = presentCount > 0 ? presentCount : totalStudents;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const reportRate =
    targetReportCount > 0 ? Math.round((filledReportsCount / targetReportCount) * 100) : 0;

  const studentsWithAllergies = students.filter((s) => {
    const passport: StudentPassport | null | undefined = s.passport;
    return (
      (passport?.allergies && passport.allergies.length > 0) ||
      (s.notes && s.notes.trim().length > 0)
    );
  });

  const userName = (() => {
    if (state.status !== 'authenticated') return 'Öğretmen';
    const email = state.user.email;
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0] ?? '';
      if (prefix) {
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    const roleLabels: Record<string, string> = {
      SUPERADMIN: 'Süper Admin',
      ADMIN: 'Kreş Müdürü',
      TEACHER: 'Öğretmen',
      PARENT: 'Veli',
    };
    return roleLabels[state.user.role] || 'Kreş Müdürü';
  })();

  const timeGreeting = (() => {
    const hour = new Date().getHours();
    if (hour < 11)
      return { text: 'Günaydın', emoji: '☀️', note: 'Güne enerjik bir başlangıç yapıyoruz!' };
    if (hour < 18)
      return { text: 'İyi günler', emoji: '🌤️', note: 'Öğrenme ve oyun dolu bir gün akışı.' };
    return {
      text: 'İyi akşamlar',
      emoji: '🌙',
      note: 'Günün tüm raporları ve teslimatları güvende.',
    };
  })();

  const menu = menuData?.menu;
  const breakfast = Array.isArray(menu?.breakfast) ? menu.breakfast : [];
  const lunch = Array.isArray(menu?.lunch) ? menu.lunch : [];
  const snack = Array.isArray(menu?.snack) ? menu.snack : [];
  const allergenWarnings = menuData?.allergenWarnings ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const pendingMedications = alerts?.immediateActions.pendingMedicationsCount ?? 0;
  const openIncidents = alerts?.immediateActions.openIncidentsCount ?? 0;
  const pendingPickups = alerts?.immediateActions.pendingPickupAuthorizationsCount ?? 0;
  const pendingRequests = alerts?.immediateActions.pendingParentRequestsCount ?? 0;
  const totalActionCount = pendingMedications + openIncidents + pendingPickups + pendingRequests;

  return (
    <div className="space-y-8">
      {/* 1. Grounded Warm Childcare Hero Header */}
      <section className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-transparent dark:border-slate-700/80 relative overflow-hidden">
        {/* Soft Warm Ambient Accents */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {timeGreeting.text}, {userName}{' '}
              <span className="text-amber-300 transform transition-transform hover:scale-125 hover:rotate-12 inline-block cursor-default">
                {timeGreeting.emoji}
              </span>
            </h1>
            <p className="text-teal-100/90 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
              Bugün kreşinizde{' '}
              <strong className="text-white font-bold">
                {totalStudents} kayıtlı öğrenciden {presentCount} tanesi
              </strong>{' '}
              katılım sağladı.
              {targetReportCount - filledReportsCount > 0 ? (
                <span>
                  {' '}
                  Tamamlanmayı bekleyen {targetReportCount - filledReportsCount} öğrenci bülteni
                  bulunuyor.
                </span>
              ) : (
                <span> Günün tüm karne ve bülten kayıtları eksiksiz tamamlandı.</span>
              )}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-teal-100 dark:text-slate-300 font-medium flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/15 dark:bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-white">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                {todayFormatted}
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 dark:bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-white">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                {timeGreeting.note}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              to="/attendance"
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 hover:shadow-md shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
              Yoklama Al
            </Link>
            <Link
              to="/tracking"
              className="bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border border-white/20 flex items-center gap-2 shadow-xs hover:shadow-sm"
            >
              <BookOpenCheck className="w-4 h-4 text-amber-200" />
              Günlük Takip
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Structured Operational KPIs with warm kindergarten accents */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Katılım Oranı & Yoklama */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500/40 dark:hover:border-blue-500/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider group-hover:text-teal-700 dark:group-hover:text-blue-300 transition-colors">
              Katılım Oranı
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                %{attendanceRate}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                ({presentCount}/{totalStudents} Mevcut)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-2">
              <span className="font-medium">{absentCount} Gelmedi</span>
              <span className="font-medium">{excusedCount} İzinli</span>
            </div>
          </div>
        </div>

        {/* Günlük Bülten / Karne */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              Günlük Bülten
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {filledReportsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                / {targetReportCount} Tamamlandı
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, reportRate)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 font-medium">
              {Math.max(0, targetReportCount - filledReportsCount)} öğrenci raporu bekleniyor
            </p>
          </div>
        </div>

        {/* Kayıtlı Öğrenci */}
        <Link
          to="/students"
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
              Kayıtlı Öğrenci
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {totalStudents}
              </span>
              {studentsWithAllergies.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                  {studentsWithAllergies.length} Alerji Takibi
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Öğrenci listesi ve pasaportları →
            </div>
          </div>
        </Link>

        {/* Günün Öğle Menüsü */}
        <Link
          to="/menus"
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Günün Öğle Menüsü
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
              {lunch.length > 0 ? lunch.slice(0, 2).join(', ') : 'Menü Planlanmadı'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 font-medium">
              {lunch.length > 0
                ? `${lunch.length} çeşit öğle yemeği →`
                : 'Menü girmek için tıklayın →'}
            </p>
          </div>
        </Link>
      </section>

      {/* 3. Operasyonel Eylem & Erken Uyarı Merkezi */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Operasyonel Eylem ve Güvenlik Merkezi
                {totalActionCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    {totalActionCount} Görev
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Sağlık, ilaç onayı, teslimat yetkileri ve veli izin talepleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 font-medium flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              {pendingMedications} İlaç
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {openIncidents} Olay
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              {pendingPickups} Teslimat
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              {pendingRequests} Veli Talebi
            </span>
          </div>
        </div>

        {alerts && alerts.immediateActions.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {alerts.immediateActions.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                  item.urgency === 'HIGH'
                    ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60'
                    : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                    {item.type === 'MEDICATION' && (
                      <Pill className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    )}
                    {item.type === 'INCIDENT' && (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    {item.type === 'PICKUP' && (
                      <ShieldAlert className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    )}
                    {item.type === 'PARENT_REQUEST' && (
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      {item.studentName && (
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.studentName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={item.actionUrl}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  İncele <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 px-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Operasyonel Durum Sakin & Güvenli
                </h3>
                <p className="text-xs text-blue-800/90 dark:text-blue-300/80">
                  Bekleyen kritik ilaç onayı, açık olay tutanağı veya bekleyen teslimat izni
                  bulunmuyor.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
              Tüm Kontroller Tamam
            </span>
          </div>
        )}
      </section>

      {/* 4. İki Kolonlu Detay Alanı: Yemek Menüsü & Sağlık Notları */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yemek Menüsü (2 Birim) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bugünün Yemek Listesi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Çocukların günlük dengeli beslenme takvimi
                </p>
              </div>
            </div>
            <Link
              to="/menus"
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 flex items-center gap-1"
            >
              Menü Detayı <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kahvaltı */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold text-xs mb-2">
                <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Sabah Kahvaltısı
              </div>
              {breakfast.length > 0 ? (
                <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  {breakfast.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300 italic">Girilmedi</p>
              )}
            </div>

            {/* Öğle Yemeği */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold text-xs mb-2">
                <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Öğle Yemeği
              </div>
              {lunch.length > 0 ? (
                <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  {lunch.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300 italic">Girilmedi</p>
              )}
            </div>

            {/* İkindi */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold text-xs mb-2">
                <Cookie className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                İkindi Ara Öğün
              </div>
              {snack.length > 0 ? (
                <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  {snack.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300 italic">Girilmedi</p>
              )}
            </div>
          </div>

          {allergenWarnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 text-xs">
              <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Günün Menüsünde Alerjen Çapraz Eşleşmesi ({allergenWarnings.length} Öğrenci)
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergenWarnings.map((w) => (
                  <span
                    key={w.studentId}
                    className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 font-medium"
                  >
                    {w.studentName}: {w.matchedAllergens.join(', ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağlık & Alerji Listesi (1 Birim) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Öğrenci Sağlık Notları
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Kayıtlı alerji ve bakım uyarıları
                </p>
              </div>
            </div>

            {studentsWithAllergies.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {studentsWithAllergies.map((s) => {
                  const passport: StudentPassport | null | undefined = s.passport;
                  const allergies = passport?.allergies ?? [];
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>
                          {s.firstName} {s.lastName}
                        </span>
                        {allergies.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            Alerjen
                          </span>
                        )}
                      </div>
                      {allergies.length > 0 && (
                        <p className="text-rose-700 dark:text-rose-300 font-medium">
                          Alerjiler: {allergies.join(', ')}
                        </p>
                      )}
                      {(passport?.specialNotes || s.notes) && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                          {passport?.specialNotes || s.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-300 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                Kayıtlı alerji uyarısı bulunmuyor.
              </div>
            )}
          </div>

          <Link
            to="/students"
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            Tüm Öğrenci Dosyaları <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
