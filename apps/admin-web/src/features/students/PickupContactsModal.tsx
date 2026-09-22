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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function remove(id: string): Promise<void> {
    if (!window.confirm('Bu kişiyi silmek istediğine emin misin?')) return;
    setBusyId(id);
    try {
      await deletePickupContact(id);
      showToast('Kişi silindi.', 'success');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚗</span>
              <h2 className="text-lg font-bold text-gray-900">
                Teslim Kişileri — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Çocuğu teslim alabilecek kişilerin listesi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              {items.length} kişi kayıtlı
            </h3>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {showForm ? 'İptal' : 'Yeni Kişi'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={submitAdd}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                    placeholder="Ayşe Teyze"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Yakınlık
                  </label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                    placeholder="Teyze"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                    placeholder="0555 555 5555"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Kimlik Notu (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={identityNote}
                    onChange={(e) => setIdentityNote(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                    placeholder="TC Kimlik No vb."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs font-semibold text-gray-600 px-3 py-1.5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Ekleniyor…' : 'Ekle'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-sm text-gray-400">Yükleniyor…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              Henüz kişi yok. "Yeni Kişi" ile başla.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {c.fullName}{' '}
                        <span className="text-xs font-normal text-gray-500">
                          ({c.relation})
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </p>
                      {c.identityNote && (
                        <p className="text-[11px] text-gray-400 italic mt-0.5">
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
                      className={`p-1.5 rounded-md transition ${
                        c.isActive
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={c.isActive ? 'Pasif yap' : 'Aktif yap'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(c.id)}
                      disabled={busyId === c.id}
                      className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 transition"
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
    </div>
  );
}
