import { ParentController } from './parent.controller';
import type { ParentService } from '../services/parent.service';
import type { ParentChildOverview } from '@kidscare/shared-types';

describe('ParentController', () => {
  let controller: ParentController;
  let service: jest.Mocked<ParentService>;

  const mockOverview: ParentChildOverview = {
    student: {
      id: 's-1',
      tenantId: 't-1',
      firstName: 'Ada',
      lastName: 'Yılmaz',
      dateOfBirth: '2020-05-12',
      gender: 'female',
      notes: null,
      passport: null,
      isActive: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      deletedAt: null,
    },
    todayAttendance: {
      id: 'att-1',
      tenantId: 't-1',
      studentId: 's-1',
      date: '2026-09-15',
      status: 'PRESENT',
      checkInTime: '08:30',
      checkInBy: 'Anne',
      checkOutTime: null,
      checkOutBy: null,
      pickupContactId: null,
      pickupNote: null,
      note: null,
      createdAt: '2026-09-15',
      updatedAt: '2026-09-15',
    },
    todayDailyReport: null,
  };

  beforeEach(() => {
    service = {
      getChildrenOverview: jest.fn(),
    } as unknown as jest.Mocked<ParentService>;

    controller = new ParentController(service);
  });

  describe('getChildren', () => {
    it('calls service with current user and returns children overviews', async () => {
      service.getChildrenOverview.mockResolvedValue([mockOverview]);

      const res = await controller.getChildren(
        { userId: 'u-1', tenantId: 't-1', role: 'PARENT' },
        '2026-09-15',
      );

      expect(res).toHaveLength(1);
      expect(res[0]?.student.firstName).toBe('Ada');
      expect(service.getChildrenOverview).toHaveBeenCalledWith(
        't-1',
        'u-1',
        'PARENT',
        '2026-09-15',
      );
    });
  });
});
