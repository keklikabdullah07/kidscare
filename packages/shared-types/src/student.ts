import type { Attendance } from './attendance';
import type { DailyReport } from './daily-report';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-' | 'UNKNOWN';

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isAuthorizedPickup: boolean;
};

export type StudentPassport = {
  bloodType: BloodType;
  allergies: string[];
  dietaryRestrictions: string[];
  chronicConditions: string[];
  regularMedications: string[];
  emergencyContacts: EmergencyContact[];
  doctorName?: string | undefined;
  doctorPhone?: string | undefined;
  specialNotes?: string | undefined;
};

export type Student = {
  id: string;
  tenantId: string;
  parentId?: string | null | undefined;
  classroomId?: string | null | undefined;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  gender: string | null;
  notes: string | null;
  passport?: StudentPassport | null | undefined;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type StudentSummary = Pick<Student, 'id' | 'firstName' | 'lastName' | 'isActive'>;

export type ParentChildOverview = {
  student: Student;
  todayAttendance: Attendance | null;
  todayDailyReport: DailyReport | null;
};
