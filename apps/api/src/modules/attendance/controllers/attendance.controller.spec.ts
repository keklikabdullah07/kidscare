import { AttendanceController } from './attendance.controller';
import type { AttendanceService } from '../services/attendance.service';
import type { StudentsService } from '../../students/services/students.service';
import { Student } from '../../students/entities/student.entity';
import { Attendance } from '../entities/attendance.entity';

const mockEntity = new Attendance(
  'att-1',
  't-1',
  's-1',
  '2026-09-15',
  'PRESENT',
  '08:30',
  'Ahmet Yılmaz',
  null,
  null,
  null,
  null,
  null,
  '2026-09-15T08:30:00.000Z',
  '2026-09-15T08:30:00.000Z',
);

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: jest.Mocked<AttendanceService>;
  let studentsService: jest.Mocked<StudentsService>;

  const studentEntity = new Student(
    's-1',
    't-1',
    null,
    'Ada',
    'Yılmaz',
    new Date('2020-05-12'),
    null,
    null,
    null,
    true,
    new Date(),
    new Date(),
    null,
  );

  beforeEach(() => {
    service = {
      findByDate: jest.fn(),
      findByStudentAndDate: jest.fn(),
      checkIn: jest.fn(),
      checkOut: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<AttendanceService>;
    studentsService = {
      findOne: jest.fn().mockResolvedValue(studentEntity),
    } as unknown as jest.Mocked<StudentsService>;
    controller = new AttendanceController(service, studentsService);
  });

  describe('findByDate', () => {
    it('returns attendance list', async () => {
      service.findByDate.mockResolvedValue([mockEntity]);
      const res = await controller.findByDate('t-1', '2026-09-15');
      expect(res).toHaveLength(1);
      expect(res[0]?.status).toBe('PRESENT');
    });
  });

  describe('findByStudentAndDate', () => {
    it('returns single attendance DTO', async () => {
      service.findByStudentAndDate.mockResolvedValue(mockEntity);
      const res = await controller.findByStudentAndDate('t-1', 's-1', '2026-09-15', {
        tenantId: 't-1',
        userId: 'u-1',
        role: 'ADMIN',
      });
      expect(res?.studentId).toBe('s-1');
    });
  });

  describe('checkIn', () => {
    it('delegates check-in to service', async () => {
      service.checkIn.mockResolvedValue(mockEntity);
      const res = await controller.checkIn('t-1', 's-1', '2026-09-15', {
        checkInTime: '08:30',
        checkInBy: 'Ahmet Yılmaz',
      });
      expect(res.status).toBe('PRESENT');
      expect(service.checkIn).toHaveBeenCalledWith('t-1', 's-1', '2026-09-15', {
        checkInTime: '08:30',
        checkInBy: 'Ahmet Yılmaz',
      });
    });
  });

  describe('checkOut', () => {
    it('delegates check-out to service', async () => {
      const leftEntity = new Attendance(
        'att-1',
        't-1',
        's-1',
        '2026-09-15',
        'LEFT',
        '08:30',
        'Baba',
        '17:00',
        'Anne',
        'ec-1',
        null,
        null,
        '2026-09-15T08:30:00.000Z',
        '2026-09-15T17:00:00.000Z',
      );
      service.checkOut.mockResolvedValue(leftEntity);
      const res = await controller.checkOut('t-1', 's-1', '2026-09-15', {
        checkOutTime: '17:00',
        checkOutBy: 'Anne',
        pickupContactId: 'ec-1',
      });
      expect(res.status).toBe('LEFT');
      expect(service.checkOut).toHaveBeenCalledWith('t-1', 's-1', '2026-09-15', {
        checkOutTime: '17:00',
        checkOutBy: 'Anne',
        pickupContactId: 'ec-1',
      });
    });
  });

  describe('update', () => {
    it('updates attendance status', async () => {
      const excusedEntity = new Attendance(
        'att-1',
        't-1',
        's-1',
        '2026-09-15',
        'EXCUSED',
        null,
        null,
        null,
        null,
        null,
        null,
        'İzinli',
        '2026-09-15T08:30:00.000Z',
        '2026-09-15T08:30:00.000Z',
      );
      service.update.mockResolvedValue(excusedEntity);
      const res = await controller.update('t-1', 's-1', '2026-09-15', {
        status: 'EXCUSED',
        note: 'İzinli',
      });
      expect(res.status).toBe('EXCUSED');
    });
  });
});
