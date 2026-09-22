import { Inject, Injectable } from '@nestjs/common';
import type { ParentChildOverview, UserRole } from '@kidscare/shared-types';
import { AttendanceRepository } from '../../attendance/repositories/attendance.repository';
import { DailyReportsRepository } from '../../daily-reports/repositories/daily-reports.repository';
import { StudentsRepository } from '../../students/repositories/students.repository';
import { Student } from '../../students/entities/student.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { DailyReport } from '../../daily-reports/entities/daily-report.entity';

@Injectable()
export class ParentService {
  constructor(
    @Inject(StudentsRepository) private readonly studentsRepository: StudentsRepository,
    @Inject(AttendanceRepository) private readonly attendanceRepository: AttendanceRepository,
    @Inject(DailyReportsRepository) private readonly dailyReportsRepository: DailyReportsRepository,
  ) {}

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  async getChildrenOverview(
    tenantId: string,
    parentUserId: string,
    userRole: UserRole,
    dateStr: string,
  ): Promise<ParentChildOverview[]> {
    const date = this.parseDate(dateStr);
    const allStudents = await this.studentsRepository.findMany(tenantId);

    // Parents may only see students explicitly linked to their own account.
    let targetStudents = allStudents.filter((s) => s.isActive);
    if (userRole === 'PARENT') {
      targetStudents = targetStudents.filter((s) => s.parentId === parentUserId);
    }

    const overviews: ParentChildOverview[] = [];

    for (const rawStudent of targetStudents) {
      const studentEntity = Student.fromPrisma(rawStudent);

      const [rawAttendance, rawDailyReport] = await Promise.all([
        this.attendanceRepository.findByStudentAndDate(tenantId, rawStudent.id, date),
        this.dailyReportsRepository.findByStudentAndDate(tenantId, rawStudent.id, date),
      ]);

      const todayAttendance = rawAttendance ? Attendance.fromPrisma(rawAttendance) : null;
      const todayDailyReport = rawDailyReport ? DailyReport.fromPrisma(rawDailyReport) : null;

      overviews.push({
        student: {
          id: studentEntity.id,
          tenantId: studentEntity.tenantId,
          parentId: studentEntity.parentId,
          firstName: studentEntity.firstName,
          lastName: studentEntity.lastName,
          dateOfBirth: studentEntity.dateOfBirth.toISOString().slice(0, 10),
          gender: studentEntity.gender,
          notes: studentEntity.notes,
          passport: studentEntity.passport,
          isActive: studentEntity.isActive,
          createdAt: studentEntity.createdAt.toISOString(),
          updatedAt: studentEntity.updatedAt.toISOString(),
          deletedAt: studentEntity.deletedAt ? studentEntity.deletedAt.toISOString() : null,
        },
        todayAttendance: todayAttendance
          ? {
              id: todayAttendance.id,
              tenantId: todayAttendance.tenantId,
              studentId: todayAttendance.studentId,
              date: todayAttendance.date,
              status: todayAttendance.status,
              checkInTime: todayAttendance.checkInTime,
              checkInBy: todayAttendance.checkInBy,
              checkOutTime: todayAttendance.checkOutTime,
              checkOutBy: todayAttendance.checkOutBy,
              pickupContactId: todayAttendance.pickupContactId,
              pickupNote: todayAttendance.pickupNote,
              note: todayAttendance.note,
              createdAt: todayAttendance.createdAt,
              updatedAt: todayAttendance.updatedAt,
            }
          : null,
        todayDailyReport: todayDailyReport
          ? {
              id: todayDailyReport.id,
              tenantId: todayDailyReport.tenantId,
              studentId: todayDailyReport.studentId,
              date: todayDailyReport.date,
              mood: todayDailyReport.mood,
              meals: todayDailyReport.meals,
              naps: todayDailyReport.naps,
              potty: todayDailyReport.potty,
              activities: todayDailyReport.activities,
              medications: todayDailyReport.medications,
              teacherNote: todayDailyReport.teacherNote,
              createdAt: todayDailyReport.createdAt,
              updatedAt: todayDailyReport.updatedAt,
            }
          : null,
      });
    }

    return overviews;
  }
}
