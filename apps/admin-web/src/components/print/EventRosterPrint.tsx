import type { ReactElement } from 'react';
import type { EventConsent, EventConsentResponseItem } from '@kidscare/shared-types';
import { Bus, CheckCircle2, XCircle, MapPin, Calendar, Users } from 'lucide-react';

export interface EventRosterPrintProps {
  consent: EventConsent;
  responses: EventConsentResponseItem[];
  tenantName?: string | undefined;
  printDate?: string | undefined;
}

export function EventRosterPrint({
  consent,
  responses,
  tenantName = 'KidsCare Anaokulu & Gündüz Bakımevi',
  printDate = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
}: EventRosterPrintProps): ReactElement {
  const approvedList = responses.filter((r) => r.decision === 'APPROVED');
  const declinedList = responses.filter((r) => r.decision === 'DECLINED');

  const formattedEventDate = new Date(consent.eventDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white text-slate-900 font-sans p-2 sm:p-4 text-[12px] leading-snug">
      {/* Header Banner */}
      <div className="border-b-2 border-teal-800 pb-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <Bus className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                RESMÎ ETKİNLİK, GEZİ & SERVİS BİNİŞ KONTROL ÇİZELGESİ
              </p>
              <h1 className="text-lg font-black text-stone-900 uppercase">{tenantName}</h1>
              <p className="text-xs font-bold text-teal-900">
                {consent.title}{' '}
                {consent.classroom?.name ? `(${consent.classroom.name})` : '(Tüm Okul)'}
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] space-y-0.5">
            <p className="text-stone-500 font-medium">Baskı Tarihi: {printDate}</p>
            {consent.price && (
              <p className="font-bold text-amber-900">Ücret: {consent.price} TL / Kişi</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>
              <strong>Etkinlik Zamanı:</strong> {formattedEventDate}
            </span>
          </div>
          {consent.location && (
            <div className="flex items-center gap-1.5 text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                <strong>Güzergah / Yer:</strong> {consent.location}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Users className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
            <span>
              <strong>Toplam Yanıt:</strong> {responses.length} Öğrenci (
              <span className="text-emerald-700 font-bold">{approvedList.length} Katılıyor</span> /{' '}
              <span className="text-rose-700 font-bold">{declinedList.length} Katılmıyor</span>)
            </span>
          </div>
          {consent.description && (
            <div className="text-stone-600 line-clamp-2">
              <strong>Açıklama:</strong> {consent.description}
            </div>
          )}
        </div>
      </div>

      {/* Approved Students Table (Bus / Roster Table) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            İzin Veren Öğrenciler (Servise Biniş ve Gezi Katılımcıları) — {approvedList.length} Kişi
          </h2>
          <span className="text-[10px] text-stone-500 font-medium italic">
            Servise binişte ve etkinlik alanında imza/yoklama alınız.
          </span>
        </div>

        <table className="w-full border-collapse border border-stone-300 text-[11px]">
          <thead>
            <tr className="bg-emerald-50 text-emerald-950 font-bold">
              <th className="border border-stone-300 p-1.5 text-center w-10">Sıra</th>
              <th className="border border-stone-300 p-1.5 text-left">Öğrenci Adı Soyadı</th>
              <th className="border border-stone-300 p-1.5 text-left">Sınıf</th>
              <th className="border border-stone-300 p-1.5 text-left">Veli İletişim / E-posta</th>
              <th className="border border-stone-300 p-1.5 text-center w-28">Gidiş Kontrol</th>
              <th className="border border-stone-300 p-1.5 text-center w-28">Dönüş Kontrol</th>
              <th className="border border-stone-300 p-1.5 text-left">Veli Notu</th>
            </tr>
          </thead>
          <tbody>
            {approvedList.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border border-stone-300 p-4 text-center text-stone-500 italic"
                >
                  Henüz onay verilmiş öğrenci bulunmamaktadır.
                </td>
              </tr>
            ) : (
              approvedList.map((res, index) => {
                const sName =
                  `${res.student?.firstName || ''} ${res.student?.lastName || ''}`.trim() || '—';
                return (
                  <tr key={res.id} className={index % 2 === 1 ? 'bg-stone-50/60' : 'bg-white'}>
                    <td className="border border-stone-300 p-1.5 text-center font-bold text-stone-600">
                      {index + 1}
                    </td>
                    <td className="border border-stone-300 p-1.5 font-bold text-stone-900">
                      {sName}
                    </td>
                    <td className="border border-stone-300 p-1.5 text-stone-700">
                      {consent.classroom?.name || 'Genel / Tüm Okul'}
                    </td>
                    <td className="border border-stone-300 p-1.5 text-stone-700">
                      {res.parentUser?.email || '—'}
                    </td>
                    <td className="border border-stone-300 p-1.5 text-center">
                      <div className="w-5 h-5 mx-auto border-2 border-stone-400 rounded-sm" />
                    </td>
                    <td className="border border-stone-300 p-1.5 text-center">
                      <div className="w-5 h-5 mx-auto border-2 border-stone-400 rounded-sm" />
                    </td>
                    <td className="border border-stone-300 p-1.5 text-stone-600 text-[10px]">
                      {res.notes || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Declined / Non-Participating Students Summary (if any) */}
      {declinedList.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase text-rose-900 flex items-center gap-1.5 mb-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Katılmayacağını Bildiren Öğrenciler ({declinedList.length})
          </h3>
          <div className="border border-stone-200 rounded-lg p-2 bg-rose-50/30 text-[11px] flex flex-wrap gap-2 text-stone-700">
            {declinedList.map((res) => (
              <span
                key={res.id}
                className="bg-white border border-rose-200 px-2 py-0.5 rounded text-rose-900"
              >
                {res.student?.firstName} {res.student?.lastName}
                {res.notes && (
                  <span className="text-[10px] text-stone-500 italic"> ({res.notes})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Signature & Official Approval Block */}
      <div className="mt-8 pt-4 border-t border-stone-300 grid grid-cols-3 gap-6 text-center text-xs">
        <div>
          <p className="font-bold text-stone-800">Sorumlu Öğretmen / Refakatçi</p>
          <p className="text-[10px] text-stone-500 mt-0.5">Ad Soyad / İmza</p>
          <div className="h-12 border-b border-stone-400 mt-2 mx-8" />
        </div>
        <div>
          <p className="font-bold text-stone-800">Servis Sorumlusu / Hostes</p>
          <p className="text-[10px] text-stone-500 mt-0.5">Ad Soyad / İmza</p>
          <div className="h-12 border-b border-stone-400 mt-2 mx-8" />
        </div>
        <div>
          <p className="font-bold text-stone-800">Kreş Müdürü / Yetkili</p>
          <p className="text-[10px] text-stone-500 mt-0.5">Mühür / İmza</p>
          <div className="h-12 border-b border-stone-400 mt-2 mx-8" />
        </div>
      </div>
    </div>
  );
}
