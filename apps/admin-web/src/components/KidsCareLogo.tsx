import type { JSX } from 'react';

type KidsCareLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'standard' | 'icon' | 'horizontal' | 'full';
  className?: string;
};

/**
 * KidsCare Official Brand Logo Component
 * Uses the authentic KidsCare brand assets (K-heart emblem & typography)
 */
export function KidsCareLogo({
  size = 'md',
  showText = true,
  variant = 'standard',
  className = '',
}: KidsCareLogoProps): JSX.Element {
  if (variant === 'horizontal') {
    const hSizes = {
      sm: 'h-8',
      md: 'h-11',
      lg: 'h-16',
      xl: 'h-20',
    };
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/brand/kidscare-logo-horizontal.png"
          alt="KidsCare"
          className={`${hSizes[size]} w-auto object-contain dark:brightness-110`}
        />
      </div>
    );
  }

  if (variant === 'full') {
    const fSizes = {
      sm: 'h-16',
      md: 'h-24',
      lg: 'h-32',
      xl: 'h-40',
    };
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <img
          src="/brand/kidscare-logo-full.png"
          alt="KidsCare"
          className={`${fSizes[size]} w-auto object-contain dark:brightness-110`}
        />
      </div>
    );
  }

  const sizeMap = {
    sm: { box: 'w-11 h-11 p-1', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-16 h-16 p-1', text: 'text-2xl', sub: 'text-xs' },
    lg: { box: 'w-20 h-20 p-1.5', text: 'text-3xl', sub: 'text-sm' },
    xl: { box: 'w-28 h-28 p-2', text: 'text-4xl', sub: 'text-base' },
  };

  const { box, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Mark with Authentic Logo Image */}
      <div
        className={`${box} rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-teal-100/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden relative group`}
      >
        <img
          src="/brand/kidscare-icon.png"
          alt="KidsCare Emblem"
          className="w-full h-full object-contain transform transition-transform group-hover:scale-105"
        />
      </div>

      {/* Brand Typography with responsive dark/light styling */}
      {showText && variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${text} font-black tracking-tight text-teal-950 dark:text-white`}>
              Kids<span className="text-teal-600 dark:text-teal-400">Care</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
              Kreş
            </span>
          </div>
          <span
            className={`${sub} text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-0.5`}
          >
            Okul Öncesi Portalı
          </span>
        </div>
      )}
    </div>
  );
}
