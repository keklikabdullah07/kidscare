import { useEffect, useState, type JSX, type FormEvent } from 'react';
import {
  School,
  Building2,
  ShieldCheck,
  Calendar,
  Hash,
  Save,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Users,
  RefreshCw,
  Sparkles,
  BellRing,
  Lock,
} from 'lucide-react';
import type { Tenant } from '@kidscare/shared-types';
import { ApiError } from '../../api/client';
import { getTenantMe, updateTenantMe } from '../../api/tenants';
import { useToast } from '../../components/Toast';

type Status = 'loading' | 'ready' | 'error';

export function TenantSettings(): JSX.Element {
  const { showToast } = useToast();
  const [status, setStatus] = useState<Status>('loading');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preference switches (local UI state)
  const [allergyAutoAlert, setAllergyAutoAlert] = useState(true);
  const [securePickupValidation, setSecurePickupValidation] = useState(true);
  const [dailyReportReminder, setDailyReportReminder] = useState(true);

  const fetchTenantData = () => {
    setStatus('loading');
    setErrorMsg(null);
    getTenantMe()
      .then((t) => {
        setTenant(t);
        setName(t.name);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Kurum bilgileri yüklenemedi');
      });
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  async function handleSave(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!tenant || saving || name === tenant.name) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateTenantMe(name);
      setTenant(updated);
      setName(updated.name);
      showToast('Kreş ayarları başarıyla kaydedildi', 'success');
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? `API ${err.status}` : 'Güncelleme başarısız oldu';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/50 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <School className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Kreş Ayarları Yüklenemedi
        </h1>
        <p
          role="alert"
          className="text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 py-2 px-4 rounded-xl inline-block"
        >
          Hata: {errorMsg}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          API servisinin çalıştığından emin olun (<code>pnpm --filter @kidscare/api start:dev</code>
          )
        </p>
        <div>
          <button
            type="button"
            onClick={fetchTenantData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  if (!tenant) return <></>;

  const hasChanges = name !== tenant.name;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Kreş & Kurum Ayarları
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Kurumsal Lisans
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kurum kimliği, şube bilgileri, kapasite ve sistem güvenlik ayarlarını yönetin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchTenantData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yenile
        </button>
      </div>

      {/* KPI / Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Kurum Durumu
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {tenant.status}
              </span>
            </div>
          </div>
        </div>

        {/* Slug Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Kreş Kodu (Slug)
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
              {tenant.slug}
            </span>
          </div>
        </div>

        {/* Capacity / Students Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Kapasite
              </span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                1 / 50
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>

        {/* Created Date Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Kayıt Tarihi
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {new Date(tenant.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        {/* Institutional Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kurumsal Profil Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kreş Adı */}
            <div className="md:col-span-2">
              <label
                htmlFor="tenant-name"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Kreş Resmi Adı <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="tenant-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  minLength={2}
                  maxLength={128}
                  required
                  placeholder="Örn: KidsCare Demo Kreş"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:focus:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-75"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Velilerin ve öğretmenlerin ana panelde göreceği resmi kreş unvanı.
              </p>
            </div>

            {/* Slug / Kurum Kodu */}
            <div>
              <label
                htmlFor="tenant-slug"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Sistem Alan Kodu (Slug)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                    @
                  </span>
                  <input
                    id="tenant-slug"
                    type="text"
                    value={tenant.slug}
                    readOnly
                    disabled
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-800/40 pl-7 pr-4 py-2.5 text-sm font-mono text-slate-600 dark:text-slate-400 cursor-not-allowed select-all"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Veritabanı ve güvenli alt alan adı tanımlayıcınız (Sabit).
              </p>
            </div>

            {/* Şube Tanımı */}
            <div>
              <label
                htmlFor="tenant-branch"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Yerleşke / Şube
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="tenant-branch"
                  type="text"
                  readOnly
                  defaultValue="Merkez Kampüs — Ana Hizmet Binası"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-800/40 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Çoklu şube desteği Kurumsal Enterprise planda aktifleştirilebilir.
              </p>
            </div>

            {/* İletişim Telefonu */}
            <div>
              <label
                htmlFor="tenant-phone"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Santral / İletişim Telefonu
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="tenant-phone"
                  type="text"
                  readOnly
                  defaultValue="+90 (212) 555 01 23"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-800/40 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* İletişim E-Postası */}
            <div>
              <label
                htmlFor="tenant-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Resmi İletişim E-Postası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="tenant-email"
                  type="text"
                  readOnly
                  defaultValue={`iletisim@${tenant.slug}.test`}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-800/40 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System & Operational Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <BellRing className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Güvenlik & Operasyonel Tercihler
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kreş operasyonları için akıllı otomasyon ve güvenlik kontrolleri.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Preference 1: Auto Allergy Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Akıllı Alerjen Çapraz Eşleme Uyarısı
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Günün yemek menüsü kaydedildiğinde sınıflardaki çocukların alerjileri otomatik
                    taranarak ekranda kırmızı uyarı verilir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllergyAutoAlert(!allergyAutoAlert)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allergyAutoAlert ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    allergyAutoAlert ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preference 2: Secure Pickup Verification */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Güvenli Veli & Yetkili Teslimat Kontrolü
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Öğrenci okuldan ayrılırken öğretmen teslim alan kişinin öğrenci pasaportunda
                    tanımlı yetkili olduğunu teyit eder.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSecurePickupValidation(!securePickupValidation)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  securePickupValidation ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    securePickupValidation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preference 3: Daily Report Notification */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Gün Sonu Karne & Bülten Hatırlatması
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saat 16:30'da henüz gün sonu karnesi girilmemiş öğrenciler için öğretmen
                    paneline görsel bildirim düşer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyReportReminder(!dailyReportReminder)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dailyReportReminder ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    dailyReportReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2"
          >
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {hasChanges ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 font-semibold">
                Kaydedilmemiş değişiklikler var
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tüm ayarlar güncel
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
