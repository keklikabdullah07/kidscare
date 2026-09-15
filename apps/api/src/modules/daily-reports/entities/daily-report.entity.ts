import type { DailyReport as PrismaDailyReport } from '@kidscare/database';
import type {
  DailyReport as IDailyReport,
  MealsData,
  MedicationEntry,
  NapData,
  PottyEntry,
  StudentMood,
} from '@kidscare/shared-types';

export class DailyReport implements IDailyReport {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly studentId: string,
    public readonly date: string,
    public readonly mood: StudentMood | null,
    public readonly meals: MealsData | null,
    public readonly naps: NapData | null,
    public readonly potty: PottyEntry[] | null,
    public readonly activities: string[] | null,
    public readonly medications: MedicationEntry[] | null,
    public readonly teacherNote: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromPrisma(row: PrismaDailyReport): DailyReport {
    // Format Date to YYYY-MM-DD
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10);

    return new DailyReport(
      row.id,
      row.tenantId,
      row.studentId,
      dateStr,
      (row.mood as StudentMood) ?? null,
      (row.meals as MealsData) ?? null,
      (row.naps as NapData) ?? null,
      (row.potty as PottyEntry[]) ?? null,
      (row.activities as string[]) ?? null,
      (row.medications as MedicationEntry[]) ?? null,
      row.teacherNote ?? null,
      row.createdAt.toISOString(),
      row.updatedAt.toISOString(),
    );
  }
}
