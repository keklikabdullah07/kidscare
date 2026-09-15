import type { AttendanceStatus, AttendanceUpdateInput } from '@kidscare/shared-types';

export class UpdateAttendanceDto implements AttendanceUpdateInput {
  status?: AttendanceStatus;
  checkInTime?: string | null;
  checkInBy?: string | null;
  checkOutTime?: string | null;
  checkOutBy?: string | null;
  pickupContactId?: string | null;
  pickupNote?: string | null;
  note?: string | null;
}
