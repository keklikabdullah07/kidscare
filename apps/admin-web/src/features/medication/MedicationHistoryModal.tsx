import { type JSX } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  HeartPulse,
  RotateCw,
  X,
} from 'lucide-react';
import type { MedicationRecord, Student, User as UserType } from '@kidscare/shared-types';
import { TactileButton } from '../../components/ui/TactileButton';
import { getTeacherDisplayName } from '../../utils/userDisplay';

interface MedicationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  medicationRecord: MedicationRecord | null;
  records: MedicationRecord[];
  classroomName?: string | null;
  teacherName?: string | null;
  parentName?: string | null;
  teachers?: UserType[];
}

export function MedicationHistoryModal({
  isOpen,
  onClose,
  student,
  medicationRecord,
  records,
  classroomName,
  teacherName,
  parentName,
  teachers = [],
}: MedicationHistoryModalProps): JSX.Element | null {
  if (!isOpen || !student) return null;

  // Filter records belonging to this student (sorted latest first)
  const studentRecords = records
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const passport = student.passport;
  const regularMeds = passport?.regularMedications || [];
  const chronicConditions = passport?.chronicConditions || [];
  const allergies = passport?.allergies || [];

  function getAdministeredByName(id?: string | null) {
    if (!id) return null;
    const t = teachers.find((u) => u.id === id);
    if (t) return getTeacherDisplayName(t);
    return 'Sağlık / Nöbetçi Personel';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="İlaç Geçmişi ve Doz Kütüğü"
    >
      <div className="bg-[#FAF9F6] dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Modal Başlığı */}
        <div className="p-5 border-b-2 border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                İlaç Geçmişi & Doz Kütüğü
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.firstName} {student.lastName} için uygulanan dozlar ve pasaport sağlık
                özeti.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal İçerik (Kaydırılabilir) */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Öğrenci Sağlık Pasaportu Özet Şeridi */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-[#DDD4C4] dark:border-slate-800 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  👶 {student.firstName} {student.lastName}
                </span>
                {classroomName && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80">
                    🏫 {classroomName}
                  </span>
                )}
                {teacherName && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/80">
                    🎓 {teacherName}
                  </span>
                )}
                {parentName && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80">
                    👤 {parentName}
                  </span>
                )}
              </div>
            </div>

            {/* Sürekli İlaçlar & Kronik Durumlar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40">
                <span className="block font-bold text-[10px] uppercase text-amber-800 dark:text-amber-300 tracking-wider flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  Sürekli İlaçlar
                </span>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {regularMeds.length > 0 ? regularMeds.join(', ') : 'Kayıtlı sürekli ilaç yok'}
                </p>
              </div>

              <div className="bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200/70 dark:border-rose-900/40">
                <span className="block font-bold text-[10px] uppercase text-rose-800 dark:text-rose-300 tracking-wider flex items-center gap-1">
                  <HeartPulse className="w-3 h-3" />
                  Kronik Durumlar
                </span>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {chronicConditions.length > 0
                    ? chronicConditions.join(', ')
                    : 'Kronik rahatsızlık yok'}
                </p>
              </div>

              <div className="bg-sky-50/60 dark:bg-sky-950/30 p-2.5 rounded-xl border border-sky-200/70 dark:border-sky-900/40">
                <span className="block font-bold text-[10px] uppercase text-sky-800 dark:text-sky-300 tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Alerjiler
                </span>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {allergies.length > 0 ? allergies.join(', ') : 'Bilinen alerji yok'}
                </p>
              </div>
            </div>
          </div>

          {/* Kronolojik İlaç Geçmişi Listesi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Geçmiş & Aktif İlaç Kayıtları ({studentRecords.length})
              </h3>
            </div>

            {studentRecords.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">
                  Bu öğrenciye ait kayıtlı ilaç geçmişi bulunmuyor.
                </p>
              </div>
            ) : (
              studentRecords.map((rec) => {
                const isSelected = medicationRecord?.id === rec.id;
                const isGiven = rec.status === 'GIVEN';
                const isSkipped = rec.status === 'SKIPPED';
                const isRejected = rec.status === 'REJECTED';

                // Check expired
                const isExpired =
                  rec.scheduledAt &&
                  new Date(rec.scheduledAt).getTime() < Date.now() &&
                  (rec.status === 'REQUESTED' ||
                    rec.status === 'APPROVED' ||
                    rec.status === 'SCHEDULED');

                const administeredBy = getAdministeredByName(rec.administeredById);

                return (
                  <div
                    key={rec.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {rec.medicationName}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {rec.dosage}
                          </span>
                          {isExpired && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Süresi Geçti / Gecikmiş
                            </span>
                          )}
                        </div>

                        {rec.instructions && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                            📝 {rec.instructions}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isGiven
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isRejected
                              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                              : isSkipped
                                ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    {/* Tarihler & Kim Verdi Bilgisi */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div>
                        {rec.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Planlanan: </span>
                            <strong className="text-slate-700 dark:text-slate-200">
                              {new Date(rec.scheduledAt).toLocaleString('tr-TR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </strong>
                          </div>
                        )}
                        {rec.givenAt && (
                          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verildi: </span>
                            <span>
                              {new Date(rec.givenAt).toLocaleString('tr-TR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        {administeredBy && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Uygulayan: </span>
                            <strong className="text-slate-700 dark:text-slate-200">
                              {administeredBy}
                            </strong>
                          </div>
                        )}
                        {rec.parentApprovalNote && (
                          <p
                            className="text-amber-800 dark:text-amber-300 truncate"
                            title={rec.parentApprovalNote}
                          >
                            Veli Notu: {rec.parentApprovalNote}
                          </p>
                        )}
                        {rec.rejectionReason && (
                          <p className="text-rose-700 dark:text-rose-400 font-semibold">
                            Ret: {rec.rejectionReason}
                          </p>
                        )}
                        {rec.skipReason && (
                          <p className="text-amber-700 dark:text-amber-400 font-semibold">
                            Atlama Nedeni: {rec.skipReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Alt Kısım */}
        <div className="p-4 border-t-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#0F172A] flex justify-end">
          <TactileButton type="button" variant="secondary" size="md" onClick={onClose}>
            Kapat
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
