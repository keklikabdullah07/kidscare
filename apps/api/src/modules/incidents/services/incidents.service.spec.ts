import { NotFoundException } from '@nestjs/common';
import type { IncidentRow } from '../repositories/incidents.repository';
import { IncidentsService } from './incidents.service';
import type { IIncidentsRepository } from '../repositories/incidents.repository';

const baseIncident: IncidentRow = {
  id: 'i-1',
  tenantId: 't-1',
  studentId: 's-1',
  category: 'DUSME',
  occurredAt: new Date('2026-09-15T10:00:00Z'),
  description: 'Bahçede düştü',
  actionTaken: null,
  parentNotified: false,
  parentNotifiedAt: null,
  parentNotifiedById: null,
  reportedById: 'teacher-1',
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

describe('IncidentsService', () => {
  let service: IncidentsService;
  let repo: jest.Mocked<IIncidentsRepository>;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    service = new IncidentsService(repo);
  });

  it('lists incidents mapped to response', async () => {
    repo.list.mockResolvedValue([baseIncident]);
    const res = await service.list('t-1', { studentId: 's-1' });
    expect(res[0]?.id).toBe('i-1');
    expect(res[0]?.category).toBe('DUSME');
  });

  it('creates incident with reporter id and default parentNotified=false', async () => {
    repo.create.mockResolvedValue(baseIncident);
    await service.create('t-1', 'teacher-1', {
      studentId: 's-1',
      category: 'DUSME',
      occurredAt: new Date('2026-09-15T10:00:00Z'),
      description: 'Bahçede düştü',
    });
    expect(repo.create).toHaveBeenCalledWith('t-1', {
      studentId: 's-1',
      category: 'DUSME',
      occurredAt: expect.any(Date),
      description: 'Bahçede düştü',
      actionTaken: null,
      parentNotified: false,
      reportedById: 'teacher-1',
    });
  });

  it('updates incident with parent notification tracking', async () => {
    repo.find.mockResolvedValue(baseIncident);
    repo.update.mockResolvedValue({
      ...baseIncident,
      parentNotified: true,
      parentNotifiedAt: new Date('2026-09-15T10:30:00Z'),
      parentNotifiedById: 'teacher-1',
    });
    const res = await service.update('t-1', 'i-1', 'teacher-1', { parentNotified: true });
    expect(res.parentNotified).toBe(true);
    expect(res.parentNotifiedById).toBe('teacher-1');
    expect(repo.update).toHaveBeenCalledWith(
      't-1',
      'i-1',
      expect.objectContaining({
        parentNotified: true,
        parentNotifiedAt: expect.any(Date),
        parentNotifiedBy: { connect: { id: 'teacher-1' } },
      }),
    );
  });

  it('throws NotFound when updating missing incident', async () => {
    repo.find.mockResolvedValue(null);
    await expect(
      service.update('t-1', 'missing', 'teacher-1', { parentNotified: true }),
    ).rejects.toThrow(NotFoundException);
  });
});
