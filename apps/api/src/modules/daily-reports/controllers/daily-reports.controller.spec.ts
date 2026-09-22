import { NotFoundException } from '@nestjs/common';
import { DailyReportsController } from './daily-reports.controller';
import type { DailyReportsService } from '../services/daily-reports.service';
import type { StudentsService } from '../../students/services/students.service';
import type { ClassroomsService } from '../../classrooms/services/classrooms.service';
import { Student } from '../../students/entities/student.entity';
import { DailyReport } from '../entities/daily-report.entity';

const mockEntity = new DailyReport(
  'dr-1',
  't-1',
  's-1',
  '2026-09-15',
  'HAPPY',
  { breakfast: 'ALL' },
  { quality: 'GOOD' },
  [],
  ['Oyun'],
  [],
  'Notlar',
  '2026-09-15T08:00:00.000Z',
  '2026-09-15T15:00:00.000Z',
);

describe('DailyReportsController', () => {
  let controller: DailyReportsController;
  let service: jest.Mocked<DailyReportsService>;
  let studentsService: jest.Mocked<StudentsService>;
  let classroomsService: jest.Mocked<ClassroomsService>;

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
      saveReport: jest.fn(),
      bulkSaveReports: jest.fn(),
    } as unknown as jest.Mocked<DailyReportsService>;
    studentsService = {
      findOne: jest.fn().mockResolvedValue(studentEntity),
    } as unknown as jest.Mocked<StudentsService>;
    classroomsService = {
      findById: jest.fn().mockResolvedValue({ id: 'c-1' }),
    } as unknown as jest.Mocked<ClassroomsService>;
    controller = new DailyReportsController(service, studentsService, classroomsService);
  });

  describe('findByDate', () => {
    it('returns list of daily reports', async () => {
      service.findByDate.mockResolvedValue([mockEntity]);
      const res = await controller.findByDate('t-1', '2026-09-15');
      expect(res).toHaveLength(1);
      expect(res[0]?.mood).toBe('HAPPY');
      expect(service.findByDate).toHaveBeenCalledWith('t-1', '2026-09-15');
    });
  });

  describe('findByStudentAndDate', () => {
    it('returns report response', async () => {
      service.findByStudentAndDate.mockResolvedValue(mockEntity);
      const res = await controller.findByStudentAndDate('t-1', 's-1', '2026-09-15', {
        tenantId: 't-1',
        userId: 'u-1',
        role: 'ADMIN',
      });
      expect(res?.studentId).toBe('s-1');
    });
  });

  describe('saveReport', () => {
    it('delegates to service and returns DTO', async () => {
      service.saveReport.mockResolvedValue(mockEntity);
      const res = await controller.saveReport('t-1', 's-1', '2026-09-15', {
        mood: 'HAPPY',
      });
      expect(res.studentId).toBe('s-1');
      expect(service.saveReport).toHaveBeenCalledWith('t-1', 's-1', '2026-09-15', {
        mood: 'HAPPY',
      });
    });
  });

  describe('bulkSaveReports', () => {
    it('rejects when classroom not visible to user', async () => {
      classroomsService.findById.mockResolvedValue(null);
      await expect(
        controller.bulkSaveReports(
          't-1',
          'c-1',
          '2026-09-15',
          { items: [{ studentId: 's-1', mood: 'HAPPY' }] },
          { tenantId: 't-1', userId: 'u-1', role: 'TEACHER' },
        ),
      ).rejects.toThrow(NotFoundException);
      expect(service.bulkSaveReports).not.toHaveBeenCalled();
    });

    it('uses teacherId filter when role is TEACHER', async () => {
      service.bulkSaveReports.mockResolvedValue([mockEntity]);
      await controller.bulkSaveReports(
        't-1',
        'c-1',
        '2026-09-15',
        { items: [{ studentId: 's-1', mood: 'HAPPY' }] },
        { tenantId: 't-1', userId: 'u-1', role: 'TEACHER' },
      );
      expect(classroomsService.findById).toHaveBeenCalledWith('t-1', 'c-1', 'u-1');
    });

    it('does not pass teacherId for ADMIN role', async () => {
      service.bulkSaveReports.mockResolvedValue([mockEntity]);
      await controller.bulkSaveReports(
        't-1',
        'c-1',
        '2026-09-15',
        { items: [{ studentId: 's-1', mood: 'HAPPY' }] },
        { tenantId: 't-1', userId: 'admin-1', role: 'ADMIN' },
      );
      expect(classroomsService.findById).toHaveBeenCalledWith('t-1', 'c-1', undefined);
    });

    it('returns array of DTOs from service', async () => {
      service.bulkSaveReports.mockResolvedValue([mockEntity, mockEntity]);
      const res = await controller.bulkSaveReports(
        't-1',
        'c-1',
        '2026-09-15',
        {
          items: [
            { studentId: 's-1', mood: 'HAPPY' },
            { studentId: 's-2', meals: { breakfast: 'ALL' } },
          ],
        },
        { tenantId: 't-1', userId: 'admin-1', role: 'ADMIN' },
      );
      expect(res).toHaveLength(2);
      expect(service.bulkSaveReports).toHaveBeenCalledWith('t-1', '2026-09-15', [
        { studentId: 's-1', mood: 'HAPPY' },
        { studentId: 's-2', meals: { breakfast: 'ALL' } },
      ]);
    });
  });
});
