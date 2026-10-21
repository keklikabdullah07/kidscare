import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastPage } from './BroadcastPage';
import * as broadcastApi from '../../api/broadcast';
import * as classroomsApi from '../../api/classrooms';
import * as studentsApi from '../../api/students';
import type { Classroom, Student, BroadcastLog, BroadcastStatsDto } from '@kidscare/shared-types';

const mockUseAuth = vi.fn();
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/broadcast');
vi.mock('../../api/classrooms');
vi.mock('../../api/students');

const mockStats: BroadcastStatsDto = {
  totalBroadcasts: 8,
  thisMonthBroadcasts: 3,
  urgentBroadcasts: 1,
  totalDelivered: 124,
};

const mockLogs: BroadcastLog[] = [
  {
    id: 'b-1',
    tenantId: 't-1',
    senderId: 'u-1',
    senderName: 'Müdür Ahmet',
    title: 'Hava Durumu Bilgilendirmesi',
    body: 'Yoğun kar yağışı nedeniyle servisler erkene alınmıştır.',
    targetType: 'ALL_DAYCARE',
    targetName: 'Tüm Kreş',
    priority: 'URGENT',
    recipientCount: 42,
    deliveredCount: 42,
    channels: ['PUSH'],
    createdAt: '2026-10-18T10:00:00.000Z',
  },
];

const mockClassrooms: Classroom[] = [
  {
    id: 'c-1',
    tenantId: 't-1',
    name: 'Papatyalar Sınıfı',
    ageGroup: '4-5 Yaş',
    isActive: true,
    teachers: [],
    studentCount: 15,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const mockStudents: Student[] = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: '2021-05-10',
    gender: 'FEMALE',
    classroomId: 'c-1',
    parentId: 'p-1',
    notes: null,
    deletedAt: null,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('BroadcastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'u-1', email: 'admin@demo.test', role: 'ADMIN' },
    });
    vi.mocked(broadcastApi.fetchBroadcastStats).mockResolvedValue(mockStats);
    vi.mocked(broadcastApi.fetchBroadcastHistory).mockResolvedValue(mockLogs);
    vi.mocked(classroomsApi.listClassrooms).mockResolvedValue(mockClassrooms);
    vi.mocked(studentsApi.listStudents).mockResolvedValue(mockStudents);
    vi.mocked(broadcastApi.sendBroadcast).mockResolvedValue({
      success: true,
      log: mockLogs[0]!,
    });
  });

  it('renders page header and stat cards properly', async () => {
    render(<BroadcastPage />);

    expect(screen.getByText('Toplu Duyuru & Bildirim Merkezi')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Toplam Duyuru')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Acil Bildirimler')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('allows applying quick templates and reflects on form and live preview', async () => {
    const user = userEvent.setup();
    render(<BroadcastPage />);

    await waitFor(() => {
      expect(screen.getByText('Kar Tatili & Hava Muhalefeti')).toBeInTheDocument();
    });

    // Click quick template
    await user.click(screen.getByText('Kar Tatili & Hava Muhalefeti'));

    // Check input is populated
    const titleInput = screen.getByPlaceholderText(/Örn: 2026 Bahar Şenliği/i);
    expect(titleInput).toHaveValue('Hava Muhalefeti Nedeniyle Eğitime Ara Verilmiştir');

    // Check smartphone preview shows updated title
    expect(
      screen.getAllByText('Hava Muhalefeti Nedeniyle Eğitime Ara Verilmiştir').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('switches to history tab and displays past broadcasts', async () => {
    const user = userEvent.setup();
    render(<BroadcastPage />);

    await waitFor(() => {
      expect(screen.getByText(/Gönderim Geçmişi/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Gönderim Geçmişi/i }));

    await waitFor(() => {
      expect(screen.getByText('Hava Durumu Bilgilendirmesi')).toBeInTheDocument();
      expect(screen.getByText('42 Alıcıya İletildi')).toBeInTheDocument();
      expect(screen.getByText('Müdür Ahmet')).toBeInTheDocument();
    });
  });

  it('validates empty inputs before sending', async () => {
    const user = userEvent.setup();
    render(<BroadcastPage />);

    await waitFor(() => {
      expect(screen.getByText('Duyuruyu Şimdi Gönder')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Duyuruyu Şimdi Gönder'));

    expect(screen.getByText('Lütfen başlık ve mesaj içeriğini doldurunuz.')).toBeInTheDocument();
  });

  it('isolates target audience for TEACHER role and hides ALL_DAYCARE and TEACHERS_ONLY', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u-teacher', email: 'teacher@demo.test', role: 'TEACHER' },
    });

    render(<BroadcastPage />);

    await waitFor(() => {
      expect(screen.getByText('Sınıf Bazlı')).toBeInTheDocument();
    });

    expect(screen.getByText('Öğrenci Bazlı')).toBeInTheDocument();
    expect(screen.queryByText('Tüm Kreş')).not.toBeInTheDocument();
    expect(screen.queryByText('Öğretmenler')).not.toBeInTheDocument();
  });
});
