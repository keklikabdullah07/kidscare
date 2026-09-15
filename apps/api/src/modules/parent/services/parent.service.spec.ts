import type {
  Attendance as PrismaAttendance,
  DailyReport as PrismaDailyReport,
  Student as PrismaStudent,
} from '@kidscare/database';
import { ParentService } from './parent.service';
import type { AttendanceRepository } from '../../attendance/repositories/attendance.repository';
import type { DailyReportsRepository } from '../../daily-reports/repositories/daily-reports.repository';
import type { StudentsRepository } from '../../students/repositories/students.repository';

const mockStudent: PrismaStudent = {
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

const mockAttendance: PrismaAttendance = {
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

const mockDailyReport: PrismaDailyReport = {
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
  let service: ParentService;
  let studentsRepo: jest.Mocked<StudentsRepository>;
  let attendanceRepo: jest.Mocked<AttendanceRepository>;
  let dailyReportsRepo: jest.Mocked<DailyReportsRepository>;

  beforeEach(() => {
    studentsRepo = {
      findMany: jest.fn(),
    } as unknown as jest.Mocked<StudentsRepository>;

    attendanceRepo = {
      findByStudentAndDate: jest.fn(),
    } as unknown as jest.Mocked<AttendanceRepository>;

    dailyReportsRepo = {
      findByStudentAndDate: jest.fn(),
    } as unknown as jest.Mocked<DailyReportsRepository>;

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
});
