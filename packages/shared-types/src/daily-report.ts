export type MealPortion = 'ALL' | 'HALF' | 'LITTLE' | 'NONE';

export type MealsData = {
  breakfast?: MealPortion | undefined;
  lunch?: MealPortion | undefined;
  afternoonSnack?: MealPortion | undefined;
  notes?: string | undefined;
};

export type NapQuality = 'GOOD' | 'INTERRUPTED' | 'NONE';

export type NapData = {
  startTime?: string | undefined; // HH:mm
  endTime?: string | undefined; // HH:mm
  quality?: NapQuality | undefined;
  notes?: string | undefined;
};

export type PottyType = 'WET' | 'DIRTY' | 'POTTY' | 'ACCIDENT';

export type PottyEntry = {
  id: string;
  time: string; // HH:mm
  type: PottyType;
  notes?: string | undefined;
};

export type MedicationStatus = 'SCHEDULED' | 'GIVEN' | 'SKIPPED';

export type MedicationEntry = {
  id: string;
  name: string;
  time: string; // HH:mm
  givenBy: string;
  dosage?: string | undefined;
  status?: MedicationStatus | undefined;
  requestedBy?: string | undefined;
  givenAt?: string | undefined;
  temperature?: number | undefined;
  notes?: string | undefined;
};

export type StudentMood = 'HAPPY' | 'CALM' | 'ENERGETIC' | 'TIRED' | 'CRANKY' | 'SAD';

export type DailyReport = {
  id: string;
  tenantId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  mood?: StudentMood | null | undefined;
  meals?: MealsData | null | undefined;
  naps?: NapData | null | undefined;
  potty?: PottyEntry[] | null | undefined;
  activities?: string[] | null | undefined;
  medications?: MedicationEntry[] | null | undefined;
  teacherNote?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type DailyReportInput = {
  mood?: StudentMood | undefined;
  meals?: MealsData | undefined;
  naps?: NapData | undefined;
  potty?: PottyEntry[] | undefined;
  activities?: string[] | undefined;
  medications?: MedicationEntry[] | undefined;
  teacherNote?: string | undefined;
};

export type BulkDailyReportItem = DailyReportInput & {
  studentId: string;
};

export type BulkDailyReportsInput = {
  items: BulkDailyReportItem[];
};
