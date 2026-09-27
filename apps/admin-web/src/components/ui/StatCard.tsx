import type { ElementType, ReactNode, JSX } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ElementType<{ className?: string }>;
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo';
  badge?: ReactNode;
  progressPercent?: number;
  footer?: ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badge,
  progressPercent,
  footer,
}: StatCardProps): JSX.Element {
  const variantStyles = {
    blue: {
      borderHover: 'hover:border-blue-500/40 dark:hover:border-blue-500/40',
      iconBg: 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
      groupText: 'group-hover:text-blue-900 dark:group-hover:text-blue-400',
      progressBar: 'bg-blue-600',
    },
    amber: {
      borderHover: 'hover:border-amber-500/40 dark:hover:border-amber-500/40',
      iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      groupText: 'group-hover:text-amber-700 dark:group-hover:text-amber-300',
      progressBar: 'bg-amber-500',
    },
    emerald: {
      borderHover: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/40',
      iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      groupText: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
      progressBar: 'bg-emerald-600',
    },
    rose: {
      borderHover: 'hover:border-rose-500/40 dark:hover:border-rose-500/40',
      iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      groupText: 'group-hover:text-rose-700 dark:group-hover:text-rose-300',
      progressBar: 'bg-rose-600',
    },
    indigo: {
      borderHover: 'hover:border-indigo-500/40 dark:hover:border-indigo-500/40',
      iconBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      groupText: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300',
      progressBar: 'bg-indigo-600',
    },
  }[variant];

  return (
    <div
      className={`bg-white dark:bg-[#131E3A] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 ${variantStyles.borderHover} shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group cursor-default`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${variantStyles.groupText} transition-colors`}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl ${variantStyles.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {value}
          </span>
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </span>
          )}
          {badge}
        </div>

        {progressPercent !== undefined && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`${variantStyles.progressBar} h-full rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}

        {footer && <div className="mt-2 text-xs">{footer}</div>}
      </div>
    </div>
  );
}
