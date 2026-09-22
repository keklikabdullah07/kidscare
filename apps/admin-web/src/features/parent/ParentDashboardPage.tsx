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
} from 'lucide-react';
import { getParentChildrenOverview } from '../../api/parent';
import { getDailyMenu } from '../../api/daily-menus';
import type { DailyMenu, ParentChildOverview } from '@kidscare/shared-types';

export function ParentDashboardPage(): JSX.Element {
  const [childrenData, setChildrenData] = useState<ParentChildOverview[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? '',
  );
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [data, menuRes] = await Promise.all([
          getParentChildrenOverview(selectedDate),
          getDailyMenu(selectedDate).catch(() => ({ menu: null, allergenWarnings: [] })),
        ]);
        if (isMounted) {
          const safe = Array.isArray(data) ? data : [];
          setChildrenData(safe);
          setDailyMenu(menuRes.menu);
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              🏡 Veli Portalı
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Çocuğunuzun kreşteki anlık durumu, günlük karnesi ve yemek menüsü
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition shadow-2xs"
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
            className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition shadow-2xs"
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

      {loading ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200/80 text-slate-500">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-medium">Bilgiler yükleniyor, lütfen bekleyin...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 text-rose-700">
          <p className="font-semibold">Hata oluştu</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : !activeChildOverview ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200/80 text-slate-500">
          <p className="text-base font-semibold text-slate-800">
            Kayıtlı öğrenci bilgisi bulunamadı.
          </p>
          <p className="text-xs mt-1 text-slate-400">Lütfen kreş yönetimiyle iletişime geçiniz.</p>
        </div>
      ) : (
        <>
          {/* Multi-child switch tabs */}
          {childrenData.length > 1 && (
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {childrenData.map((child) => (
                <button
                  key={child.student.id}
                  onClick={() => setSelectedChildId(child.student.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    activeChildOverview.student.id === child.student.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  👶 {child.student.firstName} {child.student.lastName}
                </button>
              ))}
            </div>
          )}

          {/* Real-time Status Card (Hero Banner) */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-xs">
                  {activeChildOverview.student.firstName.charAt(0)}
                  {activeChildOverview.student.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {activeChildOverview.student.firstName} {activeChildOverview.student.lastName}
                  </h2>
                  <p className="text-blue-100 text-xs mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-200" />
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
              <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-bold">
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
                      <span className="w-3 h-3 rounded-full bg-blue-300" />
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
                      <span className="w-3 h-3 rounded-full bg-yellow-300" />
                      Henüz Giriş Yapmadı
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Personalized Allergy Alert Banner */}
          {matchedAllergies.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-400/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-amber-950 font-bold text-base">Önemli Alerji Uyarısı!</h3>
                  <div className="text-amber-900 text-xs mt-1 space-y-1">
                    {matchedAllergies.map((warn, idx) => (
                      <p key={idx} className="font-medium">
                        • Bugünkü yemek menüsünde {activeChildOverview.student.firstName}'in
                        alerjisi olan{' '}
                        <strong className="underline font-bold text-rose-700">{warn}</strong>{' '}
                        bulunuyor!
                      </p>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-700 mt-2">
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
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📝</span> Günlük Karne
                </h3>
                {activeChildOverview.todayDailyReport ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Öğretmen Doldurdu
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    Henüz Rapor Girilmedi
                  </span>
                )}
              </div>

              {activeChildOverview.todayDailyReport ? (
                <div className="space-y-4">
                  {/* Mood */}
                  <div className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-500" />
                      Ruh Hali & Mod
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {getMoodEmoji(activeChildOverview.todayDailyReport.mood)}
                    </span>
                  </div>

                  {/* Meals */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      🍽️ Beslenme Durumu
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                        <span className="block text-slate-500 font-medium text-[11px]">
                          Kahvaltı
                        </span>
                        <span className="font-bold text-amber-950 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.breakfast)}
                        </span>
                      </div>
                      <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl">
                        <span className="block text-slate-500 font-medium text-[11px]">Öğle</span>
                        <span className="font-bold text-blue-950 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.lunch)}
                        </span>
                      </div>
                      <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-xl">
                        <span className="block text-slate-500 font-medium text-[11px]">İkindi</span>
                        <span className="font-bold text-orange-950 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.afternoonSnack)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sleep / Nap */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <span className="text-xs text-indigo-800 font-semibold block flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>😴 Uyku</span>
                      </span>
                      <span className="font-bold text-slate-900 mt-1 block">
                        {activeChildOverview.todayDailyReport.naps?.startTime &&
                        activeChildOverview.todayDailyReport.naps?.endTime
                          ? `${activeChildOverview.todayDailyReport.naps.startTime} - ${activeChildOverview.todayDailyReport.naps.endTime}`
                          : activeChildOverview.todayDailyReport.naps?.quality === 'GOOD'
                            ? 'İyi uyudu'
                            : 'Uyumadı / Belirtilmedi'}
                      </span>
                    </div>

                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-xs text-teal-800 font-semibold block flex items-center gap-1">
                        <span>🚽</span> Tuvalet / Bez
                      </span>
                      <span className="font-bold text-slate-900 mt-1 block">
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
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          🎨 Günün Aktiviteleri
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeChildOverview.todayDailyReport.activities.map((act, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Teacher Note */}
                  {activeChildOverview.todayDailyReport.teacherNote && (
                    <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70">
                      <span className="text-xs font-bold text-amber-900 block mb-1">
                        💬 Öğretmenin Notu
                      </span>
                      <p className="text-xs text-amber-950 italic">
                        "{activeChildOverview.todayDailyReport.teacherNote}"
                      </p>
                    </div>
                  )}

                  {/* Medications & Health */}
                  {activeChildOverview.todayDailyReport.medications &&
                    activeChildOverview.todayDailyReport.medications.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          💊 İlaç Takip & Sağlık
                        </span>
                        <div className="space-y-1.5">
                          {activeChildOverview.todayDailyReport.medications.map((med, i) => {
                            const isGiven = med.status === 'GIVEN';
                            return (
                              <div
                                key={med.id ?? i}
                                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                                  isGiven
                                    ? 'bg-emerald-50/60 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isGiven
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isGiven && <span className="text-[10px] leading-none">✓</span>}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`font-bold ${isGiven ? 'text-emerald-800' : 'text-slate-800'}`}>
                                      {med.name}
                                    </span>
                                    <span className="text-slate-400">·</span>
                                    <span className="text-slate-600">{med.time}</span>
                                    {med.dosage && (
                                      <span className="text-slate-500">({med.dosage})</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {med.temperature !== undefined && med.temperature !== null && (
                                      <span className={`font-semibold ${med.temperature >= 38 ? 'text-rose-600' : 'text-slate-600'}`}>
                                        🌡️ {med.temperature.toFixed(1)}°C
                                      </span>
                                    )}
                                    {isGiven ? (
                                      <span className="text-emerald-700 font-medium">
                                        ✓ Verildi{med.givenAt ? ` (${med.givenAt})` : ''}
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 font-medium">
                                        ⏳ Planlandı
                                      </span>
                                    )}
                                    {med.notes && (
                                      <span className="text-slate-400 italic">— {med.notes}</span>
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
                <div className="py-12 text-center text-slate-400">
                  <span className="text-3xl block mb-2">⏳</span>
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
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🍲</span> Günün Yemek Menüsü
                  </h3>
                  {dailyMenu ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Yayınlandı
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                      Menü Eklenmedi
                    </span>
                  )}
                </div>

                {dailyMenu ? (
                  <div className="space-y-3 text-xs">
                    {/* Breakfast */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sabah Kahvaltısı</span>
                      </span>
                      <p className="text-slate-800 font-medium">
                        {dailyMenu.breakfast?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Lunch */}
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Soup className="w-3.5 h-3.5 text-blue-600" />
                        <span>Öğle Yemeği</span>
                      </span>
                      <p className="text-slate-800 font-medium">
                        {dailyMenu.lunch?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Snack */}
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                      <span className="text-xs font-bold text-orange-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Cookie className="w-3.5 h-3.5 text-orange-600" />
                        <span>İkindi Beslenmesi</span>
                      </span>
                      <p className="text-slate-800 font-medium">
                        {dailyMenu.snack?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Allergens in menu */}
                    {dailyMenu.allergens && dailyMenu.allergens.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                          Menüdeki Alerjenler:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dailyMenu.allergens.map((alg, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Bugün için henüz yemek listesi girilmemiş.
                  </p>
                )}
              </div>

              {/* Child Health & Development Passport Summary */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🛡️</span> Gelişim & Sağlık Pasaportu
                  </h3>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    {activeChildOverview.student.passport?.bloodType
                      ? `🩸 Kan Grubu: ${activeChildOverview.student.passport.bloodType}`
                      : 'Kan Grubu: -'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Allergies list */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      🚨 Bilinen Alerjiler
                    </span>
                    {activeChildOverview.student.passport?.allergies &&
                    activeChildOverview.student.passport.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeChildOverview.student.passport.allergies.map((alg, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold"
                          >
                            ⚠️ {alg}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg inline-block border border-emerald-200">
                        ✓ Kayıtlı alerji bulunmuyor.
                      </p>
                    )}
                  </div>

                  {/* Dietary Restrictions */}
                  {activeChildOverview.student.passport?.dietaryRestrictions &&
                    activeChildOverview.student.passport.dietaryRestrictions.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          🥗 Diyet / Özel Beslenme
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeChildOverview.student.passport.dietaryRestrictions.map(
                            (diet, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold"
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
