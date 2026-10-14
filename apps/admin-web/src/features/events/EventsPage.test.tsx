import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsPage } from './EventsPage';
import * as consentsApi from '../../api/consents';
import * as classroomsApi from '../../api/classrooms';
import type { Classroom, EventConsent } from '@kidscare/shared-types';

const mockUseAuth = vi.fn();
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/consents');
vi.mock('../../api/classrooms');

const mockEvent: EventConsent = {
  id: 'consent-1',
  tenantId: 't-1',
  title: 'Atatürk Arboretumu Gezisi',
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Sarıyer, İstanbul',
  price: 150,
  description: 'Doğa keşif gezimiz.',
  status: 'ACTIVE',
  createdById: 'admin-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  classroom: { id: 'class-1', name: 'Arılar Sınıfı' },
  stats: {
    totalStudents: 10,
    approvedCount: 3,
    declinedCount: 1,
    pendingCount: 6,
  },
  responses: [
    {
      id: 'resp-1',
      tenantId: 't-1',
      consentId: 'consent-1',
      studentId: 's-1',
      parentUserId: 'parent-1',
      decision: 'APPROVED',
      respondedAt: new Date().toISOString(),
      student: { id: 's-1', firstName: 'Ada', lastName: 'Yılmaz' },
      parentUser: { id: 'parent-1', email: 'parent@demo.test' },
      notes: 'Araç tutması var',
    },
  ],
};

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(classroomsApi.listClassrooms).mockResolvedValue([
      { id: 'class-1', name: 'Arılar Sınıfı' } as unknown as Classroom,
    ]);
    vi.mocked(consentsApi.getEventConsents).mockResolvedValue([mockEvent]);
    vi.mocked(consentsApi.getEventConsent).mockResolvedValue(mockEvent);
    vi.mocked(consentsApi.createEventConsent).mockResolvedValue(mockEvent);
    vi.mocked(consentsApi.respondEventConsent).mockResolvedValue(mockEvent.responses![0]!);
  });

  it('renders staff view with create button and event list', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);

    expect(await screen.findByText('Geziler & İzin Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Yeni Gezi / Etkinlik Oluştur')).toBeInTheDocument();
    expect(screen.getByText('Atatürk Arboretumu Gezisi')).toBeInTheDocument();
    expect(screen.getByText('3 İzin Verildi')).toBeInTheDocument();
    expect(screen.getByText('150 TL')).toBeInTheDocument();
  });

  it('allows staff to open create event modal and submit', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);
    const createBtn = await screen.findByText('Yeni Gezi / Etkinlik Oluştur');
    await user.click(createBtn);

    expect(screen.getByText('Yeni Gezi & İzin Formu Oluştur')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('Örn: Atatürk Arboretumu & Doğa Keşif Gezisi');
    await user.type(titleInput, 'Müze Gezisi');

    const submitBtn = screen.getByText('Gezil & İzin Formunu Başlat');
    await user.click(submitBtn);

    // Form validation will check eventDate, so it stays on modal if missing
    expect(screen.getByText('Yeni Gezi & İzin Formu Oluştur')).toBeInTheDocument();
  });

  it('allows staff to view passenger / roster list modal', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);
    const rosterBtn = await screen.findByText('Servis & Katılımcı Listesi');
    await user.click(rosterBtn);

    expect(
      await screen.findByRole('heading', { name: /Servis & Katılımcı Listesi/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Araç tutması var')).toBeInTheDocument();
  });

  it('renders parent view with tabs and permits permission response', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'parent-1', role: 'PARENT', tenantId: 't-1', email: 'parent@demo.test' },
      },
    });

    render(<EventsPage />);

    expect(await screen.findByText('Onay Bekleyen & Yaklaşan Geziler')).toBeInTheDocument();
    expect(screen.getByText('Geçmiş Gezilerimiz')).toBeInTheDocument();
    expect(screen.getByText('Atatürk Arboretumu Gezisi')).toBeInTheDocument();
    expect(screen.getByText('İzin Veriyorum')).toBeInTheDocument();
    expect(screen.getByText('Katılmayacak')).toBeInTheDocument();

    const noteInput = screen.getByPlaceholderText(
      'Örn: Araç tutması, astım veya özel hassasiyet...',
    );
    await user.type(noteInput, 'Güneş kremi sürüldü');

    const approveBtn = screen.getByText('İzin Veriyorum');
    await user.click(approveBtn);

    await waitFor(() => {
      expect(consentsApi.respondEventConsent).toHaveBeenCalledWith(
        'consent-1',
        expect.objectContaining({
          decision: 'APPROVED',
          notes: 'Güneş kremi sürüldü',
        }),
      );
    });
  });
});
