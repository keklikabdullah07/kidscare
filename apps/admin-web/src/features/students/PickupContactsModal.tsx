import { useEffect, useState, useMemo, type FormEvent, type JSX } from 'react';
import { X, Plus, Trash2, Phone, User, Power, ShieldCheck, Check } from 'lucide-react';
import type { EmergencyContact, PickupContact, Student } from '@kidscare/shared-types';
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
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<PickupContact | null>(null);
  const { showToast } = useToast();

  // Form
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNote, setIdentityNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pasaportta kayıtlı teslim yetkili kişileri
  const passportPickupContacts = useMemo(() => {
    return (student.passport?.emergencyContacts || []).filter((c) => c.isAuthorizedPickup);
  }, [student.passport]);

  const isSynced = (c: EmergencyContact): boolean => {
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    return items.some(
      (item) =>
        (item.phone &&
          cleanPhone.length >= 6 &&
          item.phone.replace(/\D/g, '').includes(cleanPhone)) ||
        item.fullName.trim().toLowerCase() === c.name.trim().toLowerCase(),
    );
  };

  const unsyncedPassportContacts = useMemo(() => {
    return passportPickupContacts.filter((c) => !isSynced(c));
  }, [passportPickupContacts, items]);

  const totalAuthorizedCount = items.length + unsyncedPassportContacts.length;

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

  async function handleSyncContact(c: EmergencyContact): Promise<void> {
    setSyncingId(c.id);
    try {
      await createPickupContact({
        studentId: student.id,
        fullName: c.name.trim(),
        relation: c.relationship.trim() || 'Pasaport Yetkilisi',
        phone: c.phone.trim(),
        identityNote: 'Öğrenci Pasaportundan aktarıldı',
      });
      showToast(`${c.name} teslimat modülüne aktarıldı.`, 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Aktarılamadı', 'error');
    } finally {
      setSyncingId(null);
    }
  }

  async function handleSyncAll(): Promise<void> {
    if (unsyncedPassportContacts.length === 0) return;
    setSyncingAll(true);
    let successCount = 0;
    for (const c of unsyncedPassportContacts) {
      try {
        await createPickupContact({
          studentId: student.id,
          fullName: c.name.trim(),
          relation: c.relationship.trim() || 'Pasaport Yetkilisi',
          phone: c.phone.trim(),
          identityNote: 'Öğrenci Pasaportundan aktarıldı',
        });
        successCount++;
      } catch {
        // Devam et
      }
    }
    if (successCount > 0) {
      showToast(`${successCount} kişi teslimat modülüne aktarıldı.`, 'success');
    }
    setSyncingAll(false);
    await refresh();
  }

  async function submitAdd(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    if (!fullName.trim() || !relation.trim() || !phone.trim()) {
      showToast('Ad, yakınlık ve telefon zorunlu.', 'error');
      return;
    }
    if (phone.trim().length < 3) {
      showToast('Telefon numarası en az 3 karakter olmalıdır.', 'error');
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
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white dark:bg-slate-800 border border-[#DDD4C4] dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-850 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚗</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Teslim Kişileri — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Çocuğu okuldan teslim almaya yetkili kişilerin listesi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {totalAuthorizedCount} yetkili kişi kayıtlı
              </h3>
              {unsyncedPassportContacts.length > 0 && (
                <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                  ({passportPickupContacts.length} pasaport onaylı, {items.length} ek kayıtlı)
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unsyncedPassportContacts.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleSyncAll()}
                  disabled={syncingAll}
                  className="btn-tactile-secondary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 text-teal-800 dark:text-teal-300 disabled:opacity-50"
                  title="Pasaporttaki tüm yetkilileri teslimat tablosuna aktar"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {syncingAll
                    ? 'Aktarılıyor…'
                    : `Tümünü Senkronize Et (${unsyncedPassportContacts.length})`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="btn-tactile-teal px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {showForm ? 'İptal' : 'Yeni Kişi'}
              </button>
            </div>
          </div>

          {/* New Contact Form */}
          {showForm && (
            <form
              onSubmit={(e) => {
                void submitAdd(e);
              }}
              className="rounded-2xl border border-teal-200/80 dark:border-slate-700 bg-teal-50/30 dark:bg-slate-900/50 p-4.5 space-y-3"
            >
              <h4 className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">
                Yeni Teslimat Yetkilisi Ekle (Servis, Komşu, Akraba)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs font-medium"
                    placeholder="Örn: Ayşe Teyze, Servis Şoförü Ahmet"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs font-medium"
                    placeholder="Teyze, Servis, Komşu..."
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs font-medium"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs font-medium"
                    placeholder="TC Kimlik No, Servis Plakası vb."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-teal-200/60 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-tactile-secondary px-3 py-1.5 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-tactile-teal px-4 py-1.5 text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Ekleniyor…' : 'Yetkiliyi Kaydet'}
                </button>
              </div>
            </form>
          )}

          {/* Section 1: Pasaportta Yetkili Olan Kişiler */}
          {passportPickupContacts.length > 0 && (
            <div className="rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950 dark:text-teal-200">
                    Öğrenci Pasaportunda Yetkili Kişiler ({passportPickupContacts.length})
                  </h4>
                </div>
                <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold bg-teal-100/60 dark:bg-teal-900/40 px-2 py-0.5 rounded-md">
                  Pasaport Onaylı
                </span>
              </div>

              <div className="divide-y divide-teal-100 dark:divide-teal-900/40 rounded-xl border border-teal-200/60 dark:border-teal-900/40 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                {passportPickupContacts.map((c) => {
                  const synced = isSynced(c);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-teal-50/30 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0 font-bold text-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {c.name}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                              ({c.relationship})
                            </span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              ✓ Teslim Yetkili
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a
                              href={`tel:${c.phone}`}
                              className="font-mono font-semibold text-teal-900 dark:text-teal-300 hover:underline"
                            >
                              {c.phone}
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {synced ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 shadow-2xs">
                            <Check className="w-3.5 h-3.5" /> Senkronize
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSyncContact(c)}
                            disabled={syncingId === c.id}
                            className="btn-tactile-teal px-3 py-1 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            {syncingId === c.id ? 'Aktarılıyor…' : '+ Modüle Aktar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Teslimat Modülü Kayıtları */}
          <div className="space-y-3">
            {passportPickupContacts.length > 0 && items.length > 0 && (
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>🚗</span> Ek Tanımlı Teslim Kişileri ({items.length})
              </h4>
            )}

            {loading ? (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-300">
                Yükleniyor…
              </div>
            ) : items.length === 0 ? (
              passportPickupContacts.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  Henüz yetkili kişi yok. Yukarıdaki &quot;Yeni Kişi&quot; butonuyla ekleyebilir
                  veya öğrenci Pasaportundan teslim yetkisi verebilirsiniz.
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  Yukarıdaki pasaport yetkilileri dışında ek bir kişi (servis, komşu vb.) henüz
                  tanımlanmadı.
                </p>
              )
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
                {items.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
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
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a
                            href={`tel:${c.phone}`}
                            className="font-mono hover:underline text-teal-800 dark:text-teal-300"
                          >
                            {c.phone}
                          </a>
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
