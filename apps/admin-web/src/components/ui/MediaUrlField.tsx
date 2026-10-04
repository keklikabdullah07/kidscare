import { useRef, useState, type JSX } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadMediaFile } from '../../api/media';
import { useToast } from '../Toast';
import { TactileButton } from './TactileButton';

export type MediaCategory = 'PORTFOLIO' | 'ACTIVITY' | 'STUDENT' | 'OTHER';

export interface MediaUrlFieldProps {
  /** Tekil modda URL değeri. */
  value: string;
  /** Tekil modda URL değişimi. */
  onChange: (url: string) => void;
  /** Çoklu modda URL listesi. */
  values?: string[];
  /** Çoklu modda liste değişimi. */
  onValuesChange?: (values: string[]) => void;
  /** Yükleme kategorisi (API'ye geçer). */
  category?: MediaCategory;
  /** Label metni. */
  label?: string;
  /** URL input placeholder. */
  placeholder?: string;
  /** Dosfa butonu + file input render. */
  allowFileUpload?: boolean;
  /** Tekil modda preview img göster. */
  showPreview?: boolean;
  /** Çoklu modda preview kartları göster. */
  showMultiplePreview?: boolean;
  /** Çoklu dosya kabul et (multiple). */
  multipleFiles?: boolean;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';

export function MediaUrlField({
  value,
  onChange,
  values,
  onValuesChange,
  category = 'OTHER',
  label = 'Medya / Fotoğraf URL',
  placeholder = 'https://...',
  allowFileUpload = true,
  showPreview = true,
  showMultiplePreview = true,
  multipleFiles = false,
  showAddButton = true,
}: MediaUrlFieldProps): JSX.Element {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const isMultiple = Array.isArray(values) && Boolean(onValuesChange);

  function handleAddUrl(): void {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    if (isMultiple && onValuesChange) {
      if (!values?.includes(trimmed)) {
        onValuesChange([...(values ?? []), trimmed]);
      }
    } else {
      onChange(trimmed);
    }
    setInputUrl('');
  }

  function handleInputKey(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (isMultiple && onValuesChange) {
        const newUrls: string[] = [];
        for (const file of Array.from(files)) {
          const res = await uploadMediaFile(file, category);
          newUrls.push(res.file.url);
        }
        onValuesChange([...(values ?? []), ...newUrls]);
        showToast(`${newUrls.length} fotoğraf yüklendi`, 'success');
      } else {
        const file = files[0];
        if (!file) return;
        const res = await uploadMediaFile(file, category);
        onChange(res.file.url);
        showToast('Fotoğraf yüklendi', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Yükleme başarısız', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        {allowFileUpload && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => void handleFileUpload(e)}
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
            multiple={multipleFiles}
            className="hidden"
          />
        )}
        <input
          type="url"
          placeholder={placeholder}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleInputKey}
          className="flex-1 text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-teal-700 dark:focus:border-teal-400"
        />
        {showAddButton && (
          <TactileButton
            type="button"
            variant="secondary"
            size="md"
            onClick={handleAddUrl}
            disabled={!inputUrl.trim()}
          >
            Ekle
          </TactileButton>
        )}
        {allowFileUpload && (
          <TactileButton
            type="button"
            variant="secondary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Yükleniyor…' : 'Dosya'}</span>
          </TactileButton>
        )}
      </div>

      {/* Tekil preview */}
      {!isMultiple && showPreview && value && (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt="Önizleme"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-24 w-32 object-cover rounded-2xl border-2 border-[#DDD4C4] dark:border-slate-700 shadow-2xs"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 flex items-center justify-center transition cursor-pointer"
            title="Görseli kaldır"
            aria-label="Görseli kaldır"
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Çoklu preview */}
      {isMultiple && showMultiplePreview && values && values.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {values.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative rounded-2xl overflow-hidden border-2 border-teal-700 shadow-2xs bg-white dark:bg-[#131B2E]"
            >
              <img
                src={url}
                alt={`Seçilen ${idx + 1}`}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onValuesChange?.(values.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 flex items-center justify-center transition cursor-pointer"
                title="Fotoğrafı kaldır"
                aria-label="Fotoğrafı kaldır"
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
