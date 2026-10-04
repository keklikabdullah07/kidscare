import { useEffect, useState, useMemo, type FormEvent, type JSX } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  Clock,
  User,
  Inbox,
  X,
} from 'lucide-react';
import type {
  ParentRequest,
  ParentRequestStatus,
  ParentRequestType,
  Student,
} from '@kidscare/shared-types';
import { createParentRequest, listParentRequests, resolveParentRequest } from '../../api/messaging';
import { listStudents } from '../../api/students';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { PromptModal } from '../../components/ui/PromptModal';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { TactileButton } from '../../components/ui/TactileButton';
import { TactileTabs, type TactileTabItem } from '../../components/ui/TactileTabs';
import { EmptyState } from '../../components/ui/EmptyState';

type TabKey = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const TYPE_LABEL: Record<ParentRequestType, string> = {
  IZIN: 'İzin Talebi',
  BILGI_TALEP: 'Bilgi Talebi',
  DEGISIKLIK: 'Değişiklik Talebi',
  DIGER: 'Diğer Başvuru',
};

const STATUS_LABEL: Record<ParentRequestStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

const STATUS_VARIANT: Record<ParentRequestStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export function ParentRequestsPage(): JSX.Element {
  const { state } = useAuth();
  const role = state.status === 'authenticated' ? state.user.role : 'PARENT';

  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

  const [resolveDialog, setResolveDialog] = useState<{
    isOpen: boolean;
    requestId: string;
    status: 'APPROVED' | 'REJECTED';
  } | null>(null);

  const { showToast } = useToast();

  // Yeni Talep Form State'leri
  const [fType, setFType] = useState<ParentRequestType>('IZIN');
  const [fStudentId, setFStudentId] = useState('');
  const [fSubject, setFSubject] = useState('');
  const [fDescription, setFDescription] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listParentRequests(), listStudents()]);
      setRequests(list);
      setStudents(studentsRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Liste yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!fSubject.trim() || !fDescription.trim()) {
      showToast('Konu ve açıklama zorunludur.', 'error');
      return;
    }
    setSubmittingForm(true);
    try {
      await createParentRequest({
        type: fType,
        subject: fSubject.trim(),
        description: fDescription.trim(),
        ...(fStudentId ? { studentId: fStudentId } : {}),
      });
      showToast('Talep başarıyla oluşturuldu! 📋', 'success');
      setShowForm(false);
      setFSubject('');
      setFDescription('');
      setFStudentId('');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Talep oluşturulamadı', 'error');
    } finally {
      setSubmittingForm(false);
    }
  }

  function resolve(id: string, status: 'APPROVED' | 'REJECTED'): void {
    setResolveDialog({ isOpen: true, requestId: id, status });
  }

  async function handleResolveConfirm(note: string): Promise<void> {
    if (!resolveDialog) return;
    const { requestId, status } = resolveDialog;
    setResolveDialog(null);
    setBusyId(requestId);
    try {
      await resolveParentRequest(requestId, {
        status,
        ...(note.trim() ? { resolutionNote: note.trim() } : {}),
      });
      showToast(
        status === 'APPROVED'
          ? 'Talep onaylandı ve veli bilgilendirildi. ✅'
          : 'Talep reddedildi. ❌',
        'success',
      );
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function studentName(id?: string | null): string {
    if (!id) return 'Genel Başvuru';
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  // KPI Metrikleri
  const totalCount = requests.length;
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'PENDING').length,
    [requests],
  );
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === 'APPROVED').length,
    [requests],
  );
  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status === 'REJECTED').length,
    [requests],
  );

  // Sekmeler
  const filterTabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      { id: 'ALL', label: 'Tüm Talepler', count: totalCount, activeVariant: 'teal' },
      { id: 'PENDING', label: 'Bekleyenler', count: pendingCount, activeVariant: 'amber' },
      { id: 'APPROVED', label: 'Onaylananlar', count: approvedCount, activeVariant: 'teal' },
      { id: 'REJECTED', label: 'Reddedilenler', count: rejectedCount, activeVariant: 'rose' },
    ],
    [totalCount, pendingCount, approvedCount, rejectedCount],
  );

  // Filtrelenmiş Talepler
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Sekme filtresi
      if (activeTab === 'PENDING' && r.status !== 'PENDING') return false;
      if (activeTab === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && r.status !== 'REJECTED') return false;

      // Öğrenci filtresi
      if (selectedStudentFilter && r.studentId !== selectedStudentFilter) return false;

      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sName = studentName(r.studentId).toLowerCase();
        const sub = r.subject.toLowerCase();
        const desc = r.description.toLowerCase();
        const note = (r.resolutionNote || '').toLowerCase();
        if (!sub.includes(q) && !desc.includes(q) && !sName.includes(q) && !note.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [requests, activeTab, selectedStudentFilter, searchQuery, students]);

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Dokunsal Aksiyonlar */}
      <PageHeader
        title="Veli Talepleri"
        description="Velilerden iletilen izin, bilgi alma, randevu ve diğer idari başvuruları inceleyin ve yanıtlayın."
        icon={ClipboardList}
        actions={
          <>
            <TactileButton variant="secondary" size="md" onClick={() => void refresh()}>
              <RotateCw className="w-4 h-4" />
              Yenile
            </TactileButton>

            <TactileButton variant="teal" size="md" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Yeni Talep
            </TactileButton>
          </>
        }
      />

      {/* 4 Adet Dokunsal KPI Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOPLAM TALEP"
          value={totalCount}
          subtitle="Tüm başvurular"
          icon={Inbox}
          onClick={() => {
            setActiveTab('ALL');
            setSearchQuery('');
            setSelectedStudentFilter('');
          }}
          className="cursor-pointer"
        />

        <StatCard
          title="BEKLEYENLER"
          value={pendingCount}
          subtitle="İnceleme bekliyor"
          icon={Clock}
          variant="amber"
          onClick={() => {
            setActiveTab('PENDING');
            setSearchQuery('');
          }}
          className="cursor-pointer"
        />

        <StatCard
          title="ONAYLANANLAR"
          value={approvedCount}
          subtitle="Uygun görülenler"
          icon={CheckCircle2}
          variant="teal"
          onClick={() => {
            setActiveTab('APPROVED');
            setSearchQuery('');
          }}
          className="cursor-pointer"
        />

        <StatCard
          title="REDDEDİLENLER"
          value={rejectedCount}
          subtitle="Reddedilen başvurular"
          icon={XCircle}
          variant="rose"
          onClick={() => {
            setActiveTab('REJECTED');
            setSearchQuery('');
          }}
          className="cursor-pointer"
        />
      </div>

      {/* Sekmeler & Filtreleme Barı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TactileTabs<TabKey> tabs={filterTabs} activeId={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Öğrenci Filtresi */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3 py-2 bg-white dark:bg-[#131B2E] text-slate-800 dark:text-white focus:outline-none focus:border-teal-700 shadow-2xs"
            >
              <option value="">Tüm Öğrenciler</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Arama Inputu */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Talep veya öğrenci ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3.5 py-2 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl bg-white dark:bg-[#131B2E] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-700 shadow-2xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* İçerik Alanı: Yükleniyor / Boş / Talep Kartları */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">
            Veli talepleri yükleniyor…
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-dashed border-[#DDD4C4] dark:border-slate-800 p-8 shadow-2xs">
          <EmptyState
            icon={ClipboardList}
            title={
              searchQuery || selectedStudentFilter
                ? 'Aramayla eşleşen talep bulunamadı'
                : 'Kayıtlı talep bulunmuyor'
            }
            description={
              searchQuery || selectedStudentFilter
                ? 'Arama kriterlerinizi veya seçilen öğrenci filtresini değiştirerek tekrar deneyebilirsiniz.'
                : 'Velilerden iletilen izin, bilgi alma veya idari talepler burada listelenecektir.'
            }
            action={
              searchQuery || selectedStudentFilter || activeTab !== 'ALL' ? (
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStudentFilter('');
                    setActiveTab('ALL');
                  }}
                >
                  Filtreleri Temizle
                </TactileButton>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3.5 transition"
            >
              {/* Kart Üst Bilgileri */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 px-2.5 py-0.5 rounded-full">
                        {TYPE_LABEL[r.type]}
                      </span>
                      <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </div>

                    <h3
                      className="text-base font-black text-slate-900 dark:text-white truncate"
                      title={r.subject}
                    >
                      {r.subject}
                    </h3>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Öğrenci:</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {studentName(r.studentId)}
                  </span>
                </div>
              </div>

              {/* Talep Açıklaması */}
              <div className="text-xs text-slate-700 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-2xl border-2 border-[#DDD4C4]/60 dark:border-slate-800/80 leading-relaxed font-medium">
                {r.description}
              </div>

              {/* İnceleme / Karar Notu */}
              {r.resolutionNote && (
                <div className="text-xs bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    İnceleme Notu:
                  </span>{' '}
                  <span className="italic">{r.resolutionNote}</span>
                </div>
              )}

              {/* Yönetici Aksiyon Butonları (Tek Etkileşimli Varlık İlkesi) */}
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && r.status === 'PENDING' && (
                <div className="flex items-center gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                  <TactileButton
                    variant="teal"
                    size="sm"
                    className="flex-1"
                    disabled={busyId === r.id}
                    onClick={() => void resolve(r.id, 'APPROVED')}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Onayla
                  </TactileButton>

                  <TactileButton
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={busyId === r.id}
                    onClick={() => void resolve(r.id, 'REJECTED')}
                  >
                    <XCircle className="w-4 h-4 text-rose-200" />
                    Reddet
                  </TactileButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Yeni Talep Modalı */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Yeni Talep Oluştur
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void submitCreate(e)} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Talep Türü
                  </label>
                  <select
                    value={fType}
                    onChange={(e) => setFType(e.target.value as ParentRequestType)}
                    className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                  >
                    {Object.entries(TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    İlgili Öğrenci (Opsiyonel)
                  </label>
                  <select
                    value={fStudentId}
                    onChange={(e) => setFStudentId(e.target.value)}
                    className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                  >
                    <option value="">— Genel Konu —</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Talep Konusu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Cuma günü izin bildirimi veya bilgi talebi"
                  value={fSubject}
                  onChange={(e) => setFSubject(e.target.value)}
                  required
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Açıklama & Detaylar
                </label>
                <textarea
                  rows={4}
                  placeholder="Talebinizin ayrıntılarını, geçerli tarihleri veya gerekçesini belirtin..."
                  value={fDescription}
                  onChange={(e) => setFDescription(e.target.value)}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-teal-700 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={submittingForm}
                >
                  İptal
                </TactileButton>

                <TactileButton
                  variant="teal"
                  size="sm"
                  type="submit"
                  disabled={submittingForm || !fSubject.trim() || !fDescription.trim()}
                >
                  Talebi Gönder
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onay / Ret Karar Modalı */}
      {resolveDialog && (
        <PromptModal
          isOpen={resolveDialog.isOpen}
          title={resolveDialog.status === 'APPROVED' ? 'Talebi Onayla' : 'Talebi Reddet'}
          description={
            resolveDialog.status === 'APPROVED'
              ? 'Veliye iletilecek bilgilendirme veya onay notunu girebilirsiniz (isteğe bağlı).'
              : 'Lütfen veliye iletilecek ret gerekçesini belirtin.'
          }
          inputLabel={resolveDialog.status === 'APPROVED' ? 'Onay Notu' : 'Ret Gerekçesi'}
          placeholder={
            resolveDialog.status === 'APPROVED'
              ? 'Örn: Talebiniz uygun görülmüş ve onaylanmıştır...'
              : 'Örn: İlgili tarihte kontenjan dolu olduğundan dolayı...'
          }
          confirmText={resolveDialog.status === 'APPROVED' ? 'Onayla' : 'Reddet'}
          cancelText="Vazgeç"
          requireInput={resolveDialog.status === 'REJECTED'}
          isTextarea={true}
          variant={resolveDialog.status === 'APPROVED' ? 'success' : 'danger'}
          onConfirm={(val) => void handleResolveConfirm(val)}
          onCancel={() => setResolveDialog(null)}
        />
      )}
    </div>
  );
}
