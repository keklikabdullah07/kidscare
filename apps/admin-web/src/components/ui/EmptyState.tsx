import type { ReactNode, ElementType, JSX } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ElementType<{ className?: string }>;
  action?: ReactNode;
  variant?: 'amber' | 'blue' | 'slate';
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  variant = 'amber',
}: EmptyStateProps): JSX.Element {
  const iconVariantClasses = {
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    blue: 'bg-blue-50 text-teal-900 dark:bg-blue-950/50 dark:text-blue-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }[variant];

  return (
    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 p-8 shadow-2xs">
      {Icon && (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs ${iconVariantClasses}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
