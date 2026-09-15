import type {
  DailyReport as IDailyReport,
  MealsData,
  MedicationEntry,
  NapData,
  PottyEntry,
  StudentMood,
} from '@kidscare/shared-types';

export class DailyReportResponseDto implements IDailyReport {
  id!: string;
  tenantId!: string;
  studentId!: string;
  date!: string;
  mood?: StudentMood | null;
  meals?: MealsData | null;
  naps?: NapData | null;
  potty?: PottyEntry[] | null;
  activities?: string[] | null;
  medications?: MedicationEntry[] | null;
  teacherNote?: string | null;
  createdAt!: string;
  updatedAt!: string;
}
