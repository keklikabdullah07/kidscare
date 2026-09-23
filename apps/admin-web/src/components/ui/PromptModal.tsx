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
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

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
          btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
          iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'warning':
        return {
          btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'success':
        return {
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500',
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      default:
        return {
          btn: 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs focus:ring-orange-500',
          iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
          icon: <HelpCircle className="w-5 h-5" />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>{styles.icon}</div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {inputLabel !== undefined && (
            <div>
              {inputLabel && (
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  required={requireInput}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={requireInput && !value.trim()}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
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
