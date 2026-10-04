import { useEffect, useState, type JSX } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCw,
  Calendar,
  Plus,
  Phone,
  User,
  Clock,
  Check,
  X,
  FileText,
  UserCheck,
  History,
  Lock,
} from 'lucide-react';
import type {
  PickupAuthorization,
  PickupAuthorizationStatus,
  PickupEvent,
  PickupVerificationMethod,
  Student,
} from '@kidscare/shared-types';
import {
  listPickupAuthorizations,
  reviewPickupAuthorization,
  listPickupEvents,
  createPickupEvent,
  createPickupContact,
  createPickupAuthorization,
} from '../../api/pickup';
import { listStudents } from '../../api/students';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { TactileButton } from '../../components/ui/TactileButton';
import { TactileTabs } from '../../components/ui/TactileTabs';

const STATUS_LABEL: Record<PickupAuthorizationStatus, string> = {
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Yetkili / Onaylı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi Doldu',
  REVOKED: 'İptal Edildi',
};

const STATUS_STYLE: Record<PickupAuthorizationStatus, string> = {
  PENDING:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  APPROVED:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  REJECTED:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900',
  EXPIRED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  REVOKED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const VERIFICATION_LABEL: Record<PickupVerificationMethod, string> = {
  ID_CHECK: 'Nüfus Cüzdanı / TC Kontrolü',
  PHONE_CONFIRM: 'Veli Telefon Teyidi',
  KNOWN_FACE: 'Tanınan Yüz / Rutin Teslim',
  PASSWORD: 'Özel Güvenlik Şifresi',
  OTHER: 'Diğer Doğrulama Yöntemi',
};

const RELATIONS_LIST = [
  'Anneanne',
  'Babaanne',
  'Dede',
  'Teyze',
  'Dayı',
  'Amca',
  'Hala',
  'Servis Şoförü',
  'Servis Hostesi',
  'Komşu / Aile Dostu',
  'Diğer',
];

export function PickupPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin =
    state.status === 'authenticated' &&
    (state.user.role === 'SUPER_ADMIN' || state.user.role === 'ADMIN');
  const canOperate = state.status === 'authenticated' && state.user.role !== 'PARENT';

  const [activeTab, setActiveTab] = useState<'AUTHORIZATIONS' | 'EVENTS'>('AUTHORIZATIONS');
  const [items, setItems] = useState<PickupAuthorization[]>([]);
  const [events, setEvents] = useState<PickupEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<PickupAuthorizationStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  // Modals state
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverStudentId, setHandoverStudentId] = useState('');
  const [handoverPersonName, setHandoverPersonName] = useState('');
  const [handoverPersonPhone, setHandoverPersonPhone] = useState('');
  const [handoverMethod, setHandoverMethod] = useState<PickupVerificationMethod>('ID_CHECK');
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverContactId, setHandoverContactId] = useState<string | undefined>(undefined);
  const [handoverAuthId, setHandoverAuthId] = useState<string | undefined>(undefined);
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Anneanne');
  const [newPhone, setNewPhone] = useState('');
  const [newIdentityNote, setNewIdentityNote] = useState('');
  const [addContactSubmitting, setAddContactSubmitting] = useState(false);

  const { showToast } = useToast();

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsList, eventsList] = await Promise.all([
        listPickupAuthorizations(undefined, filter === 'ALL' ? undefined : filter),
        listStudents().catch(() => []),
        listPickupEvents().catch(() => []),
      ]);
      setItems(list);
      setStudents(studentsList);
      setEvents(eventsList);
      if (studentsList.length > 0 && !handoverStudentId) {
        setHandoverStudentId(studentsList[0]?.id || '');
        setNewStudentId(studentsList[0]?.id || '');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Liste yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [filter]);

  async function review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    setBusyId(id);
    try {
      await reviewPickupAuthorization(id, { status });
      showToast(status === 'APPROVED' ? 'Yetki onaylandı! ✅' : 'Yetki reddedildi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function startHandoverFromAuth(item: PickupAuthorization): void {
    const student = students.find((s) => s.id === item.studentId);
    setHandoverStudentId(item.studentId);
    setHandoverPersonName(item.pickupContact?.fullName || '');
    setHandoverPersonPhone(item.pickupContact?.phone || '');
    setHandoverContactId(item.pickupContactId || undefined);
    setHandoverAuthId(item.id);
    setHandoverNote(
      `${student ? student.firstName : 'Öğrenci'} yetkili kişiye (${item.pickupContact?.relation || 'Teslimatçı'}) güvenle teslim edildi.`,
    );
    setIsHandoverOpen(true);
  }

  async function submitHandover(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!handoverStudentId) {
      showToast('Lütfen teslim edilecek öğrenciyi seçin.', 'error');
      return;
    }
    if (!handoverPersonName.trim()) {
      showToast('Lütfen teslim alan kişinin adını girin.', 'error');
      return;
    }

    try {
      setHandoverSubmitting(true);
      await createPickupEvent(handoverStudentId, handoverPersonName.trim(), handoverMethod, {
        pickupContactId: handoverContactId,
        authorizationId: handoverAuthId,
        pickupPersonPhone: handoverPersonPhone.trim() || undefined,
        note: handoverNote.trim() || undefined,
      });

      showToast('Öğrenci güvenle teslim edildi ve günlüğe kaydedildi! 🛡️', 'success');
      setIsHandoverOpen(false);
      setHandoverPersonName('');
      setHandoverPersonPhone('');
      setHandoverNote('');
      setHandoverContactId(undefined);
      setHandoverAuthId(undefined);
      await refresh();
      setActiveTab('EVENTS');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Teslimat kaydedilemedi.', 'error');
    } finally {
      setHandoverSubmitting(false);
    }
  }

  async function submitAddContact(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newStudentId) {
      showToast('Lütfen öğrenci seçin.', 'error');
      return;
    }
    if (!newName.trim()) {
      showToast('Lütfen teslimatçının adını ve soyadını girin.', 'error');
      return;
    }
    if (!newPhone.trim()) {
      showToast('Lütfen iletişim telefonunu girin.', 'error');
      return;
    }

    try {
      setAddContactSubmitting(true);
      const contact = await createPickupContact({
        studentId: newStudentId,
        fullName: newName.trim(),
        relation: newRelation,
        phone: newPhone.trim(),
        identityNote: newIdentityNote.trim() || undefined,
      });

      await createPickupAuthorization({
        studentId: newStudentId,
        pickupContactId: contact.id,
        note: 'Yönetim tarafından doğrudan tanımlandı.',
      });

      showToast('Yeni teslimatçı yetkilendirildi! 🛡️', 'success');
      setIsAddContactOpen(false);
      setNewName('');
      setNewPhone('');
      setNewIdentityNote('');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Yetkili eklenemedi.', 'error');
    } finally {
      setAddContactSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Güvenlik & Teslimat Kontrolü"
        description="Öğrenci teslim alma yetkileri, veli talepleri ve gün sonu kapı teslimat günlüğü."
        icon={ShieldCheck}
        actions={
          <>
            {canOperate && (
              <>
                <TactileButton
                  variant="teal"
                  size="md"
                  onClick={() => {
                    setHandoverPersonName('');
                    setHandoverPersonPhone('');
                    setHandoverContactId(undefined);
                    setHandoverAuthId(undefined);
                    setHandoverNote('');
                    setIsHandoverOpen(true);
                  }}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Öğrenciyi Teslim Et</span>
                </TactileButton>

                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddContactOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Yetkili Ekle</span>
                </TactileButton>
              </>
            )}

            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
              aria-label="Yenile"
              title="Yenile"
              className="px-2.5"
            >
              <RotateCw className="w-4 h-4" />
            </TactileButton>
          </>
        }
      />

      {/* Main Tabs */}
      <div className="pb-3 border-b border-[#DDD4C4]/60 dark:border-slate-800">
        <TactileTabs<'AUTHORIZATIONS' | 'EVENTS'>
          tabs={[
            {
              id: 'AUTHORIZATIONS',
              label: 'Teslimat Yetkileri',
              count: items.length,
              icon: Lock,
              activeVariant: 'teal',
            },
            {
              id: 'EVENTS',
              label: 'Teslimat Günlüğü & Kütük',
              count: events.length,
              icon: History,
              activeVariant: 'teal',
            },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          ariaLabel="Teslimat Ana Sekmeleri"
        />
      </div>

      {/* TAB 1: AUTHORIZATIONS */}
      {activeTab === 'AUTHORIZATIONS' && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="overflow-x-auto pb-1">
            <TactileTabs<'ALL' | PickupAuthorizationStatus>
              tabs={[
                { id: 'ALL', label: 'Tümü' },
                {
                  id: 'PENDING',
                  label: STATUS_LABEL['PENDING'],
                  activeVariant: 'amber',
                  badgeCls: 'bg-amber-100 text-amber-900 font-bold',
                },
                { id: 'APPROVED', label: STATUS_LABEL['APPROVED'], activeVariant: 'teal' },
                { id: 'REJECTED', label: STATUS_LABEL['REJECTED'], activeVariant: 'rose' },
              ]}
              activeId={filter}
              onChange={setFilter}
              ariaLabel="Yetki Durumu Filtresi"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent mb-3" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Yetkiler yükleniyor…
              </p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Bu filtrede teslim yetkisi kaydı bulunamadı."
              description="Velilerin öğrenci teslimatı için yetkilendirdiği kişiler ve onay talepleri burada listelenir."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => {
                const student = students.find((s) => s.id === item.studentId);
                const contact = item.pickupContact;

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-600/50 transition group"
                  >
                    <div className="space-y-3">
                      {/* Student & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Öğrenci
                          </span>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {student
                              ? `${student.firstName} ${student.lastName}`
                              : `Öğrenci #${item.studentId.slice(0, 8)}`}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${STATUS_STYLE[item.status]}`}
                        >
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>

                      {/* Authorized Person Card */}
                      <div className="bg-[#FCFAF7] dark:bg-slate-900/60 rounded-2xl p-3.5 border border-[#DDD4C4] dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                              {contact ? contact.fullName : 'Yetkili Kişi Belirtilmemiş'}
                            </span>
                          </div>
                          {contact?.relation && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shrink-0">
                              {contact.relation}
                            </span>
                          )}
                        </div>

                        {contact?.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:underline font-mono text-teal-800 dark:text-teal-300"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}

                        {contact?.identityNote && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 italic">
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Not: {contact.identityNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Request note & dates */}
                      {item.note && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed italic">
                          "{item.note}"
                        </p>
                      )}

                      {(item.validFrom || item.validUntil) && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Geçerlilik:</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {item.validFrom
                              ? new Date(item.validFrom).toLocaleDateString('tr-TR')
                              : 'Başlangıçtan'}
                          </strong>
                          <span>→</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {item.validUntil
                              ? new Date(item.validUntil).toLocaleDateString('tr-TR')
                              : 'Süresiz'}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center gap-2">
                      {isAdmin && item.status === 'PENDING' ? (
                        <>
                          <TactileButton
                            variant="teal"
                            size="sm"
                            onClick={() => void review(item.id, 'APPROVED')}
                            disabled={busyId === item.id}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Onayla</span>
                          </TactileButton>
                          <TactileButton
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectTargetId(item.id)}
                            disabled={busyId === item.id}
                            className="flex-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reddet</span>
                          </TactileButton>
                        </>
                      ) : item.status === 'APPROVED' ? (
                        <TactileButton
                          variant="secondary"
                          size="sm"
                          onClick={() => startHandoverFromAuth(item)}
                          className="w-full"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Öğrenciyi Teslim Et</span>
                        </TactileButton>
                      ) : (
                        <div className="w-full text-center text-[11px] font-semibold text-slate-400 py-1">
                          Talep sonlandı
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVENTS (TESLİMAT GÜNLÜĞÜ) */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] dark:bg-slate-900/60 p-4 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Günün Resmi Teslimat Kayıtları
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Kapıdan teslim edilen tüm öğrencilerin doğrulama arşivi.
            </span>
          </div>

          {events.length === 0 ? (
            <EmptyState
              icon={History}
              title="Bugün henüz teslimat kaydı girilmedi."
              description="Okul çıkışında öğrencileri teslim ederken 'Öğrenciyi Teslim Et' butonu ile teslimat kaydı oluşturabilirsiniz."
            />
          ) : (
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD4C4] dark:border-slate-800 bg-[#FCFAF7] dark:bg-slate-900/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <th className="py-3 px-4">Zaman / Saat</th>
                      <th className="py-3 px-4">Teslim Edilen Öğrenci</th>
                      <th className="py-3 px-4">Teslim Alan Kişi</th>
                      <th className="py-3 px-4">Doğrulama Yöntemi</th>
                      <th className="py-3 px-4">Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {events.map((ev) => {
                      const st = students.find((s) => s.id === ev.studentId);
                      const timeStr = new Date(ev.occurredAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const dateStr = new Date(ev.occurredAt).toLocaleDateString('tr-TR');

                      return (
                        <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-bold font-mono text-teal-800 dark:text-teal-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{timeStr}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {st
                                ? `${st.firstName} ${st.lastName}`
                                : `Öğrenci #${ev.studentId.slice(0, 8)}`}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-slate-900 dark:text-slate-100">
                              {ev.pickupPersonName}
                            </span>
                            {ev.pickupPersonPhone && (
                              <span className="text-[10px] text-slate-500 block font-mono">
                                {ev.pickupPersonPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {VERIFICATION_LABEL[ev.verificationMethod]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                            {ev.note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Confirm Modal */}
      {rejectTargetId && (
        <ConfirmModal
          isOpen={true}
          title="Teslim Yetkisini Reddet"
          description="Bu teslimat yetkisi talebini reddetmek istediğinize emin misiniz? Öğrenci bu kişiye teslim edilemeyecektir."
          confirmText="Evet, Reddet"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => {
            const id = rejectTargetId;
            setRejectTargetId(null);
            if (id) void review(id, 'REJECTED');
          }}
          onCancel={() => setRejectTargetId(null)}
        />
      )}

      {/* HANDOVER MODAL ("Öğrenciyi Teslim Et") */}
      {isHandoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] w-full max-w-lg rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Öğrenciyi Güvenle Teslim Et
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kapı teslimatını resmi kütüğe işleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void submitHandover(e)} className="p-5 space-y-4">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslim Edilecek Öğrenci *
                </label>
                <select
                  value={handoverStudentId}
                  onChange={(e) => setHandoverStudentId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup Person Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslim Alan Kişinin Adı Soyadı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ayşe Yılmaz"
                  value={handoverPersonName}
                  onChange={(e) => setHandoverPersonName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              {/* Pickup Person Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  İletişim Telefonu (İsteğe Bağlı)
                </label>
                <input
                  type="tel"
                  placeholder="Örn: 0555 123 4567"
                  value={handoverPersonPhone}
                  onChange={(e) => setHandoverPersonPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs font-mono"
                />
              </div>

              {/* Verification Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Doğrulama Yöntemi *
                </label>
                <select
                  value={handoverMethod}
                  onChange={(e) => setHandoverMethod(e.target.value as PickupVerificationMethod)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="ID_CHECK">Nüfus Cüzdanı / TC Kimlik Kontrolü</option>
                  <option value="PHONE_CONFIRM">Veli Telefon Teyidi</option>
                  <option value="KNOWN_FACE">Tanınan Yüz / Rutin Teslimat</option>
                  <option value="PASSWORD">Güvenlik Şifresi / Teslim Kodu</option>
                  <option value="OTHER">Diğer Yöntem</option>
                </select>
              </div>

              {/* Handover Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslimat Notu (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Annesinin onayıyla teyzesine teslim edildi."
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsHandoverOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="teal" size="md" disabled={handoverSubmitting}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{handoverSubmitting ? 'Kaydediliyor…' : 'Teslimatı Onayla ve Kaydet'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL ("Yeni Yetkili Ekle") */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] w-full max-w-lg rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Yeni Teslimat Yetkilisi Tanımla
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Öğrenciyi teslim alabilecek yeni bir kişi ekleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void submitAddContact(e)} className="p-5 space-y-4">
              {/* Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Öğrenci *
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Yetkilinin Adı ve Soyadı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Fatma Demir"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              {/* Relation & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Yakınlık Derecesi *
                  </label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                  >
                    {RELATIONS_LIST.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    placeholder="05xx xxx xxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Identity Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kimlik Notu / Açıklama (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: TC son 4 hane: 1234, Sarı servis aracı"
                  value={newIdentityNote}
                  onChange={(e) => setNewIdentityNote(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddContactOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton
                  type="submit"
                  variant="teal"
                  size="md"
                  disabled={addContactSubmitting}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{addContactSubmitting ? 'Kaydediliyor…' : 'Yetkiliyi Kaydet'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
