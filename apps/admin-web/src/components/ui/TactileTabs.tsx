import type { ComponentType, JSX } from 'react';

export type TactileTabVariant = 'teal' | 'amber' | 'rose' | 'sky' | 'purple';

export interface TactileTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number | undefined;
  icon?: ComponentType<{ className?: string }> | undefined;
  activeVariant?: TactileTabVariant | undefined;
  badgeCls?: string | undefined;
}

export interface TactileTabsProps<T extends string = string> {
  tabs: TactileTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  defaultActiveVariant?: TactileTabVariant | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
}

const ACTIVE_CLASS_MAP: Record<TactileTabVariant, string> = {
  teal: 'tactile-tab-btn-active-teal',
  amber: 'tactile-tab-btn-active-amber',
  rose: 'tactile-tab-btn-active-rose',
  sky: 'tactile-tab-btn-active-sky',
  purple: 'tactile-tab-btn-active-purple',
};

export function TactileTabs<T extends string = string>({
  tabs,
  activeId,
  onChange,
  defaultActiveVariant = 'teal',
  className = '',
  ariaLabel = 'Sekmeler',
}: TactileTabsProps<T>): JSX.Element {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`tactile-tab-track ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const variant = tab.activeVariant || defaultActiveVariant;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`tactile-tab-btn ${
              isActive ? ACTIVE_CLASS_MAP[variant] : 'tactile-tab-btn-inactive'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.badgeCls ||
                      'bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
