import { useState, useEffect, type FormEvent, type JSX } from 'react';
import { X, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

export interface PromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  inputLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  requireInput?: boolean;
  isTextarea?: boolean;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  isOpen,
  title,
  description,
  inputLabel,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Onayla',
  cancelText = 'İptal',
  requireInput = false,
  isTextarea = false,
  variant = 'primary',
  onConfirm,
  onCancel,
}: PromptModalProps): JSX.Element | null {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!isOpen) return;
    setValue(defaultValue);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, defaultValue, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (requireInput && !value.trim()) return;
    onConfirm(value.trim());
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          btn: 'btn-tactile-danger',
          iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'warning':
        return {
          btn: 'btn-tactile-amber',
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'success':
        return {
          btn: 'btn-tactile-teal',
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      default:
        return {
          btn: 'btn-tactile-teal',
          iconBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
          icon: <HelpCircle className="w-5 h-5" />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl border-2 border-[#DDD4C4] dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-[#DDD4C4]/80 dark:border-slate-800 bg-[#FCFAF7]/90 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${styles.iconBg} shadow-2xs`}>{styles.icon}</div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {inputLabel !== undefined && (
            <div>
              {inputLabel && (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {inputLabel} {requireInput && <span className="text-rose-500">*</span>}
                </label>
              )}
              {isTextarea ? (
                <textarea
                  autoFocus
                  rows={3}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  required={requireInput}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-700 dark:focus:ring-amber-500/30 dark:focus:border-amber-500 transition-all resize-none shadow-2xs"
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  required={requireInput}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-700 dark:focus:ring-amber-500/30 dark:focus:border-amber-500 transition-all shadow-2xs"
                />
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-tactile-secondary px-4 py-2 text-xs font-bold"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={requireInput && !value.trim()}
              className={`px-4 py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Evet, Onayla',
  cancelText = 'Vazgeç',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element | null {
  return (
    <PromptModal
      isOpen={isOpen}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      onConfirm={() => onConfirm()}
      onCancel={onCancel}
    />
  );
}
