import { useState, useEffect, useMemo, type JSX } from 'react';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Send,
  Receipt,
  Search,
  X,
  Building,
  TrendingUp,
  FileText,
  User,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/Toast';
import {
  getFinanceStats,
  listInvoices,
  createInvoice,
  recordPayment,
  listBillingPlans,
  saveBillingPlan,
  sendPaymentReminder,
  getMyChildBilling,
} from '../../api/finance';
import { listStudents } from '../../api/students';
import { listClassrooms } from '../../api/classrooms';
import { StatCard } from '../../components/ui/StatCard';
import { TactileTabs, type TactileTabItem } from '../../components/ui/TactileTabs';
import { TactileButton } from '../../components/ui/TactileButton';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import type {
  BillingInvoice,
  CreateBillingPlanInput,
  CreateInvoiceInput,
  FinanceSummaryStats,
  InvoiceStatus,
  PaymentMethod,
  PaymentTransaction,
  RecordPaymentInput,
  StudentBillingPlan,
  Student,
  Classroom,
} from '@kidscare/shared-types';

export function FinancePage(): JSX.Element {
  const { state: authState } = useAuth();
  const { showToast } = useToast();
  const userRole = authState.status === 'authenticated' ? authState.user.role : 'PARENT';
  const isStaff = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Current Period YYYY-MM
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonthStr);

  // Tabs for Staff: 'overdue' | 'invoices' | 'plans'
  type FinanceTab = 'overdue' | 'invoices' | 'plans';
  const [activeTab, setActiveTab] = useState<FinanceTab>('overdue');

  // Data states
  const [stats, setStats] = useState<FinanceSummaryStats | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [plans, setPlans] = useState<StudentBillingPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [parentInvoices, setParentInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters for invoices
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [historyInvoice, setHistoryInvoice] = useState<BillingInvoice | null>(null);

  // Modal active selections
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<BillingInvoice | null>(
    null,
  );
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<StudentBillingPlan | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [paymentRefNo, setPaymentRefNo] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);

  // Invoice Form State
  const [invStudentId, setInvStudentId] = useState<string>('');
  const [invPeriod, setInvPeriod] = useState<string>(currentMonthStr);
  const [invAmount, setInvAmount] = useState<string>('');
  const [invDueDate, setInvDueDate] = useState<string>(
    `${currentMonthStr}-05T00:00:00.000Z`.slice(0, 10),
  );
  const [invNotes, setInvNotes] = useState<string>('');
  const [submittingInvoice, setSubmittingInvoice] = useState<boolean>(false);

  // Plan Form State
  const [planStudentId, setPlanStudentId] = useState<string>('');
  const [planTuition, setPlanTuition] = useState<string>('15000');
  const [planService, setPlanService] = useState<string>('0');
  const [planActivity, setPlanActivity] = useState<string>('0');
  const [planDiscount, setPlanDiscount] = useState<string>('0');
  const [planDueDay, setPlanDueDay] = useState<string>('5');
  const [planNotes, setPlanNotes] = useState<string>('');
  const [planIsActive, setPlanIsActive] = useState<boolean>(true);
  const [submittingPlan, setSubmittingPlan] = useState<boolean>(false);

  // Reminder in-flight set
  const [remindingIds, setRemindingIds] = useState<Set<string>>(new Set());

  // Period Options (Son 6 ay ve Gelecek 2 ay)
  const periodOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const baseDate = new Date();
    for (let i = -6; i <= 2; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lbl = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      list.push({ value: val, label: lbl.charAt(0).toUpperCase() + lbl.slice(1) });
    }
    return list;
  }, []);

  useEffect(() => {
    void loadData();
  }, [selectedPeriod, isStaff]);

  async function loadData(): Promise<void> {
    setLoading(true);
    try {
      if (isStaff) {
        const [statsData, invoicesData, plansData, studentsData, classroomsData] =
          await Promise.all([
            getFinanceStats(selectedPeriod).catch(() => null),
            listInvoices({ period: selectedPeriod }).catch(() => []),
            listBillingPlans().catch(() => []),
            listStudents().catch(() => []),
            listClassrooms().catch(() => []),
          ]);

        setStats(statsData);
        setInvoices(invoicesData);
        setPlans(plansData);
        setStudents(studentsData);
        setClassrooms(classroomsData);
      } else {
        const myInvoices = await getMyChildBilling().catch(() => []);
        setParentInvoices(myInvoices);
      }
    } catch {
      showToast('Finans verileri yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Overdue Invoices
  const overdueInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const remaining = inv.totalAmount - inv.paidAmount;
      if (remaining <= 0) return false;
      const isPast = new Date(inv.dueDate) < new Date();
      return inv.status === 'OVERDUE' || isPast;
    });
  }, [invoices]);

  // Filtered Invoices for Tab 2
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false;
      if (selectedClassroomId !== 'all' && inv.student?.classroom?.id !== selectedClassroomId)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName =
          `${inv.student?.firstName ?? ''} ${inv.student?.lastName ?? ''}`.toLowerCase();
        const classroomName = (inv.student?.classroom?.name ?? '').toLowerCase();
        if (!studentName.includes(q) && !classroomName.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, selectedStatus, selectedClassroomId, searchQuery]);

  // Handlers
  async function handleSendReminder(invoiceId: string): Promise<void> {
    setRemindingIds((prev) => new Set(prev).add(invoiceId));
    try {
      const res = await sendPaymentReminder(invoiceId);
      showToast(res.message, 'success');
    } catch {
      showToast('Hatırlatma iletilemedi.', 'error');
    } finally {
      setRemindingIds((prev) => {
        const next = new Set(prev);
        next.delete(invoiceId);
        return next;
      });
    }
  }

  function openPaymentModal(inv: BillingInvoice): void {
    setSelectedInvoiceForPayment(inv);
    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
    setPaymentAmount(remaining.toString());
    setPaymentMethod('BANK_TRANSFER');
    setPaymentRefNo('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  }

  async function handleSavePayment(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Geçerli bir ödeme tutarı giriniz.', 'error');
      return;
    }

    setSubmittingPayment(true);
    try {
      const payload: RecordPaymentInput = {
        invoiceId: selectedInvoiceForPayment.id,
        amount: amountNum,
        method: paymentMethod,
        referenceNo: paymentRefNo.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      };

      await recordPayment(payload);
      showToast('Tahsilat başarıyla kaydedildi.', 'success');
      setIsPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
      await loadData();
    } catch {
      showToast('Tahsilat kaydedilemedi. Tutarı ve bilgileri kontrol ediniz.', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  }

  async function handleCreateInvoiceSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!invStudentId) {
      showToast('Lütfen öğrenci seçiniz.', 'error');
      return;
    }

    const amountNum = parseFloat(invAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Geçerli bir fatura tutarı giriniz.', 'error');
      return;
    }

    setSubmittingInvoice(true);
    try {
      const payload: CreateInvoiceInput = {
        studentId: invStudentId,
        period: invPeriod,
        totalAmount: amountNum,
        dueDate: new Date(invDueDate).toISOString(),
        notes: invNotes.trim() || undefined,
      };

      await createInvoice(payload);
      showToast('Fatura başarıyla oluşturuldu.', 'success');
      setIsInvoiceModalOpen(false);
      setInvAmount('');
      setInvNotes('');
      await loadData();
    } catch {
      showToast('Fatura oluşturulamadı. Aynı dönemde mevcut fatura olabilir.', 'error');
    } finally {
      setSubmittingInvoice(false);
    }
  }

  function openEditPlanModal(plan?: StudentBillingPlan): void {
    if (plan) {
      setSelectedPlanForEdit(plan);
      setPlanStudentId(plan.studentId);
      setPlanTuition(plan.tuitionAmount.toString());
      setPlanService(plan.serviceAmount.toString());
      setPlanActivity(plan.activityAmount.toString());
      setPlanDiscount(plan.discountPercent.toString());
      setPlanDueDay(plan.dueDayOfMonth.toString());
      setPlanNotes(plan.notes || '');
      setPlanIsActive(plan.isActive);
    } else {
      setSelectedPlanForEdit(null);
      setPlanStudentId(students[0]?.id || '');
      setPlanTuition('15000');
      setPlanService('0');
      setPlanActivity('0');
      setPlanDiscount('0');
      setPlanDueDay('5');
      setPlanNotes('');
      setPlanIsActive(true);
    }
    setIsPlanModalOpen(true);
  }

  async function handleSavePlanSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!planStudentId) {
      showToast('Lütfen öğrenci seçiniz.', 'error');
      return;
    }

    const tuitionNum = parseFloat(planTuition);
    if (isNaN(tuitionNum) || tuitionNum < 0) {
      showToast('Geçerli bir aidat tutarı giriniz.', 'error');
      return;
    }

    setSubmittingPlan(true);
    try {
      const payload: CreateBillingPlanInput = {
        studentId: planStudentId,
        tuitionAmount: tuitionNum,
        serviceAmount: parseFloat(planService) || 0,
        activityAmount: parseFloat(planActivity) || 0,
        discountPercent: parseFloat(planDiscount) || 0,
        dueDayOfMonth: parseInt(planDueDay, 10) || 5,
        notes: planNotes.trim() || undefined,
        isActive: planIsActive,
      };

      await saveBillingPlan(payload);
      showToast('Öğrenci ücret planı başarıyla kaydedildi.', 'success');
      setIsPlanModalOpen(false);
      setSelectedPlanForEdit(null);
      await loadData();
    } catch {
      showToast('Ücret planı kaydedilemedi.', 'error');
    } finally {
      setSubmittingPlan(false);
    }
  }

  // Format currency
  function formatCurrency(val: number): string {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  // Status Badge Helper
  function renderStatusBadge(status: InvoiceStatus, dueDate: string, remaining: number) {
    const isPast = new Date(dueDate) < new Date();
    if (status === 'PAID' || remaining <= 0) {
      return (
        <Badge variant="success" size="sm">
          Ödendi
        </Badge>
      );
    }
    if (status === 'OVERDUE' || isPast) {
      return (
        <Badge variant="danger" size="sm">
          Gecikmede
        </Badge>
      );
    }
    if (status === 'PARTIALLY_PAID') {
      return (
        <Badge variant="warning" size="sm">
          Kısmi Ödendi
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        Bekliyor
      </Badge>
    );
  }

  // Tabs Definition
  const tabs: TactileTabItem<FinanceTab>[] = [
    {
      id: 'overdue',
      label: 'Geciken Ödemeler',
      count: overdueInvoices.length,
      icon: AlertTriangle,
      activeVariant: 'rose',
      badgeCls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
    },
    {
      id: 'invoices',
      label: 'Tahsilat & Fatura Listesi',
      count: invoices.length,
      icon: Receipt,
      activeVariant: 'teal',
      badgeCls: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300',
    },
    {
      id: 'plans',
      label: 'Öğrenci Ücret Planları',
      count: plans.length,
      icon: FileText,
      activeVariant: 'amber',
      badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    },
  ];

  // ----------------------------------------------------
  // PARENT VIEW
  // ----------------------------------------------------
  if (!isStaff) {
    const totalRemaining = parentInvoices.reduce(
      (sum, inv) => sum + Math.max(0, inv.totalAmount - inv.paidAmount),
      0,
    );
    const paidInvoicesCount = parentInvoices.filter(
      (inv) => inv.status === 'PAID' || inv.totalAmount <= inv.paidAmount,
    ).length;

    return (
      <div className="space-y-6">
        {/* Slim Page Hero Card */}
        <PageHeader
          title="Öğrenci Aidat & Ödeme Dökümü"
          description="Çocuğunuzun aylık eğitim aidatı, servis/etkinlik ücretleri ve geçmiş ödeme makbuzlarını buradan takip edebilirsiniz"
          icon={CreditCard}
          colorTheme="teal"
          badges={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 font-bold text-[11px] border border-teal-200/80 dark:border-teal-800/60">
              {parentInvoices.length} Fatura · {paidInvoicesCount} Ödendi
            </span>
          }
          actions={
            <div className="bg-[#FAF9F6] dark:bg-slate-900/80 border border-[#DDD4C4] dark:border-slate-800 px-4 py-2 rounded-2xl shrink-0 text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Kalan Toplam Borç</span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {formatCurrency(totalRemaining)}
              </div>
            </div>
          }
        />

        {/* Bank Wire Guide Box */}
        <div className="bg-teal-50/70 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800/60 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                Banka Havalesi / EFT ile Ödeme
              </h2>
              <p className="text-xs text-teal-800/80 dark:text-teal-300/80 mt-0.5">
                Ödeme yaparken lütfen açıklama kısmına <strong>öğrencinin adını, soyadını</strong>{' '}
                ve ilgili <strong>dönemi</strong> yazınız.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 shadow-2xs">
            TR33 0006 1000 0000 1234 5678 90
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">
            Dönem Faturaları & Makbuzlar
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Veriler yükleniyor...</div>
          ) : parentInvoices.length === 0 ? (
            <EmptyState
              title="Kayıtlı Fatura Bulunamadı"
              description="Çocuğunuza ait tanımlanmış bir aidat faturası bulunmamaktadır."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {parentInvoices.map((inv) => {
                const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                return (
                  <div
                    key={inv.id}
                    className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {inv.period} Dönemi Aidatı
                        </span>
                        {renderStatusBadge(inv.status, inv.dueDate, remaining)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>
                          Öğrenci: {inv.student?.firstName} {inv.student?.lastName}
                        </span>
                        <span>•</span>
                        <span>
                          Son Ödeme:{' '}
                          {new Date(inv.dueDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {inv.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                          Not: {inv.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          Toplam: {formatCurrency(inv.totalAmount)}
                        </div>
                        <div
                          className={`text-base font-black ${
                            remaining > 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {remaining > 0 ? `Kalan: ${formatCurrency(remaining)}` : 'Tamamı Ödendi'}
                        </div>
                      </div>

                      {inv.payments && inv.payments.length > 0 && (
                        <TactileButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setHistoryInvoice(inv)}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Makbuz ({inv.payments.length})</span>
                        </TactileButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Modal for Parent */}
        {historyInvoice && (
          <PaymentHistoryModal
            invoice={historyInvoice}
            onClose={() => setHistoryInvoice(null)}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // STAFF VIEW (Admin & Super Admin)
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Slim Page Hero Card */}
      <PageHeader
        title="Aidat & Tahsilat Yönetimi"
        description="Öğrenci aidat planları, tahsilat girişleri, faturalar ve veli borç takibi"
        icon={CreditCard}
        colorTheme="amber"
        badges={
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] border border-amber-200/80 dark:border-amber-800/60">
              {invoices.length} Kayıtlı Fatura
            </span>
            {overdueInvoices.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 font-bold text-[11px] border border-rose-300 dark:border-rose-700">
                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                {overdueInvoices.length} Gecikmede
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Geciken Fatura Yok
              </span>
            )}
          </>
        }
        actions={
          <>
            {/* Period Selector */}
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white dark:bg-slate-800 border-2 border-[#DDD4C4] dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-2xl px-3 py-1.5 pr-8 focus:outline-hidden focus:border-amber-600 appearance-none shadow-2xs cursor-pointer"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fatura Kes</span>
            </TactileButton>

            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => {
                const firstInv = invoices[0];
                if (firstInv) {
                  openPaymentModal(firstInv);
                } else {
                  showToast('Ödeme alınacak fatura bulunamadı.', 'info');
                }
              }}
              className="whitespace-nowrap text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 hover:border-amber-400"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>+ Tahsilat Al</span>
            </TactileButton>
          </>
        }
      />

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bu Ay Beklenen"
          value={stats ? formatCurrency(stats.expectedTotal) : '₺0'}
          subtitle={`${selectedPeriod} Dönemi`}
          icon={Calendar}
          variant="teal"
        />
        <StatCard
          title="Tahsil Edilen"
          value={stats ? formatCurrency(stats.collectedTotal) : '₺0'}
          subtitle="Toplanan Tutar"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Geciken Borç"
          value={stats ? formatCurrency(stats.overdueTotal) : '₺0'}
          subtitle={`${stats?.overdueInvoicesCount ?? 0} Fatura Vadesi Geçti`}
          icon={AlertTriangle}
          variant="rose"
        />
        <StatCard
          title="Tahsilat Oranı"
          value={stats ? `%${stats.collectionRate}` : '%0'}
          subtitle="Hedef %100"
          icon={TrendingUp}
          variant="amber"
          progressPercent={stats?.collectionRate ?? 0}
        />
      </div>

      {/* Tactile Tabs Track */}
      <TactileTabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id)} />

      {/* TAB 1: Geciken Ödemeler */}
      {activeTab === 'overdue' && (
        <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Vadesi Geçen & Ödenmemiş Aidatlar</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vadesi geçen faturalara tek tıkla veli hatırlatması gönderebilir veya hızlı tahsilat
                alabilirsiniz.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Yükleniyor...</div>
          ) : overdueInvoices.length === 0 ? (
            <EmptyState
              title="Harika! Geciken Ödeme Yok"
              description="Seçili dönem için vadesi geçmiş herhangi bir aidat borcu bulunmamaktadır."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {overdueInvoices.map((inv) => {
                const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                const isReminding = remindingIds.has(inv.id);
                const dueDate = new Date(inv.dueDate);
                const diffDays = Math.max(
                  1,
                  Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
                );

                return (
                  <div
                    key={inv.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs mt-0.5">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {inv.student?.firstName} {inv.student?.lastName}
                          </span>
                          {inv.student?.classroom && (
                            <Badge variant="info" size="sm">
                              {inv.student.classroom.name}
                            </Badge>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                            {diffDays} gün gecikti
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                          <span>Dönem: {inv.period}</span>
                          <span>•</span>
                          <span>Vade Tarihi: {dueDate.toLocaleDateString('tr-TR')}</span>
                          {inv.student?.parent?.email && (
                            <>
                              <span>•</span>
                              <span>Veli: {inv.student.parent.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          Toplam: {formatCurrency(inv.totalAmount)}
                        </div>
                        <div className="text-base font-black text-rose-600 dark:text-rose-400">
                          Kalan: {formatCurrency(remaining)}
                        </div>
                      </div>

                      <TactileButton
                        variant="secondary"
                        size="sm"
                        disabled={isReminding}
                        onClick={() => {
                          void handleSendReminder(inv.id);
                        }}
                      >
                        <Send className="w-3 h-3 text-teal-700" />
                        <span>{isReminding ? 'Gönderiliyor...' : 'Hatırlat'}</span>
                      </TactileButton>

                      <TactileButton variant="teal" size="sm" onClick={() => openPaymentModal(inv)}>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tahsil Et</span>
                      </TactileButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Tahsilat & Fatura Listesi */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Öğrenci veya sınıf ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-hidden focus:border-teal-600 text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Classroom filter */}
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">Tüm Sınıflar</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="PENDING">Bekleyenler</option>
                <option value="PARTIALLY_PAID">Kısmi Ödenenler</option>
                <option value="PAID">Ödenenler</option>
                <option value="OVERDUE">Gecikenler</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Yükleniyor...</div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              title="Fatura Bulunamadı"
              description="Arama kriterlerinize uygun dönem faturası bulunamadı."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DDD4C4] dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Öğrenci & Sınıf</th>
                    <th className="py-3 px-3">Dönem</th>
                    <th className="py-3 px-3">Toplam Tutar</th>
                    <th className="py-3 px-3">Ödenen</th>
                    <th className="py-3 px-3">Kalan Bakiye</th>
                    <th className="py-3 px-3">Son Ödeme</th>
                    <th className="py-3 px-3">Durum</th>
                    <th className="py-3 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredInvoices.map((inv) => {
                    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {inv.student?.firstName} {inv.student?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {inv.student?.classroom?.name || 'Sınıfsız'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {inv.period}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(inv.paidAmount)}
                        </td>
                        <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(remaining)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {new Date(inv.dueDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-3">
                          {renderStatusBadge(inv.status, inv.dueDate, remaining)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.payments && inv.payments.length > 0 && (
                              <button
                                type="button"
                                title="Ödeme Makbuzları"
                                onClick={() => setHistoryInvoice(inv)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            {remaining > 0 ? (
                              <TactileButton
                                variant="teal"
                                size="sm"
                                onClick={() => openPaymentModal(inv)}
                              >
                                <span>Tahsil Al</span>
                              </TactileButton>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-600">
                                Tamamlandı
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Öğrenci Ücret Planları */}
      {activeTab === 'plans' && (
        <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Öğrenci Aidat ve Fiyatlandırma Planları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Her öğrencinin kayıtlı taban aidatı, servis ücreti ve özel indirim oranları.
              </p>
            </div>
            <TactileButton variant="amber" size="sm" onClick={() => openEditPlanModal()}>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Plan Tanımla</span>
            </TactileButton>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Yükleniyor...</div>
          ) : plans.length === 0 ? (
            <EmptyState
              title="Tanımlı Plan Bulunamadı"
              description="Henüz hiçbir öğrenciye aidat planı tanımlanmamış. '+ Plan Tanımla' butonuyla başlayabilirsiniz."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DDD4C4] dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Öğrenci & Sınıf</th>
                    <th className="py-3 px-3">Taban Aidat</th>
                    <th className="py-3 px-3">Servis Ücreti</th>
                    <th className="py-3 px-3">Etkinlik/Yemek</th>
                    <th className="py-3 px-3">İndirim</th>
                    <th className="py-3 px-3">Net Aylık</th>
                    <th className="py-3 px-3">Vade Günü</th>
                    <th className="py-3 px-3">Durum</th>
                    <th className="py-3 px-3 text-right">Düzenle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {plans.map((p) => {
                    const gross = p.tuitionAmount + p.serviceAmount + p.activityAmount;
                    const net = gross * (1 - p.discountPercent / 100);
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          <div>
                            {p.student?.firstName} {p.student?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {p.student?.classroom?.name || 'Sınıfsız'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(p.tuitionAmount)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {p.serviceAmount > 0 ? formatCurrency(p.serviceAmount) : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {p.activityAmount > 0 ? formatCurrency(p.activityAmount) : '—'}
                        </td>
                        <td className="py-3 px-3">
                          {p.discountPercent > 0 ? (
                            <span className="font-bold text-emerald-600">%{p.discountPercent}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-black text-teal-800 dark:text-teal-300 text-sm">
                          {formatCurrency(net)}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          Her ayın {p.dueDayOfMonth}. günü
                        </td>
                        <td className="py-3 px-3">
                          {p.isActive ? (
                            <Badge variant="success" size="sm">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              Pasif
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <TactileButton
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditPlanModal(p)}
                          >
                            <span>Düzenle</span>
                          </TactileButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: Tahsilat Alma Modalı */}
      {/* ---------------------------------------------------- */}
      {isPaymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-700" />
                <span>Tahsilat Girişi Yap</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF9F6] dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedInvoiceForPayment.student?.firstName}{' '}
                {selectedInvoiceForPayment.student?.lastName}
              </div>
              <div className="text-slate-500">
                Dönem: {selectedInvoiceForPayment.period} · Toplam:{' '}
                {formatCurrency(selectedInvoiceForPayment.totalAmount)}
              </div>
              <div className="text-rose-600 dark:text-rose-400 font-bold">
                Kalan Borç Tutarı:{' '}
                {formatCurrency(
                  Math.max(
                    0,
                    selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount,
                  ),
                )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                void handleSavePayment(e);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tahsil Edilen Tutar (₺) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ödeme Yöntemi *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 cursor-pointer"
                >
                  <option value="BANK_TRANSFER">Banka Havalesi / EFT</option>
                  <option value="CREDIT_CARD">Kredi Kartı / POS</option>
                  <option value="CASH">Nakit Elden</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dekont / Referans No
                </label>
                <input
                  type="text"
                  placeholder="Örn: EFT-99212 veya POS Dekont No"
                  value={paymentRefNo}
                  onChange={(e) => setPaymentRefNo(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="İsteğe bağlı tahsilat notu..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="teal" size="sm" disabled={submittingPayment}>
                  {submittingPayment ? 'Kaydediliyor...' : 'Tahsilatı Onayla'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: Fatura Oluşturma Modalı */}
      {/* ---------------------------------------------------- */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>Yeni Dönem Faturası Kes</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreateInvoiceSubmit(e);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Öğrenci Seçiniz *
                </label>
                <select
                  required
                  value={invStudentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setInvStudentId(sid);
                    // auto fill from plan if exists
                    const p = plans.find((item) => item.studentId === sid);
                    if (p) {
                      const net =
                        (p.tuitionAmount + p.serviceAmount + p.activityAmount) *
                        (1 - p.discountPercent / 100);
                      setInvAmount(net.toString());
                    }
                  }}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 cursor-pointer"
                >
                  <option value="">-- Öğrenci Seçiniz --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dönem *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM"
                    value={invPeriod}
                    onChange={(e) => setInvPeriod(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Son Ödeme Vade Tarihi *
                </label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama / Kalem Notu
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: 2026 Ekim Aidatı + Kırtasiye bedeli dahil"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInvoiceModalOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="teal" size="sm" disabled={submittingInvoice}>
                  {submittingInvoice ? 'Oluşturuluyor...' : 'Faturayı Kes'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: Plan Düzenleme / Tanımlama Modalı */}
      {/* ---------------------------------------------------- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span>
                  {selectedPlanForEdit ? 'Ücret Planını Güncelle' : 'Yeni Öğrenci Planı Tanımla'}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleSavePlanSubmit(e);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Öğrenci Seçiniz *
                </label>
                <select
                  required
                  disabled={!!selectedPlanForEdit}
                  value={planStudentId}
                  onChange={(e) => setPlanStudentId(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 disabled:opacity-60 cursor-pointer"
                >
                  <option value="">-- Öğrenci Seçiniz --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aylık Taban Aidat (₺) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={planTuition}
                    onChange={(e) => setPlanTuition(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Servis Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={planService}
                    onChange={(e) => setPlanService(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Etkinlik/Yemek (₺)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={planActivity}
                    onChange={(e) => setPlanActivity(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={planDiscount}
                    onChange={(e) => setPlanDiscount(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vade Günü (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={planDueDay}
                    onChange={(e) => setPlanDueDay(e.target.value)}
                    className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Plan Notları
                </label>
                <textarea
                  rows={2}
                  placeholder="Kardeş indirimi, özel anlaşma koşulları vb."
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  className="w-full bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planIsActiveCheck"
                  checked={planIsActive}
                  onChange={(e) => setPlanIsActive(e.target.checked)}
                  className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label
                  htmlFor="planIsActiveCheck"
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Plan Aktif Olarak İşletilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPlanModalOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="amber" size="sm" disabled={submittingPlan}>
                  {submittingPlan ? 'Kaydediliyor...' : 'Planı Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: Ödeme Geçmişi ve Makbuz Dökümü Modalı */}
      {/* ---------------------------------------------------- */}
      {historyInvoice && (
        <PaymentHistoryModal
          invoice={historyInvoice}
          onClose={() => setHistoryInvoice(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

// --------------------------------------------------------
// Subcomponent: Payment History Receipt Modal
// --------------------------------------------------------
function PaymentHistoryModal({
  invoice,
  onClose,
  formatCurrency,
}: {
  invoice: BillingInvoice;
  onClose: () => void;
  formatCurrency: (n: number) => string;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DCD4C6] dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-700" />
            <span>Tahsilat Makbuzları & Geçmiş</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-slate-900/80 p-3.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 text-xs">
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            {invoice.student?.firstName} {invoice.student?.lastName}
          </div>
          <div className="text-slate-500 mt-0.5">
            {invoice.period} Dönemi · Toplam {formatCurrency(invoice.totalAmount)}
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {!invoice.payments || invoice.payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Henüz kaydedilmiş bir ödeme hareketi yok.
            </p>
          ) : (
            invoice.payments.map((p: PaymentTransaction) => {
              const methodLabels: Record<PaymentMethod, string> = {
                BANK_TRANSFER: 'Havale / EFT',
                CREDIT_CARD: 'Kredi Kartı',
                CASH: 'Nakit Elden',
                OTHER: 'Diğer',
              };
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {methodLabels[p.method] || p.method}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(p.paidAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {p.referenceNo ? ` · Ref: ${p.referenceNo}` : ''}
                    </div>
                    {p.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">{p.notes}</div>
                    )}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2">
          <TactileButton variant="secondary" size="sm" onClick={onClose}>
            Kapat
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
