import { useEffect, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  orientation?: 'portrait' | 'landscape' | undefined;
  children: ReactNode;
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  orientation = 'portrait',
  children,
}: PrintPreviewModalProps): ReactElement | null {
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('print-modal-active');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('print-modal-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalNode = (
    <div
      className="print-modal-backdrop fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
      data-testid="print-preview-modal"
    >
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 dark:border-slate-800 bg-stone-100/95 dark:bg-slate-900/95 px-6 py-3.5 shadow-md backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                {title}
              </h2>
              <span className="inline-flex items-center rounded-full bg-stone-200 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                {orientation === 'landscape' ? 'A4 Yatay' : 'A4 Dikey'}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mr-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Baskıya ve PDF Çıktısına Hazır
          </span>
          <TactileButton variant="teal" onClick={handlePrint} aria-label="Yazdır veya PDF Kaydet">
            <Printer className="h-4 w-4 mr-2" />
            Yazdır / PDF Kaydet
          </TactileButton>
          <TactileButton variant="secondary" onClick={onClose} aria-label="Kapat">
            <X className="h-4 w-4 mr-1.5" />
            Kapat
          </TactileButton>
        </div>
      </div>

      {/* Sheet Preview Container */}
      <div className="print-modal-container flex-1 py-8 px-4 sm:px-6 flex justify-center items-start">
        <div
          id="printable-document"
          className={
            orientation === 'landscape'
              ? 'preview-sheet-landscape print-landscape'
              : 'preview-sheet-portrait'
          }
          data-testid="printable-content"
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
