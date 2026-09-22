import type {
  PickupAuthorizationRow,
  PickupContactRow,
  PickupEventRow,
} from '../repositories/pickup.repository';
import { PickupService } from './pickup.service';
import type { IPickupRepository } from '../repositories/pickup.repository';

const baseContact: PickupContactRow = {
  id: 'pc-1',
  tenantId: 't-1',
  studentId: 's-1',
  fullName: 'Ayşe Teyze',
  relation: 'Teyze',
  phone: '05551112233',
  identityNote: null,
  isActive: true,
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

const baseAuth: PickupAuthorizationRow = {
  id: 'pa-1',
  tenantId: 't-1',
  studentId: 's-1',
  pickupContactId: null,
  requestedById: 'parent-1',
  reviewedById: null,
  status: 'PENDING',
  validFrom: null,
  validUntil: null,
  note: null,
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

const baseEvent: PickupEventRow = {
  id: 'pe-1',
  tenantId: 't-1',
  studentId: 's-1',
  pickupContactId: null,
  authorizationId: null,
  pickupPersonName: 'Dede',
  pickupPersonPhone: null,
  verificationMethod: 'ID_CHECK',
  verifiedByUserId: 'teacher-1',
  occurredAt: new Date('2026-09-15T15:30:00Z'),
  note: null,
};

describe('PickupService', () => {
  let service: PickupService;
  let repo: jest.Mocked<IPickupRepository>;

  beforeEach(() => {
    repo = {
      listContacts: jest.fn(),
      createContact: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
      findContact: jest.fn(),
      listAuthorizations: jest.fn(),
      createAuthorization: jest.fn(),
      reviewAuthorization: jest.fn(),
      findAuthorization: jest.fn(),
      listEvents: jest.fn(),
      createEvent: jest.fn(),
    };
    service = new PickupService(repo);
  });

  describe('contacts', () => {
    it('lists contacts mapped to response', async () => {
      repo.listContacts.mockResolvedValue([baseContact]);
      const res = await service.listContacts('t-1', 's-1');
      expect(res[0]?.id).toBe('pc-1');
      expect(res[0]?.createdAt).toBe('2026-09-15T10:00:00.000Z');
    });

    it('creates contact with defaults', async () => {
      repo.createContact.mockResolvedValue(baseContact);
      await service.createContact('t-1', {
        studentId: 's-1',
        fullName: 'Ayşe Teyze',
        relation: 'Teyze',
        phone: '05551112233',
      });
      expect(repo.createContact).toHaveBeenCalledWith('t-1', {
        studentId: 's-1',
        fullName: 'Ayşe Teyze',
        relation: 'Teyze',
        phone: '05551112233',
        identityNote: null,
        isActive: true,
      });
    });

    it('updates contact with partial fields', async () => {
      repo.findContact.mockResolvedValue(baseContact);
      repo.updateContact.mockResolvedValue({ ...baseContact, phone: '05550000000' });
      const res = await service.updateContact('t-1', 'pc-1', { phone: '05550000000' });
      expect(res.phone).toBe('05550000000');
    });

    it('throws when updating missing contact', async () => {
      repo.findContact.mockResolvedValue(null);
      await expect(
        service.updateContact('t-1', 'missing', { phone: '05550000000' }),
      ).rejects.toThrow('PickupContact not found');
    });

    it('deletes contact', async () => {
      repo.findContact.mockResolvedValue(baseContact);
      repo.deleteContact.mockResolvedValue();
      await service.deleteContact('t-1', 'pc-1');
      expect(repo.deleteContact).toHaveBeenCalledWith('t-1', 'pc-1');
    });
  });

  describe('authorizations', () => {
    it('creates authorization as PENDING with requestedById', async () => {
      repo.createAuthorization.mockResolvedValue(baseAuth);
      await service.createAuthorization('t-1', 'parent-1', { studentId: 's-1' });
      expect(repo.createAuthorization).toHaveBeenCalledWith('t-1', {
        studentId: 's-1',
        pickupContactId: null,
        requestedById: 'parent-1',
        status: 'PENDING',
        validFrom: null,
        validUntil: null,
        note: null,
      });
    });

    it('approves authorization with reviewer id', async () => {
      repo.findAuthorization.mockResolvedValue(baseAuth);
      repo.reviewAuthorization.mockResolvedValue({ ...baseAuth, status: 'APPROVED' });
      const res = await service.reviewAuthorization(
        't-1',
        'pa-1',
        'admin-1',
        { status: 'APPROVED', validFrom: new Date('2026-09-16') },
      );
      expect(res.status).toBe('APPROVED');
      expect(repo.reviewAuthorization).toHaveBeenCalledWith(
        't-1',
        'pa-1',
        expect.objectContaining({
          status: 'APPROVED',
          reviewedBy: { connect: { id: 'admin-1' } },
        }),
      );
    });
  });

  describe('events', () => {
    it('lists events ordered desc by occurredAt', async () => {
      repo.listEvents.mockResolvedValue([baseEvent]);
      const res = await service.listEvents('t-1', { studentId: 's-1' });
      expect(res[0]?.id).toBe('pe-1');
      expect(res[0]?.verificationMethod).toBe('ID_CHECK');
    });

    it('creates event with verifiedByUserId', async () => {
      repo.createEvent.mockResolvedValue(baseEvent);
      await service.createEvent('t-1', 'teacher-1', {
        studentId: 's-1',
        pickupPersonName: 'Dede',
        verificationMethod: 'ID_CHECK',
      });
      expect(repo.createEvent).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({ verifiedByUserId: 'teacher-1', studentId: 's-1' }),
      );
    });
  });
});
