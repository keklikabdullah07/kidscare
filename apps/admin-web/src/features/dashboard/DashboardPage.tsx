import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  BookOpenCheck,
  Utensils,
  ArrowRight,
  AlertTriangle,
  Heart,
  Camera,
  Coffee,
  Sun,
  Cookie,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { listStudents } from '../../api/students';
import { getAttendanceByDate } from '../../api/attendance';
import { getDailyReportsByDate } from '../../api/daily-reports';
import { getDailyMenu, type DailyMenuResponse } from '../../api/daily-menus';
import type { Attendance, DailyReport, Student } from '@kidscare/shared-types';

export function DashboardPage(): JSX.Element {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [menuData, setMenuData] = useState<DailyMenuResponse | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void Promise.allSettled([
      listStudents(),
      getAttendanceByDate(today),
      getDailyReportsByDate(today),
      getDailyMenu(today),
    ]).then(([studentsRes, attRes, repRes, menuRes]) => {
      if (cancelled) return;

      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value);
      if (attRes.status === 'fulfilled') setAttendances(attRes.value);
      if (repRes.status === 'fulfilled') setReports(repRes.value);
      if (menuRes.status === 'fulfilled') setMenuData(menuRes.value);

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [today]);

  // Hesaplamalar
  const totalStudents = students.length;
  const presentCount = attendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LEFT',
  ).length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;
  const excusedCount = attendances.filter((a) => a.status === 'EXCUSED').length;
  const filledReportsCount = reports.length;

  // Alerjisi veya sağlık notu olan öğrenciler
  const studentsWithAllergies = students.filter((s) => {
    const passport = s.passport as { allergies?: string[]; medicalNotes?: string } | undefined;
    return (
      (passport?.allergies && passport.allergies.length > 0) ||
      (passport?.medicalNotes && passport.medicalNotes.trim().length > 0) ||
      (s.notes && s.notes.trim().length > 0)
    );
  });

  const userName =
    state.status === 'authenticated'
      ? state.user.email?.split('@')[0] || state.user.id
      : 'Öğretmen';

  const menu = menuData?.menu;
  const breakfast = Array.isArray(menu?.breakfast) ? menu.breakfast : [];
  const lunch = Array.isArray(menu?.lunch) ? menu.lunch : [];
  const snack = Array.isArray(menu?.snack) ? menu.snack : [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Üst Karşılama Kartı */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Günün Nabzı
              </span>
              <span className="text-white/80 text-xs font-medium">{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              İyi günler, {userName} 👋
            </h1>
            <p className="text-white/90 text-sm mt-1 max-w-xl">
              Kreşinizin bugünkü genel durumu, yoklama katılımı ve menü bilgileri hazır.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/attendance"
              className="bg-white text-orange-600 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Yoklama Al
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Adet İstatistik Kartı (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Öğrenci */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kayıtlı Öğrenci
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-0.5">Sınıflar aktif</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Bugün Yoklama */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gelen Öğrenci
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {presentCount}{' '}
              <span className="text-sm font-normal text-slate-400">/ {totalStudents}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{absentCount} Gelmedi</span>
              {excusedCount > 0 && <span>• {excusedCount} İzinli</span>}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Günlük Karneler */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Doldurulan Karne
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {filledReportsCount}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {presentCount || totalStudents}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {Math.max(0, (presentCount || totalStudents) - filledReportsCount)} veli bülteni
              bekliyor
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpenCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Yemek Menüsü Durumu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Günün Menüsü
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[140px]">
              {lunch.length > 0 ? lunch[0] : 'Menü Girilmedi'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lunch.length > 0 ? `${lunch.length} çeşit öğle yemeği` : 'Girmek için tıklayın'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Hızlı Aksiyonlar Barı */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/attendance"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Yoklama Al</h4>
            <p className="text-xs text-slate-500">Geldileri işaretle</p>
          </div>
        </Link>

        <Link
          to="/tracking"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Karne Doldur</h4>
            <p className="text-xs text-slate-500">Yemek & Uyku bülteni</p>
          </div>
        </Link>

        <Link
          to="/menus"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Yemek Menüsü</h4>
            <p className="text-xs text-slate-500">Günün öğünleri</p>
          </div>
        </Link>

        <Link
          to="/gallery"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Fotoğraf Yükle</h4>
            <p className="text-xs text-slate-500">Sınıf aktiviteleri</p>
          </div>
        </Link>
      </div>

      {/* 4. İki Kolonlu Detay Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon (2 Birim): Günün Yemek Menüsü */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bugünün Yemek Listesi</h3>
                <p className="text-xs text-slate-500">Çocukların bugünkü beslenme planı</p>
              </div>
            </div>
            <Link
              to="/menus"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Menüyü Düzenle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Kahvaltı */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                Sabah Kahvaltısı
              </div>
              {breakfast.length > 0 ? (
                <ul className="text-xs text-slate-700 space-y-1.5 font-medium">
                  {breakfast.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Girilmedi</p>
              )}
            </div>

            {/* Öğle Yemeği */}
            <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
              <div className="flex items-center gap-2 text-orange-800 font-bold text-xs mb-2">
                <Sun className="w-4 h-4 text-orange-600" />
                Öğle Yemeği
              </div>
              {lunch.length > 0 ? (
                <ul className="text-xs text-slate-700 space-y-1.5 font-medium">
                  {lunch.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Girilmedi</p>
              )}
            </div>

            {/* İkindi */}
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
                <Cookie className="w-4 h-4 text-rose-600" />
                İkindi Kahvaltısı
              </div>
              {snack.length > 0 ? (
                <ul className="text-xs text-slate-700 space-y-1.5 font-medium">
                  {snack.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Girilmedi</p>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon (1 Birim): Kritik Alerji & Sağlık Notları */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Alerji & Sağlık Notları</h3>
                <p className="text-xs text-slate-500">Öğretmen güvenlik uyarısı</p>
              </div>
            </div>

            {studentsWithAllergies.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {studentsWithAllergies.map((s) => {
                  const passport = s.passport as
                    { allergies?: string[]; medicalNotes?: string } | undefined;
                  const allergies = passport?.allergies ?? [];
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Alerji
                        </span>
                      </div>
                      {allergies.length > 0 && (
                        <p className="text-rose-900 font-semibold">⚠️ {allergies.join(', ')}</p>
                      )}
                      {(passport?.medicalNotes || s.notes) && (
                        <p className="text-slate-600 text-[11px]">
                          {passport?.medicalNotes || s.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                Kayıtlı alerji uyarısı bulunmuyor.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/students"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              Tüm Öğrenci Dosyaları <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
