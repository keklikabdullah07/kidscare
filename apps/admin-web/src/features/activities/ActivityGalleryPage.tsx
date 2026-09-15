import { useState, useEffect, type JSX } from 'react';
import type { ActivityPost } from '@kidscare/shared-types';
import { getActivities, createActivity, deleteActivity } from '../../api/activities';

const PRESET_PHOTOS = [
  {
    name: '🎨 Sanat & Boyama',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop',
  },
  {
    name: '🌳 Bahçe & Doğa',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
  },
  {
    name: '🎵 Ritim & Müzik',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop',
  },
  {
    name: '🧩 Zeka Oyunları',
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',
  },
  {
    name: '📚 Masal Saati',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
  },
  {
    name: '🧪 Minik Bilim İnsanları',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop',
  },
];

const FILTER_TAGS = ['Hepsi', 'Sanat', 'Oyun', 'Bahçe', 'Müzik', 'Resim', 'Gelişim'];

export function ActivityGalleryPage(): JSX.Element {
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState('Hepsi');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classroom, setClassroom] = useState('Papatyalar Sınıfı');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([PRESET_PHOTOS[0]?.url || '']);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Sanat', 'Etkinlik']);
  const [submitting, setSubmitting] = useState(false);

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
        alert('En az 1 fotoğraf seçmelisiniz.');
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
      alert('Lütfen bir başlık girin.');
      return;
    }
    if (selectedUrls.length === 0) {
      alert('Lütfen en az bir fotoğraf seçin.');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Paylaşılamadı');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Bu etkinliği ve fotoğraflarını silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await deleteActivity(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📸</span> Fotoğraf & Etkinlik Galerisi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kreşte gerçekleşen günlük etkinlik ve aktiviteleri fotoğraflarla velilerle paylaşın.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <span>✨</span> Yeni Etkinlik Paylaş
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
          Filtre:
        </span>
        {FILTER_TAGS.map((tag) => {
          const active = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tag === 'Hepsi' ? '🌟 Hepsi' : `#${tag}`}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Etkinlikler yükleniyor...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-5xl mb-3">🎨</div>
          <h3 className="text-lg font-bold text-gray-800">Henüz Paylaşılan Etkinlik Yok</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
            Öğrencilerin sınıf içi ve bahçe aktivitelerinden fotoğraflar yükleyerek velilere görsel
            güncellemeler sunun.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            İlk Etkinliği Paylaş
          </button>
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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                        {post.classroom || 'Tüm Kreş'}
                      </span>
                      <span className="text-xs text-gray-400">{formattedDate}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mt-1">{post.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(post.id);
                    }}
                    title="Etkinliği Sil"
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    🗑️
                  </button>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 gap-1 bg-gray-100 aspect-video relative overflow-hidden">
                  {post.mediaUrls.slice(0, 4).map((url, idx) => {
                    const isLast = idx === 3 && post.mediaUrls.length > 4;
                    const remaining = post.mediaUrls.length - 4;
                    const isSingle = post.mediaUrls.length === 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveLightboxImg(url)}
                        className={`relative cursor-pointer group overflow-hidden ${
                          isSingle ? 'col-span-2 row-span-2' : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${post.title} Fotoğraf ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {isLast && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
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
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
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
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={activeLightboxImg}
              alt="Büyük Fotoğraf"
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 text-white text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium"
            >
              ✕ Kapat
            </button>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📸</span> Yeni Etkinlik Paylaş
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreate(e);
              }}
              className="p-5 overflow-y-auto space-y-4 flex-1"
            >
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Etkinlik Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sulu Boya ile Hayvanlar Alemi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Classroom */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Sınıf / Grup
                </label>
                <select
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Papatyalar Sınıfı">🌼 Papatyalar Sınıfı (3-4 Yaş)</option>
                  <option value="Yıldızlar Sınıfı">⭐ Yıldızlar Sınıfı (4-5 Yaş)</option>
                  <option value="Minikler Sınıfı">🐥 Minikler Sınıfı (2-3 Yaş)</option>
                  <option value="Tüm Kreş">🏫 Tüm Kreş (Genel Etkinlik)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Açıklama / Notlar
                </label>
                <textarea
                  rows={3}
                  placeholder="Bugün çocuklarla birlikte renkleri karıştırdık, ince motor becerilerini geliştirdik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Preset Photos Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Hazır Etkinlik Fotoğrafları Seçin ({selectedUrls.length} seçildi)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((item) => {
                    const isSelected = selectedUrls.includes(item.url);
                    return (
                      <div
                        key={item.url}
                        onClick={() => togglePreset(item.url)}
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer group ${
                          isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="h-20 w-full object-cover" />
                        <div className="p-1 bg-white/95 text-[11px] font-semibold text-gray-700 truncate text-center">
                          {item.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Veya Özel Fotoğraf URL'si Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomUrl}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Oyun', 'Sanat', 'Resim', 'Müzik', 'Bahçe', 'Gelişim', 'Masal'].map((t) => {
                    const isSelected = selectedTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? `✓ #${t}` : `#${t}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Paylaşılıyor...' : '🚀 Etkinliği Paylaş'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
