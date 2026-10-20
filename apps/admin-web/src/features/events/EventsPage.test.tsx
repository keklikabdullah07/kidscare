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
    vi.mocked(consentsApi.cancelEventConsent).mockResolvedValue({
      ...mockEvent,
      status: 'CANCELLED',
    });
  });

  it('renders staff view with create button and event list', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);

    expect(await screen.findByText('Etkinlikler & İzin Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Dış Geziler (İzin & Servis)')).toBeInTheDocument();
    expect(screen.getByText('Okul İçi Etkinlikler & Atölyeler')).toBeInTheDocument();
    expect(screen.getByText('Genel İzin & Onay Formları')).toBeInTheDocument();
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

  it('switches between master tabs (in_school, forms, trips)', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);

    // Click on Okul İçi Etkinlikler tab
    const inSchoolTab = await screen.findByText('Okul İçi Etkinlikler & Atölyeler');
    await user.click(inSchoolTab);

    expect(screen.getByText('Kurum İçi Etkinlikler, Gösteriler & Atölyeler')).toBeInTheDocument();
    expect(screen.getByText('🎨 Kil & Çömlek Atölyesi Günü')).toBeInTheDocument();

    // Click on Genel İzin & Onay Formları tab
    const formsTab = screen.getByText('Genel İzin & Onay Formları');
    await user.click(formsTab);

    expect(screen.getByText('Resmi İzin & Yasal Onay Belgeleri')).toBeInTheDocument();
    expect(screen.getByText(/KVKK & Medya Paylaşım İzni/)).toBeInTheDocument();

    // Switch back to Trips
    const tripsTab = screen.getByText('Dış Geziler (İzin & Servis)');
    await user.click(tripsTab);

    expect(screen.getByText('Atatürk Arboretumu Gezisi')).toBeInTheDocument();
  });

  it('allows staff to add a new in-school workshop via modal', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);

    // Switch to Okul İçi Etkinlikler
    const inSchoolTab = await screen.findByText('Okul İçi Etkinlikler & Atölyeler');
    await user.click(inSchoolTab);

    // Look for Yeni Atölye Ekle button
    const addWorkshopBtn = screen.getByText('Yeni Atölye Ekle');
    await user.click(addWorkshopBtn);

    expect(screen.getByText('Yeni Okul İçi Atölye / Etkinlik Ekle')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(
      'Örn: 🎨 Ebru Sanatı Atölyesi veya 🔬 Yanardağ Deneyi',
    );
    await user.type(titleInput, '🎨 Ebru Sanatı Atölyesi');

    const descInput = screen.getByPlaceholderText(
      'Atölyenin amacı, çocuklara katacağı beceriler ve etkinlik süreci...',
    );
    await user.type(descInput, 'Geleneksel Türk el sanatları ebru çalışması.');

    const submitBtn = screen.getByText('Atölyeyi Ekle');
    await user.click(submitBtn);

    // Modal should close and new workshop should appear
    expect(screen.queryByText('Yeni Okul İçi Atölye / Etkinlik Ekle')).not.toBeInTheDocument();
    expect(screen.getByText('🎨 Ebru Sanatı Atölyesi')).toBeInTheDocument();
    expect(screen.getByText(/Geleneksel Türk el sanatları ebru çalışması/)).toBeInTheDocument();
  });

  it('allows staff to cancel an event from the card via ConfirmModal', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'admin-1', role: 'ADMIN', tenantId: 't-1', email: 'admin@demo.test' },
      },
    });

    render(<EventsPage />);
    const cancelBtn = await screen.findByRole('button', { name: /İptal Et/i });
    await user.click(cancelBtn);

    // ConfirmModal should appear
    expect(screen.getByText('Geziyi İptal Etmek İstiyor Musunuz?')).toBeInTheDocument();
    const modalConfirmBtn = screen.getByRole('button', { name: 'Evet, Geziyi İptal Et' });
    await user.click(modalConfirmBtn);

    expect(consentsApi.cancelEventConsent).toHaveBeenCalledWith('consent-1');
  });

  it('allows parent to cancel their previous permission via ConfirmModal', async () => {
    const user = userEvent.setup();
    const parentEvent: EventConsent = {
      ...mockEvent,
      myResponse: {
        id: 'resp-1',
        tenantId: 't-1',
        consentId: 'consent-1',
        studentId: 's-1',
        parentUserId: 'parent-1',
        decision: 'APPROVED',
        respondedAt: new Date().toISOString(),
      },
    };
    vi.mocked(consentsApi.getEventConsents).mockResolvedValue([parentEvent]);

    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'parent-1', role: 'PARENT', tenantId: 't-1', email: 'parent@demo.test' },
      },
    });

    render(<EventsPage />);
    const cancelPermBtn = await screen.findByRole('button', {
      name: /İzni İptal Et \(Katılmayacak\)/i,
    });
    await user.click(cancelPermBtn);

    // ConfirmModal should appear
    expect(screen.getByText('Gezi İznini İptal Et')).toBeInTheDocument();
    const modalConfirmBtn = screen.getByRole('button', { name: 'Evet, İznimi İptal Et' });
    await user.click(modalConfirmBtn);

    expect(consentsApi.respondEventConsent).toHaveBeenCalledWith(
      'consent-1',
      expect.objectContaining({
        studentId: 's-1',
        decision: 'DECLINED',
      }),
    );
  });

  it('allows staff to cancel a student permission in roster modal via ConfirmModal', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'teacher-1', role: 'TEACHER', tenantId: 't-1', email: 'teacher@demo.test' },
      },
    });

    render(<EventsPage />);
    const rosterBtn = await screen.findByText('Servis & Katılımcı Listesi');
    await user.click(rosterBtn);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Servis & Katılımcı Listesi/ }),
      ).toBeInTheDocument();
    });

    // In the roster table, Ada Yılmaz has decision APPROVED, should have İzni İptal Et button
    const cancelStudentBtn = await screen.findByRole('button', { name: 'İzni İptal Et' });
    await user.click(cancelStudentBtn);

    // ConfirmModal should appear
    expect(screen.getByText('Öğrenci İznini İptal Et')).toBeInTheDocument();
    const modalConfirmBtn = screen.getByRole('button', { name: 'Evet, İzni İptal Et' });
    await user.click(modalConfirmBtn);

    expect(consentsApi.respondEventConsent).toHaveBeenCalledWith(
      'consent-1',
      expect.objectContaining({
        studentId: 's-1',
        decision: 'DECLINED',
      }),
    );
  });
});
