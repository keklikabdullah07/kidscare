import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const VARIANT_MAP: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  warning: {
    container:
      'bg-amber-50 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  danger: {
    container:
      'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  info: {
    container:
      'bg-blue-50 text-blue-900 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  neutral: {
    container:
      'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
    dot: 'bg-slate-400 dark:bg-slate-500',
  },
  brand: {
    container:
      'bg-blue-50 text-blue-950 border-blue-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-blue-900 dark:bg-amber-400',
  },
};

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 font-semibold gap-1',
  md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps): React.ReactElement {
  const styles = VARIANT_MAP[variant];
  const sizeStyles = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${styles.container} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      {children}
    </span>
  );
}
