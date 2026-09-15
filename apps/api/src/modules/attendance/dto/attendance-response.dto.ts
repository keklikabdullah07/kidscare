import type { Attendance as IAttendance, AttendanceStatus } from '@kidscare/shared-types';

export class AttendanceResponseDto implements IAttendance {
  id!: string;
  tenantId!: string;
  studentId!: string;
  date!: string;
  status!: AttendanceStatus;
  checkInTime?: string | null;
  checkInBy?: string | null;
  checkOutTime?: string | null;
  checkOutBy?: string | null;
  pickupContactId?: string | null;
  pickupNote?: string | null;
  note?: string | null;
  createdAt!: string;
  updatedAt!: string;
}
