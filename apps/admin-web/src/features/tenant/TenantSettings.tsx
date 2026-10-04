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
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { TactileButton } from '../../components/ui/TactileButton';

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
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/50 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <School className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
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
          <TactileButton variant="secondary" size="md" onClick={fetchTenantData}>
            <RefreshCw className="w-4 h-4" />
            Yeniden Dene
          </TactileButton>
        </div>
      </div>
    );
  }

  if (!tenant) return <></>;

  const hasChanges = name !== tenant.name;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Kreş & Kurum Ayarları"
        description="Kurum kimliği, şube bilgileri, kapasite ve sistem güvenlik ayarlarını yönetin."
        icon={School}
        actions={
          <TactileButton variant="secondary" size="sm" onClick={fetchTenantData}>
            <RefreshCw className="w-3.5 h-3.5" />
            Yenile
          </TactileButton>
        }
      />

      {/* License badge */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-900 dark:text-teal-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-full border border-teal-200/60 dark:border-slate-700 w-fit shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-800 dark:text-amber-400" />
        Kurumsal Lisans
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Kurum Durumu"
          value={tenant.status}
          subtitle="Aktif"
          icon={ShieldCheck}
          variant="emerald"
        />
        <StatCard
          title="Kreş Kodu (Slug)"
          value={tenant.slug}
          subtitle="Sistem Tanımlayıcı"
          icon={Hash}
          variant="teal"
        />
        <StatCard
          title="Kapasite"
          value="1 / 50"
          subtitle="Öğrenci Doluluğu"
          icon={Users}
          variant="amber"
          progressPercent={4}
        />
        <StatCard
          title="Kayıt Tarihi"
          value={new Date(tenant.createdAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          subtitle="Kuruluş"
          icon={Calendar}
          variant="indigo"
        />
      </div>

      {/* Main Settings Form */}
      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        {/* Institutional Information Card */}
        <div className="rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80">
            <Building2 className="w-5 h-5 text-teal-900 dark:text-teal-300" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Kurumsal Profil Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kreş Adı */}
            <div className="md:col-span-2">
              <label
                htmlFor="tenant-name"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5"
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
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:border-teal-700 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-75 shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-300 mt-1">
                Velilerin ve öğretmenlerin ana panelde göreceği resmi kreş unvanı.
              </p>
            </div>

            {/* Slug / Kurum Kodu */}
            <div>
              <label
                htmlFor="tenant-slug"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5"
              >
                Sistem Alan Kodu (Slug)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-slate-300 font-mono">
                    @
                  </span>
                  <input
                    id="tenant-slug"
                    type="text"
                    value={tenant.slug}
                    readOnly
                    disabled
                    className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 pl-7 pr-4 py-2.5 text-sm font-mono text-slate-600 dark:text-slate-300 cursor-not-allowed select-all shadow-2xs"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-300 mt-1">
                Veritabanı ve güvenli alt alan adı tanımlayıcınız (Sabit).
              </p>
            </div>

            {/* Şube Tanımı */}
            <div>
              <label
                htmlFor="tenant-branch"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5"
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
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-300 mt-1">
                Çoklu şube desteği Kurumsal Enterprise planda aktifleştirilebilir.
              </p>
            </div>

            {/* İletişim Telefonu */}
            <div>
              <label
                htmlFor="tenant-phone"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5"
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
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed shadow-2xs"
                />
              </div>
            </div>

            {/* İletişim E-Postası */}
            <div>
              <label
                htmlFor="tenant-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5"
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
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 pl-9 pr-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System & Operational Preferences */}
        <div className="rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)] p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80">
            <BellRing className="w-5 h-5 text-teal-900 dark:text-teal-300" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Güvenlik & Operasyonel Tercihler
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Kreş operasyonları için akıllı otomasyon ve güvenlik kontrolleri.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Preference 1: Auto Allergy Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Akıllı Alerjen Çapraz Eşleme Uyarısı
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Günün yemek menüsü kaydedildiğinde sınıflardaki çocukların alerjileri otomatik
                    taranarak ekranda kırmızı uyarı verilir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllergyAutoAlert(!allergyAutoAlert)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allergyAutoAlert
                    ? 'bg-teal-700 dark:bg-teal-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-200 shadow-xs ring-0 transition duration-200 ease-in-out ${
                    allergyAutoAlert ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preference 2: Secure Pickup Verification */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Güvenli Veli & Yetkili Teslimat Kontrolü
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Öğrenci okuldan ayrılırken öğretmen teslim alan kişinin öğrenci pasaportunda
                    tanımlı yetkili olduğunu teyit eder.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSecurePickupValidation(!securePickupValidation)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  securePickupValidation
                    ? 'bg-teal-700 dark:bg-teal-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-200 shadow-xs ring-0 transition duration-200 ease-in-out ${
                    securePickupValidation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preference 3: Daily Report Notification */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-teal-900 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Gün Sonu Karne & Bülten Hatırlatması
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Saat 16:30'da henüz gün sonu karnesi girilmemiş öğrenciler için öğretmen
                    paneline görsel bildirim düşer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyReportReminder(!dailyReportReminder)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dailyReportReminder
                    ? 'bg-teal-700 dark:bg-teal-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-200 shadow-xs ring-0 transition duration-200 ease-in-out ${
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
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131B2E] p-4 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 shadow-[0_4px_0_0_#D5CBB9,0_8px_20px_-2px_rgba(45,38,30,0.06)] dark:shadow-[0_4px_0_0_#1E293B,0_8px_20px_-2px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            {hasChanges ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 font-semibold">
                Kaydedilmemiş değişiklikler var
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tüm ayarlar güncel
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <TactileButton type="submit" variant="teal" size="md" disabled={saving || !hasChanges}>
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </TactileButton>
          </div>
        </div>
      </form>
    </div>
  );
}
