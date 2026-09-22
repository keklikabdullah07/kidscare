import { useEffect, useState } from 'react';
import type {
  DailyReport,
  DailyReportInput,
  MealPortion,
  NapQuality,
  PottyEntry,
  PottyType,
  Student,
  StudentMood,
  MedicationEntry,
} from '@kidscare/shared-types';
import { getStudentDailyReport, saveStudentDailyReport } from '../../api/daily-reports';

const MOODS: { key: StudentMood; label: string; emoji: string; color: string }[] = [
  {
    key: 'HAPPY',
    label: 'Mutlu',
    emoji: '😄',
    color: 'bg-green-50 border-green-200 text-green-800',
  },
  { key: 'CALM', label: 'Sakin', emoji: '😌', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  {
    key: 'ENERGETIC',
    label: 'Enerjik',
    emoji: '⚡',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  {
    key: 'TIRED',
    label: 'Yorgun',
    emoji: '🥱',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  },
  {
    key: 'CRANKY',
    label: 'Huysuz',
    emoji: '😣',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  { key: 'SAD', label: 'Üzgün', emoji: '😢', color: 'bg-red-50 border-red-200 text-red-800' },
];

const MEAL_PORTIONS: { key: MealPortion; label: string }[] = [
  { key: 'ALL', label: 'Hepsini Yedi' },
  { key: 'HALF', label: 'Yarısını Yedi' },
  { key: 'LITTLE', label: 'Az Yedi' },
  { key: 'NONE', label: 'Yemedi' },
];

const NAP_QUALITIES: { key: NapQuality; label: string }[] = [
  { key: 'GOOD', label: 'Kesintisiz / Rahat' },
  { key: 'INTERRUPTED', label: 'Bölük Pörçük' },
  { key: 'NONE', label: 'Uyumadı' },
];

const POTTY_TYPES: { key: PottyType; label: string; emoji: string }[] = [
  { key: 'POTTY', label: 'Tuvalet Başarılı', emoji: '🚽' },
  { key: 'WET', label: 'Islak Bez', emoji: '💧' },
  { key: 'DIRTY', label: 'Kirli Bez', emoji: '🧻' },
  { key: 'ACCIDENT', label: 'Kaza / Kaçırma', emoji: '⚠️' },
];

const QUICK_ACTIVITIES = [
  'Serbest Oyun',
  'Görsel Sanatlar',
  'Müzik & Ritim',
  'Bahçe Zamanı',
  'Hikaye & Masal',
  'Jimnastik / Hareket',
  'İngilizce',
  'Montessori & Akıl Oyunları',
];

interface Props {
  student: Student | null;
  date: string;
  onClose: () => void;
  onSaved: (report: DailyReport) => void;
}

export function DailyReportEditorModal({
  student,
  date,
  onClose,
  onSaved,
}: Props): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [mood, setMood] = useState<StudentMood | undefined>(undefined);
  const [breakfast, setBreakfast] = useState<MealPortion | undefined>(undefined);
  const [lunch, setLunch] = useState<MealPortion | undefined>(undefined);
  const [snack, setSnack] = useState<MealPortion | undefined>(undefined);
  const [mealNotes, setMealNotes] = useState('');

  const [napStart, setNapStart] = useState('');
  const [napEnd, setNapEnd] = useState('');
  const [napQuality, setNapQuality] = useState<NapQuality | undefined>(undefined);
  const [napNotes, setNapNotes] = useState('');

  const [pottyEntries, setPottyEntries] = useState<PottyEntry[]>([]);
  const [pottyTime, setPottyTime] = useState('');
  const [pottyType, setPottyType] = useState<PottyType>('POTTY');

  const [activities, setActivities] = useState<string[]>([]);
  const [teacherNote, setTeacherNote] = useState('');

  // Medication & Health state
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [medName, setMedName] = useState('');
  const [medTime, setMedTime] = useState('13:00');
  const [medDosage, setMedDosage] = useState('');
  const [medTemperature, setMedTemperature] = useState('');
  const [medNotes, setMedNotes] = useState('');

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getStudentDailyReport(student.id, date)
      .then((report) => {
        if (cancelled) return;
        if (report) {
          setMood(report.mood ?? undefined);
          setBreakfast(report.meals?.breakfast);
          setLunch(report.meals?.lunch);
          setSnack(report.meals?.afternoonSnack);
          setMealNotes(report.meals?.notes ?? '');

          setNapStart(report.naps?.startTime ?? '');
          setNapEnd(report.naps?.endTime ?? '');
          setNapQuality(report.naps?.quality);
          setNapNotes(report.naps?.notes ?? '');

          setPottyEntries(report.potty ?? []);
          setActivities(report.activities ?? []);
          setTeacherNote(report.teacherNote ?? '');
          setMedications(report.medications ?? []);
        } else {
          // Reset for new
          setMood(undefined);
          setBreakfast(undefined);
          setLunch(undefined);
          setSnack(undefined);
          setMealNotes('');
          setNapStart('13:00');
          setNapEnd('14:30');
          setNapQuality('GOOD');
          setNapNotes('');
          setPottyEntries([]);
          setActivities([]);
          setTeacherNote('');
          setMedications([]);
          setMedName('');
          setMedTime('13:00');
          setMedDosage('');
          setMedTemperature('');
          setMedNotes('');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Rapor yüklenemedi');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [student, date]);

  function toggleActivity(act: string): void {
    setActivities((prev) => (prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]));
  }

  function addPotty(): void {
    if (!pottyTime.trim()) return;
    const newEntry: PottyEntry = {
      id: `p-${Date.now()}`,
      time: pottyTime.trim(),
      type: pottyType,
    };
    setPottyEntries((prev) => [...prev, newEntry]);
    setPottyTime('');
  }

  function removePotty(id: string): void {
    setPottyEntries((prev) => prev.filter((p) => p.id !== id));
  }

  function addMedication(): void {
    if (!medName.trim()) return;
    const tempNum = medTemperature ? parseFloat(medTemperature) : undefined;
    const newMed: MedicationEntry = {
      id: `med-${Date.now()}`,
      name: medName.trim(),
      time: medTime.trim() || '13:00',
      givenBy: 'Öğretmen',
      dosage: medDosage.trim() || undefined,
      status: 'SCHEDULED',
      requestedBy: 'Veli',
      temperature: tempNum && !isNaN(tempNum) ? tempNum : undefined,
      notes: medNotes.trim() || undefined,
    };
    setMedications((prev) => [...prev, newMed]);
    setMedName('');
    setMedDosage('');
    setMedTemperature('');
    setMedNotes('');
  }

  function toggleMedicationStatus(id: string): void {
    const nowStr = new Date().toTimeString().slice(0, 5);
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStatus = m.status === 'GIVEN' ? 'SCHEDULED' : 'GIVEN';
        return {
          ...m,
          status: newStatus,
          givenAt: newStatus === 'GIVEN' ? nowStr : undefined,
        };
      }),
    );
  }

  function removeMedication(id: string): void {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!student || saving) return;
    setSaving(true);
    setError(null);

    try {
      const payload: DailyReportInput = {
        mood,
        meals: {
          breakfast,
          lunch,
          afternoonSnack: snack,
          notes: mealNotes.trim() || undefined,
        },
        naps: {
          startTime: napStart.trim() || undefined,
          endTime: napEnd.trim() || undefined,
          quality: napQuality,
          notes: napNotes.trim() || undefined,
        },
        potty: pottyEntries,
        activities,
        teacherNote: teacherNote.trim() || undefined,
        medications: medications.length > 0 ? medications : undefined,
      };

      const saved = await saveStudentDailyReport(student.id, date, payload);
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
      setSaving(false);
    }
  }

  if (!student) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <h2 className="text-lg font-bold text-gray-900">
                Günlük Takip — {student.firstName} {student.lastName}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Tarih: <span className="font-semibold text-gray-700">{date}</span>
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-gray-500">
            Günlük rapor yükleniyor…
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void handleSave(e);
            }}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Mood Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                😊 Günün Ruh Hali (Mod)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOODS.map((m) => {
                  const isSelected = mood === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMood(m.key)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? `${m.color} ring-2 ring-blue-500 font-bold scale-102`
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-xs mt-1">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meals Section */}
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/40 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span>🍽️</span> Beslenme & Yemek Takibi
              </h3>
              <div className="space-y-2">
                {/* Breakfast */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-md border border-gray-200">
                  <span className="text-xs font-medium text-gray-800 w-24">Sabah Kahvaltısı</span>
                  <div className="flex flex-wrap gap-1">
                    {MEAL_PORTIONS.map((mp) => (
                      <button
                        key={mp.key}
                        type="button"
                        onClick={() => setBreakfast(mp.key)}
                        className={`px-2 py-1 text-xs rounded-md border font-medium ${
                          breakfast === mp.key
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {mp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lunch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-md border border-gray-200">
                  <span className="text-xs font-medium text-gray-800 w-24">Öğle Yemeği</span>
                  <div className="flex flex-wrap gap-1">
                    {MEAL_PORTIONS.map((mp) => (
                      <button
                        key={mp.key}
                        type="button"
                        onClick={() => setLunch(mp.key)}
                        className={`px-2 py-1 text-xs rounded-md border font-medium ${
                          lunch === mp.key
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {mp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Snack */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-md border border-gray-200">
                  <span className="text-xs font-medium text-gray-800 w-24">İkindi Ara Öğün</span>
                  <div className="flex flex-wrap gap-1">
                    {MEAL_PORTIONS.map((mp) => (
                      <button
                        key={mp.key}
                        type="button"
                        onClick={() => setSnack(mp.key)}
                        className={`px-2 py-1 text-xs rounded-md border font-medium ${
                          snack === mp.key
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {mp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="Yemek hakkında özel not (ör: çorbayı çok sevdi, ekmek yemedi)..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Nap Section */}
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/40 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span>😴</span> Uyku & Dinlenme Takibi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Uyuma Saati
                  </label>
                  <input
                    type="time"
                    value={napStart}
                    onChange={(e) => setNapStart(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Uyanma Saati
                  </label>
                  <input
                    type="time"
                    value={napEnd}
                    onChange={(e) => setNapEnd(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Uyku Kalitesi
                  </label>
                  <select
                    value={napQuality ?? ''}
                    onChange={(e) => setNapQuality(e.target.value as NapQuality)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
                  >
                    <option value="">Seçiniz</option>
                    {NAP_QUALITIES.map((nq) => (
                      <option key={nq.key} value={nq.key}>
                        {nq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={napNotes}
                onChange={(e) => setNapNotes(e.target.value)}
                placeholder="Uyku notu (ör: masalla 10 dakikada uyudu)..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Potty / Diaper Section */}
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/40 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span>🚻</span> Tuvalet & Bez Değişimi
              </h3>
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-md border border-gray-200">
                <input
                  type="time"
                  value={pottyTime}
                  onChange={(e) => setPottyTime(e.target.value)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                />
                <select
                  value={pottyType}
                  onChange={(e) => setPottyType(e.target.value as PottyType)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                >
                  {POTTY_TYPES.map((pt) => (
                    <option key={pt.key} value={pt.key}>
                      {pt.emoji} {pt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addPotty}
                  className="px-3 py-1 bg-gray-800 hover:bg-black text-white rounded-md text-xs font-medium"
                >
                  + Kayıt Ekle
                </button>
              </div>

              {pottyEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {pottyEntries.map((p) => {
                    const info = POTTY_TYPES.find((pt) => pt.key === p.type);
                    return (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full text-xs font-medium text-gray-800 shadow-2xs"
                      >
                        <span>{info?.emoji}</span>
                        <span>{p.time}</span>
                        <span className="text-gray-500">({info?.label})</span>
                        <button
                          type="button"
                          onClick={() => removePotty(p.id)}
                          className="text-red-500 hover:text-red-700 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activities Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                🎨 Günün Etkinlikleri
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIVITIES.map((act) => {
                  const isSelected = activities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActivity(act)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? `✓ ${act}` : `+ ${act}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medication & Health Section */}
            <div className="rounded-lg border border-rose-100 p-4 bg-rose-50/30 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span>💊</span> İlaç Takip & Sağlık
              </h3>

              {/* Add medication form */}
              <div className="bg-white rounded-md border border-rose-100 p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="İlaç adı (ör: Nurofen)"
                    className="col-span-1 sm:col-span-2 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-800 focus:border-rose-400 focus:outline-hidden"
                  />
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="Doz (ör: 5 ml)"
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-800 focus:border-rose-400 focus:outline-hidden"
                  />
                  <input
                    type="number"
                    value={medTemperature}
                    onChange={(e) => setMedTemperature(e.target.value)}
                    placeholder="Ateş (°C)"
                    step="0.1"
                    min="35"
                    max="42"
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-800 focus:border-rose-400 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={medNotes}
                    onChange={(e) => setMedNotes(e.target.value)}
                    placeholder="Not (ör: veli istedi)"
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-800 focus:border-rose-400 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  disabled={!medName.trim()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  + İlaç Kaydı Ekle
                </button>
              </div>

              {/* Medication list */}
              {medications.length > 0 && (
                <div className="space-y-1.5">
                  {medications.map((med) => {
                    const isGiven = med.status === 'GIVEN';
                    return (
                      <div
                        key={med.id}
                        className={`flex items-center gap-2 p-2.5 rounded-md border text-xs transition-colors ${
                          isGiven
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleMedicationStatus(med.id)}
                          title={isGiven ? 'Verildi olarak işaretlendi' : 'Verildi olarak işaretle'}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isGiven
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isGiven && <span className="text-[10px] leading-none">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold ${ isGiven ? 'text-green-800' : 'text-gray-800' }`}>
                            {med.name}
                          </span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-500">{med.time}</span>
                          {med.dosage && (
                            <span className="ml-1 text-gray-500">({med.dosage})</span>
                          )}
                          {med.temperature !== undefined && (
                            <span className={`ml-1.5 font-medium ${ med.temperature >= 38 ? 'text-red-600' : 'text-gray-600' }`}>
                              🌡️ {med.temperature.toFixed(1)}°C
                            </span>
                          )}
                          {isGiven && med.givenAt && (
                            <span className="ml-1.5 text-green-600">✓ {med.givenAt}'de verildi</span>
                          )}
                          {med.notes && (
                            <span className="ml-1 text-gray-400 italic">— {med.notes}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedication(med.id)}
                          className="flex-shrink-0 text-red-400 hover:text-red-600 font-bold text-base leading-none px-1"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teacher Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                📝 Öğretmen Gün Sonu Notu & Veli Mesajı
              </label>
              <textarea
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                rows={3}
                placeholder="Örn: Bugün arkadaşlarıyla çok uyumlu oynadı, resim etkinliğinde güneş resmi yaptı..."
                className="w-full rounded-md border border-gray-300 p-3 text-xs text-gray-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

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
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor…' : 'Raporu Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
