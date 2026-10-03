import { useState, useEffect, type FormEvent, type ReactElement } from 'react';
import { AlertTriangle, Utensils } from 'lucide-react';
import type { BloodType, EmergencyContact, Student, StudentPassport } from '@kidscare/shared-types';
import { getStudentPassport, updateStudentPassport } from '../../api/students';

const COMMON_ALLERGIES = [
  'Fıstık',
  'Süt / Laktoz',
  'Yumurta',
  'Gluten',
  'Balık',
  'Polen',
  'Toz',
  'Antibiyotik',
];
const COMMON_DIET = ['Vejetaryen', 'Vegan', 'Glutensiz', 'Şekersiz', 'Helal', 'Laktozsuz'];
const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'UNKNOWN'];

export function StudentPassportModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student;
  onClose: () => void;
  onSaved: (passport: StudentPassport) => void;
}): ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bloodType, setBloodType] = useState<BloodType>('UNKNOWN');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [dietInput, setDietInput] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [chronicInput, setChronicInput] = useState('');
  const [regularMedications, setRegularMedications] = useState<string[]>([]);
  const [medInput, setMedInput] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // New Contact form state
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cPickup, setCPickup] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStudentPassport(student.id)
      .then((p) => {
        if (cancelled) return;
        setBloodType(p.bloodType || 'UNKNOWN');
        setAllergies(p.allergies || []);
        setDietaryRestrictions(p.dietaryRestrictions || []);
        setChronicConditions(p.chronicConditions || []);
        setRegularMedications(p.regularMedications || []);
        setEmergencyContacts(p.emergencyContacts || []);
        setDoctorName(p.doctorName || '');
        setDoctorPhone(p.doctorPhone || '');
        setSpecialNotes(p.specialNotes || '');
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Pasaport yüklenemedi');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [student.id]);

  function toggleAllergy(item: string) {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function addCustomAllergy() {
    if (!allergyInput.trim() || allergies.includes(allergyInput.trim())) return;
    setAllergies((prev) => [...prev, allergyInput.trim()]);
    setAllergyInput('');
  }

  function toggleDiet(item: string) {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function addCustomDiet() {
    if (!dietInput.trim() || dietaryRestrictions.includes(dietInput.trim())) return;
    setDietaryRestrictions((prev) => [...prev, dietInput.trim()]);
    setDietInput('');
  }

  function addChronic() {
    if (!chronicInput.trim() || chronicConditions.includes(chronicInput.trim())) return;
    setChronicConditions((prev) => [...prev, chronicInput.trim()]);
    setChronicInput('');
  }

  function addMed() {
    if (!medInput.trim() || regularMedications.includes(medInput.trim())) return;
    setRegularMedications((prev) => [...prev, medInput.trim()]);
    setMedInput('');
  }

  function addContact() {
    if (!cName.trim() || !cPhone.trim()) return;
    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: cName.trim(),
      relationship: cRel.trim() || 'Veli',
      phone: cPhone.trim(),
      isAuthorizedPickup: cPickup,
    };
    setEmergencyContacts((prev) => [...prev, newContact]);
    setCName('');
    setCRel('');
    setCPhone('');
    setCPickup(true);
  }

  function removeContact(id: string) {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: StudentPassport = {
        bloodType,
        allergies,
        dietaryRestrictions,
        chronicConditions,
        regularMedications,
        emergencyContacts,
        doctorName: doctorName.trim() || undefined,
        doctorPhone: doctorPhone.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
      };
      const updated = await updateStudentPassport(student.id, payload);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
      setSaving(false);
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
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Öğrenci Pasaportu — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Acil sağlık, alerji, beslenme ve veli irtibat bilgileri
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-500 dark:text-slate-400">
            Pasaport bilgileri yükleniyor…
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSave(e);
            }}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                {error}
              </div>
            )}

            {/* Section: Kan Grubu & Sağlık */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🩸</span> Temel Sağlık & Kan Grubu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Kan Grubu
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as BloodType)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-1.5 text-sm font-medium shadow-xs focus:border-teal-600 focus:outline-hidden"
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt === 'UNKNOWN' ? 'Bilinmiyor / Belirtilmedi' : bt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Doktor Adı
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Örn. Dr. Mehmet Öz"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-1.5 text-sm shadow-xs focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Doktor / Klinik Tel
                  </label>
                  <input
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-1.5 text-sm shadow-xs focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section: Alerjiler */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Alerjiler (
                  {allergies.length})
                </h3>
                <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  Öğretmenler için kritik uyarı
                </span>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((item) => {
                  const selected = allergies.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergy(item)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {selected ? `✓ ${item}` : `+ ${item}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom allergy input & tags */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                  placeholder="Başka alerji ekle (örn: Arı sokması)..."
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-1.5 text-xs shadow-xs focus:border-rose-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-medium"
                >
                  Ekle
                </button>
              </div>

              {allergies.filter((a) => !COMMON_ALLERGIES.includes(a)).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {allergies
                    .filter((a) => !COMMON_ALLERGIES.includes(a))
                    .map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => toggleAllergy(item)}
                          className="text-rose-700 dark:text-rose-300 hover:text-rose-950 dark:hover:text-white font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Section: Beslenme & İlaçlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Beslenme */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 p-4 space-y-2.5">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-700 dark:text-amber-400" /> Beslenme
                  Kısıtlamaları
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DIET.map((item) => {
                    const selected = dietaryRestrictions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDiet(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selected
                            ? 'bg-amber-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {selected ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={dietInput}
                    onChange={(e) => setDietInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomDiet();
                      }
                    }}
                    placeholder="Özel diyet / beslenme notu..."
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-2.5 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomDiet}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-xl text-xs font-medium"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Düzenli İlaç & Kronik */}
              <div className="rounded-xl border border-blue-200 dark:border-teal-900/60 bg-blue-50/30 dark:bg-slate-900/50 p-4 space-y-2.5">
                <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <span>💊</span> Kronik Durum & İlaçlar
                </h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chronicInput}
                      onChange={(e) => setChronicInput(e.target.value)}
                      placeholder="Kronik durum (örn: Astım)..."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={addChronic}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-medium transition"
                    >
                      Ekle
                    </button>
                  </div>
                  {chronicConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {chronicConditions.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60"
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => setChronicConditions((p) => p.filter((x) => x !== c))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={medInput}
                      onChange={(e) => setMedInput(e.target.value)}
                      placeholder="Düzenli ilaç (örn: Sabah 10:00 Ventolin)..."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={addMed}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-medium transition"
                    >
                      Ekle
                    </button>
                  </div>
                  {regularMedications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {regularMedications.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                        >
                          {m}
                          <button
                            type="button"
                            onClick={() => setRegularMedications((p) => p.filter((x) => x !== m))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Acil Durum & Teslim Alıcılar */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📞</span> Acil Durum İletişim & Yetkili Teslim Kişileri (
                {emergencyContacts.length})
              </h3>

              {/* Existing contacts table */}
              {emergencyContacts.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200/80 dark:border-slate-700 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-900">
                  {emergencyContacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white mr-2">
                          {c.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-300 mr-2">
                          ({c.relationship})
                        </span>
                        <span className="text-teal-900 dark:text-teal-300 font-mono">
                          {c.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.isAuthorizedPickup && (
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                            ✓ Teslim Yetkili
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeContact(c.id)}
                          className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-300 italic">
                  Henüz acil durum kişisi eklenmedi.
                </p>
              )}

              {/* Add contact row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Kişi Adı Soyadı"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
                <input
                  type="text"
                  value={cRel}
                  onChange={(e) => setCRel(e.target.value)}
                  placeholder="Yakınlık (Anne, Baba...)"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
                <input
                  type="tel"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="Telefon"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cPickup}
                      onChange={(e) => setCPickup(e.target.checked)}
                      className="rounded border-slate-300 text-teal-900 dark:text-amber-500 focus:ring-teal-600 dark:focus:ring-amber-400"
                    />
                    Teslim alabilir
                  </label>
                  <button
                    type="button"
                    onClick={addContact}
                    className="ml-auto px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white rounded-xl text-xs font-bold transition"
                  >
                    + Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Section: Özel / Pedagojik Notlar */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Öğretmene Özel Hatırlatma & Bireysel Notlar
              </label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={2}
                placeholder="Örn: Uyku öncesi masal dinlemeyi sever, yüksek sesten tedirgin olur..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 px-3 py-2 text-xs focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            {/* Modal Actions */}
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
                className="btn-tactile-teal px-5 py-2 text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor…' : 'Pasaportu Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
