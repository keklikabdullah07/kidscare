import { useEffect, type JSX } from 'react';
import { X, Download, ExternalLink, Calendar, Tag } from 'lucide-react';
import type { MediaFileItem, MediaCategory } from '@kidscare/shared-types';

interface LightboxModalProps {
  isOpen: boolean;
  file: MediaFileItem | null;
  onClose: () => void;
}

const CATEGORY_NAMES: Record<MediaCategory, string> = {
  ACTIVITY: 'Etkinlik & Aktivite',
  PORTFOLIO: 'Dijital Portfolyo',
  DAILY_REPORT: 'Günlük Karne',
  STUDENT_AVATAR: 'Öğrenci Profil Fotoğrafı',
  HEALTH_RECORD: 'Sağlık Belgesi',
  GENERAL: 'Genel Galeri',
};

const CATEGORY_COLORS: Record<MediaCategory, string> = {
  ACTIVITY: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  PORTFOLIO: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  DAILY_REPORT: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  STUDENT_AVATAR: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  HEALTH_RECORD: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  GENERAL: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

export function LightboxModal({ isOpen, file, onClose }: LightboxModalProps): JSX.Element | null {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const categoryName = CATEGORY_NAMES[file.category] || file.category;
  const categoryColor = CATEGORY_COLORS[file.category] || CATEGORY_COLORS.GENERAL;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={file.fileName}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-sm ${categoryColor}`}
          >
            {categoryName}
          </span>
          <span className="text-white/60 text-xs font-medium hidden sm:inline">
            {formatFileSize(file.fileSize)}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer border border-white/15"
          title="Kapat (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 flex items-center justify-center w-full max-w-4xl my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={file.url}
          alt={file.fileName}
          className="max-h-[72vh] max-w-full rounded-3xl object-contain shadow-2xl border-2 border-white/15 select-none"
        />
      </div>

      {/* Bottom Info & Action Bar */}
      <div
        className="w-full max-w-4xl bg-[#131B2E]/95 border border-slate-700/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white truncate" title={file.fileName}>
            {file.fileName}
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {new Date(file.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-400" />
              {file.mimeType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Yeni Sekmede Aç</span>
          </a>

          <a
            href={file.url}
            download={file.fileName}
            className="btn-tactile-teal px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>İndir</span>
          </a>
        </div>
      </div>
    </div>
  );
}
