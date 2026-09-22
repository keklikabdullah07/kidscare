import { AttendanceService } from './attendance.service';
const mockAttendance = {
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
    let service;
    let repo;
    beforeEach(() => {
        repo = {
            findByDate: jest.fn(),
            findByStudentAndDate: jest.fn(),
            upsert: jest.fn(),
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
            expect(repo.upsert).toHaveBeenCalledWith('t-1', 's-1', expect.any(Date), expect.objectContaining({
                status: 'PRESENT',
                checkInTime: '08:30',
                checkInBy: 'Ahmet Yılmaz',
            }));
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
            expect(repo.upsert).toHaveBeenCalledWith('t-1', 's-1', expect.any(Date), expect.objectContaining({
                status: 'LEFT',
                checkOutTime: '17:00',
                checkOutBy: 'Anne',
                pickupContactId: 'ec-1',
            }));
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
});
