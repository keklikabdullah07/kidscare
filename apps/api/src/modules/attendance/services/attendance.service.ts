import { Inject, Injectable, Optional } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import type { AttendanceUpdateInput, CheckInInput, CheckOutInput } from '@kidscare/shared-schemas';
import { Attendance } from '../entities/attendance.entity';
import type {
  AttendanceExcuseWithStudent,
  IAttendanceRepository,
} from '../repositories/attendance.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { StudentsService } from '../../students/services/students.service';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('IAttendanceRepository')
    private readonly repo: IAttendanceRepository,
    @Optional()
    @Inject(NotificationsService)
    private readonly notificationsService?: NotificationsService,
    @Optional()
    @Inject(StudentsService)
    private readonly studentsService?: StudentsService,
  ) {}

  async findByDate(tenantId: string, dateStr: string, user?: CurrentUserPayload): Promise<Attendance[]> {
    const date = new Date(dateStr);
    let studentIds: string[] | undefined;
    if (user?.role === 'TEACHER' && this.studentsService) {
      const teacherStudents = await this.studentsService.findAll(tenantId, user);
      studentIds = teacherStudents.map((s) => s.id);
      if (studentIds.length === 0) return [];
    }
    const rows =
      studentIds !== undefined
        ? await this.repo.findByDate(tenantId, date, studentIds)
        : await this.repo.findByDate(tenantId, date);
    return rows.map((row) => Attendance.fromPrisma(row));
  }

  async findByDateRange(
    tenantId: string,
    startDateStr: string,
    endDateStr: string,
    user?: CurrentUserPayload,
  ): Promise<Attendance[]> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    let studentIds: string[] | undefined;
    if (user?.role === 'TEACHER' && this.studentsService) {
      const teacherStudents = await this.studentsService.findAll(tenantId, user);
      studentIds = teacherStudents.map((s) => s.id);
      if (studentIds.length === 0) return [];
    }
    const rows =
      studentIds !== undefined
        ? await this.repo.findByDateRange(tenantId, startDate, endDate, studentIds)
        : await this.repo.findByDateRange(tenantId, startDate, endDate);
    return rows.map((row) => Attendance.fromPrisma(row));
  }

  async findByStudentAndDate(
    tenantId: string,
    studentId: string,
    dateStr: string,
  ): Promise<Attendance | null> {
    const date = new Date(dateStr);
    const row = await this.repo.findByStudentAndDate(tenantId, studentId, date);
    return row ? Attendance.fromPrisma(row) : null;
  }

  async checkIn(
    tenantId: string,
    studentId: string,
    dateStr: string,
    input: CheckInInput,
  ): Promise<Attendance> {
    const date = new Date(dateStr);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updateData: Prisma.AttendanceUpdateInput = {
      status: 'PRESENT',
      checkInTime: input.checkInTime || currentTime,
      checkInBy: input.checkInBy ?? null,
      ...(input.note !== undefined ? { note: input.note } : {}),
    };

    const saved = await this.repo.upsert(tenantId, studentId, date, updateData);

    if (this.notificationsService) {
      void this.notificationsService.notifyStudentParents(tenantId, studentId, {
        title: '⏰ Kreşe Giriş Yapıldı',
        body: `Öğrenciniz saat ${saved.checkInTime || currentTime} itibarıyla kreşe giriş yaptı.`,
        type: 'ATTENDANCE_CHECK_IN',
        data: { studentId, date: dateStr, status: 'PRESENT' },
      });
    }

    return Attendance.fromPrisma(saved);
  }

  async checkOut(
    tenantId: string,
    studentId: string,
    dateStr: string,
    input: CheckOutInput,
  ): Promise<Attendance> {
    const date = new Date(dateStr);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updateData: Prisma.AttendanceUpdateInput = {
      status: 'LEFT',
      checkOutTime: input.checkOutTime || currentTime,
      checkOutBy: input.checkOutBy,
      pickupContactId: input.pickupContactId ?? null,
      pickupNote: input.pickupNote ?? null,
      ...(input.note !== undefined ? { note: input.note } : {}),
    };

    const saved = await this.repo.upsert(tenantId, studentId, date, updateData);

    if (this.notificationsService) {
      void this.notificationsService.notifyStudentParents(tenantId, studentId, {
        title: '🚗 Teslim Alındı',
        body: `Öğrenciniz saat ${saved.checkOutTime || currentTime} itibarıyla ${input.checkOutBy} tarafından teslim alındı.`,
        type: 'ATTENDANCE_CHECK_OUT',
        data: { studentId, date: dateStr, checkOutBy: input.checkOutBy },
      });
    }

    return Attendance.fromPrisma(saved);
  }

  async update(
    tenantId: string,
    studentId: string,
    dateStr: string,
    input: AttendanceUpdateInput,
  ): Promise<Attendance> {
    const date = new Date(dateStr);

    const updateData: Prisma.AttendanceUpdateInput = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.checkInTime !== undefined) updateData.checkInTime = input.checkInTime;
    if (input.checkInBy !== undefined) updateData.checkInBy = input.checkInBy;
    if (input.checkOutTime !== undefined) updateData.checkOutTime = input.checkOutTime;
    if (input.checkOutBy !== undefined) updateData.checkOutBy = input.checkOutBy;
    if (input.pickupContactId !== undefined) updateData.pickupContactId = input.pickupContactId;
    if (input.pickupNote !== undefined) updateData.pickupNote = input.pickupNote;
    if (input.note !== undefined) updateData.note = input.note;

    const saved = await this.repo.upsert(tenantId, studentId, date, updateData);
    return Attendance.fromPrisma(saved);
  }

  async createExcuse(
    tenantId: string,
    userId: string,
    input: {
      studentId: string;
      date: string;
      reason: string;
      notes?: string | undefined;
    },
  ): Promise<AttendanceExcuseWithStudent> {
    const date = new Date(input.date);

    const excuse = await this.repo.createExcuse(tenantId, {
      studentId: input.studentId,
      date,
      reason: input.reason,
      notes: input.notes ?? null,
      createdById: userId,
    });

    // Otomatik olarak o günün yoklamasını EXCUSED olarak işaretle
    const reasonLabels: Record<string, string> = {
      SICKNESS: 'Hastalık',
      FAMILY_LEAVE: 'Aile İzni',
      TRAVEL: 'Seyahat',
      DOCTOR: 'Doktor Randevusu',
      OTHER: 'Mazeretli',
    };
    const reasonLabel = reasonLabels[input.reason] || input.reason;
    const excuseNote = input.notes
      ? `Mazeret: ${reasonLabel} - ${input.notes}`
      : `Mazeret: ${reasonLabel}`;

    await this.repo.upsert(tenantId, input.studentId, date, {
      status: 'EXCUSED',
      note: excuseNote,
    });

    if (this.notificationsService) {
      void this.notificationsService.notifyStudentParents(tenantId, input.studentId, {
        title: '📋 Mazeret Bildirimi Alındı',
        body: `${excuse.student?.firstName || 'Öğrenciniz'} için ${input.date} tarihli mazeret (${reasonLabel}) başarıyla kaydedildi.`,
        type: 'SYSTEM',
        data: { studentId: input.studentId, date: input.date, excuseId: excuse.id },
      });
    }

    return excuse;
  }

  async findExcuses(
    tenantId: string,
    params: {
      dateStr?: string | undefined;
      studentId?: string | undefined;
      studentIds?: string[] | undefined;
    },
  ): Promise<AttendanceExcuseWithStudent[]> {
    const repoParams: { date?: Date; studentId?: string; studentIds?: string[] } = {};
    if (params.dateStr) {
      repoParams.date = new Date(params.dateStr);
    }
    if (params.studentId) {
      repoParams.studentId = params.studentId;
    }
    if (params.studentIds && params.studentIds.length > 0) {
      repoParams.studentIds = params.studentIds;
    }

    return this.repo.findExcuses(tenantId, repoParams);
  }
}
