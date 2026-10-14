import { DevelopmentService } from './development.service';
import type { DevelopmentRepository } from '../repositories/development.repository';
import type { NotificationsService } from '../../notifications/services/notifications.service';

describe('DevelopmentService', () => {
  let service: DevelopmentService;
  let repo: jest.Mocked<DevelopmentRepository>;
  let notif: jest.Mocked<NotificationsService>;

  beforeEach(() => {
    repo = {
      listObservations: jest.fn(),
      createObservation: jest.fn(),
      listPortfolioItems: jest.fn(),
      createPortfolioItem: jest.fn(),
      listHomeActivities: jest.fn(),
      createHomeActivity: jest.fn(),
    } as unknown as jest.Mocked<DevelopmentRepository>;

    notif = {
      notifyStudentParents: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationsService>;

    service = new DevelopmentService(repo, notif);
  });

  it('notifies parents when isParentVisible observation is created', async () => {
    repo.createObservation.mockResolvedValue({
      id: 'obs-1',
      tenantId: 't-1',
      studentId: 's-1',
      teacherId: 'teacher-1',
      domain: 'MOTOR',
      skillName: 'İnce Motor',
      observation: 'Makasla kağıt kesti.',
      isParentVisible: true,
      observedAt: new Date('2026-10-14T10:00:00Z'),
      createdAt: new Date('2026-10-14T10:00:00Z'),
      updatedAt: new Date('2026-10-14T10:00:00Z'),
      student: { id: 's-1', firstName: 'Ali', lastName: 'Yılmaz' },
      teacher: { id: 'teacher-1', email: 'teacher@demo.test' },
    });

    const res = await service.createObservation('t-1', 'teacher-1', {
      studentId: 's-1',
      domain: 'MOTOR',
      skillName: 'İnce Motor',
      observation: 'Makasla kağıt kesti.',
      isParentVisible: true,
    });

    expect(res.id).toBe('obs-1');
    expect(notif.notifyStudentParents).toHaveBeenCalledWith(
      't-1',
      's-1',
      expect.objectContaining({
        title: expect.stringContaining('Gelişim'),
        body: expect.stringContaining('İnce Motor'),
      }),
    );
  });

  it('does not notify parents when observation is not isParentVisible', async () => {
    repo.createObservation.mockResolvedValue({
      id: 'obs-2',
      tenantId: 't-1',
      studentId: 's-1',
      teacherId: 'teacher-1',
      domain: 'SOSYAL_DUYGUSAL',
      skillName: 'Sosyal Uyum',
      observation: 'Öğretmen içi not.',
      isParentVisible: false,
      observedAt: new Date('2026-10-14T10:00:00Z'),
      createdAt: new Date('2026-10-14T10:00:00Z'),
      updatedAt: new Date('2026-10-14T10:00:00Z'),
      student: { id: 's-1', firstName: 'Ali', lastName: 'Yılmaz' },
      teacher: { id: 'teacher-1', email: 'teacher@demo.test' },
    });

    await service.createObservation('t-1', 'teacher-1', {
      studentId: 's-1',
      domain: 'SOSYAL_DUYGUSAL',
      skillName: 'Sosyal Uyum',
      observation: 'Öğretmen içi not.',
      isParentVisible: false,
    });

    expect(notif.notifyStudentParents).not.toHaveBeenCalled();
  });
});
