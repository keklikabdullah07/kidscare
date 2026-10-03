import { useState, useEffect, type JSX } from 'react';
import {
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Moon,
  Smile,
  Coffee,
  Soup,
  Cookie,
  Award,
  Sparkles,
} from 'lucide-react';
import { getParentChildrenOverview } from '../../api/parent';
import { getDailyMenu } from '../../api/daily-menus';
import { listObservations, listPortfolio } from '../../api/development';
import type {
  DailyMenu,
  DevelopmentObservationDto,
  ParentChildOverview,
  PortfolioItemDto,
} from '@kidscare/shared-types';
import { EmptyState } from '../../components/ui/EmptyState';

export function ParentDashboardPage(): JSX.Element {
  const [childrenData, setChildrenData] = useState<ParentChildOverview[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? '',
  );
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [devObservations, setDevObservations] = useState<DevelopmentObservationDto[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [data, menuRes, obsRes, portRes] = await Promise.all([
          getParentChildrenOverview(selectedDate),
          getDailyMenu(selectedDate).catch(() => ({ menu: null, allergenWarnings: [] })),
          listObservations(selectedChildId || undefined).catch(() => []),
          listPortfolio(selectedChildId || undefined).catch(() => []),
        ]);
        if (isMounted) {
          const safe = Array.isArray(data) ? data : [];
          setChildrenData(safe);
          setDailyMenu(menuRes.menu);
          setDevObservations(Array.isArray(obsRes) ? obsRes : []);
          setPortfolioItems(Array.isArray(portRes) ? portRes : []);
          if (
            safe.length > 0 &&
            (!selectedChildId || !safe.some((c) => c.student.id === selectedChildId))
          ) {
            setSelectedChildId(safe[0]?.student.id ?? null);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedChildId]);

  function changeDay(delta: number): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  const activeChildOverview = Array.isArray(childrenData)
    ? childrenData.find((c) => c.student.id === selectedChildId) || childrenData[0]
    : undefined;

  const getMoodEmoji = (mood?: string | null) => {
    switch (mood) {
      case 'HAPPY':
        return '😊 Çok Mutlu';
      case 'CALM':
        return '😌 Sakin & Huzurlu';
      case 'ENERGETIC':
        return '⚡ Enerjik & Aktif';
      case 'TIRED':
        return '🥱 Yorgun';
      case 'CRANKY':
        return '😤 Huysuz';
      case 'SAD':
        return '😢 Üzgün';
      default:
        return mood || 'Belirtilmedi';
    }
  };

  const getMealLevel = (level?: string | null) => {
    switch (level) {
      case 'ALL':
        return '🟢 Hepsini Bitirdi';
      case 'HALF':
        return '🟠 Yarısını Yedi';
      case 'LITTLE':
        return '🔴 Çok Az Yedi';
      case 'NONE':
        return '❌ Yemedi';
      default:
        return 'Belirtilmedi';
    }
  };

  // Check matching allergens for active child
  const childAllergies = activeChildOverview?.student.passport?.allergies ?? [];
  const menuAllergens = dailyMenu?.allergens ?? [];
  const matchedAllergies = childAllergies.filter((alg) =>
    menuAllergens.some(
      (m) =>
        m.toLowerCase().includes(alg.toLowerCase()) || alg.toLowerCase().includes(m.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-6">
      {/* Header & Date / Child Selector */}
      <div className="bg-white dark:bg-[#131B2E] p-5.5 rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center font-bold shadow-2xs">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Veli Portalı
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              Çocuğunuzun kreşteki anlık durumu, günlük karnesi ve yemek menüsü
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 p-1.5 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60 transition shadow-2xs active:scale-95 cursor-pointer"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent px-2 py-1 outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60 transition shadow-2xs active:scale-95 cursor-pointer"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100/60 dark:hover:bg-teal-950/60 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl ml-1 transition active:scale-95 border border-teal-200/60 cursor-pointer"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#131B2E] p-16 text-center rounded-3xl border border-[#DDD4C4] dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-medium">Bilgiler yükleniyor, lütfen bekleyin...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/50 p-6 rounded-3xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200">
          <p className="font-semibold text-sm">Hata oluştu</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      ) : !activeChildOverview ? (
        <EmptyState
          icon={Heart}
          title="Kayıtlı öğrenci bilgisi bulunamadı."
          description="Hesabınıza bağlı bir öğrenci kaydı görünmüyor. Lütfen kreş yönetimiyle iletişime geçiniz."
        />
      ) : (
        <>
          {/* Multi-child switch tabs */}
          {childrenData.length > 1 && (
            <div className="flex gap-2 border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-2">
              {childrenData.map((child) => (
                <button
                  key={child.student.id}
                  onClick={() => setSelectedChildId(child.student.id)}
                  className={`px-4 py-2 text-xs font-bold flex items-center gap-2 ${
                    activeChildOverview.student.id === child.student.id
                      ? 'btn-tactile-teal'
                      : 'btn-tactile-secondary'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-teal-400" />
                  <span>
                    {child.student.firstName} {child.student.lastName}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Real-time Status Card (Hero Banner) */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 border border-teal-800/40 rounded-3xl p-6 text-white shadow-[0_8px_24px_-4px_rgba(15,118,110,0.25)] overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-2xl font-bold shadow-xs">
                  {activeChildOverview.student.firstName.charAt(0)}
                  {activeChildOverview.student.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {activeChildOverview.student.firstName} {activeChildOverview.student.lastName}
                  </h2>
                  <p className="text-teal-200/90 text-xs mt-1 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {new Date(selectedDate).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-bold">
                  Anlık Durum
                </span>
                <span className="text-base font-bold flex items-center gap-2 mt-0.5">
                  {activeChildOverview.todayAttendance?.status === 'PRESENT' ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      Okulda (Giriş: {activeChildOverview.todayAttendance.checkInTime || '-'})
                    </>
                  ) : activeChildOverview.todayAttendance?.status === 'LEFT' ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-sky-300" />
                      Ayrıldı (Çıkış: {activeChildOverview.todayAttendance.checkOutTime || '-'})
                    </>
                  ) : activeChildOverview.todayAttendance?.status === 'ABSENT' ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      Katılmadı ({activeChildOverview.todayAttendance.note || 'Mazeretsiz'})
                    </>
                  ) : activeChildOverview.todayAttendance?.status === 'EXCUSED' ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      İzinli / Mazeretli ({activeChildOverview.todayAttendance.note || 'İzinli'})
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-amber-300" />
                      Henüz Giriş Yapmadı
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Personalized Allergy Alert Banner */}
          {matchedAllergies.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-3xl p-5.5 shadow-[0_6px_20px_-3px_rgba(217,119,6,0.1)]">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-amber-950 dark:text-amber-200 font-bold text-base">
                    Önemli Alerji Uyarısı!
                  </h3>
                  <div className="text-amber-900 dark:text-amber-300 text-xs mt-1 space-y-1">
                    {matchedAllergies.map((warn, idx) => (
                      <p key={idx} className="font-medium">
                        • Bugünkü yemek menüsünde {activeChildOverview.student.firstName}'in
                        alerjisi olan{' '}
                        <strong className="underline font-bold text-rose-700 dark:text-rose-400">
                          {warn}
                        </strong>{' '}
                        bulunuyor!
                      </p>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-2 font-medium">
                    * Mutfak ve sınıf öğretmenleri bu konuda sistem tarafından otomatik olarak
                    uyarılmıştır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Report, Menu, and Health Passport */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Report Card */}
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-5">
              <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Günlük Karne</span>
                </h3>
                {activeChildOverview.todayDailyReport ? (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs">
                    Öğretmen Doldurdu
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#FCFAF7] dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-700/80">
                    Henüz Rapor Girilmedi
                  </span>
                )}
              </div>

              {activeChildOverview.todayDailyReport ? (
                <div className="space-y-4">
                  {/* Mood */}
                  <div className="p-3.5 bg-[#FCFAF7] dark:bg-slate-900/60 border border-[#DDD4C4]/70 dark:border-slate-700/60 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-500" />
                      Ruh Hali & Mod
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {getMoodEmoji(activeChildOverview.todayDailyReport.mood)}
                    </span>
                  </div>

                  {/* Meals */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Beslenme Durumu
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 bg-amber-50/70 dark:bg-slate-900/50 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                        <span className="block text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          Kahvaltı
                        </span>
                        <span className="font-bold text-amber-950 dark:text-amber-300 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.breakfast)}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50/70 dark:bg-slate-900/50 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
                        <span className="block text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          Öğle
                        </span>
                        <span className="font-bold text-emerald-950 dark:text-emerald-300 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.lunch)}
                        </span>
                      </div>
                      <div className="p-3 bg-orange-50/70 dark:bg-slate-900/50 border border-orange-200 dark:border-orange-900/40 rounded-2xl">
                        <span className="block text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          İkindi
                        </span>
                        <span className="font-bold text-orange-950 dark:text-orange-300 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.afternoonSnack)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sleep / Nap */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#FCFAF7] dark:bg-slate-900/50 rounded-2xl border border-[#DDD4C4]/70 dark:border-purple-900/40">
                      <span className="text-xs text-purple-800 dark:text-purple-300 font-bold block flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-purple-500" />
                        <span>Uyku</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                        {activeChildOverview.todayDailyReport.naps?.startTime &&
                        activeChildOverview.todayDailyReport.naps?.endTime
                          ? `${activeChildOverview.todayDailyReport.naps.startTime} - ${activeChildOverview.todayDailyReport.naps.endTime}`
                          : activeChildOverview.todayDailyReport.naps?.quality === 'GOOD'
                            ? 'İyi uyudu'
                            : 'Uyumadı / Belirtilmedi'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FCFAF7] dark:bg-slate-900/50 rounded-2xl border border-[#DDD4C4]/70 dark:border-teal-900/40">
                      <span className="text-xs text-teal-800 dark:text-teal-300 font-bold block flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-teal-500" />
                        <span>Tuvalet / Bez</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                        {activeChildOverview.todayDailyReport.potty &&
                        activeChildOverview.todayDailyReport.potty.length > 0
                          ? `${activeChildOverview.todayDailyReport.potty.length} kayıt`
                          : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {/* Activities */}
                  {activeChildOverview.todayDailyReport.activities &&
                    activeChildOverview.todayDailyReport.activities.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Günün Aktiviteleri
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeChildOverview.todayDailyReport.activities.map((act, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-[#DDD4C4] dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-2xs"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Teacher Note */}
                  {activeChildOverview.todayDailyReport.teacherNote && (
                    <div className="p-4 bg-amber-50/70 dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/40">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                        Öğretmenin Notu
                      </span>
                      <p className="text-xs text-amber-950 dark:text-slate-200 italic font-medium">
                        "{activeChildOverview.todayDailyReport.teacherNote}"
                      </p>
                    </div>
                  )}

                  {/* Medications & Health */}
                  {activeChildOverview.todayDailyReport.medications &&
                    activeChildOverview.todayDailyReport.medications.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          İlaç Takip & Sağlık
                        </span>
                        <div className="space-y-2">
                          {activeChildOverview.todayDailyReport.medications.map((med, i) => {
                            const isGiven = med.status === 'GIVEN';
                            return (
                              <div
                                key={med.id ?? i}
                                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                                  isGiven
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/60'
                                    : 'bg-[#FCFAF7] dark:bg-slate-900 border-[#DDD4C4] dark:border-slate-700/80'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isGiven
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {isGiven && (
                                    <span className="text-[10px] leading-none font-bold">✓</span>
                                  )}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`font-bold ${isGiven ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}
                                    >
                                      {med.name}
                                    </span>
                                    <span className="text-slate-400">·</span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                                      {med.time}
                                    </span>
                                    {med.dosage && (
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                                        ({med.dosage})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {med.temperature !== undefined && med.temperature !== null && (
                                      <span
                                        className={`font-bold ${med.temperature >= 38 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}
                                      >
                                        🌡️ {med.temperature.toFixed(1)}°C
                                      </span>
                                    )}
                                    {isGiven ? (
                                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                        ✓ Verildi{med.givenAt ? ` (${med.givenAt})` : ''}
                                      </span>
                                    ) : (
                                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                                        Planlandı
                                      </span>
                                    )}
                                    {med.notes && (
                                      <span className="text-slate-500 dark:text-slate-300 italic">
                                        — {med.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-slate-300">
                  <p className="text-xs max-w-xs mx-auto">
                    Öğretmenimiz gün sonunda veya aktiviteler tamamlandıkça günlük karneyi sisteme
                    girecektir.
                  </p>
                </div>
              )}
            </div>

            {/* Daily Menu & Health Passport Column */}
            <div className="space-y-6">
              {/* Daily Menu Card */}
              <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <span>Günün Yemek Menüsü</span>
                  </h3>
                  {dailyMenu ? (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs">
                      Yayınlandı
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#FCFAF7] dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-700/80">
                      Menü Eklenmedi
                    </span>
                  )}
                </div>

                {dailyMenu ? (
                  <div className="space-y-3 text-xs">
                    {/* Breakfast */}
                    <div className="p-3.5 bg-amber-50/60 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Sabah Kahvaltısı</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {dailyMenu.breakfast?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Lunch */}
                    <div className="p-3.5 bg-emerald-50/60 dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Soup className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Öğle Yemeği</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {dailyMenu.lunch?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Snack */}
                    <div className="p-3.5 bg-orange-50/60 dark:bg-slate-900 rounded-2xl border border-orange-200 dark:border-orange-900/40">
                      <span className="text-xs font-bold text-orange-900 dark:text-orange-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Cookie className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span>İkindi Beslenmesi</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {dailyMenu.snack?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Allergens in menu */}
                    {dailyMenu.allergens && dailyMenu.allergens.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                          Menüdeki Alerjenler:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {dailyMenu.allergens.map((alg, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-[#FCFAF7] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-700/80 rounded-xl text-xs font-medium"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-300 py-6 text-center">
                    Bugün için henüz yemek listesi girilmemiş.
                  </p>
                )}
              </div>

              {/* Child Health & Development Passport Summary */}
              <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Gelişim & Sağlık Pasaportu</span>
                  </h3>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900/60 px-3 py-1 rounded-full shadow-2xs">
                    {activeChildOverview.student.passport?.bloodType
                      ? `Kan Grubu: ${activeChildOverview.student.passport.bloodType}`
                      : 'Kan Grubu: -'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Allergies list */}
                  <div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Bilinen Alerjiler
                    </span>
                    {activeChildOverview.student.passport?.allergies &&
                    activeChildOverview.student.passport.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeChildOverview.student.passport.allergies.map((alg, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60 rounded-xl text-xs font-bold shadow-2xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            {alg}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-2xl inline-block border border-emerald-200 dark:border-emerald-800/60">
                        Kayıtlı alerji bulunmuyor.
                      </p>
                    )}
                  </div>

                  {/* Dietary Restrictions */}
                  {activeChildOverview.student.passport?.dietaryRestrictions &&
                    activeChildOverview.student.passport.dietaryRestrictions.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                          Diyet / Özel Beslenme
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeChildOverview.student.passport.dietaryRestrictions.map(
                            (diet, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs font-bold shadow-2xs"
                              >
                                {diet}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Development & Portfolio Section */}
              <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 p-6 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> Gelişim Gözlemleri & Karnesi
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-300 font-bold">
                    {devObservations.length} Gözlem Kaydı
                  </span>
                </div>

                {devObservations.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-300 py-3 text-center">
                    Henüz paylaşılan gelişim gözlemi bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {devObservations.slice(0, 3).map((obs) => (
                      <div
                        key={obs.id}
                        className="bg-[#FCFAF7] dark:bg-slate-900/60 p-4 rounded-2xl border border-[#DDD4C4]/70 dark:border-slate-700/60 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 dark:text-amber-300">
                            {obs.skillName}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                            {new Date(obs.observedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {obs.observation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Portfolio Showcase */}
                {portfolioItems.length > 0 && (
                  <div className="pt-2 border-t border-[#DDD4C4]/60 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Dijital
                      Portfolyo
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {portfolioItems.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#DDD4C4] dark:border-slate-700/80 overflow-hidden bg-[#FCFAF7] dark:bg-slate-900 shadow-2xs"
                        >
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-24 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="p-2.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
