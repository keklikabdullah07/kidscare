import { useEffect, useState, type JSX } from 'react';
import type { AllergenWarningSummary, DailyMenu } from '@kidscare/shared-types';
import {
  Utensils,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Coffee,
  Soup,
  Cookie,
  Flame,
  FileText,
  X,
} from 'lucide-react';
import { deleteDailyMenu, getDailyMenu, saveDailyMenu } from '../../api/daily-menus';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';

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

export function DailyMenuPage(): JSX.Element {
  const { state: authState } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [warnings, setWarnings] = useState<AllergenWarningSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canEdit = authState.status === 'authenticated' && authState.user.role !== 'PARENT';

  // Form states
  const [breakfastInput, setBreakfastInput] = useState('');
  const [lunchInput, setLunchInput] = useState('');
  const [snackInput, setSnackInput] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [notes, setNotes] = useState('');

  const { showToast } = useToast();

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
      setSuccessMsg('Kreş menüsü başarıyla kaydedildi!');
      showToast('Kreş yemek menüsü başarıyla kaydedildi!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Menü kaydedilemedi';
      setError(msg);
      showToast(msg, 'error');
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
      setSuccessMsg('Kreş menüsü silindi.');
      showToast('Kreş menüsü başarıyla silindi.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Menü silinemedi';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Kreş Yemek Menüsü & Beslenme Yönetimi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kreş genelinde geçerli kahvaltı, öğle ve ikindi menülerini planlayın; öğrenci
                pasaportlarındaki alerjenlerle otomatik eşleştirin.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent px-2 py-1 outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg ml-1 transition"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Allergen Warning Banner */}
      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-950">
                Alerjen Riski Uyarısı — {warnings.length} Öğrenci Etkileniyor!
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Günün menüsündeki içerikler, aşağıdaki öğrencilerin sağlık pasaportundaki kayıtlı
                alerjileri ile çakışmaktadır:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {warnings.map((w) => (
                  <div
                    key={w.studentId}
                    className="inline-flex items-center gap-2 bg-white border border-amber-300/80 rounded-xl px-3 py-1.5 text-xs shadow-xs"
                  >
                    <span className="font-bold text-slate-900">{w.studentName}:</span>
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span> {w.matchedAllergens.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Günün menüsü yükleniyor…</p>
        </div>
      ) : !canEdit ? (
        /* View-only mode for parents */
        <div className="space-y-6">
          {!menu ||
          (menu.breakfast.length === 0 && menu.lunch.length === 0 && menu.snack.length === 0) ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-slate-500 text-sm font-medium">Bu gün için menü girilmemiştir.</p>
            </div>
          ) : (
            <>
              {/* Allergen Warning Banner */}
              {warnings.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-amber-950">
                        Alerjen Riski Uyarısı — {warnings.length} Öğrenci Etkileniyor!
                      </h3>
                      <p className="text-xs text-amber-800 mt-1">
                        Günün menüsündeki içerikler, aşağıdaki öğrencilerin sağlık pasaportundaki
                        kayıtlı alerjileri ile çakışmaktadır:
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {warnings.map((w) => (
                          <div
                            key={w.studentId}
                            className="inline-flex items-center gap-2 bg-white border border-amber-300/80 rounded-xl px-3 py-1.5 text-xs shadow-xs"
                          >
                            <span className="font-bold text-slate-900">{w.studentName}:</span>
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <span>⚠️</span> {w.matchedAllergens.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Cards - View Only */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {menu.breakfast.length > 0 && (
                  <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Sabah Kahvaltısı</h3>
                    </div>
                    <div className="space-y-1">
                      {menu.breakfast.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {menu.lunch.length > 0 && (
                  <div className="rounded-2xl border border-blue-200/90 bg-blue-50/40 p-5 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Soup className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Öğle Yemeği</h3>
                    </div>
                    <div className="space-y-1">
                      {menu.lunch.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {menu.snack.length > 0 && (
                  <div className="rounded-2xl border border-orange-200/90 bg-orange-50/40 p-5 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
                        <Cookie className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">İkindi Ara Öğünü</h3>
                    </div>
                    <div className="space-y-1">
                      {menu.snack.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nutrition Info - View Only */}
              {(menu.allergens.length > 0 || menu.calories || menu.notes) && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-amber-500">🏷️</span> İçerdiği Alerjenler & Beslenme
                    Bilgisi
                  </h3>

                  {menu.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">İçerdiği Alerjenler:</p>
                      <div className="flex flex-wrap gap-2">
                        {menu.allergens.map((alg, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-rose-50 border-rose-300 text-rose-800"
                          >
                            {alg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menu.calories && (
                    <p className="text-xs text-slate-700">
                      🔥 Tahmini Kalori: <span className="font-bold">{menu.calories} kcal</span>
                    </p>
                  )}

                  {menu.notes && (
                    <p className="text-xs text-slate-700">
                      📝 Not: <span className="italic">{menu.notes}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
          {/* Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Breakfast */}
            <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sabah Kahvaltısı</h3>
                    <p className="text-[11px] text-slate-500">Her satıra bir çeşit yazın</p>
                  </div>
                </div>
                <textarea
                  value={breakfastInput}
                  onChange={(e) => setBreakfastInput(e.target.value)}
                  placeholder="Örn:&#10;Haşlanmış Yumurta&#10;Beyaz Peynir&#10;Zeytin&#10;Ihlamur"
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed transition"
                />
              </div>
            </div>

            {/* Lunch */}
            <div className="rounded-2xl border border-blue-200/90 bg-blue-50/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Soup className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Öğle Yemeği</h3>
                    <p className="text-[11px] text-slate-500">Her satıra bir çeşit yazın</p>
                  </div>
                </div>
                <textarea
                  value={lunchInput}
                  onChange={(e) => setLunchInput(e.target.value)}
                  placeholder="Örn:&#10;Mercimek Çorbası&#10;Kıymalı Bezelye&#10;Pirinç Pilavı&#10;Ayran"
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed transition"
                />
              </div>
            </div>

            {/* Snack */}
            <div className="rounded-2xl border border-orange-200/90 bg-orange-50/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">İkindi Ara Öğünü</h3>
                    <p className="text-[11px] text-slate-500">Her satıra bir çeşit yazın</p>
                  </div>
                </div>
                <textarea
                  value={snackInput}
                  onChange={(e) => setSnackInput(e.target.value)}
                  placeholder="Örn:&#10;Mevsim Meyvesi (Muz)&#10;Fındıklı Ev Keki"
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed transition"
                />
              </div>
            </div>
          </div>

          {/* Allergens & Nutrition Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">🏷️</span> İçerdiği Alerjenler & Beslenme Bilgisi
            </h3>

            {/* Preset Allergen Chips */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Menüde yer alan alerjenleri seçin:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((all) => {
                  const clean = all.replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '').trim();
                  const isSel = selectedAllergens.includes(clean || all);
                  return (
                    <button
                      key={all}
                      type="button"
                      onClick={() => toggleAllergen(all)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSel
                          ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs ring-1 ring-rose-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={addCustomAllergen}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
              >
                Ekle
              </button>
            </div>

            {/* Calories & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tahmini Kalori (kcal)</span>
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Örn: 950"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Aşçı / Beslenme Notu</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Sebzeler taze olarak temin edilmiştir."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {canEdit && (
            <div className="flex items-center justify-between pt-2">
              <div>
                {menu && (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kreş Menüsünü Sil</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Kaydediliyor…' : 'Günün Menüsünü Kaydet'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
