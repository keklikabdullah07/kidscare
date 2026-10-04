import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpenCheck, Calendar } from 'lucide-react';
import type { JSX } from 'react';

export interface DashboardHeroTimeGreeting {
  text: string;
  emoji: string;
  note: string;
}

export interface DashboardHeroProps {
  userName: string;
  timeGreeting: DashboardHeroTimeGreeting;
  totalStudents: number;
  presentCount: number;
  targetReportCount: number;
  filledReportsCount: number;
  todayFormatted: string;
}

export function DashboardHero({
  userName,
  timeGreeting,
  totalStudents,
  presentCount,
  targetReportCount,
  filledReportsCount,
  todayFormatted,
}: DashboardHeroProps): JSX.Element {
  const pendingReports = Math.max(0, targetReportCount - filledReportsCount);

  return (
    <section className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-transparent dark:border-slate-700/80 relative overflow-hidden">
      {/* Soft Warm Ambient Accents */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

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
            {pendingReports > 0 ? (
              <span> Tamamlanmayı bekleyen {pendingReports} öğrenci bülteni bulunuyor.</span>
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              {timeGreeting.note}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/attendance"
            className="rounded-full border-2 border-amber-600 bg-amber-500 hover:bg-amber-400 text-amber-950 px-5 py-2.5 text-sm font-extrabold shadow-[0_3px_0_0_#b45309,0_8px_16px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#b45309] active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-amber-950" />
            Yoklama Al
          </Link>
          <Link
            to="/tracking"
            className="rounded-full border-2 border-white/40 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 text-sm font-bold shadow-[0_3px_0_0_rgba(255,255,255,0.25),0_6px_14px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center gap-2"
          >
            <BookOpenCheck className="w-4.5 h-4.5 text-amber-200" />
            Günlük Takip
          </Link>
        </div>
      </div>
    </section>
  );
}
