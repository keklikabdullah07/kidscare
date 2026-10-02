import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { X, Plus, Trash2, Phone, User, Power } from 'lucide-react';
import type { PickupContact, Student } from '@kidscare/shared-types';
import {
  createPickupContact,
  deletePickupContact,
  listPickupContacts,
  updatePickupContact,
} from '../../api/pickup';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ui/PromptModal';

export function PickupContactsModal({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}): JSX.Element {
  const [items, setItems] = useState<PickupContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<PickupContact | null>(null);
  const { showToast } = useToast();

  // Form
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNote, setIdentityNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const list = await listPickupContacts(student.id);
      setItems(list);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [student.id]);

  async function submitAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!fullName.trim() || !relation.trim() || !phone.trim()) {
      showToast('Ad, yakınlık ve telefon zorunlu.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createPickupContact({
        studentId: student.id,
        fullName: fullName.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        identityNote: identityNote.trim() || undefined,
      });
      showToast('Kişi eklendi.', 'success');
      setFullName('');
      setRelation('');
      setPhone('');
      setIdentityNote('');
      setShowForm(false);
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Eklenemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function remove(contact: PickupContact): void {
    setContactToDelete(contact);
  }

  async function confirmRemove(): Promise<void> {
    if (!contactToDelete) return;
    const { id, fullName: name } = contactToDelete;
    setContactToDelete(null);
    setBusyId(id);
    try {
      await deletePickupContact(id);
      showToast(`${name} silindi.`, 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Silinemedi', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(contact: PickupContact): Promise<void> {
    setBusyId(contact.id);
    try {
      await updatePickupContact(contact.id, { isActive: !contact.isActive });
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Güncellenemedi', 'error');
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚗</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Teslim Kişileri — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Çocuğu teslim alabilecek kişilerin listesi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {items.length} kişi kayıtlı
            </h3>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {showForm ? 'İptal' : 'Yeni Kişi'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={(e) => {
                void submitAdd(e);
              }}
              className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs"
                    placeholder="Ayşe Teyze"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                    Yakınlık
                  </label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs"
                    placeholder="Teyze"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs"
                    placeholder="0555 555 5555"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                    Kimlik Notu (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={identityNote}
                    onChange={(e) => setIdentityNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs"
                    placeholder="TC Kimlik No vb."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-3 py-1.5 hover:text-slate-900 dark:hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white px-4 py-1.5 text-xs font-bold disabled:opacity-50 transition"
                >
                  {submitting ? 'Ekleniyor…' : 'Ekle'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-300">
              Yükleniyor…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-300">
              Henüz kişi yok. "Yeni Kişi" ile başla.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        c.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {c.fullName}{' '}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-300">
                          ({c.relation})
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                      </p>
                      {c.identityNote && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-300 italic mt-0.5">
                          {c.identityNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleActive(c)}
                      disabled={busyId === c.id}
                      className={`p-1.5 rounded-lg transition ${
                        c.isActive
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={c.isActive ? 'Pasif yap' : 'Aktif yap'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c)}
                      disabled={busyId === c.id}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {contactToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Teslimat Yetkilisini Sil"
          description={`"${contactToDelete.fullName}" adlı kişiyi teslimat yetkilileri listesinden silmek istediğinize emin misiniz?`}
          confirmText="Evet, Sil"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => void confirmRemove()}
          onCancel={() => setContactToDelete(null)}
        />
      )}
    </div>
  );
}
