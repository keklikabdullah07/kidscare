import type { DailyReport as PrismaDailyReport } from '@kidscare/database';
import { DailyReportsService } from './daily-reports.service';
import type { IDailyReportsRepository } from '../repositories/daily-reports.repository';

const mockReport: PrismaDailyReport = {
  id: 'dr-1',
  tenantId: 't-1',
  studentId: 's-1',
  date: new Date('2026-09-15'),
  mood: 'HAPPY',
  meals: { breakfast: 'ALL', lunch: 'ALL', afternoonSnack: 'ALL' },
  naps: { startTime: '13:00', endTime: '14:30', quality: 'GOOD' },
  potty: [{ id: 'p-1', time: '10:30', type: 'POTTY' }],
  activities: ['Oyun', 'Sanat'],
  medications: [],
  teacherNote: 'Çok iyi bir gündü.',
  createdAt: new Date('2026-09-15T08:00:00Z'),
  updatedAt: new Date('2026-09-15T15:00:00Z'),
};

describe('DailyReportsService', () => {
  let service: DailyReportsService;
  let repo: jest.Mocked<IDailyReportsRepository>;

  beforeEach(() => {
    repo = {
      findByDate: jest.fn(),
      findByStudentAndDate: jest.fn(),
      upsert: jest.fn(),
      bulkUpsert: jest.fn(),
    };
    service = new DailyReportsService(repo);
  });

  describe('findByDate', () => {
    it('returns reports for a date', async () => {
      repo.findByDate.mockResolvedValue([mockReport]);
      const res = await service.findByDate('t-1', '2026-09-15');
      expect(res).toHaveLength(1);
      expect(res[0]?.mood).toBe('HAPPY');
      expect(repo.findByDate).toHaveBeenCalledWith('t-1', expect.any(Date));
    });
  });

  describe('findByStudentAndDate', () => {
    it('returns report when found', async () => {
      repo.findByStudentAndDate.mockResolvedValue(mockReport);
      const res = await service.findByStudentAndDate('t-1', 's-1', '2026-09-15');
      expect(res).not.toBeNull();
      expect(res?.studentId).toBe('s-1');
    });

    it('returns null when not found', async () => {
      repo.findByStudentAndDate.mockResolvedValue(null);
      const res = await service.findByStudentAndDate('t-1', 's-1', '2026-09-15');
      expect(res).toBeNull();
    });
  });

  describe('saveReport', () => {
    it('upserts and returns saved report', async () => {
      repo.upsert.mockResolvedValue(mockReport);
      const res = await service.saveReport('t-1', 's-1', '2026-09-15', {
        mood: 'HAPPY',
        teacherNote: 'Harika bir gün',
      });
      expect(res.mood).toBe('HAPPY');
      expect(repo.upsert).toHaveBeenCalledWith(
        't-1',
        's-1',
        expect.any(Date),
        expect.objectContaining({ mood: 'HAPPY' }),
      );
    });
  });

  describe('bulkSaveReports', () => {
    it('maps items to bulkUpsert and returns mapped entities', async () => {
      repo.bulkUpsert.mockResolvedValue([mockReport, { ...mockReport, id: 'dr-2', studentId: 's-2' }]);
      const res = await service.bulkSaveReports('t-1', '2026-09-15', [
        { studentId: 's-1', mood: 'HAPPY' },
        { studentId: 's-2', meals: { breakfast: 'ALL' } },
      ]);
      expect(res).toHaveLength(2);
      expect(repo.bulkUpsert).toHaveBeenCalledWith(
        't-1',
        expect.any(Date),
        [
          { studentId: 's-1', data: expect.objectContaining({ mood: 'HAPPY' }) },
          { studentId: 's-2', data: expect.objectContaining({ meals: { breakfast: 'ALL' } }) },
        ],
      );
    });
  });
});
