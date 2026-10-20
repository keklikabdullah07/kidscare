import { ConsentsController } from './consents.controller';
import type { ConsentsService } from '../services/consents.service';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import type {
  ConsentCreatedWithRelations,
  ConsentResponseWithStudent,
  ConsentWithRelations,
} from '../repositories/consents.repository';

describe('ConsentsController', () => {
  let controller: ConsentsController;
  let service: jest.Mocked<ConsentsService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      respond: jest.fn(),
      cancel: jest.fn(),
    } as unknown as jest.Mocked<ConsentsService>;

    controller = new ConsentsController(service);
  });

  describe('create', () => {
    it('creates an event consent', async () => {
      service.create.mockResolvedValue({
        id: 'consent-1',
        title: 'Tiyatro',
      } as unknown as ConsentCreatedWithRelations);
      const user: CurrentUserPayload = {
        userId: 'admin-1',
        role: 'ADMIN',
        tenantId: 't-1',
      };
      const res = await controller.create('t-1', user, {
        title: 'Tiyatro Gezisi',
        eventDate: '2026-10-25T10:00:00Z',
      });
      expect(res.id).toBe('consent-1');
      expect(service.create).toHaveBeenCalledWith(
        't-1',
        'admin-1',
        expect.objectContaining({
          title: 'Tiyatro Gezisi',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns consents list', async () => {
      service.findAll.mockResolvedValue([{ id: 'consent-1' } as unknown as ConsentWithRelations]);
      const user: CurrentUserPayload = {
        userId: 'parent-1',
        role: 'PARENT',
        tenantId: 't-1',
      };
      const res = await controller.findAll('t-1', user);
      expect(res).toHaveLength(1);
    });
  });

  describe('respond', () => {
    it('records parent decision', async () => {
      service.respond.mockResolvedValue({
        id: 'resp-1',
        decision: 'APPROVED',
      } as unknown as ConsentResponseWithStudent);
      const user: CurrentUserPayload = {
        userId: 'parent-1',
        role: 'PARENT',
        tenantId: 't-1',
      };
      const res = await controller.respond('t-1', user, 'consent-1', {
        studentId: 'student-1',
        decision: 'APPROVED',
      });
      expect(res.decision).toBe('APPROVED');
      expect(service.respond).toHaveBeenCalledWith(
        't-1',
        expect.anything(),
        'consent-1',
        expect.objectContaining({
          studentId: 'student-1',
          decision: 'APPROVED',
        }),
      );
    });
  });

  describe('cancel', () => {
    it('cancels consent by staff', async () => {
      service.cancel.mockResolvedValue({
        id: 'consent-1',
        status: 'CANCELLED',
      } as unknown as ConsentWithRelations);
      const user: CurrentUserPayload = {
        userId: 'admin-1',
        role: 'ADMIN',
        tenantId: 't-1',
      };
      const res = await controller.cancel('t-1', user, 'consent-1', { reason: 'Hava durumu' });
      expect(res.status).toBe('CANCELLED');
      expect(service.cancel).toHaveBeenCalledWith(
        't-1',
        { userId: 'admin-1', role: 'ADMIN' },
        'consent-1',
        'Hava durumu',
      );
    });
  });
});
