import { useEffect, useState } from 'react';
import type { AllergenWarningSummary, DailyMenu } from '@kidscare/shared-types';
import { deleteDailyMenu, getDailyMenu, saveDailyMenu } from '../../api/daily-menus';

const COMMON_ALLERGENS = [
  '🥛 Süt / Laktoz',
  '🌾 Gluten',
  '🥚 Yumurta',
  '🥜 Fıstık / Kuruyemiş',
  '🐟 Balık',
  '🍓 Çilek',
  '🍫 Soya',
  '🍯 Bal',
];

export function DailyMenuPage(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [warnings, setWarnings] = useState<AllergenWarningSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [breakfastInput, setBreakfastInput] = useState('');
  const [lunchInput, setLunchInput] = useState('');
  const [snackInput, setSnackInput] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [notes, setNotes] = useState('');

  function loadMenu(): void {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    getDailyMenu(selectedDate)
      .then((res) => {
        setMenu(res.menu);
        setWarnings(res.allergenWarnings);
        if (res.menu) {
          setBreakfastInput(res.menu.breakfast.join('\n'));
          setLunchInput(res.menu.lunch.join('\n'));
          setSnackInput(res.menu.snack.join('\n'));
          setSelectedAllergens(res.menu.allergens);
          setCalories(res.menu.calories ? String(res.menu.calories) : '');
          setNotes(res.menu.notes ?? '');
        } else {
          setBreakfastInput('');
          setLunchInput('');
          setSnackInput('');
          setSelectedAllergens([]);
          setCalories('');
          setNotes('');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Menü yüklenemedi');
        setLoading(false);
      });
  }

  useEffect(loadMenu, [selectedDate]);

  function changeDay(delta: number): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  function toggleAllergen(allergen: string): void {
    // extract clean name without emoji
    const clean = allergen.replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '').trim();
    const tag = clean || allergen;

    setSelectedAllergens((prev) =>
      prev.includes(tag) ? prev.filter((a) => a !== tag) : [...prev, tag],
    );
  }

  function addCustomAllergen(): void {
    const trimmed = customAllergen.trim();
    if (trimmed && !selectedAllergens.includes(trimmed)) {
      setSelectedAllergens((prev) => [...prev, trimmed]);
      setCustomAllergen('');
    }
  }

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const breakfast = breakfastInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const lunch = lunchInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const snack = snackInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await saveDailyMenu({
        date: selectedDate,
        breakfast,
        lunch,
        snack,
        allergens: selectedAllergens,
        calories: calories.trim() ? Number(calories) : null,
        notes: notes.trim() || null,
      });

      setMenu(res.menu);
      setWarnings(res.allergenWarnings);
      setSuccessMsg('Günün menüsü başarıyla kaydedildi!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Menü kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!confirm('Bu günün menüsünü silmek istediğinize emin misiniz?')) return;
    setSaving(true);
    setError(null);
    try {
      await deleteDailyMenu(selectedDate);
      setMenu(null);
      setWarnings([]);
      setBreakfastInput('');
      setLunchInput('');
      setSnackInput('');
      setSelectedAllergens([]);
      setCalories('');
      setNotes('');
      setSuccessMsg('Menü silindi.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Menü silinemedi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🍲</span> Yemek Listesi & Beslenme Yönetimi
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Günün kahvaltı, öğle ve ikindi menülerini planlayın; öğrenci pasaportlarındaki
            alerjenlerle otomatik eşleştirin.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
            title="Önceki Gün"
          >
            ◀
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-transparent px-2 py-1 outline-hidden"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
            title="Sonraki Gün"
          >
            ▶
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md ml-1"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Allergen Warning Banner */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Alerjen Riski Uyarısı — {warnings.length} Öğrenci Etkileniyor!
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Günün menüsündeki içerikler, aşağıdaki öğrencilerin sağlık pasaportundaki kayıtlı
                alerjileri ile çakışmaktadır:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {warnings.map((w) => (
                  <div
                    key={w.studentId}
                    className="inline-flex items-center gap-1.5 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs shadow-2xs"
                  >
                    <span className="font-bold text-gray-900">{w.studentName}:</span>
                    <span className="text-red-700 font-semibold">
                      {w.matchedAllergens.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Günün menüsü yükleniyor…</div>
      ) : (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
          {/* Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Breakfast */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌅</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Sabah Kahvaltısı</h3>
                  <p className="text-[11px] text-gray-500">Her satıra bir çeşit yazın</p>
                </div>
              </div>
              <textarea
                value={breakfastInput}
                onChange={(e) => setBreakfastInput(e.target.value)}
                placeholder="Örn:&#10;Haşlanmış Yumurta&#10;Beyaz Peynir&#10;Zeytin&#10;Ihlamur"
                rows={5}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Lunch */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🍲</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Öğle Yemeği</h3>
                  <p className="text-[11px] text-gray-500">Her satıra bir çeşit yazın</p>
                </div>
              </div>
              <textarea
                value={lunchInput}
                onChange={(e) => setLunchInput(e.target.value)}
                placeholder="Örn:&#10;Mercimek Çorbası&#10;Kıymalı Bezelye&#10;Pirinç Pilavı&#10;Ayran"
                rows={5}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Snack */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🥪</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">İkindi Ara Öğünü</h3>
                  <p className="text-[11px] text-gray-500">Her satıra bir çeşit yazın</p>
                </div>
              </div>
              <textarea
                value={snackInput}
                onChange={(e) => setSnackInput(e.target.value)}
                placeholder="Örn:&#10;Mevsim Meyvesi (Muz)&#10;Fındıklı Ev Keki"
                rows={5}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Allergens & Nutrition Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🏷️</span> İçerdiği Alerjenler & Beslenme Bilgisi
            </h3>

            {/* Preset Allergen Chips */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Menüde yer alan alerjenleri seçin:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((all) => {
                  const clean = all.replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '').trim();
                  const isSel = selectedAllergens.includes(clean || all);
                  return (
                    <button
                      key={all}
                      type="button"
                      onClick={() => toggleAllergen(all)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSel
                          ? 'bg-red-100 border-red-300 text-red-800 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {all} {isSel ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Allergen Tag */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAllergen();
                  }
                }}
                placeholder="Başka alerjen ekle (Örn: Kivi, Susam)"
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800"
              />
              <button
                type="button"
                onClick={addCustomAllergen}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium"
              >
                Ekle
              </button>
            </div>

            {/* Calories & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tahmini Kalori (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Örn: 950"
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Aşçı / Beslenme Notu
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Sebzeler taze olarak temin edilmiştir."
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {menu && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={saving}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  🗑️ Menüyü Sil
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <span>💾</span>
                <span>{saving ? 'Kaydediliyor…' : 'Günün Menüsünü Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
