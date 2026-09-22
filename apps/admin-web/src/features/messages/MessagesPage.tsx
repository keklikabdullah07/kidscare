import { useEffect, useState, type FormEvent, type JSX } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  AlertCircle,
  RotateCw,
  CheckCheck,
} from 'lucide-react';
import type {
  Conversation,
  ConversationCategory,
  ConversationStatus,
  Message,
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
import type { Student } from '@kidscare/shared-types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';

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

export function MessagesPage(): JSX.Element {
  const { state } = useAuth();
  const meId = state.status === 'authenticated' ? state.user.id : '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  // compose form
  const [cSubject, setCSubject] = useState('');
  const [cCategory, setCCategory] = useState<ConversationCategory>('GUNLUK_BILGI');
  const [cStudentId, setCStudentId] = useState('');
  const [cBody, setCBody] = useState('');

  async function refreshList(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes] = await Promise.all([listConversations(), listStudents()]);
      setConversations(list);
      setStudents(studentsRes);
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
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Mesajlar yüklenemedi', 'error');
    }
  }

  useEffect(() => {
    void refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeId) {
      void loadThread(activeId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  async function sendDraft(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeId, { content: draft.trim() });
      setMessages((prev) => [...prev, msg]);
      setDraft('');
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
    try {
      const created = await createConversation({
        subject: cSubject.trim(),
        category: cCategory,
        participantIds: [],
        ...(cStudentId ? { studentId: cStudentId } : {}),
        initialMessage: cBody.trim(),
      });
      showToast('Sohbet oluşturuldu.', 'success');
      setShowCompose(false);
      setCSubject('');
      setCBody('');
      setCStudentId('');
      await refreshList();
      setActiveId(created.id);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Sohbet oluşturulamadı', 'error');
    }
  }

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mesajlar</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Veli, öğretmen ve admin arası güvenli iletişim.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshList()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Yenile
          </button>
          <button
            type="button"
            onClick={() => setShowCompose((v) => !v)}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni Sohbet
          </button>
        </div>
      </div>

      {showCompose && (
        <form
          onSubmit={submitCompose}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Konu
              </label>
              <input
                type="text"
                value={cSubject}
                onChange={(e) => setCSubject(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kategori
              </label>
              <select
                value={cCategory}
                onChange={(e) => setCCategory(e.target.value as ConversationCategory)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Öğrenci (opsiyonel)
              </label>
              <select
                value={cStudentId}
                onChange={(e) => setCStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">—</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              İlk mesaj
            </label>
            <textarea
              value={cBody}
              onChange={(e) => setCBody(e.target.value)}
              rows={3}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              className="text-xs font-semibold text-slate-600 px-3 py-1.5"
            >
              İptal
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg"
            >
              Aç
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversation List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Yükleniyor…</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Henüz sohbet yok. "Yeni Sohbet" ile başla.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 transition ${
                      activeId === c.id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold truncate ${
                            c.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {c.isCritical && <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-rose-600" />}
                          {c.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {CATEGORY_LABEL[c.category]}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thread */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col min-h-[60vh]">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8">
              Bir sohbet seçin veya yeni oluşturun.
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 truncate">
                    {active.isCritical && (
                      <AlertCircle className="w-4 h-4 inline mr-1 text-rose-600" />
                    )}
                    {active.subject}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {CATEGORY_LABEL[active.category]} · {STATUS_LABEL[active.status]}
                  </p>
                </div>
                {active.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => void closeConversation()}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg"
                  >
                    Kapat
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-8">
                    Henüz mesaj yok.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === meId;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                            isMine
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {active.status === 'OPEN' && (
                <form
                  onSubmit={sendDraft}
                  className="border-t border-slate-100 p-3 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Mesaj yaz…"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? '…' : 'Gönder'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
