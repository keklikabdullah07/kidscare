import { Inject, Injectable, Optional } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import type { AttendanceUpdateInput, CheckInInput, CheckOutInput } from '@kidscare/shared-schemas';
import { Attendance } from '../entities/attendance.entity';
import type { IAttendanceRepository } from '../repositories/attendance.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('IAttendanceRepository')
    private readonly repo: IAttendanceRepository,
    @Optional()
    @Inject(NotificationsService)
    private readonly notificationsService?: NotificationsService,
  ) {}

  async findByDate(tenantId: string, dateStr: string): Promise<Attendance[]> {
    const date = new Date(dateStr);
    const rows = await this.repo.findByDate(tenantId, date);
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
}
