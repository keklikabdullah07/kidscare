import { useState, useEffect, type JSX } from 'react';
import type { ActivityPost } from '@kidscare/shared-types';
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  X,
  Sparkles,
  School,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { getActivities, createActivity, deleteActivity } from '../../api/activities';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';

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
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const canEdit = authState.status === 'authenticated' && authState.user.role !== 'PARENT';

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classroom, setClassroom] = useState('Papatyalar Sınıfı');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([PRESET_PHOTOS[0]?.url || '']);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Sanat', 'Etkinlik']);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  function togglePreset(url: string): void {
    if (selectedUrls.includes(url)) {
      if (selectedUrls.length > 1) {
        setSelectedUrls(selectedUrls.filter((u) => u !== url));
      } else {
        showToast('En az 1 fotoğraf seçmelisiniz.', 'info');
      }
    } else {
      setSelectedUrls([...selectedUrls, url]);
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
      showToast('Lütfen en az bir fotoğraf seçin.', 'error');
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Fotoğraf & Etkinlik Galerisi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kreşte gerçekleşen günlük etkinlik ve aktiviteleri fotoğraflarla velilerle paylaşın.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Etkinlik Paylaş</span>
          </button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
          Filtre:
        </span>
        {FILTER_TAGS.map((tag) => {
          const active = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tag === 'Hepsi' ? 'Hepsi' : `#${tag}`}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Etkinlikler yükleniyor...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Henüz Paylaşılan Etkinlik Yok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Öğrencilerin sınıf içi ve bahçe aktivitelerinden fotoğraflar yükleyerek velilere görsel
            güncellemeler sunun.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>İlk Etkinliği Paylaş</span>
            </button>
          )}
        </div>
      ) : (
        /* Activity Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const formattedDate = new Date(post.activityDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition group"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex items-center gap-1">
                        <School className="w-3 h-3" />
                        {post.classroom || 'Tüm Kreş'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        {formattedDate}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
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
                      className="text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 aspect-video relative overflow-hidden">
                  {post.mediaUrls.slice(0, 4).map((url, idx) => {
                    const isLast = idx === 3 && post.mediaUrls.length > 4;
                    const remaining = post.mediaUrls.length - 4;
                    const isSingle = post.mediaUrls.length === 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveLightboxImg(url)}
                        className={`relative cursor-pointer group/img overflow-hidden ${
                          isSingle ? 'col-span-2 row-span-2' : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${post.title} Fotoğraf ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                        />
                        {isLast && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-lg font-bold">
                            +{remaining}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Description and Tags */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {post.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
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
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={activeLightboxImg}
              alt="Büyük Fotoğraf"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-medium transition"
            >
              ✕ Kapat
            </button>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Yeni Etkinlik Paylaş</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreate(e);
              }}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Etkinlik Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sulu Boya ile Hayvanlar Alemi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {/* Classroom */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sınıf / Grup
                </label>
                <select
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 bg-white dark:bg-slate-800"
                >
                  <option value="Papatyalar Sınıfı">Papatyalar Sınıfı (3-4 Yaş)</option>
                  <option value="Yıldızlar Sınıfı">Yıldızlar Sınıfı (4-5 Yaş)</option>
                  <option value="Minikler Sınıfı">Minikler Sınıfı (2-3 Yaş)</option>
                  <option value="Tüm Kreş">Tüm Kreş (Genel Etkinlik)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama / Notlar
                </label>
                <textarea
                  rows={3}
                  placeholder="Bugün çocuklarla birlikte renkleri karıştırdık, ince motor becerilerini geliştirdik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {/* Preset Photos Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Hazır Etkinlik Fotoğrafları Seçin ({selectedUrls.length} seçildi)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((item) => {
                    const isSelected = selectedUrls.includes(item.url);
                    return (
                      <div
                        key={item.url}
                        onClick={() => togglePreset(item.url)}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                          isSelected
                            ? 'border-teal-600 ring-2 ring-teal-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="h-20 w-full object-cover" />
                        <div className="p-1 bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate text-center">
                          {item.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Veya Özel Fotoğraf URL'si Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  />
                  <button
                    type="button"
                    onClick={addCustomUrl}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex items-center gap-1'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>#{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Paylaşılıyor...' : 'Etkinliği Paylaş'}</span>
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
