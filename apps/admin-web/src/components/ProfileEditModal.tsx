import { useState, useEffect, type FormEvent, type JSX } from 'react';
import type { UserProfileUpdateInput } from '@kidscare/shared-types';
import { X, User, Phone, Mail, Shield, Camera, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { TactileButton } from './ui/TactileButton';
import { Badge, type BadgeVariant } from './ui/Badge';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset playful / professional avatar samples for quick 1-click selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

function getRoleInfo(role: string): { label: string; variant: BadgeVariant } {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
      return { label: 'Süper Admin', variant: 'brand' };
    case 'ADMIN':
      return { label: 'Yönetici / Müdür', variant: 'info' };
    case 'TEACHER':
      return { label: 'Sınıf Öğretmeni', variant: 'warning' };
    case 'PARENT':
      return { label: 'Veli', variant: 'success' };
    case 'SERVICE_STAFF':
      return { label: 'Servis Personeli', variant: 'accent' };
    default:
      return { label: role, variant: 'neutral' };
  }
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps): JSX.Element | null {
  const { state, updateProfile } = useAuth();
  const currentUser = state.status === 'authenticated' ? state.user : null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFirstName(currentUser.firstName ?? '');
      setLastName(currentUser.lastName ?? '');
      setPhone(currentUser.phone ?? '');
      setAvatarUrl(currentUser.avatarUrl ?? '');
      setError(null);
      setSuccess(false);
      setImageError(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const roleInfo = getRoleInfo(currentUser.role);
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() ||
    (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'K');

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSuccess(false);

    try {
      const payload: UserProfileUpdateInput = {};
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim();
      if (phone.trim()) payload.phone = phone.trim();
      if (avatarUrl.trim()) payload.avatarUrl = avatarUrl.trim();
      await updateProfile(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 shadow-[0_16px_36px_rgba(0,0,0,0.18)] overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#115E59] to-[#0F766E] px-6 py-5 text-white flex items-center justify-between border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-lg font-bold">
                Profilimi Düzenle
              </h2>
              <p className="text-xs text-teal-100/90 font-medium">
                Kişisel bilgilerinizi ve avatarınızı güncelleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5">
          {/* Avatar Preview & Quick Picker */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FCFAF7] dark:bg-slate-800/50 border border-[#DDD4C4] dark:border-slate-700/70">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-teal-800 text-white font-black text-2xl flex items-center justify-center border-2 border-[#DDD4C4] dark:border-slate-600 shadow-md">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt="Profil Önizleme"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-white rounded-lg shadow-xs">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                  {[firstName, lastName].filter(Boolean).join(' ') || currentUser.email}
                </h3>
                <Badge variant={roleInfo.variant} size="sm">
                  {roleInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                Hızlı görsel seçin veya aşağıya görsel URL'si yapıştırın
              </p>

              {/* Preset Avatar Selector */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setImageError(false);
                    }}
                    className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                      avatarUrl === url
                        ? 'border-teal-600 scale-110 shadow-xs'
                        : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      setImageError(false);
                    }}
                    className="px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-800"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ad <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Örn: Ayşe"
                  maxLength={100}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Soyad <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Örn: Yılmaz"
                  maxLength={100}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Telefon Numarası
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  maxLength={30}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rol / Unvan
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  disabled
                  value={roleInfo.label}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E0D5] dark:border-slate-800 bg-[#F4F1EA] dark:bg-slate-950 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium select-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              E-posta Adresi <span className="text-[10px] font-normal text-slate-400">(Değiştirilemez)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E0D5] dark:border-slate-800 bg-[#F4F1EA] dark:bg-slate-950 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Profil Fotoğrafı URL (Opsiyonel)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setImageError(false);
              }}
              placeholder="https://example.com/avatar.jpg"
              maxLength={1000}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 transition-colors"
            />
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Profiliniz başarıyla kaydedildi!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DDD4C4]/60 dark:border-slate-700/60">
            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              İptal
            </TactileButton>
            <TactileButton
              type="submit"
              variant="teal"
              size="sm"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </TactileButton>
          </div>
        </form>
      </div>
    </div>
  );
}
