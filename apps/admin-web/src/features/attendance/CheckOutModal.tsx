import { useState, useEffect } from 'react';
import type { Attendance, EmergencyContact, Student } from '@kidscare/shared-types';
import { checkOutStudent } from '../../api/attendance';

interface Props {
  student: Student | null;
  date: string;
  onClose: () => void;
  onSaved: (att: Attendance) => void;
}

export function CheckOutModal({ student, date, onClose, onSaved }: Props): React.ReactElement {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [time, setTime] = useState(defaultTime);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [customPerson, setCustomPerson] = useState('');
  const [pickupNote, setPickupNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!student) return <></>;

  const contacts: EmergencyContact[] = student.passport?.emergencyContacts ?? [];
  const authorizedContacts = contacts.filter((c) => c.isAuthorizedPickup);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!student || saving) return;

    let who = '';
    let contactId: string | undefined = undefined;

    if (selectedContactId && selectedContactId !== 'CUSTOM') {
      const found = contacts.find((c) => c.id === selectedContactId);
      if (found) {
        who = `${found.name} (${found.relationship})`;
        contactId = found.id;
      }
    } else {
      who = customPerson.trim();
    }

    if (!who) {
      setError('Lütfen çocuğu teslim alan kişiyi belirtin.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saved = await checkOutStudent(student.id, date, {
        checkOutTime: time.trim() || undefined,
        checkOutBy: who,
        pickupContactId: contactId,
        pickupNote: pickupNote.trim() || undefined,
      });
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Çıkış kaydedilemedi');
      setSaving(false);
    }
  }

  const isCustom = selectedContactId === 'CUSTOM' || (!selectedContactId && contacts.length === 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/40 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Güvenli Teslim & Çıkış — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Çocuğu teslim alan kişiyi doğrulayın ve çıkışı onaylayın.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              {error}
            </div>
          )}

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Çıkış Saati
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:ring-amber-500/20 dark:focus:border-amber-500"
            />
          </div>

          {/* Authorized Pickup Contacts from Passport */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
              📋 Pasaporttaki Yetkili Teslim Alıcılar
            </label>

            {authorizedContacts.length > 0 ? (
              <div className="space-y-2">
                {authorizedContacts.map((c, idx) => {
                  const isSel = selectedContactId === (c.id || c.name);
                  return (
                    <label
                      key={c.id || `${c.name}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSel
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30 dark:border-amber-400 dark:bg-amber-400/10 dark:ring-amber-400/30'
                          : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="pickupContact"
                          checked={isSel}
                          onChange={() => setSelectedContactId(c.id || c.name)}
                          className="text-teal-900 dark:text-amber-500 focus:ring-teal-500 dark:focus:ring-amber-400"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {c.name}{' '}
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                              ({c.relationship})
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">
                            {c.phone}
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        ✓ Yetkili
                      </span>
                    </label>
                  );
                })}

                {/* Custom / Non-authorized option */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedContactId === 'CUSTOM'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-400/10'
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupContact"
                    checked={selectedContactId === 'CUSTOM'}
                    onChange={() => setSelectedContactId('CUSTOM')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      ➕ Başka Bir Kişi (Özel Teslim)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      Pasaport listesinde olmayan veli/akraba
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-800 dark:text-amber-300">
                Öğrenci pasaportunda tanımlı yetkili teslim alıcı bulunamadı. Lütfen teslim alan
                kişiyi aşağıya yazın.
              </div>
            )}
          </div>

          {/* Custom Person Input */}
          {isCustom && (
            <div className="space-y-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <span>⚠️</span> Yetki Doğrulama & Veli Onayı
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Teslim Alan Kişinin Adı Soyadı & Yakınlığı
                </label>
                <input
                  type="text"
                  value={customPerson}
                  onChange={(e) => setCustomPerson(e.target.value)}
                  placeholder="Örn: Merve Kaya (Teyze)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-1.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Veli İzin / Açıklama Notu
                </label>
                <input
                  type="text"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  placeholder="Örn: Annesi telefonla arayarak teyzesine teslim edilmesini onayladı."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-slate-700/80 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-tactile-secondary px-4 py-2 text-sm font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-tactile-teal px-5 py-2 text-sm font-bold disabled:opacity-50 flex items-center gap-2"
            >
              <span>🔒</span>
              <span>{saving ? 'Kaydediliyor…' : 'Güvenli Çıkışı Tamamla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
