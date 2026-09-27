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
      sm: 'h-7',
      md: 'h-9',
      lg: 'h-12',
      xl: 'h-16',
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
      sm: 'h-14',
      md: 'h-20',
      lg: 'h-28',
      xl: 'h-36',
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
    sm: { box: 'w-8 h-8 p-1', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10 p-1.5', text: 'text-lg', sub: 'text-xs' },
    lg: { box: 'w-14 h-14 p-2', text: 'text-2xl', sub: 'text-sm' },
    xl: { box: 'w-20 h-20 p-2.5', text: 'text-3xl', sub: 'text-base' },
  };

  const { box, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Mark with Authentic Logo Image */}
      <div
        className={`${box} rounded-2xl bg-white shadow-xs border border-amber-100/90 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden relative group`}
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
            <span className={`${text} font-black tracking-tight text-blue-900 dark:text-white`}>
              Kids<span className="text-blue-600 dark:text-blue-400">Care</span>
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
