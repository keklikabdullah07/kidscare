import type { Meta, StoryObj } from '@storybook/react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Search,
} from 'lucide-react';
import { TactileButton, TACTILE_CARD_CLASSES } from './TactileButton';

const meta: Meta = {
  title: 'Design System / Living Design Guide',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const MasterShowcase: Story = {
  render: () => (
    <div className="max-w-5xl mx-auto space-y-12 p-6 bg-[#FAF9F6] dark:bg-[#090D16] text-slate-900 dark:text-white rounded-3xl border border-[#DDD4C4] dark:border-slate-800 transition-colors">
      {/* Header */}
      <div className="space-y-3 border-b border-[#DDD4C4] dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 text-xs font-black tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>KIDSCARE DOKUNSAL (TACTILE) TASARIM SİSTEMİ</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">KidsCare Nordic Claymorphic Rehberi</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
          Sıcak, organik İskandinav kreş paleti ile fiziksel mikro-derinliği (3D extruded clay lip)
          birleştiren kurumsal tasarım dili. Gelecekteki tüm sayfa, mobil ekran ve yeni projeler
          (E-Ticaret, SaaS, Portallar) bu kılavuzu referans alır.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
          <span>1. Renk Paleti ve Zemin Tokenları</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Teal */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs space-y-2">
            <div className="h-16 rounded-xl bg-[#115e59] shadow-inner flex items-center justify-center text-white text-xs font-bold">
              #115e59
            </div>
            <div>
              <p className="text-xs font-black">İskandinav Adaçayı / Teal</p>
              <p className="text-[10px] text-slate-500">Birincil Eylemler & Marka</p>
            </div>
          </div>

          {/* Amber */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs space-y-2">
            <div className="h-16 rounded-xl bg-[#f59e0b] shadow-inner flex items-center justify-center text-[#451a03] text-xs font-black">
              #f59e0b
            </div>
            <div>
              <p className="text-xs font-black">Bal Kehribarı / Amber</p>
              <p className="text-[10px] text-slate-500">Kreş Sıcaklığı & Vurgu</p>
            </div>
          </div>

          {/* Peach */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs space-y-2">
            <div className="h-16 rounded-xl bg-[#F3D5C3] shadow-inner flex items-center justify-center text-[#5c3826] text-xs font-black">
              #F3D5C3
            </div>
            <div>
              <p className="text-xs font-black">Şeftali / Pişmiş Toprak</p>
              <p className="text-[10px] text-slate-500">Özel Hero & Duyuru Kartları</p>
            </div>
          </div>

          {/* Linen */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs space-y-2">
            <div className="h-16 rounded-xl bg-[#FAF9F6] border border-[#DDD4C4] shadow-inner flex items-center justify-center text-slate-700 text-xs font-bold">
              #FAF9F6
            </div>
            <div>
              <p className="text-xs font-black">Keten / Yulaf Zemini</p>
              <p className="text-[10px] text-slate-500">Açık Mod Arka Planı</p>
            </div>
          </div>

          {/* Obsidian */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 shadow-2xs space-y-2">
            <div className="h-16 rounded-xl bg-[#090D16] border border-slate-700 shadow-inner flex items-center justify-center text-slate-300 text-xs font-bold">
              #090D16
            </div>
            <div>
              <p className="text-xs font-black">Derin Obsidyen</p>
              <p className="text-[10px] text-slate-500">Koyu Mod Arka Planı</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Single Interactive Entity Rule (HAYATİ ETKİLEŞİM KURALI) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-black tracking-tight">
            2. Altın Kural: Tek Etkileşimli Varlık İlkesi (Single Interactive Entity Rule)
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Kullanıcı bir bileşenle etkileşime girdiğinde{' '}
          <strong>hangisinin tepki verdiği net olmalıdır</strong>. Asla hareket eden bir kartın
          içerisine ayrıca hareket eden buton koyulmaz!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* DOĞRU: Sabit Kapsayıcı + 3D Dokunsal Buton */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border-2 border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DOĞRU MİMARİ: Zeminlenmiş Kart + 3D Buton
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Kart sabittir (<code className="text-emerald-700 font-bold">shadow-sm</code>).
              İçindeki buton ise 3D kalkar ve tıklandığında içeri gömülür:
            </p>
            <div className="p-4 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Öğrenci Sağlık & İlaç Raporu</p>
                <p className="text-[11px] text-slate-500">Bugün 2 ilaç saati var</p>
              </div>
              <TactileButton variant="teal" size="sm">
                <span>İncele ➔</span>
              </TactileButton>
            </div>
          </div>

          {/* DOĞRU: Yalnızca Kartın Kendisi Butondur (KPI Kartı) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border-2 border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DOĞRU MİMARİ: Bağımsız Dokunsal Kart
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Kartın içinde başka buton yoktur. Kartın tamamı bir buton gibi hareket eder:
            </p>
            <div className={`${TACTILE_CARD_CLASSES} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Günlük Katılım</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">%94.2</p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                Detay Gör ➔
              </span>
            </div>
          </div>
        </div>

        {/* HATALI ÖRNEK UYARISI */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong>YASAKLI DAVRANIŞ (Çift Hareket Çatışması):</strong> Hem kartın hover'da havaya
            kalkıp hem de içindeki butonun ayrıca havaya kalkması kullanıcıda yön kaybı ve dengesiz
            bir titreme hissi yaratır. Kart içinde eylem butonu varsa kart <u>her zaman sabit</u>{' '}
            olmalıdır.
          </div>
        </div>
      </section>

      {/* 3. Button Anatomy & Shadows */}
      <section className="space-y-4">
        <h2 className="text-lg font-black tracking-tight">3. 3D Ekstrüzyon Buton Anatomisi</h2>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Her buton fiziksel bir "tuş" hissi verir. Altındaki renkli sert dudak (
            <code className="font-bold">shadow-[0_3px_0_0_#...]</code>) tıklama anında (
            <code className="font-bold">active:translate-y-[3px] active:shadow-none</code>) sıkışır.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <TactileButton variant="teal">
              <span>Birincil (Teal)</span>
            </TactileButton>
            <TactileButton variant="amber">
              <span>Kreş Vurgusu (Amber)</span>
            </TactileButton>
            <TactileButton variant="peach">
              <span>Sıcak (Peach)</span>
            </TactileButton>
            <TactileButton variant="secondary">
              <span>Nötr (Secondary)</span>
            </TactileButton>
            <TactileButton variant="danger">
              <span>Kritik (Danger)</span>
            </TactileButton>
          </div>
        </div>
      </section>

      {/* 4. Inputs and Warm Form Elements */}
      <section className="space-y-4">
        <h2 className="text-lg font-black tracking-tight">4. Form & Giriş Alanları (Inputs)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arama & Filtreleme Alanı
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Öğrenci adı veya sınıf ara…"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] hover:bg-white focus:bg-white dark:bg-slate-900 text-sm font-medium focus:border-teal-700 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Seçici (Hap Tipi)
            </label>
            <div className="flex gap-2 py-0.5">
              <TactileButton variant="teal" size="sm">
                <span>Tümü (24)</span>
              </TactileButton>
              <TactileButton variant="secondary" size="sm">
                <span>Gelenler (22)</span>
              </TactileButton>
              <TactileButton variant="secondary" size="sm">
                <span>İzinliler (2)</span>
              </TactileButton>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CSS Overflow Clipping Warning */}
      <section className="space-y-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 font-medium">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>ÖNEMLİ CSS KURALI: 3D Gölgelerin ve Dudakların Kesilmesi (Clipping)</span>
        </div>
        <p>
          Dokunsal pill butonları barındıran yatay çubuklarda asla{' '}
          <code className="font-bold">overflow-x: auto</code> ve yetersiz alt dolgu (
          <code className="font-bold">pb-0</code>) kullanılmamalıdır. Bu durum butonun 3D alt
          dudağını ve yuvarlak tabanını tıraşlar. Daima{' '}
          <code className="font-bold">flex-wrap py-1.5</code> tercih edilmelidir.
        </p>
      </section>
    </div>
  ),
};
