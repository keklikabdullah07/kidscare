import type { Attendance as PrismaAttendance } from '@kidscare/database';
import { AttendanceService } from './attendance.service';
import type { IAttendanceRepository } from '../repositories/attendance.repository';

const mockAttendance: PrismaAttendance = {
  id: 'att-1',
  tenantId: 't-1',
  studentId: 's-1',
  date: new Date('2026-09-15'),
  status: 'PRESENT',
  checkInTime: '08:30',
  checkInBy: 'Ahmet Yılmaz',
  checkOutTime: null,
  checkOutBy: null,
  pickupContactId: null,
  pickupNote: null,
  note: null,
  createdAt: new Date('2026-09-15T08:30:00Z'),
  updatedAt: new Date('2026-09-15T08:30:00Z'),
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repo: jest.Mocked<IAttendanceRepository>;

  beforeEach(() => {
    repo = {
      findByDate: jest.fn(),
      findByDateRange: jest.fn(),
      findByStudentAndDate: jest.fn(),
      upsert: jest.fn(),
      createExcuse: jest.fn(),
      findExcuses: jest.fn(),
    };
    service = new AttendanceService(repo);
  });

  describe('findByDate', () => {
    it('returns attendance list for date', async () => {
      repo.findByDate.mockResolvedValue([mockAttendance]);
      const res = await service.findByDate('t-1', '2026-09-15');
      expect(res).toHaveLength(1);
      expect(res[0]?.status).toBe('PRESENT');
      expect(repo.findByDate).toHaveBeenCalledWith('t-1', expect.any(Date));
    });
  });

  describe('findByDateRange', () => {
    it('returns attendance list for date range', async () => {
      repo.findByDateRange.mockResolvedValue([mockAttendance]);
      const res = await service.findByDateRange('t-1', '2026-10-01', '2026-10-31');
      expect(res).toHaveLength(1);
      expect(res[0]?.status).toBe('PRESENT');
      expect(repo.findByDateRange).toHaveBeenCalledWith(
        't-1',
        expect.any(Date),
        expect.any(Date),
      );
    });
  });

  describe('findByStudentAndDate', () => {
    it('returns student attendance when found', async () => {
      repo.findByStudentAndDate.mockResolvedValue(mockAttendance);
      const res = await service.findByStudentAndDate('t-1', 's-1', '2026-09-15');
      expect(res).not.toBeNull();
      expect(res?.status).toBe('PRESENT');
    });

    it('returns null when not found', async () => {
      repo.findByStudentAndDate.mockResolvedValue(null);
      const res = await service.findByStudentAndDate('t-1', 's-1', '2026-09-15');
      expect(res).toBeNull();
    });
  });

  describe('checkIn', () => {
    it('sets status to PRESENT and saves checkInTime', async () => {
      repo.upsert.mockResolvedValue(mockAttendance);
      const res = await service.checkIn('t-1', 's-1', '2026-09-15', {
        checkInTime: '08:30',
        checkInBy: 'Ahmet Yılmaz',
      });
      expect(res.status).toBe('PRESENT');
      expect(repo.upsert).toHaveBeenCalledWith(
        't-1',
        's-1',
        expect.any(Date),
        expect.objectContaining({
          status: 'PRESENT',
          checkInTime: '08:30',
          checkInBy: 'Ahmet Yılmaz',
        }),
      );
    });
  });

  describe('checkOut', () => {
    it('sets status to LEFT and saves checkOut details', async () => {
      const leftMock = {
        ...mockAttendance,
        status: 'LEFT',
        checkOutTime: '17:00',
        checkOutBy: 'Anne',
      };
      repo.upsert.mockResolvedValue(leftMock);
      const res = await service.checkOut('t-1', 's-1', '2026-09-15', {
        checkOutTime: '17:00',
        checkOutBy: 'Anne',
        pickupContactId: 'ec-1',
      });
      expect(res.status).toBe('LEFT');
      expect(repo.upsert).toHaveBeenCalledWith(
        't-1',
        's-1',
        expect.any(Date),
        expect.objectContaining({
          status: 'LEFT',
          checkOutTime: '17:00',
          checkOutBy: 'Anne',
          pickupContactId: 'ec-1',
        }),
      );
    });
  });

  describe('update', () => {
    it('updates attendance status to EXCUSED', async () => {
      const excusedMock = { ...mockAttendance, status: 'EXCUSED', note: 'İzinli' };
      repo.upsert.mockResolvedValue(excusedMock);
      const res = await service.update('t-1', 's-1', '2026-09-15', {
        status: 'EXCUSED',
        note: 'İzinli',
      });
      expect(res.status).toBe('EXCUSED');
    });
  });

  describe('createExcuse', () => {
    it('saves excuse and marks attendance as EXCUSED', async () => {
      repo.createExcuse.mockResolvedValue({
        id: 'exc-1',
        tenantId: 't-1',
        studentId: 's-1',
        date: new Date('2026-09-15'),
        reason: 'SICKNESS',
        notes: 'Grip',
        status: 'PENDING',
        createdById: 'u-1',
        createdAt: new Date('2026-09-15T08:00:00Z'),
        updatedAt: new Date('2026-09-15T08:00:00Z'),
        student: { id: 's-1', firstName: 'Ada', lastName: 'Yılmaz' },
      });
      repo.upsert.mockResolvedValue(mockAttendance);

      const res = await service.createExcuse('t-1', 'u-1', {
        studentId: 's-1',
        date: '2026-09-15',
        reason: 'SICKNESS',
        notes: 'Grip',
      });

      expect(res.id).toBe('exc-1');
      expect(repo.createExcuse).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({
          studentId: 's-1',
          reason: 'SICKNESS',
        }),
      );
      expect(repo.upsert).toHaveBeenCalledWith(
        't-1',
        's-1',
        expect.any(Date),
        expect.objectContaining({
          status: 'EXCUSED',
          note: expect.stringContaining('Hastalık'),
        }),
      );
    });
  });

  describe('findExcuses', () => {
    it('calls repo.findExcuses with parsed date', async () => {
      repo.findExcuses.mockResolvedValue([
        {
          id: 'exc-1',
          tenantId: 't-1',
          studentId: 's-1',
          date: new Date('2026-09-15'),
          reason: 'SICKNESS',
          notes: 'Grip',
          status: 'PENDING',
          createdById: 'u-1',
          createdAt: new Date('2026-09-15T08:00:00Z'),
          updatedAt: new Date('2026-09-15T08:00:00Z'),
          student: { id: 's-1', firstName: 'Ada', lastName: 'Yılmaz' },
        },
      ]);
      const res = await service.findExcuses('t-1', { dateStr: '2026-09-15' });
      expect(res).toHaveLength(1);
      expect(repo.findExcuses).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({
          date: expect.any(Date),
        }),
      );
    });
  });
});
