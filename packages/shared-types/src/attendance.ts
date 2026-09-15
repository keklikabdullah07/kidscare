export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LEFT';

export type Attendance = {
  id: string;
  tenantId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string | null | undefined; // HH:mm
  checkInBy?: string | null | undefined;
  checkOutTime?: string | null | undefined; // HH:mm
  checkOutBy?: string | null | undefined;
  pickupContactId?: string | null | undefined;
  pickupNote?: string | null | undefined;
  note?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type CheckInInput = {
  checkInTime?: string | undefined; // HH:mm
  checkInBy?: string | undefined;
  note?: string | undefined;
};

export type CheckOutInput = {
  checkOutTime?: string | undefined; // HH:mm
  checkOutBy: string;
  pickupContactId?: string | undefined;
  pickupNote?: string | undefined;
  note?: string | undefined;
};

export type AttendanceUpdateInput = {
  status?: AttendanceStatus | undefined;
  checkInTime?: string | null | undefined;
  checkInBy?: string | null | undefined;
  checkOutTime?: string | null | undefined;
  checkOutBy?: string | null | undefined;
  pickupContactId?: string | null | undefined;
  pickupNote?: string | null | undefined;
  note?: string | null | undefined;
};
