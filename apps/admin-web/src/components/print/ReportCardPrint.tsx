import type { ReactElement } from 'react';
import type {
  DevelopmentDomain,
  DevelopmentObservationDto,
  Student,
  StudentPassport,
} from '@kidscare/shared-types';
import { Award, Heart, Sparkles, Smile, Palette, Activity } from 'lucide-react';

export interface ReportCardPrintProps {
  student: Student;
  tenantName?: string | undefined;
  tenantLogo?: string | undefined;
  period?: string | undefined;
  classroomName?: string | undefined;
  passport?: StudentPassport | null | undefined;
  observations?: DevelopmentObservationDto[] | undefined;
  teacherName?: string | undefined;
  directorName?: string | undefined;
  customTeacherNote?: string | undefined;
  issueDate?: string | undefined;
}

interface DomainConfig {
  domain: DevelopmentDomain;
  title: string;
  icon: typeof Award;
  defaultDescription: string;
  defaultScore: number; // 1-4
}

const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    domain: 'DIL',
    title: 'Dil ve İletişim Becerileri',
    icon: Sparkles,
    defaultDescription:
      'Duygu ve düşüncelerini akıcı şekilde ifade eder. Zengin kelime dağarcığına sahip olup hikaye anlatımına ve grup sohbetlerine aktif katılır.',
    defaultScore: 4,
  },
  {
    domain: 'BILISSEL',
    title: 'Bilişsel Gelişim & Mantık',
    icon: Award,
    defaultDescription:
      'Neden-sonuç ilişkilerini kavrar, örüntüleri çözer, problem çözme ve nesneleri özelliklerine göre gruplandırma becerisi oldukça yüksektir.',
    defaultScore: 4,
  },
  {
    domain: 'MOTOR',
    title: 'Motor Becerileri (Kaba & İnce)',
    icon: Activity,
    defaultDescription:
      'Kalem tutma, makas kullanma, boncuk dizme gibi ince motor becerileri ve denge gerektiren hareketli oyunlarda koordinasyonu tamdır.',
    defaultScore: 3,
  },
  {
    domain: 'SOSYAL_DUYGUSAL',
    title: 'Sosyal ve Duygusal Gelişim',
    icon: Heart,
    defaultDescription:
      'Arkadaşlarıyla iş birliği içinde çalışır, paylaşımcıdır, sınıf içi kurallara özen gösterir ve empati duygusu güçlüdür.',
    defaultScore: 4,
  },
  {
    domain: 'OZ_BAKIM',
    title: 'Öz Bakım & Yaşam Becerileri',
    icon: Smile,
    defaultDescription:
      'Kişisel hijyenini, el yıkama ve giyinme adımlarını bağımsız yürütür; yemek saatlerinde sofra adabına uyum gösterir.',
    defaultScore: 4,
  },
  {
    domain: 'SANAT',
    title: 'Görsel Sanatlar & Ritim/Müzik',
    icon: Palette,
    defaultDescription:
      'Farklı materyallerle yaratıcı ürünler ortaya koyar, ritim çalışmalarına istekle katılır ve hayal gücünü renklerle yansıtır.',
    defaultScore: 3,
  },
];

const SCORE_LABELS: Record<number, { text: string; bg: string; textCol: string }> = {
  4: {
    text: 'İleri Düzey (Çok Başarılı)',
    bg: 'bg-teal-50 border-teal-200',
    textCol: 'text-teal-900 font-bold',
  },
  3: {
    text: 'Yetkin (Hedefe Ulaştı)',
    bg: 'bg-emerald-50 border-emerald-200',
    textCol: 'text-emerald-900 font-bold',
  },
  2: {
    text: 'Gelişmekte (Çaba Gösteriyor)',
    bg: 'bg-amber-50 border-amber-200',
    textCol: 'text-amber-900 font-bold',
  },
  1: {
    text: 'Desteklenmeli',
    bg: 'bg-rose-50 border-rose-200',
    textCol: 'text-rose-900 font-bold',
  },
};

const DEFAULT_SCORE_META = {
  text: 'İleri Düzey (Çok Başarılı)',
  bg: 'bg-teal-50 border-teal-200',
  textCol: 'text-teal-900 font-bold',
};

export function ReportCardPrint({
  student,
  tenantName = 'KidsCare Anaokulu & Gündüz Bakımevi',
  tenantLogo,
  period = '2026-2027 Eğitim Öğretim Yılı 1. Dönem',
  classroomName,
  passport,
  observations = [],
  teacherName = 'Sınıf Öğretmeni',
  directorName = 'Okul Müdürü',
  customTeacherNote,
  issueDate = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
}: ReportCardPrintProps): ReactElement {
  // Aggregate observations per domain if available
  const domainObservations = DOMAIN_CONFIGS.map((cfg) => {
    const relevantObs = observations.filter((o) => o.domain === cfg.domain);
    const customText =
      relevantObs.length > 0 ? relevantObs[relevantObs.length - 1]?.observation : undefined;
    return {
      ...cfg,
      description: customText || cfg.defaultDescription,
      score: cfg.defaultScore,
    };
  });

  const defaultTeacherNote =
    `${student.firstName}, dönem boyunca sergilediği meraklı, sevecen ve iş birliğine açık tavrıyla sınıfımızın neşesi oldu. ` +
    `Hem akademik hem de sosyal becerilerinde çok güzel ilerlemeler kaydetti. Çocuğumuzun bu başarısını gönülden tebrik ediyor, ` +
    `ailece keyifli ve dinlendirici bir tatil diliyorum.`;

  return (
    <div className="bg-white text-slate-800 font-sans p-2 sm:p-4 text-[13px] leading-relaxed">
      {/* Official Top Header / Antet */}
      <div className="border-b-2 border-teal-900/80 pb-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img
                src={tenantLogo}
                alt={tenantName}
                className="h-16 w-16 object-contain rounded-lg border border-stone-200 p-1"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-teal-900 text-amber-300 flex items-center justify-center font-black text-2xl shadow-sm">
                KC
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-teal-900">
                T.C. MİLLÎ EĞİTİM BAKANLIĞI STANDARTLARINDA
              </p>
              <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">{tenantName}</h1>
              <p className="text-xs font-semibold text-teal-800">
                Okul Öncesi Pedagojik Gelişim Değerlendirme Raporu (Karne)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
              {period}
            </span>
            <p className="text-[11px] text-stone-500 mt-1 font-medium">
              Tanzim Tarihi: {issueDate}
            </p>
          </div>
        </div>
      </div>

      {/* Student Passport & Profile Snapshot */}
      <div className="rounded-xl border border-stone-300 bg-stone-50/70 p-3.5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-teal-100 border-2 border-teal-600 flex items-center justify-center text-teal-900 font-bold text-xl overflow-hidden shrink-0">
              {`${student.firstName[0] || ''}${student.lastName[0] || ''}`}
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-stone-600">
                <span className="font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {classroomName || 'Sınıf Bilgisi Yok'}
                </span>
                <span>•</span>
                <span>
                  Doğum:{' '}
                  {student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString('tr-TR')
                    : '—'}
                </span>
                <span>•</span>
                <span>
                  Cinsiyet:{' '}
                  {student.gender === 'MALE'
                    ? 'Erkek'
                    : student.gender === 'FEMALE'
                      ? 'Kız'
                      : 'Belirtilmemiş'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Health & Vitals from Passport */}
          <div className="flex items-center gap-3 text-xs bg-white rounded-lg p-2 border border-stone-200 shadow-2xs">
            <div className="text-center px-2 border-r border-stone-200">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">
                Kan Grubu
              </span>
              <span className="font-bold text-rose-700">
                {passport?.bloodType || 'Belirtilmedi'}
              </span>
            </div>
            <div className="text-center px-2 border-r border-stone-200">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Alerjen</span>
              <span className="font-bold text-stone-700">
                {passport?.allergies && passport.allergies.length > 0
                  ? passport.allergies.join(', ')
                  : 'Tespit Edilmedi'}
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[10px] text-stone-400 uppercase font-bold">
                Öğrenci No
              </span>
              <span className="font-bold text-stone-700">
                #{student.id.slice(-5).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Pedagogical Development Areas Grid */}
      <div className="mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-teal-950 mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Pedagojik Gelişim Alanları ve Kazanım Değerlendirmeleri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {domainObservations.map((domainItem) => {
            const Icon = domainItem.icon;
            const scoreMeta = SCORE_LABELS[domainItem.score] ?? DEFAULT_SCORE_META;
            return (
              <div
                key={domainItem.domain}
                className="rounded-lg border border-stone-200 bg-white p-3 shadow-2xs flex flex-col justify-between avoid-break"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs">{domainItem.title}</h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${scoreMeta.bg} ${scoreMeta.textCol}`}
                    >
                      {scoreMeta.text}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-normal">{domainItem.description}</p>
                </div>

                {/* Visual Progress Stars */}
                <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-stone-100 text-[10px] text-stone-400">
                  <span className="font-medium">Kazanım Düzeyi:</span>
                  <div className="flex gap-1 ml-1 text-amber-500 font-bold">
                    {'★'.repeat(domainItem.score)}
                    <span className="text-stone-300">{'★'.repeat(4 - domainItem.score)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher's Pedagogical Note */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 mb-6 avoid-break">
        <h3 className="text-xs font-black uppercase tracking-wider text-teal-900 mb-1.5 flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-teal-700" />
          Öğretmenin Dönem Sonu Pedagojik Değerlendirmesi & Mesajı
        </h3>
        <p className="text-xs text-stone-800 leading-relaxed italic bg-white/80 p-2.5 rounded-lg border border-teal-100">
          "{customTeacherNote || defaultTeacherNote}"
        </p>
      </div>

      {/* Signature & Seal Blocks */}
      <div className="pt-2 border-t-2 border-stone-200 avoid-break">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="font-semibold text-stone-500 mb-10">Sınıf Öğretmeni</p>
            <p className="font-bold text-stone-900">{teacherName}</p>
            <p className="text-[11px] text-stone-400">İmza</p>
          </div>
          <div>
            <p className="font-semibold text-stone-500 mb-10">Kurum Müdürü / Kurucu</p>
            <p className="font-bold text-stone-900">{directorName}</p>
            <p className="text-[11px] text-stone-400">İmza & Mühür</p>
          </div>
        </div>
      </div>

      {/* Tiny Footer */}
      <div className="mt-6 text-center text-[10px] text-stone-400">
        KidsCare Çocuk Gelişimi & Kreş Yönetim Bilgi Sistemi tarafından resmi standartlarda
        üretilmiştir.
      </div>
    </div>
  );
}
