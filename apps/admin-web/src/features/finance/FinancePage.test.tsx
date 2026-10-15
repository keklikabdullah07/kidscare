import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinancePage } from './FinancePage';
import * as financeApi from '../../api/finance';
import * as studentsApi from '../../api/students';
import * as classroomsApi from '../../api/classrooms';
import type {
  BillingInvoice,
  Classroom,
  FinanceSummaryStats,
  Student,
  StudentBillingPlan,
} from '@kidscare/shared-types';

const mockUseAuth = vi.fn();
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockShowToast = vi.fn();
vi.mock('../../components/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../../api/finance');
vi.mock('../../api/students');
vi.mock('../../api/classrooms');

const mockStats: FinanceSummaryStats = {
  expectedTotal: 150000,
  collectedTotal: 100000,
  overdueTotal: 50000,
  collectionRate: 66.7,
  activePlansCount: 15,
  overdueInvoicesCount: 2,
};

const mockInvoice: BillingInvoice = {
  id: 'inv-1',
  tenantId: 't-1',
  studentId: 's-1',
  period: '2026-10',
  totalAmount: 15000,
  paidAmount: 5000,
  dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'OVERDUE',
  notes: 'Ekim aidatı',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  student: {
    id: 's-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    classroom: { id: 'c-1', name: 'Yıldızlar' },
    parent: { id: 'p-1', email: 'parent@demo.test' },
  },
  payments: [
    {
      id: 'pay-1',
      tenantId: 't-1',
      invoiceId: 'inv-1',
      studentId: 's-1',
      amount: 5000,
      method: 'BANK_TRANSFER',
      paidAt: new Date().toISOString(),
      referenceNo: 'EFT-1234',
      recordedByUserId: 'admin-1',
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockPlan: StudentBillingPlan = {
  id: 'plan-1',
  tenantId: 't-1',
  studentId: 's-1',
  tuitionAmount: 15000,
  serviceAmount: 2000,
  activityAmount: 1000,
  discountPercent: 10,
  dueDayOfMonth: 5,
  notes: 'Kardeş indirimi uygulandı',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  student: {
    id: 's-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    classroom: { id: 'c-1', name: 'Yıldızlar' },
  },
};

const mockStudent = {
  id: 's-1',
  tenantId: 't-1',
  firstName: 'Ada',
  lastName: 'Yılmaz',
  dateOfBirth: '2021-05-10',
  classroomId: 'c-1',
  parentId: 'p-1',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as unknown as Student;

describe('FinancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeApi.getFinanceStats).mockResolvedValue(mockStats);
    vi.mocked(financeApi.listInvoices).mockResolvedValue([mockInvoice]);
    vi.mocked(financeApi.listBillingPlans).mockResolvedValue([mockPlan]);
    vi.mocked(financeApi.getMyChildBilling).mockResolvedValue([mockInvoice]);
    vi.mocked(studentsApi.listStudents).mockResolvedValue([mockStudent]);
    vi.mocked(classroomsApi.listClassrooms).mockResolvedValue([
      { id: 'c-1', name: 'Yıldızlar' } as unknown as Classroom,
    ]);
  });

  it('renders staff view with KPI cards, tabs and overdue invoices', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<FinancePage />);

    expect(await screen.findByText('Aidat & Tahsilat Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Bu Ay Beklenen')).toBeInTheDocument();
    expect(screen.getByText('Tahsil Edilen')).toBeInTheDocument();
    expect(screen.getByText('Geciken Borç')).toBeInTheDocument();
    expect(screen.getByText('Tahsilat Oranı')).toBeInTheDocument();

    expect(screen.getByText('Geciken Ödemeler')).toBeInTheDocument();
    expect(screen.getByText('Tahsilat & Fatura Listesi')).toBeInTheDocument();
    expect(screen.getByText('Öğrenci Ücret Planları')).toBeInTheDocument();

    expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Kalan: ₺10.000')).toBeInTheDocument();
  });

  it('allows staff to trigger payment reminder notification', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });
    vi.mocked(financeApi.sendPaymentReminder).mockResolvedValue({
      success: true,
      message: 'Ada Yılmaz velisine ödeme hatırlatması iletildi.',
    });

    render(<FinancePage />);

    const remindBtn = await screen.findByText('Hatırlat');
    await user.click(remindBtn);

    await waitFor(() => {
      expect(financeApi.sendPaymentReminder).toHaveBeenCalledWith('inv-1');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Ada Yılmaz velisine ödeme hatırlatması iletildi.',
        'success',
      );
    });
  });

  it('allows switching to Invoices tab and displays filtered invoices', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<FinancePage />);

    const invoicesTab = await screen.findByText('Tahsilat & Fatura Listesi');
    await user.click(invoicesTab);

    expect(screen.getByPlaceholderText('Öğrenci veya sınıf ara...')).toBeInTheDocument();
    expect(screen.getByText('Toplam Tutar')).toBeInTheDocument();
    expect(screen.getByText('Kalan Bakiye')).toBeInTheDocument();
  });

  it('renders parent view with balance and payment instructions', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'parent-1', role: 'PARENT', tenantId: 't-1', email: 'parent@demo.test' },
      },
    });

    render(<FinancePage />);

    expect(await screen.findByText('Öğrenci Aidat & Ödeme Dökümü')).toBeInTheDocument();
    expect(screen.getByText('Kalan Toplam Borç')).toBeInTheDocument();
    expect(screen.getByText('Banka Havalesi / EFT ile Ödeme')).toBeInTheDocument();
    expect(screen.getByText(/TR33 0006 1000 0000 1234 5678 90/)).toBeInTheDocument();
  });
});
