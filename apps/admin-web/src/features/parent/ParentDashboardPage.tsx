import { useState, useEffect, type JSX } from 'react';
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
          setChildrenData(data);
          setDailyMenu(menuRes.menu);
          if (
            data.length > 0 &&
            (!selectedChildId || !data.some((c) => c.student.id === selectedChildId))
          ) {
            setSelectedChildId(data[0]?.student.id ?? null);
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
  }, [selectedDate]);

  const activeChildOverview =
    childrenData.find((c) => c.student.id === selectedChildId) || childrenData[0];

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
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🏡 Veli Portalı
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Çocuğunuzun kreşteki anlık durumu, günlük karnesi ve yemek menüsü
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Tarih:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
          <p>Bilgiler yükleniyor, lütfen bekleyin...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700">
          <p className="font-semibold">Hata oluştu</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : !activeChildOverview ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
          <p className="text-lg font-medium text-gray-700">Kayıtlı öğrenci bilgisi bulunamadı.</p>
          <p className="text-sm mt-1">Lütfen kreş yönetimiyle iletişime geçiniz.</p>
        </div>
      ) : (
        <>
          {/* Multi-child switch tabs */}
          {childrenData.length > 1 && (
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              {childrenData.map((child) => (
                <button
                  key={child.student.id}
                  onClick={() => setSelectedChildId(child.student.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeChildOverview.student.id === child.student.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  👶 {child.student.firstName} {child.student.lastName}
                </button>
              ))}
            </div>
          )}

          {/* Real-time Status Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👶</span>
                  <h2 className="text-2xl font-bold">
                    {activeChildOverview.student.firstName} {activeChildOverview.student.lastName}
                  </h2>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  {new Date(selectedDate).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Status Badge */}
              <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                <span className="text-xs uppercase tracking-wider text-blue-200 block font-semibold">
                  Anlık Durum
                </span>
                <span className="text-lg font-bold flex items-center gap-2 mt-0.5">
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
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      Katılmadı ({activeChildOverview.todayAttendance.note || 'Mazeretsiz'})
                    </>
                  ) : activeChildOverview.todayAttendance?.status === 'EXCUSED' ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      İzinli / Mazeretli ({activeChildOverview.todayAttendance.note || 'İzinli'})
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      Henüz Giriş Yapmadı
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Personalized Allergy Alert Banner */}
          {matchedAllergies.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="text-amber-900 font-bold text-lg">Önemli Alerji Uyarısı!</h3>
                  <div className="text-amber-800 text-sm mt-1 space-y-1">
                    {matchedAllergies.map((warn, idx) => (
                      <p key={idx} className="font-medium">
                        • Bugünkü yemek menüsünde {activeChildOverview.student.firstName}'in
                        alerjisi olan <strong className="underline">{warn}</strong> bulunuyor!
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  📝 Günlük Karne
                </h3>
                {activeChildOverview.todayDailyReport ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Öğretmen Doldurdu
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Henüz Rapor Girilmedi
                  </span>
                )}
              </div>

              {activeChildOverview.todayDailyReport ? (
                <div className="space-y-4">
                  {/* Mood */}
                  <div className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Ruh Hali & Mod</span>
                    <span className="text-sm font-bold text-gray-900">
                      {getMoodEmoji(activeChildOverview.todayDailyReport.mood)}
                    </span>
                  </div>

                  {/* Meals */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      🍽️ Beslenme Durumu
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-blue-50 rounded-lg">
                        <span className="block text-gray-500 font-medium">Kahvaltı</span>
                        <span className="font-bold text-blue-900 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.breakfast)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-indigo-50 rounded-lg">
                        <span className="block text-gray-500 font-medium">Öğle</span>
                        <span className="font-bold text-indigo-900 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.lunch)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-purple-50 rounded-lg">
                        <span className="block text-gray-500 font-medium">İkindi</span>
                        <span className="font-bold text-purple-900 mt-1 block">
                          {getMealLevel(activeChildOverview.todayDailyReport.meals?.afternoonSnack)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sleep / Nap */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-xs text-amber-800 font-semibold block">😴 Uyku</span>
                      <span className="font-bold text-gray-900 mt-1 block">
                        {activeChildOverview.todayDailyReport.naps?.startTime &&
                        activeChildOverview.todayDailyReport.naps?.endTime
                          ? `${activeChildOverview.todayDailyReport.naps.startTime} - ${activeChildOverview.todayDailyReport.naps.endTime}`
                          : activeChildOverview.todayDailyReport.naps?.quality === 'GOOD'
                            ? 'İyi uyudu'
                            : 'Uyumadı / Belirtilmedi'}
                      </span>
                    </div>

                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-xs text-teal-800 font-semibold block">
                        🚽 Tuvalet / Bez
                      </span>
                      <span className="font-bold text-gray-900 mt-1 block">
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
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          🎨 Günün Aktiviteleri
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeChildOverview.todayDailyReport.activities.map((act, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Teacher Note */}
                  {activeChildOverview.todayDailyReport.teacherNote && (
                    <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                      <span className="text-xs font-bold text-blue-900 block mb-1">
                        💬 Öğretmenin Notu
                      </span>
                      <p className="text-sm text-gray-800 italic">
                        "{activeChildOverview.todayDailyReport.teacherNote}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <span className="text-3xl block mb-2">⏳</span>
                  <p className="text-sm">
                    Öğretmenimiz gün sonunda veya aktiviteler tamamlandıkça günlük karneyi sisteme
                    girecektir.
                  </p>
                </div>
              )}
            </div>

            {/* Daily Menu & Health Passport Column */}
            <div className="space-y-6">
              {/* Daily Menu Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    🍲 Günün Yemek Menüsü
                  </h3>
                  {dailyMenu ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Yayınlandı
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      Menü Eklenmedi
                    </span>
                  )}
                </div>

                {dailyMenu ? (
                  <div className="space-y-3 text-sm">
                    {/* Breakfast */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        🍳 Sabah Kahvaltısı
                      </span>
                      <p className="text-gray-800 font-medium">
                        {dailyMenu.breakfast?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Lunch */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                        🥗 Öğle Yemeği
                      </span>
                      <p className="text-gray-800 font-medium">
                        {dailyMenu.lunch?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Snack */}
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">
                        🍪 İkindi Beslenmesi
                      </span>
                      <p className="text-gray-800 font-medium">
                        {dailyMenu.snack?.join(', ') || 'Belirtilmedi'}
                      </p>
                    </div>

                    {/* Allergens in menu */}
                    {dailyMenu.allergens && dailyMenu.allergens.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-gray-500 block mb-1.5">
                          Menüdeki Alerjenler:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dailyMenu.allergens.map((alg, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-6 text-center">
                    Bugün için henüz yemek listesi girilmemiş.
                  </p>
                )}
              </div>

              {/* Child Health & Development Passport Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    🛡️ Gelişim & Sağlık Pasaportu
                  </h3>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {activeChildOverview.student.passport?.bloodType || 'Kan Grubu: -'}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  {/* Allergies list */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      🚨 Bilinen Alerjiler
                    </span>
                    {activeChildOverview.student.passport?.allergies &&
                    activeChildOverview.student.passport.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeChildOverview.student.passport.allergies.map((alg, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold"
                          >
                            ⚠️ {alg}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg inline-block">
                        ✓ Kayıtlı alerji bulunmuyor.
                      </p>
                    )}
                  </div>

                  {/* Dietary Restrictions */}
                  {activeChildOverview.student.passport?.dietaryRestrictions &&
                    activeChildOverview.student.passport.dietaryRestrictions.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
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
