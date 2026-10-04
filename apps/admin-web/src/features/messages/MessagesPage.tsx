import { useEffect, useState, useMemo, useRef, type FormEvent, type JSX } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  AlertCircle,
  RotateCw,
  Search,
  CheckCircle2,
  X,
  Clock,
  User as UserIcon,
  Inbox,
} from 'lucide-react';
import type {
  Conversation,
  ConversationCategory,
  ConversationStatus,
  Message,
  Student,
  User,
} from '@kidscare/shared-types';
import {
  createConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  updateConversationStatus,
} from '../../api/messaging';
import { listStudents } from '../../api/students';
import { listUsers } from '../../api/users';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import {
  Badge,
  EmptyState,
  StatCard,
  TactileButton,
  TactileTabs,
  type TactileTabItem,
} from '../../components/ui';

const CATEGORY_LABEL: Record<ConversationCategory, string> = {
  ACIL: '🚨 Acil',
  SAGLIK: '🏥 Sağlık',
  IZIN: '📅 İzin',
  TESLIM: '🚗 Teslim',
  GUNLUK_BILGI: '📝 Günlük Bilgi',
  DUYURU: '📢 Duyuru',
  ODEME: '💳 Ödeme',
  RANDEVU: '📞 Randevu',
};

const STATUS_LABEL: Record<ConversationStatus, string> = {
  OPEN: 'Açık',
  CLOSED: 'Kapalı',
  ARCHIVED: 'Arşivlendi',
};

type TabKey = 'ALL' | 'UNREAD' | 'CRITICAL' | 'CLOSED';

export function MessagesPage(): JSX.Element {
  const { state } = useAuth();
  const meId = state.status === 'authenticated' ? state.user.id : '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const { showToast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compose form states
  const [cSubject, setCSubject] = useState('');
  const [cCategory, setCCategory] = useState<ConversationCategory>('GUNLUK_BILGI');
  const [cStudentId, setCStudentId] = useState('');
  const [cRecipientId, setCRecipientId] = useState('');
  const [cBody, setCBody] = useState('');
  const [submittingCompose, setSubmittingCompose] = useState(false);

  async function refreshList(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes, usersRes] = await Promise.all([
        listConversations(),
        listStudents(),
        listUsers().catch(() => []),
      ]);
      setConversations(list);
      setStudents(studentsRes);
      setUsers(usersRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Sohbetler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadThread(id: string): Promise<void> {
    try {
      const msgs = await listMessages(id);
      setMessages(msgs);
      await markConversationRead(id);
      // Yerel olarak okunmamış sayısını sıfırla
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Mesajlar yüklenemedi', 'error');
    }
  }

  useEffect(() => {
    void refreshList();
  }, []);

  useEffect(() => {
    if (activeId) {
      void loadThread(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleStudentChange(studentId: string): void {
    setCStudentId(studentId);
    if (studentId) {
      const selectedStudent = students.find((s) => s.id === studentId);
      if (selectedStudent?.parentId) {
        setCRecipientId(selectedStudent.parentId);
      }
    }
  }

  async function sendDraft(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeId, { content: draft.trim() });
      setMessages((prev) => [...prev, msg]);
      setDraft('');
      // Sol listedeki son mesaj tarihi ve özetini yenile
      void listConversations()
        .then(setConversations)
        .catch(() => {});
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Mesaj gönderilemedi', 'error');
    } finally {
      setSending(false);
    }
  }

  async function closeConversation(): Promise<void> {
    if (!activeId) return;
    try {
      await updateConversationStatus(activeId, { status: 'CLOSED' });
      showToast('Sohbet kapatıldı.', 'success');
      await refreshList();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    }
  }

  async function submitCompose(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!cSubject.trim() || !cBody.trim()) {
      showToast('Konu ve mesaj zorunlu.', 'error');
      return;
    }
    setSubmittingCompose(true);
    try {
      const resolvedParticipantIds = new Set<string>();
      const selectedStudent = students.find((s) => s.id === cStudentId);
      if (selectedStudent?.parentId) {
        resolvedParticipantIds.add(selectedStudent.parentId);
      }
      if (cRecipientId) {
        resolvedParticipantIds.add(cRecipientId);
      }

      const created = await createConversation({
        subject: cSubject.trim(),
        category: cCategory,
        participantIds: Array.from(resolvedParticipantIds),
        ...(cStudentId ? { studentId: cStudentId } : {}),
        initialMessage: cBody.trim(),
      });
      showToast('Yeni sohbet başarıyla oluşturuldu! 💬', 'success');
      setShowCompose(false);
      setCSubject('');
      setCBody('');
      setCStudentId('');
      setCRecipientId('');
      await refreshList();
      setActiveId(created.id);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Sohbet oluşturulamadı', 'error');
    } finally {
      setSubmittingCompose(false);
    }
  }

  // KPI Metrikleri
  const totalCount = conversations.length;
  const unreadTotal = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [conversations],
  );
  const criticalCount = useMemo(
    () =>
      conversations.filter((c) => c.isCritical || c.category === 'ACIL' || c.category === 'SAGLIK')
        .length,
    [conversations],
  );
  const closedCount = useMemo(
    () => conversations.filter((c) => c.status === 'CLOSED' || c.status === 'ARCHIVED').length,
    [conversations],
  );

  // Sekmeler
  const filterTabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      { id: 'ALL', label: 'Tüm Sohbetler', count: totalCount, activeVariant: 'teal' },
      {
        id: 'UNREAD',
        label: 'Okunmamış',
        count: unreadTotal,
        activeVariant: 'amber',
        badgeCls: 'bg-amber-200 text-amber-950 font-black',
      },
      {
        id: 'CRITICAL',
        label: 'Acil & Sağlık',
        count: criticalCount,
        activeVariant: 'rose',
      },
      { id: 'CLOSED', label: 'Kapananlar', count: closedCount, activeVariant: 'purple' },
    ],
    [totalCount, unreadTotal, criticalCount, closedCount],
  );

  // Filtrelenmiş Sohbetler
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Sekme filtresi
      if (activeTab === 'UNREAD' && c.unreadCount <= 0) return false;
      if (
        activeTab === 'CRITICAL' &&
        !(c.isCritical || c.category === 'ACIL' || c.category === 'SAGLIK')
      )
        return false;
      if (activeTab === 'CLOSED' && c.status !== 'CLOSED' && c.status !== 'ARCHIVED') return false;

      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = c.subject.toLowerCase().includes(q);
        const matchesCategory = (CATEGORY_LABEL[c.category] || '').toLowerCase().includes(q);
        return matchesSubject || matchesCategory;
      }

      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Dokunsal Butonlar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 border-2 border-teal-700/30 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shadow-[0_3px_0_0_#0f766e]">
            <MessageSquare className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mesajlar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Veli, öğretmen ve admin arası güvenli iletişim ve anlık mesajlaşma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => void refreshList()}
            disabled={loading}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Yenile
          </TactileButton>

          <TactileButton variant="teal" size="sm" onClick={() => setShowCompose(true)}>
            <Plus className="w-3.5 h-3.5" />
            Yeni Sohbet
          </TactileButton>
        </div>
      </div>

      {/* Dokunsal KPI Özet Sayaçları (Tıklanabilir Sekme Geçişi) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setSearchQuery('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Tüm sohbetler sekmesine geç"
        >
          <StatCard
            title="Toplam Sohbet"
            value={totalCount}
            subtitle="Tüm diyaloglar"
            variant="blue"
            icon={MessageSquare}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('UNREAD');
            setSearchQuery('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Okunmamış mesajlar sekmesine geç"
        >
          <StatCard
            title="Okunmamış"
            value={unreadTotal}
            subtitle="Yanıt bekleyen"
            variant="amber"
            icon={Inbox}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('CRITICAL');
            setSearchQuery('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Acil ve sağlık mesajları sekmesine geç"
        >
          <StatCard
            title="Acil & Sağlık"
            value={criticalCount}
            subtitle="Öncelikli konular"
            variant="rose"
            icon={AlertCircle}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('CLOSED');
            setSearchQuery('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Kapanan sohbetler sekmesine geç"
        >
          <StatCard
            title="Kapananlar"
            value={closedCount}
            subtitle="Tamamlanan görüşmeler"
            variant="emerald"
            icon={CheckCircle2}
          />
        </button>
      </div>

      {/* Evrensel Dokunsal Sekmeler & Arama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TactileTabs<TabKey> tabs={filterTabs} activeId={activeTab} onChange={setActiveTab} />

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sohbet veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700/80 rounded-2xl pl-10 pr-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 shadow-2xs focus:border-teal-700 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dokunsal Çift Panelli Mesajlaşma Arayüzü */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SOL PANEL: Sohbet Listesi */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-[#DDD4C4] dark:border-slate-800 bg-[#FCFAF7]/50 dark:bg-slate-900/40 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Sohbet Listesi ({filteredConversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[65vh] p-3 space-y-2">
            {loading ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-400 text-xs font-bold">
                <div className="inline-block w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Sohbetler yükleniyor…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState
                  icon={MessageSquare}
                  title="Henüz sohbet yok"
                  description='Yukarıdaki "Yeni Sohbet" butonu ile ilk mesajınızı başlatabilirsiniz.'
                />
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = activeId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs'
                        : 'border-[#DDD4C4] dark:border-slate-800/80 bg-[#FCFAF7] dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {c.isCritical && (
                            <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full border border-rose-300">
                              <AlertCircle className="w-3 h-3 inline mr-0.5" /> Acil
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#DDD4C4] dark:border-slate-700 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABEL[c.category]}
                          </span>
                        </div>

                        <p
                          className={`text-sm font-black truncate mt-1.5 ${
                            isSelected
                              ? 'text-teal-950 dark:text-teal-200'
                              : c.unreadCount > 0
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {c.subject}
                        </p>
                      </div>

                      {c.unreadCount > 0 && (
                        <span className="text-[11px] font-black bg-amber-500 text-amber-950 px-2.5 py-0.5 rounded-full shadow-xs shrink-0 border border-amber-600">
                          {c.unreadCount} yeni
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* SAĞ PANEL: Yazışma Akışı & Gönderim Alanı */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex flex-col min-h-[500px]">
          {!active ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={MessageSquare}
                title="Bir sohbet seçin"
                description="Detayları görüntülemek ve mesaj yazmak için sol listeden bir görüşmeye tıklayın veya yeni bir sohbet başlatın."
              />
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between gap-3 bg-[#FCFAF7]/50 dark:bg-slate-900/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {active.isCritical && (
                      <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full border border-rose-300">
                        <AlertCircle className="w-3 h-3 inline mr-0.5" /> Acil Konu
                      </span>
                    )}
                    <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#DDD4C4] dark:border-slate-700 px-2.5 py-0.5 rounded-full">
                      {CATEGORY_LABEL[active.category]}
                    </span>
                    <Badge variant={active.status === 'OPEN' ? 'success' : 'neutral'} size="sm">
                      {STATUS_LABEL[active.status]}
                    </Badge>
                  </div>

                  <h2 className="font-black text-base text-slate-900 dark:text-white truncate mt-1">
                    {active.subject}
                  </h2>
                </div>

                {active.status === 'OPEN' && (
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    onClick={() => void closeConversation()}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Sohbeti Kapat
                  </TactileButton>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 max-h-[50vh]">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 dark:text-slate-400 text-xs font-semibold py-12">
                    Henüz mesaj bulunmuyor. İlk mesajınızı aşağıdan gönderebilirsiniz.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === meId;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                          <UserIcon className="w-3 h-3" />
                          <span className="font-bold">{isMine ? 'Siz' : 'Karşı Taraf'}</span>
                          <span>·</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3.5 text-xs font-medium leading-relaxed ${
                            isMine
                              ? 'bg-teal-700 text-white rounded-2xl rounded-tr-xs shadow-[0_3px_0_0_#0f766e]'
                              : 'bg-[#FCFAF7] dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs border-2 border-[#DDD4C4] dark:border-slate-700 shadow-2xs'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Form */}
              {active.status === 'OPEN' ? (
                <form
                  onSubmit={(e) => void sendDraft(e)}
                  className="p-3.5 border-t border-[#DDD4C4] dark:border-slate-800 bg-[#FCFAF7]/40 dark:bg-slate-900/40 flex items-center gap-2.5"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={1}
                    className="flex-1 bg-white dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-700 transition resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void sendDraft(e);
                      }
                    }}
                  />

                  <TactileButton
                    variant="teal"
                    size="md"
                    type="submit"
                    disabled={sending || !draft.trim()}
                  >
                    <Send className="w-4 h-4" />
                    Gönder
                  </TactileButton>
                </form>
              ) : (
                <div className="p-3.5 border-t border-[#DDD4C4] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                  Bu sohbet kapatılmıştır. Yeni bir görüşme başlatmak için "Yeni Sohbet" butonunu
                  kullanabilirsiniz.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Yeni Sohbet Modalı */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Yeni Sohbet Başlat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void submitCompose(e)} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Konu Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Servis saatleri hakkında bilgi talebi"
                  value={cSubject}
                  onChange={(e) => setCSubject(e.target.value)}
                  required
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value as ConversationCategory)}
                    className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                  >
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
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
                    value={cStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
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
                  Alıcı / Muhatap
                </label>
                <select
                  value={cRecipientId}
                  onChange={(e) => setCRecipientId(e.target.value)}
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                >
                  <option value="">
                    {cStudentId
                      ? '— Öğrencinin Velisi (Otomatik Belirlenir) —'
                      : '— Otomatik (Kreş Yönetimi / İlgili Kişi) —'}
                  </option>
                  {users
                    .filter((u) => u.id !== meId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} (
                        {u.role === 'PARENT'
                          ? 'Veli'
                          : u.role === 'TEACHER'
                            ? 'Öğretmen'
                            : 'Yönetici'}
                        )
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  İlk Mesajınız
                </label>
                <textarea
                  rows={4}
                  placeholder="İletmek istediğiniz konuyu detaylıca açıklayın..."
                  value={cBody}
                  onChange={(e) => setCBody(e.target.value)}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCompose(false)}
                  disabled={submittingCompose}
                >
                  İptal
                </TactileButton>
                <TactileButton variant="teal" size="sm" type="submit" disabled={submittingCompose}>
                  {submittingCompose ? 'Başlatılıyor…' : 'Sohbeti Başlat'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
