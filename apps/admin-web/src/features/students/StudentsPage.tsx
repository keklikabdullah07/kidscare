import { useEffect, useState, type FormEvent, type JSX } from 'react';
import type { Student, StudentPassport } from '@kidscare/shared-types';
import { ApiError } from '../../api/client';
import { createStudent, deleteStudent, listStudents } from '../../api/students';
import { StudentPassportModal } from './StudentPassportModal';

type Status = 'loading' | 'ready' | 'error';

export function StudentsPage(): JSX.Element {
  const [status, setStatus] = useState<Status>('loading');
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passportStudent, setPassportStudent] = useState<Student | null>(null);

  function reload(): void {
    setStatus('loading');
    listStudents()
      .then((rows) => {
        setStudents(rows);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Bilinmeyen hata');
      });
  }

  useEffect(reload, []);

  async function handleDelete(id: string, name: string): Promise<void> {
    if (!confirm(`${name} adlı öğrenciyi silmek istediğine emin misin?`)) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? `API ${err.status}` : 'Silme başarısız');
    }
  }

  function handlePassportSaved(studentId: string, updatedPassport: StudentPassport): void {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, passport: updatedPassport } : s)),
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Öğrenciler</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Öğrenci listesi, kayıt yönetimi ve Öğrenci Pasaportu
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 text-white rounded-md px-3.5 py-1.5 text-sm font-semibold hover:bg-blue-700 shadow-xs"
        >
          {showForm ? 'İptal' : '+ Yeni öğrenci'}
        </button>
      </div>

      {showForm && (
        <NewStudentForm
          saving={saving}
          onSaved={(s) => {
            setStudents((prev) => [...prev, s].sort(byLastName));
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
          onError={setErrorMsg}
          onSavingChange={setSaving}
        />
      )}

      {errorMsg && (
        <p role="alert" className="text-sm text-red-600">
          {errorMsg}
        </p>
      )}

      {status === 'loading' && <p className="text-gray-500">Yükleniyor…</p>}
      {status === 'error' && <p className="text-red-600">Öğrenciler yüklenemedi.</p>}
      {status === 'ready' && students.length === 0 && (
        <p className="text-gray-500">Henüz öğrenci yok. Yukarıdan ekleyin.</p>
      )}
      {status === 'ready' && students.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-2.5">Ad Soyad</th>
                <th className="py-2.5">Doğum</th>
                <th className="py-2.5">Cinsiyet</th>
                <th className="py-2.5">Pasaport Özeti</th>
                <th className="py-2.5">Durum</th>
                <th className="py-2.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const p = s.passport;
                const hasAllergy = p?.allergies && p.allergies.length > 0;
                const blood = p?.bloodType && p.bloodType !== 'UNKNOWN' ? p.bloodType : null;

                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="py-2.5 font-semibold text-gray-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="py-2.5 text-gray-700">{s.dateOfBirth}</td>
                    <td className="py-2.5 text-gray-700">{s.gender ?? '—'}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {blood && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                            🩸 {blood}
                          </span>
                        )}
                        {hasAllergy && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                            ⚠️ {p.allergies.length} Alerji
                          </span>
                        )}
                        {!blood && !hasAllergy && <span className="text-gray-400 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={
                          s.isActive
                            ? 'inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium'
                            : 'inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium'
                        }
                      >
                        {s.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setPassportStudent(s)}
                        className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        📋 Pasaport
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(s.id, `${s.firstName} ${s.lastName}`)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {passportStudent && (
        <StudentPassportModal
          student={passportStudent}
          onClose={() => setPassportStudent(null)}
          onSaved={(updated) => handlePassportSaved(passportStudent.id, updated)}
        />
      )}
    </div>
  );
}

function byLastName(a: Student, b: Student): number {
  const ln = a.lastName.localeCompare(b.lastName, 'tr');
  return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName, 'tr');
}

function NewStudentForm({
  saving,
  onSaved,
  onCancel,
  onError,
  onSavingChange,
}: {
  saving: boolean;
  onSaved: (s: Student) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
  onSavingChange: (b: boolean) => void;
}): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (saving) return;
    onSavingChange(true);
    try {
      const payload: Parameters<typeof createStudent>[0] = {
        firstName,
        lastName,
        dateOfBirth,
      };
      if (gender) payload.gender = gender;
      if (notes) payload.notes = notes;
      const created = await createStudent(payload);
      onSaved(created);
    } catch (err) {
      onError(err instanceof ApiError ? `API ${err.status}` : 'Kaydetme başarısız');
    } finally {
      onSavingChange(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="bg-gray-50 rounded p-4 space-y-3 border border-gray-200"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ad" value={firstName} onChange={setFirstName} required />
        <Field label="Soyad" value={lastName} onChange={setLastName} required />
        <Field
          label="Doğum tarihi"
          type="date"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          required
        />
        <Field label="Cinsiyet" value={gender} onChange={setGender} />
      </div>
      <Field label="Notlar" value={notes} onChange={setNotes} multiline />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}): JSX.Element {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={2}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </label>
  );
}
