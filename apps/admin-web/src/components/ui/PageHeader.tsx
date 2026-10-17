import React, { type ReactElement, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type PageHeaderColor = 'teal' | 'amber' | 'rose' | 'indigo' | 'sky' | 'emerald';

export interface PageHeaderProps {
  title: string;
  description?: string | undefined;
  icon: LucideIcon;
  colorTheme?: PageHeaderColor | undefined;
  badges?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  className?: string | undefined;
}

const THEME_STYLES: Record<
  PageHeaderColor,
  {
    gradient: string;
    iconBg: string;
  }
> = {
  teal: {
    gradient: 'from-teal-500/12 via-teal-500/4 to-transparent',
    iconBg: 'bg-teal-800 dark:bg-teal-700 text-white shadow-teal-950/25',
  },
  amber: {
    gradient: 'from-amber-500/14 via-amber-500/4 to-transparent',
    iconBg: 'bg-amber-600 dark:bg-amber-700 text-white shadow-amber-950/25',
  },
  rose: {
    gradient: 'from-rose-500/12 via-rose-500/4 to-transparent',
    iconBg: 'bg-rose-600 dark:bg-rose-700 text-white shadow-rose-950/25',
  },
  indigo: {
    gradient: 'from-indigo-500/12 via-indigo-500/4 to-transparent',
    iconBg: 'bg-indigo-700 dark:bg-indigo-600 text-white shadow-indigo-950/25',
  },
  sky: {
    gradient: 'from-sky-500/12 via-sky-500/4 to-transparent',
    iconBg: 'bg-sky-700 dark:bg-sky-600 text-white shadow-sky-950/25',
  },
  emerald: {
    gradient: 'from-emerald-500/12 via-emerald-500/4 to-transparent',
    iconBg: 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-emerald-950/25',
  },
};

/**
 * KidsCare Slim Page Hero Card
 * Modern, tactile, identity-colored header for all operation screens.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  colorTheme = 'teal',
  badges,
  actions,
  className = '',
}: PageHeaderProps): ReactElement {
  const theme = THEME_STYLES[colorTheme];

  return (
    <div
      className={`bg-white dark:bg-[#131B2E] rounded-3xl p-4 sm:p-5 border-2 border-[#DDD4C4] dark:border-slate-800 shadow-[0_4px_16px_rgba(45,38,30,0.04)] relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${className}`}
    >
      {/* Dynamic Background Accent Gradient */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-64 bg-gradient-to-r ${theme.gradient} pointer-events-none`}
      />

      <div className="flex flex-wrap items-center gap-3.5 relative z-10 min-w-0">
        {/* Module Icon Badge */}
        <div
          className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center font-bold shadow-md shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badges && <div className="flex items-center gap-1.5 flex-wrap">{badges}</div>}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap relative z-10 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
