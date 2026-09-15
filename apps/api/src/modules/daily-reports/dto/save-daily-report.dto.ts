import type {
  DailyReportInput,
  MealsData,
  MedicationEntry,
  NapData,
  PottyEntry,
  StudentMood,
} from '@kidscare/shared-types';

export class SaveDailyReportDto implements DailyReportInput {
  mood?: StudentMood;
  meals?: MealsData;
  naps?: NapData;
  potty?: PottyEntry[];
  activities?: string[];
  medications?: MedicationEntry[];
  teacherNote?: string;
}
