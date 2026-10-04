import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type TactileVariant = 'teal' | 'amber' | 'secondary' | 'danger' | 'peach';
export type TactileSize = 'sm' | 'md' | 'lg';

export interface TactileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileVariant;
  size?: TactileSize;
  children: ReactNode;
  className?: string;
}

export const TACTILE_VARIANT_CLASSES: Record<TactileVariant, string> = {
  teal: 'border-2 border-[#0f766e] bg-[#115e59] hover:bg-[#0f766e] text-white shadow-[0_3px_0_0_#042f2e,0_6px_14px_rgba(17,94,89,0.25)] hover:shadow-[0_4px_0_0_#042f2e,0_8px_18px_rgba(17,94,89,0.30)] active:translate-y-[3px] active:shadow-none',
  amber:
    'border-2 border-[#d97706] bg-[#f59e0b] hover:bg-[#fbbf24] text-[#451a03] shadow-[0_3px_0_0_#b45309,0_6px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_0_0_#b45309,0_8px_18px_rgba(245,158,11,0.30)] active:translate-y-[3px] active:shadow-none',
  secondary:
    'border-2 border-[#d5cbb9] bg-white hover:bg-[#faf8f5] dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 shadow-[0_3px_0_0_#d5cbb9,0_4px_10px_rgba(45,38,30,0.05)] hover:shadow-[0_4px_0_0_#d5cbb9,0_6px_14px_rgba(45,38,30,0.08)] active:translate-y-[3px] active:shadow-none',
  danger:
    'border-2 border-[#e11d48] bg-[#f43f5e] hover:bg-[#fb7185] text-white shadow-[0_3px_0_0_#be123c,0_6px_12px_rgba(244,63,94,0.25)] hover:shadow-[0_4px_0_0_#be123c,0_8px_16px_rgba(244,63,94,0.30)] active:translate-y-[3px] active:shadow-none',
  peach:
    'border-2 border-[#E5C1AE] bg-[#F3D5C3] hover:bg-[#F8E3D7] text-[#5c3826] shadow-[0_3px_0_0_#DDB6A2,0_6px_14px_rgba(92,56,38,0.18)] hover:shadow-[0_4px_0_0_#DDB6A2,0_8px_18px_rgba(92,56,38,0.22)] active:translate-y-[3px] active:shadow-none',
};

export const TACTILE_SIZE_CLASSES: Record<TactileSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const TACTILE_CARD_CLASSES =
  'rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#D5CBB9,0_14px_26px_-3px_rgba(45,38,30,0.10)] dark:hover:shadow-[0_6px_0_0_#1E293B,0_14px_26px_-3px_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-none transition-all duration-150 cursor-pointer';

export function TactileButton({
  variant = 'teal',
  size = 'md',
  children,
  className = '',
  ...props
}: TactileButtonProps): React.JSX.Element {
  return (
    <button
      {...props}
      disabled={props.disabled}
      aria-disabled={props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${TACTILE_VARIANT_CLASSES[variant]} ${TACTILE_SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
