import type { Attendance as PrismaAttendance } from '@kidscare/database';
import type { Attendance as IAttendance, AttendanceStatus } from '@kidscare/shared-types';

export class Attendance implements IAttendance {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly studentId: string,
    public readonly date: string,
    public readonly status: AttendanceStatus,
    public readonly checkInTime: string | null,
    public readonly checkInBy: string | null,
    public readonly checkOutTime: string | null,
    public readonly checkOutBy: string | null,
    public readonly pickupContactId: string | null,
    public readonly pickupNote: string | null,
    public readonly note: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromPrisma(row: PrismaAttendance): Attendance {
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10);

    return new Attendance(
      row.id,
      row.tenantId,
      row.studentId,
      dateStr,
      row.status as AttendanceStatus,
      row.checkInTime,
      row.checkInBy,
      row.checkOutTime,
      row.checkOutBy,
      row.pickupContactId,
      row.pickupNote,
      row.note,
      row.createdAt.toISOString(),
      row.updatedAt.toISOString(),
    );
  }
}
