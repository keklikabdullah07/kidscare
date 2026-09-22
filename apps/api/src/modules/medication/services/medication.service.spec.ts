import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { MedicationRecordRow } from '../repositories/medication.repository';
import { MedicationService } from './medication.service';
import type { IMedicationRepository } from '../repositories/medication.repository';

const baseRow: MedicationRecordRow = {
  id: 'med-1',
  tenantId: 't-1',
  studentId: 's-1',
  medicationName: 'Parol',
  dosage: '5ml',
  instructions: null,
  scheduledAt: new Date('2026-09-15T13:00:00Z'),
  givenAt: null,
  status: 'REQUESTED',
  requestedById: 'parent-1',
  approvedById: null,
  administeredById: null,
  parentApprovalNote: null,
  rejectionReason: null,
  skipReason: null,
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

describe('MedicationService', () => {
  let service: MedicationService;
  let repo: jest.Mocked<IMedicationRepository>;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    service = new MedicationService(repo);
  });

  it('creates REQUESTED record with requestedById', async () => {
    repo.create.mockResolvedValue(baseRow);
    await service.create('t-1', 'parent-1', {
      studentId: 's-1',
      medicationName: 'Parol',
      dosage: '5ml',
    });
    expect(repo.create).toHaveBeenCalledWith('t-1', {
      studentId: 's-1',
      medicationName: 'Parol',
      dosage: '5ml',
      instructions: null,
      scheduledAt: null,
      parentApprovalNote: null,
      requestedById: 'parent-1',
      status: 'REQUESTED',
    });
  });

  it('approves REQUESTED record', async () => {
    repo.find.mockResolvedValue(baseRow);
    repo.update.mockResolvedValue({ ...baseRow, status: 'APPROVED', approvedById: 'admin-1' });
    const res = await service.approve('t-1', 'med-1', 'admin-1', { note: 'Tamam' });
    expect(res.status).toBe('APPROVED');
  });

  it('rejects approving non-REQUESTED record', async () => {
    repo.find.mockResolvedValue({ ...baseRow, status: 'GIVEN' });
    await expect(service.approve('t-1', 'med-1', 'admin-1', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects medication record with rejection reason', async () => {
    repo.find.mockResolvedValue(baseRow);
    repo.update.mockResolvedValue({ ...baseRow, status: 'REJECTED', rejectionReason: 'Yanlış doz' });
    const res = await service.reject('t-1', 'med-1', 'admin-1', { reason: 'Yanlış doz' });
    expect(res.status).toBe('REJECTED');
    expect(res.rejectionReason).toBe('Yanlış doz');
  });

  it('throws NotFound when approving missing record', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.approve('t-1', 'missing', 'admin-1', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('marks APPROVED record as GIVEN with administeredById and timestamp', async () => {
    repo.find.mockResolvedValue({ ...baseRow, status: 'APPROVED' });
    repo.update.mockResolvedValue({
      ...baseRow,
      status: 'GIVEN',
      administeredById: 'teacher-1',
      givenAt: new Date('2026-09-15T13:05:00Z'),
    });
    const res = await service.markGiven('t-1', 'med-1', 'teacher-1', {
      givenAt: new Date('2026-09-15T13:05:00Z'),
    });
    expect(res.status).toBe('GIVEN');
    expect(res.givenAt).toBe('2026-09-15T13:05:00.000Z');
  });

  it('rejects marking unapproved record as given', async () => {
    repo.find.mockResolvedValue(baseRow); // REQUESTED
    await expect(service.markGiven('t-1', 'med-1', 'teacher-1', {})).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('skips APPROVED record with reason', async () => {
    repo.find.mockResolvedValue({ ...baseRow, status: 'APPROVED' });
    repo.update.mockResolvedValue({
      ...baseRow,
      status: 'SKIPPED',
      administeredById: 'teacher-1',
      skipReason: 'Çocuk reddetti',
    });
    const res = await service.markSkipped('t-1', 'med-1', 'teacher-1', {
      reason: 'Çocuk reddetti',
    });
    expect(res.status).toBe('SKIPPED');
    expect(res.skipReason).toBe('Çocuk reddetti');
  });
});
