import { DailyReportsController } from './daily-reports.controller';
import type { DailyReportsService } from '../services/daily-reports.service';
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

  beforeEach(() => {
    service = {
      findByDate: jest.fn(),
      findByStudentAndDate: jest.fn(),
      saveReport: jest.fn(),
    } as unknown as jest.Mocked<DailyReportsService>;
    controller = new DailyReportsController(service);
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
      const res = await controller.findByStudentAndDate('t-1', 's-1', '2026-09-15');
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
});
