import { useEffect, useState, useMemo, type FormEvent, type JSX } from 'react';
import type { Student, StudentPassport } from '@kidscare/shared-types';
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  Phone,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { ApiError } from '../../api/client';
import { createStudent, deleteStudent, listStudents, updateStudent } from '../../api/students';
import { listUsers } from '../../api/users';
import type { User } from '@kidscare/shared-types';
import { StudentPassportModal } from './StudentPassportModal';
import { PickupContactsModal } from './PickupContactsModal';
import { useToast } from '../../components/Toast';

type Status = 'loading' | 'ready' | 'error';
type ViewMode = 'grid' | 'table';
type FilterType = 'all' | 'active' | 'allergy' | 'blood';

export function StudentsPage(): JSX.Element {
  const [status, setStatus] = useState<Status>('loading');
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [passportStudent, setPassportStudent] = useState<Student | null>(null);
  const [pickupContactsStudent, setPickupContactsStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { showToast } = useToast();

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
    if (!confirm(`${name} adlı öğrenciyi silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      showToast(`${name} başarıyla silindi.`, 'info');
    } catch (err) {
      const msg = err instanceof ApiError ? `API ${err.status}` : 'Silme başarısız';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  }

  function handlePassportSaved(studentId: string, updatedPassport: StudentPassport): void {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, passport: updatedPassport } : s)),
    );
    showToast('Öğrenci pasaportu ve sağlık bilgileri güncellendi.', 'success');
  }

  // Filter & Search logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
          const notes = (s.notes || '').toLowerCase();
          const allergyMatch = s.passport?.allergies?.some((a) => a.toLowerCase().includes(q));
          const contactMatch = s.passport?.emergencyContacts?.some(
            (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
          );
          if (!fullName.includes(q) && !notes.includes(q) && !allergyMatch && !contactMatch) {
            return false;
          }
        }

        // Category filter
        if (filterType === 'active') return s.isActive;
        if (filterType === 'allergy') return (s.passport?.allergies?.length ?? 0) > 0;
        if (filterType === 'blood') {
          return !!s.passport?.bloodType && s.passport.bloodType !== 'UNKNOWN';
        }
        return true;
      })
      .sort(byLastName);
  }, [students, searchQuery, filterType]);

  // Statistics
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.isActive).length;
  const allergyCount = students.filter((s) => (s.passport?.allergies?.length ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Öğrenci Yönetimi</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kayıtlı öğrenciler, acil iletişim rehberi ve sağlık pasaportları
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-xs">
            <span>
              Toplam: <strong className="text-slate-900">{totalCount}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Aktif: <strong className="text-emerald-700">{activeCount}</strong>
            </span>
            {allergyCount > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {allergyCount} Alerji
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yeni öğrenci</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci adı, veli telefonu veya alerji ara..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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

        {/* Filter Badges & View Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tümü ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Aktifler ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('allergy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                filterType === 'allergy'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Alerjisi Olanlar ({allergyCount})
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tablo Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading & Empty States */}
      {status === 'loading' && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Yükleniyor…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-rose-600 text-sm font-medium">Öğrenciler yüklenemedi.</p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {status === 'ready' && students.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Henüz öğrenci yok.</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Kreşinize ilk öğrencinizi eklemek için aşağıdaki butonu kullanabilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" /> + Yeni öğrenci
          </button>
        </div>
      )}

      {status === 'ready' && students.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">Arama kriterlerine uygun öğrenci bulunamadı.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Content: Grid or Table View */}
      {status === 'ready' && filteredStudents.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  onOpenPassport={() => setPassportStudent(s)}
                  onOpenPickupContacts={() => setPickupContactsStudent(s)}
                  onEdit={() => setEditingStudent(s)}
                  onDelete={() => void handleDelete(s.id, `${s.firstName} ${s.lastName}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Ad Soyad</th>
                      <th className="py-3.5 px-4">Doğum</th>
                      <th className="py-3.5 px-4">Cinsiyet</th>
                      <th className="py-3.5 px-4">Pasaport Özeti</th>
                      <th className="py-3.5 px-4">Acil İletişim / Veli</th>
                      <th className="py-3.5 px-4">Durum</th>
                      <th className="py-3.5 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => {
                      const p = s.passport;
                      const hasAllergy = p?.allergies && p.allergies.length > 0;
                      const blood = p?.bloodType && p.bloodType !== 'UNKNOWN' ? p.bloodType : null;
                      const primaryContact = p?.emergencyContacts?.[0];

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {s.firstName.charAt(0)}
                                {s.lastName.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-900">
                                  {s.firstName} {s.lastName}
                                </span>
                                {s.notes && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1">
                                    {s.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-xs whitespace-nowrap">
                            {s.dateOfBirth}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-xs">{s.gender ?? '—'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {blood && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  🩸 {blood}
                                </span>
                              )}
                              {hasAllergy && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                                  ⚠️ {p.allergies.length} Alerji
                                </span>
                              )}
                              {!blood && !hasAllergy && (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {primaryContact ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${primaryContact.phone}`}
                                  className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {primaryContact.name} ({primaryContact.relationship})
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={
                                s.isActive
                                  ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600'
                              }
                            >
                              {s.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setPassportStudent(s)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                            >
                              📋 Pasaport
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStudent(s)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(s.id, `${s.firstName} ${s.lastName}`)
                              }
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition text-xs"
                              title="Sil"
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
            </div>
          )}
        </>
      )}

      {/* Add New Student Modal */}
      {showAddModal && (
        <StudentFormModal
          title="Yeni Öğrenci Ekle"
          onClose={() => setShowAddModal(false)}
          onSaved={(created) => {
            setStudents((prev) => [...prev, created].sort(byLastName));
            setShowAddModal(false);
            showToast(`${created.firstName} ${created.lastName} başarıyla eklendi!`, 'success');
          }}
        />
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentFormModal
          title={`Öğrenciyi Düzenle: ${editingStudent.firstName} ${editingStudent.lastName}`}
          initialStudent={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSaved={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setEditingStudent(null);
            showToast(`${updated.firstName} ${updated.lastName} bilgileri güncellendi!`, 'success');
          }}
        />
      )}

      {/* Passport Modal */}
      {passportStudent && (
        <StudentPassportModal
          student={passportStudent}
          onClose={() => setPassportStudent(null)}
          onSaved={(updated) => handlePassportSaved(passportStudent.id, updated)}
        />
      )}

      {/* Pickup Contacts Modal */}
      {pickupContactsStudent && (
        <PickupContactsModal
          student={pickupContactsStudent}
          onClose={() => setPickupContactsStudent(null)}
        />
      )}
    </div>
  );
}

// Student Card Component for Grid View
function StudentCard({
  student,
  onOpenPassport,
  onOpenPickupContacts,
  onEdit,
  onDelete,
}: {
  student: Student;
  onOpenPassport: () => void;
  onOpenPickupContacts: () => void;
  onEdit: () => void;
  onDelete: () => void;
}): JSX.Element {
  const p = student.passport;
  const allergies = p?.allergies || [];
  const blood = p?.bloodType && p.bloodType !== 'UNKNOWN' ? p.bloodType : null;
  const primaryContact = p?.emergencyContacts?.[0];

  // Age calculation
  const parts = student.dateOfBirth ? student.dateOfBirth.split('-') : [];
  const birthYear = parts.length > 0 && parts[0] ? parseInt(parts[0], 10) : null;
  const currentYear = new Date().getFullYear();
  const estimatedAge = birthYear ? currentYear - birthYear : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Info */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {student.firstName.charAt(0)}
              {student.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                {student.firstName} {student.lastName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.dateOfBirth}</span>
                  {estimatedAge !== null && (
                    <span className="text-slate-400">({estimatedAge} yaş)</span>
                  )}
                </span>
                {student.gender && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="capitalize">{student.gender}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <span
            className={
              student.isActive
                ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0'
                : 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 shrink-0'
            }
          >
            {student.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>

        {/* Health & Passport Highlights */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {blood && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                🩸 Kan: {blood}
              </span>
            )}
            {p?.dietaryRestrictions && p.dietaryRestrictions.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                🥗 {p.dietaryRestrictions.join(', ')}
              </span>
            )}
            {allergies.length === 0 && !blood && (
              <span className="text-[11px] text-slate-400 italic">Sağlık notu belirtilmedi</span>
            )}
          </div>

          {/* Allergies Highlight (Prominent) */}
          {allergies.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Kritik Alerji Uyarısı:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-900"
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Contact / Parent */}
        {primaryContact && (
          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {primaryContact.name}{' '}
                  <span className="font-normal text-slate-500">
                    ({primaryContact.relationship})
                  </span>
                </p>
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="text-blue-600 hover:underline font-mono text-[11px]"
                >
                  {primaryContact.phone}
                </a>
              </div>
            </div>
            {primaryContact.isAuthorizedPickup && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Teslim Yetkili
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenPassport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pasaport & Sağlık</span>
        </button>
        <button
          type="button"
          onClick={onOpenPickupContacts}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Teslim Kişileri</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition text-xs"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Student Form Modal (Used for both Create and Update)
function StudentFormModal({
  title,
  initialStudent,
  onClose,
  onSaved,
}: {
  title: string;
  initialStudent?: Student;
  onClose: () => void;
  onSaved: (student: Student) => void;
}): JSX.Element {
  const [firstName, setFirstName] = useState(initialStudent?.firstName || '');
  const [lastName, setLastName] = useState(initialStudent?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialStudent?.dateOfBirth || '');
  const [gender, setGender] = useState(initialStudent?.gender || '');
  const [notes, setNotes] = useState(initialStudent?.notes || '');
  const [isActive, setIsActive] = useState(initialStudent?.isActive ?? true);
  const [parentId, setParentId] = useState(initialStudent?.parentId ?? '');
  const [parents, setParents] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    listUsers('PARENT')
      .then(setParents)
      .catch(() => setParents([]));
  }, []);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError(null);

    try {
      if (initialStudent) {
        // Update
        const updated = await updateStudent(initialStudent.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
          gender: gender || null,
          notes: notes.trim() || null,
          isActive,
          parentId: parentId || null,
        });
        onSaved(updated);
      } else {
        // Create
        const payload: Parameters<typeof createStudent>[0] = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
        };
        if (gender) payload.gender = gender;
        if (notes.trim()) payload.notes = notes.trim();
        if (parentId) payload.parentId = parentId;
        const created = await createStudent(payload);
        onSaved(created);
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError ? `API Hatası: ${err.status}` : 'Kaydetme işlemi başarısız',
      );
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Ad</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Örn: Ada"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Soyad</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Örn: Yılmaz"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Doğum tarihi</span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-slate-700 mb-1">Cinsiyet</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="">Belirtilmedi</option>
                <option value="female">Kız (female)</option>
                <option value="male">Erkek (male)</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Notlar</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Öğrenciye dair özel notlar, alışkanlıklar..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Veli hesabı</span>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">Veli atanmadı</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Veli hesabı yoksa önce Ekip & Veliler sayfasından oluşturun.
            </p>
          </label>

          {initialStudent && (
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">Öğrenci aktif durumda</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : initialStudent ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function byLastName(a: Student, b: Student): number {
  const ln = a.lastName.localeCompare(b.lastName, 'tr');
  return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName, 'tr');
}
