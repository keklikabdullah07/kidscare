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
  CheckCircle2,
  Tag,
  Plus,
  Check,
} from 'lucide-react';
import { deleteDailyMenu, getDailyMenu, saveDailyMenu } from '../../api/daily-menus';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';

const COMMON_ALLERGENS = [
  'Süt / Laktoz',
  'Gluten',
  'Yumurta',
  'Fıstık / Kuruyemiş',
  'Balık',
  'Çilek',
  'Soya',
  'Bal',
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleDelete(): void {
    setShowDeleteConfirm(true);
  }

  async function confirmDelete(): Promise<void> {
    setShowDeleteConfirm(false);
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
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center font-bold shadow-2xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kreş Yemek Menüsü & Beslenme Yönetimi
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              Kahvaltı, öğle ve ikindi menüleri ile otomatik öğrenci alerjen denetimi
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 p-1.5 rounded-2xl shadow-[0_4px_16px_-2px_rgba(20,32,54,0.06),0_2px_4px_-1px_rgba(20,32,54,0.03)]">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F3] dark:hover:bg-slate-700/60 transition cursor-pointer"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-800 dark:text-white bg-transparent px-2 py-1 outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F3] dark:hover:bg-slate-700/60 transition cursor-pointer"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl ml-1 transition border border-teal-200/60 cursor-pointer"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Allergen Warning Banner */}
      {warnings.length > 0 && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 p-5.5 shadow-[0_6px_20px_-3px_rgba(217,119,6,0.1)]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Alerjen Riski Uyarısı — {warnings.length} Öğrenci Etkileniyor!
              </h3>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 mt-1 font-medium">
                Günün menüsündeki içerikler, aşağıdaki öğrencilerin sağlık pasaportundaki kayıtlı
                alerjileri ile çakışmaktadır:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {warnings.map((w) => (
                  <div
                    key={w.studentId}
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-2xl px-3.5 py-1.5 text-xs shadow-2xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-white">
                      {w.studentName}:
                    </span>
                    <span className="text-rose-600 dark:text-rose-300 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
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
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
          <div className="inline-block w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            Günün menüsü yükleniyor…
          </p>
        </div>
      ) : !canEdit ? (
        /* View-only mode for parents */
        <div className="space-y-6">
          {!menu ||
          (menu.breakfast.length === 0 && menu.lunch.length === 0 && menu.snack.length === 0) ? (
            <EmptyState
              icon={Utensils}
              title="Bu gün için menü girilmemiştir."
              description="İlgili güne ait yemek planı henüz oluşturulmadı."
            />
          ) : (
            <>
              {/* Meal Cards - View Only */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {menu.breakfast.length > 0 && (
                  <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60 shadow-2xs">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Sabah Kahvaltısı
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {menu.breakfast.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2.5 py-1"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {menu.lunch.length > 0 && (
                  <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60 shadow-2xs">
                        <Soup className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Öğle Yemeği
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {menu.lunch.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2.5 py-1"
                        >
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {menu.snack.length > 0 && (
                  <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-800/60 shadow-2xs">
                        <Cookie className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        İkindi Ara Öğünü
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {menu.snack.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2.5 py-1"
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nutrition Info - View Only */}
              {(menu.allergens.length > 0 || menu.calories || menu.notes) && (
                <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    İçerdiği Alerjenler & Beslenme Bilgisi
                  </h3>

                  {menu.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">
                        İçerdiği Alerjenler:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {menu.allergens.map((alg, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 shadow-2xs"
                          >
                            {alg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menu.calories && (
                    <p className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-medium">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Tahmini Kalori:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {menu.calories} kcal
                      </span>
                    </p>
                  )}

                  {menu.notes && (
                    <p className="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-medium">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Not:</span>
                      <span className="italic">{menu.notes}</span>
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
            <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60 shadow-2xs">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sabah Kahvaltısı
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      Her satıra bir çeşit yazın
                    </p>
                  </div>
                </div>
                <textarea
                  value={breakfastInput}
                  onChange={(e) => setBreakfastInput(e.target.value)}
                  placeholder="Örn:&#10;Haşlanmış Yumurta&#10;Beyaz Peynir&#10;Zeytin&#10;Ihlamur"
                  rows={6}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-4 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed transition shadow-2xs"
                />
              </div>
            </div>

            {/* Lunch */}
            <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60 shadow-2xs">
                    <Soup className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Öğle Yemeği
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      Her satıra bir çeşit yazın
                    </p>
                  </div>
                </div>
                <textarea
                  value={lunchInput}
                  onChange={(e) => setLunchInput(e.target.value)}
                  placeholder="Örn:&#10;Mercimek Çorbası&#10;Kıymalı Bezelye&#10;Pirinç Pilavı&#10;Ayran"
                  rows={6}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-4 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed transition shadow-2xs"
                />
              </div>
            </div>

            {/* Snack */}
            <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200/60 dark:border-orange-800/60 shadow-2xs">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      İkindi Ara Öğünü
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      Her satıra bir çeşit yazın
                    </p>
                  </div>
                </div>
                <textarea
                  value={snackInput}
                  onChange={(e) => setSnackInput(e.target.value)}
                  placeholder="Örn:&#10;Mevsim Meyvesi (Muz)&#10;Fındıklı Ev Keki"
                  rows={6}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-4 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Allergens & Nutrition Information */}
          <div className="rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              İçerdiği Alerjenler & Beslenme Bilgisi
            </h3>

            {/* Preset Allergen Chips */}
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2.5 font-medium">
                Menüde yer alan alerjenleri seçin:
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((all) => {
                  const clean = all.replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '').trim();
                  const isSel = selectedAllergens.includes(clean || all);
                  return (
                    <button
                      key={all}
                      type="button"
                      onClick={() => toggleAllergen(all)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                        isSel
                          ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-700/60 dark:text-rose-200 shadow-2xs'
                          : 'bg-[#FCFAF7] dark:bg-slate-800/80 border-[#DDD4C4] dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-[#F9F7F3] dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{all}</span>
                      {isSel ? (
                        <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 opacity-60" />
                      )}
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
                className="flex-1 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
              />
              <button
                type="button"
                onClick={addCustomAllergen}
                className="btn-tactile-secondary px-4 py-2.5 text-xs font-bold"
              >
                Ekle
              </button>
            </div>

            {/* Calories & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tahmini Kalori (kcal)</span>
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Örn: 950"
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Aşçı / Beslenme Notu</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Sebzeler taze olarak temin edilmiştir."
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium shadow-2xs"
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
                    className="btn-tactile-danger px-4 py-2.5 text-xs font-bold"
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
                  className="btn-tactile-teal px-6 py-2.5 text-sm font-bold disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Kaydediliyor…' : 'Günün Menüsünü Kaydet'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Kreş Menüsünü Sil"
          description={`${selectedDate} tarihine ait günün menüsünü silmek istediğinize emin misiniz?`}
          confirmText="Evet, Menüyü Sil"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
