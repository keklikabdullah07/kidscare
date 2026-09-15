import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h2 className="text-lg font-bold text-gray-900">
                Güvenli Teslim & Çıkış — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Çocuğu teslim alan kişiyi doğrulayın ve çıkışı onaylayın.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
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
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Çıkış Saati</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium"
            />
          </div>

          {/* Authorized Pickup Contacts from Passport */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              📋 Pasaporttaki Yetkili Teslim Alıcılar
            </label>

            {authorizedContacts.length > 0 ? (
              <div className="space-y-2">
                {authorizedContacts.map((c, idx) => {
                  const isSel = selectedContactId === (c.id || c.name);
                  return (
                    <label
                      key={c.id || `${c.name}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isSel
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="pickupContact"
                          checked={isSel}
                          onChange={() => setSelectedContactId(c.id || c.name)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {c.name}{' '}
                            <span className="text-xs font-medium text-gray-500">
                              ({c.relationship})
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{c.phone}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                        ✓ Yetkili
                      </span>
                    </label>
                  );
                })}

                {/* Custom / Non-authorized option */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedContactId === 'CUSTOM'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
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
                    <p className="text-sm font-bold text-gray-900">
                      ➕ Başka Bir Kişi (Özel Teslim)
                    </p>
                    <p className="text-xs text-gray-500">Pasaport listesinde olmayan veli/akraba</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Öğrenci pasaportunda tanımlı yetkili teslim alıcı bulunamadı. Lütfen teslim alan
                kişiyi aşağıya yazın.
              </div>
            )}
          </div>

          {/* Custom Person Input */}
          {isCustom && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <span>⚠️</span> Yetki Doğrulama & Veli Onayı
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Teslim Alan Kişinin Adı Soyadı & Yakınlığı
                </label>
                <input
                  type="text"
                  value={customPerson}
                  onChange={(e) => setCustomPerson(e.target.value)}
                  placeholder="Örn: Merve Kaya (Teyze)"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Veli İzin / Açıklama Notu
                </label>
                <input
                  type="text"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  placeholder="Örn: Annesi telefonla arayarak teyzesine teslim edilmesini onayladı."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 flex items-center gap-2"
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
