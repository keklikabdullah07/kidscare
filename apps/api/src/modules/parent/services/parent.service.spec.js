import { ParentService } from './parent.service';
const mockStudent = {
    id: 's-1',
    tenantId: 't-1',
    parentId: 'parent-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: new Date('2020-05-12'),
    gender: 'female',
    notes: null,
    passport: {
        bloodType: 'A+',
        allergies: ['Fıstık'],
        dietaryRestrictions: [],
        chronicConditions: [],
        regularMedications: [],
        emergencyContacts: [],
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};
const mockAttendance = {
    id: 'att-1',
    tenantId: 't-1',
    studentId: 's-1',
    date: new Date('2026-09-15'),
    status: 'PRESENT',
    checkInTime: '08:30',
    checkInBy: 'Anne',
    checkOutTime: null,
    checkOutBy: null,
    pickupContactId: null,
    pickupNote: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};
const mockDailyReport = {
    id: 'dr-1',
    tenantId: 't-1',
    studentId: 's-1',
    date: new Date('2026-09-15'),
    mood: 'HAPPY',
    meals: { breakfast: 'ALL', lunch: 'MOST', snack: 'HALF' },
    naps: { durationMinutes: 90 },
    potty: [],
    activities: ['Suluboya'],
    medications: [],
    teacherNote: 'Harika bir gündü!',
    createdAt: new Date(),
    updatedAt: new Date(),
};
describe('ParentService', () => {
    let service;
    let studentsRepo;
    let attendanceRepo;
    let dailyReportsRepo;
    beforeEach(() => {
        studentsRepo = {
            findMany: jest.fn(),
        };
        attendanceRepo = {
            findByStudentAndDate: jest.fn(),
        };
        dailyReportsRepo = {
            findByStudentAndDate: jest.fn(),
        };
        service = new ParentService(studentsRepo, attendanceRepo, dailyReportsRepo);
    });
    it('returns children overview with today attendance and daily report', async () => {
        studentsRepo.findMany.mockResolvedValue([mockStudent]);
        attendanceRepo.findByStudentAndDate.mockResolvedValue(mockAttendance);
        dailyReportsRepo.findByStudentAndDate.mockResolvedValue(mockDailyReport);
        const result = await service.getChildrenOverview('t-1', 'parent-1', 'PARENT', '2026-09-15');
        expect(result).toHaveLength(1);
        expect(result[0]?.student.firstName).toBe('Ada');
        expect(result[0]?.todayAttendance?.status).toBe('PRESENT');
        expect(result[0]?.todayAttendance?.checkInTime).toBe('08:30');
        expect(result[0]?.todayDailyReport?.mood).toBe('HAPPY');
        expect(result[0]?.todayDailyReport?.teacherNote).toBe('Harika bir gündü!');
    });
    it('does not expose other students when the parent has no linked child', async () => {
        studentsRepo.findMany.mockResolvedValue([mockStudent]);
        const result = await service.getChildrenOverview('t-1', 'unlinked-parent', 'PARENT', '2026-09-15');
        expect(result).toEqual([]);
        expect(attendanceRepo.findByStudentAndDate).not.toHaveBeenCalled();
        expect(dailyReportsRepo.findByStudentAndDate).not.toHaveBeenCalled();
    });
});
