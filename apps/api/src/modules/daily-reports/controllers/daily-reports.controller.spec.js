import { DailyReportsController } from './daily-reports.controller';
import { Student } from '../../students/entities/student.entity';
import { DailyReport } from '../entities/daily-report.entity';
const mockEntity = new DailyReport('dr-1', 't-1', 's-1', '2026-09-15', 'HAPPY', { breakfast: 'ALL' }, { quality: 'GOOD' }, [], ['Oyun'], [], 'Notlar', '2026-09-15T08:00:00.000Z', '2026-09-15T15:00:00.000Z');
describe('DailyReportsController', () => {
    let controller;
    let service;
    let studentsService;
    const studentEntity = new Student('s-1', 't-1', null, 'Ada', 'Yılmaz', new Date('2020-05-12'), null, null, null, true, new Date(), new Date(), null);
    beforeEach(() => {
        service = {
            findByDate: jest.fn(),
            findByStudentAndDate: jest.fn(),
            saveReport: jest.fn(),
        };
        studentsService = {
            findOne: jest.fn().mockResolvedValue(studentEntity),
        };
        controller = new DailyReportsController(service, studentsService);
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
});
