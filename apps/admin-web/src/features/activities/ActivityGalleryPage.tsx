import { useState, useEffect, useRef, type JSX, type ChangeEvent } from 'react';
import type { ActivityPost, MediaFileItem } from '@kidscare/shared-types';
import { Camera, Plus, Trash2, Calendar, X, Sparkles, School, Upload, Check } from 'lucide-react';
import { getActivities, createActivity, deleteActivity } from '../../api/activities';
import { listMediaFiles, uploadMediaFile } from '../../api/media';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { TactileButton } from '../../components/ui/TactileButton';
import { LightboxModal } from '../gallery/LightboxModal';

const PRESET_PHOTOS = [
  {
    name: 'Sanat & Boyama',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop',
  },
  {
    name: 'Bahçe & Doğa',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
  },
  {
    name: 'Ritim & Müzik',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop',
  },
  {
    name: 'Zeka Oyunları',
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',
  },
  {
    name: 'Masal Saati',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
  },
  {
    name: 'Minik Bilim',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop',
  },
];

const FILTER_TAGS = ['Hepsi', 'Sanat', 'Oyun', 'Bahçe', 'Müzik', 'Resim', 'Gelişim'];

export function ActivityGalleryPage(): JSX.Element {
  const { state: authState } = useAuth();
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState('Hepsi');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeLightboxFile, setActiveLightboxFile] = useState<MediaFileItem | null>(null);

  const canEdit = authState.status === 'authenticated' && authState.user.role !== 'PARENT';

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classroom, setClassroom] = useState('Papatyalar Sınıfı');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([PRESET_PHOTOS[0]?.url || '']);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Sanat', 'Etkinlik']);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [tenantMediaFiles, setTenantMediaFiles] = useState<MediaFileItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  function loadPosts(): void {
    setLoading(true);
    setError(null);
    getActivities({ tag: selectedTag === 'Hepsi' ? undefined : selectedTag })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Etkinlikler yüklenemedi');
        setLoading(false);
      });
  }

  function loadTenantMedia(): void {
    if (!canEdit) return;
    listMediaFiles('ACTIVITY', 30)
      .then((items) => {
        setTenantMediaFiles(items);
      })
      .catch(() => {
        // silent fallback
      });
  }

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  useEffect(() => {
    if (isCreateOpen) {
      loadTenantMedia();
    }
  }, [isCreateOpen]);

  function togglePreset(url: string): void {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  }

  function togglePhotoUrl(url: string): void {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  }

  function removeSelectedUrl(url: string): void {
    setSelectedUrls(selectedUrls.filter((u) => u !== url));
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        if (file.size > 10 * 1024 * 1024) {
          showToast(`"${file.name}" 10MB sınırını aşıyor.`, 'error');
          continue;
        }

        const res = await uploadMediaFile(file, 'ACTIVITY');
        if (res.success && res.file.url) {
          uploadedUrls.push(res.file.url);
          setTenantMediaFiles((prev) => [res.file, ...prev.filter((f) => f.id !== res.file.id)]);
        }
      }

      if (uploadedUrls.length > 0) {
        setSelectedUrls((prev) => {
          const isOnlyDefaultPreset = prev.length === 1 && prev[0] === PRESET_PHOTOS[0]?.url;
          return isOnlyDefaultPreset ? [...uploadedUrls] : [...uploadedUrls, ...prev];
        });
        showToast(`${uploadedUrls.length} fotoğraf başarıyla yüklendi! 📸`, 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fotoğraf yüklenirken hata oluştu.';
      showToast(msg, 'error');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function addCustomUrl(): void {
    if (!customUrl.trim()) return;
    if (!selectedUrls.includes(customUrl.trim())) {
      setSelectedUrls([...selectedUrls, customUrl.trim()]);
      setCustomUrl('');
    }
  }

  function toggleTag(t: string): void {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((x) => x !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  }

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Lütfen bir başlık girin.', 'error');
      return;
    }
    if (selectedUrls.length === 0) {
      showToast('Lütfen en az bir fotoğraf seçin veya yükleyin.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const newPost = await createActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        classroom: classroom.trim() || undefined,
        mediaUrls: selectedUrls,
        tags: selectedTags,
      });
      setPosts([newPost, ...posts]);
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setSelectedUrls([PRESET_PHOTOS[0]?.url || '']);
      showToast('Yeni etkinlik ve fotoğraflar paylaşıldı! 📸', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Paylaşılamadı';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  function handleDelete(id: string): void {
    setActivityToDelete(id);
  }

  async function confirmDeleteActivity(): Promise<void> {
    if (!activityToDelete) return;
    const id = activityToDelete;
    setActivityToDelete(null);
    try {
      await deleteActivity(id);
      setPosts(posts.filter((p) => p.id !== id));
      showToast('Etkinlik silindi.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Silinemedi';
      showToast(msg, 'error');
    }
  }

  function openLightboxForUrl(url: string, titleText: string, dateStr: string): void {
    setActiveLightboxFile({
      id: url,
      tenantId: '',
      uploadedById: '',
      category: 'ACTIVITY',
      fileName: titleText,
      fileKey: url,
      mimeType: 'image/jpeg',
      fileSize: 1024 * 1024,
      url,
      createdAt: dateStr || new Date().toISOString(),
      updatedAt: dateStr || new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Fotoğraf & Etkinlik Galerisi"
        description="Kreşte gerçekleşen günlük etkinlik ve aktiviteleri fotoğraflarla velilerle paylaşın."
        icon={Camera}
        actions={
          canEdit ? (
            <TactileButton variant="teal" size="md" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Yeni Etkinlik & Fotoğraf Paylaş</span>
            </TactileButton>
          ) : null
        }
      />

      {/* Filter Tags Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 py-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
          Filtre:
        </span>
        {FILTER_TAGS.map((tag) => {
          const active = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 text-xs font-bold shrink-0 ${
                active ? 'btn-tactile-teal' : 'btn-tactile-secondary'
              }`}
            >
              {tag === 'Hepsi' ? 'Tümü' : `#${tag}`}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-2xs">
          <span className="font-semibold">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent mb-3" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Etkinlikler yükleniyor, lütfen bekleyin...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Henüz Paylaşılan Etkinlik Yok"
          description="Öğrencilerin sınıf içi ve bahçe aktivitelerinden fotoğraflar yükleyerek velilere görsel güncellemeler sunun."
          action={
            canEdit ? (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="btn-tactile-teal px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>İlk Etkinliği Paylaş</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        /* Activity Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => {
            const formattedDate = new Date(post.activityDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col group transition hover:border-teal-600/50"
              >
                {/* Card Header */}
                <div className="p-4.5 border-b border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800/60 flex items-center gap-1 shadow-2xs">
                        <School className="w-3 h-3" />
                        {post.classroom || 'Tüm Kreş'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        {formattedDate}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                      {post.title}
                    </h2>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(post.id);
                      }}
                      title="Etkinliği Sil"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Photo Grid Container */}
                <div className="grid grid-cols-2 gap-1.5 bg-[#FCFAF7] dark:bg-slate-900/60 p-1.5 aspect-video relative overflow-hidden">
                  {post.mediaUrls.slice(0, 4).map((url, idx) => {
                    const isLast = idx === 3 && post.mediaUrls.length > 4;
                    const remaining = post.mediaUrls.length - 4;
                    const isSingle = post.mediaUrls.length === 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => openLightboxForUrl(url, post.title, post.activityDate)}
                        className={`relative cursor-pointer group/img overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 border border-[#DDD4C4]/50 dark:border-slate-700/50 ${
                          isSingle ? 'col-span-2 row-span-2' : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${post.title} Fotoğraf ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                        />
                        {isLast && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white text-base font-bold">
                            +{remaining} Fotoğraf
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Description and Tags */}
                <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                  {post.description && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
                      {post.description}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-xl text-[11px] font-bold bg-[#FCFAF7] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-700/80 shadow-2xs"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={Boolean(activeLightboxFile)}
        file={activeLightboxFile}
        onClose={() => setActiveLightboxFile(null)}
      />

      {/* Create Activity & Photo Upload Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border-2 border-[#DDD4C4] dark:border-slate-800">
            <div className="p-5 border-b border-[#DDD4C4]/70 dark:border-slate-800 flex items-center justify-between bg-[#FCFAF7] dark:bg-slate-900/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Yeni Etkinlik & Fotoğraf Paylaş</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreate(e);
              }}
              className="p-6 overflow-y-auto space-y-4.5 flex-1"
            >
              {/* Hidden file input — Dosfa butonu (URL satirinda) tetikler */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => void handleFileUpload(e)}
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                multiple
                className="hidden"
                id="activity-file-upload"
              />

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Etkinlik Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sulu Boya ile Hayvanlar Alemi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              {/* Classroom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Sınıf / Grup
                </label>
                <select
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="Papatyalar Sınıfı">Papatyalar Sınıfı (3-4 Yaş)</option>
                  <option value="Yıldızlar Sınıfı">Yıldızlar Sınıfı (4-5 Yaş)</option>
                  <option value="Minikler Sınıfı">Minikler Sınıfı (2-3 Yaş)</option>
                  <option value="Tüm Kreş">Tüm Kreş (Genel Etkinlik)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Açıklama / Pedagojik Notlar
                </label>
                <textarea
                  rows={3}
                  placeholder="Bugün çocuklarla birlikte renkleri karıştırdık, ince motor becerilerini geliştirdik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs leading-relaxed"
                />
              </div>

              {/* Custom Photo URL — "Paylaşılacak Fotoğraflar" preview'dan hemen önce */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Veya Doğrudan Görsel URL'si Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="btn-tactile-secondary px-3 py-2 text-xs font-bold shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
                    title="Cihazınızdan fotoğraf yükle"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Dosya
                  </button>
                  <button
                    type="button"
                    onClick={addCustomUrl}
                    className="btn-tactile-secondary px-4 py-2 text-xs font-bold shrink-0"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Hidden file input — Dosfa butonu (URL satırında) tetikler */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => void handleFileUpload(e)}
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                multiple
                className="hidden"
                id="activity-file-upload"
              />

              {/* Selected Photos Gallery (Prominent Preview) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Paylaşılacak Fotoğraflar</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200">
                      {selectedUrls.length} seçildi
                    </span>
                  </label>
                  {selectedUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUrls([])}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Tümünü Temizle
                    </button>
                  )}
                </div>

                {selectedUrls.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-[#DDD4C4] dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500 bg-[#FCFAF7] dark:bg-slate-900/40">
                    Henüz fotoğraf seçilmedi. Cihazınızdan fotoğraf yükleyin veya aşağıdaki
                    galeriden seçin.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {selectedUrls.map((url, idx) => {
                      const isPreset = PRESET_PHOTOS.some((p) => p.url === url);
                      return (
                        <div
                          key={`${url}-${idx}`}
                          className="group relative rounded-2xl overflow-hidden border-2 border-teal-700 shadow-[0_2px_0_0_#0f766e] bg-white dark:bg-[#131B2E]"
                        >
                          <img
                            src={url}
                            alt={`Seçilen görsel ${idx + 1}`}
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                            }}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-1.5 flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <span className="truncate max-w-[85px]">
                              {isPreset ? 'Örnek Görsel' : 'Yüklenen Foto'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSelectedUrl(url)}
                              className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 flex items-center justify-center transition cursor-pointer"
                              title="Fotoğrafı Kaldır"
                            >
                              <X className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                          <div className="absolute top-1.5 left-1.5 bg-teal-800/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                            #{idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Previously Uploaded Activity Photos from Tenant */}
              {tenantMediaFiles.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Kreş Arşivinden Seçin ({tenantMediaFiles.length} fotoğraf)
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                    {tenantMediaFiles.map((file) => {
                      const isSelected = selectedUrls.includes(file.url);
                      return (
                        <div
                          key={file.id}
                          onClick={() => togglePhotoUrl(file.url)}
                          className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                            isSelected
                              ? 'border-teal-700 shadow-[0_2px_0_0_#0f766e]'
                              : 'border-[#DDD4C4] dark:border-slate-700 hover:border-teal-500/60 shadow-2xs'
                          }`}
                        >
                          <img
                            src={file.url}
                            alt={file.fileName}
                            className="h-16 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-teal-700 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preset Photos Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Veya Hazır Örnek Fotoğraflardan Ekleyin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((item) => {
                    const isSelected = selectedUrls.includes(item.url);
                    return (
                      <div
                        key={item.url}
                        onClick={() => togglePreset(item.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition ${
                          isSelected
                            ? 'border-teal-700 shadow-[0_2px_0_0_#0f766e]'
                            : 'border-[#DDD4C4] dark:border-slate-700 hover:border-teal-500/60 shadow-2xs'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                          }}
                          className="h-20 w-full object-cover"
                        />
                        <div className="p-1.5 bg-white dark:bg-[#131B2E] text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate text-center">
                          {item.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-teal-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Oyun', 'Sanat', 'Resim', 'Müzik', 'Bahçe', 'Gelişim', 'Masal'].map((t) => {
                    const isSelected = selectedTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-3 py-1 text-xs font-bold ${
                          isSelected ? 'btn-tactile-teal' : 'btn-tactile-secondary'
                        }`}
                      >
                        <span>#{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-tactile-secondary px-4.5 py-2 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-tactile-teal px-5 py-2 text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Paylaşılıyor…' : 'Etkinliği Paylaş'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activityToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Etkinliği Sil"
          description="Bu etkinliği ve paylaşılan fotoğraflarını kalıcı olarak silmek istediğinize emin misiniz?"
          confirmText="Evet, Etkinliği Sil"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => void confirmDeleteActivity()}
          onCancel={() => setActivityToDelete(null)}
        />
      )}
    </div>
  );
}
