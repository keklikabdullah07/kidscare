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
    teal: {
      borderHover: 'hover:border-teal-500/40 dark:hover:border-teal-500/40',
      iconBg: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
      groupText: 'group-hover:text-teal-800 dark:group-hover:text-teal-300',
      progressBar: 'bg-teal-600',
    },
    blue: {
      borderHover: 'hover:border-teal-500/40 dark:hover:border-teal-500/40',
      iconBg: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
      groupText: 'group-hover:text-teal-800 dark:group-hover:text-teal-300',
      progressBar: 'bg-teal-600',
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
      className={`bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-[#DDD4C4] dark:border-slate-800 ${variantStyles.borderHover} shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] hover:shadow-[0_16px_36px_-4px_rgba(20,32,54,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-default`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${variantStyles.groupText} transition-colors`}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-2xl ${variantStyles.iconBg} flex items-center justify-center group-hover:scale-108 transition-transform duration-300 shadow-2xs`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
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
          <div className="w-full bg-[#EFEAE0] dark:bg-slate-900/80 dark:border dark:border-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`${variantStyles.progressBar} h-full rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}

        {footer && <div className="mt-2.5 text-xs">{footer}</div>}
      </div>
    </div>
  );
}
