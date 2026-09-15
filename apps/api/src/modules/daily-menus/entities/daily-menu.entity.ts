import type { DailyMenu as PrismaDailyMenu } from '@kidscare/database';
import type { DailyMenu as IDailyMenu } from '@kidscare/shared-types';

export class DailyMenu implements IDailyMenu {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly date: string,
    public readonly breakfast: string[],
    public readonly lunch: string[],
    public readonly snack: string[],
    public readonly allergens: string[],
    public readonly calories: number | null,
    public readonly notes: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromPrisma(row: PrismaDailyMenu): DailyMenu {
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10);

    return new DailyMenu(
      row.id,
      row.tenantId,
      dateStr,
      Array.isArray(row.breakfast) ? (row.breakfast as string[]) : [],
      Array.isArray(row.lunch) ? (row.lunch as string[]) : [],
      Array.isArray(row.snack) ? (row.snack as string[]) : [],
      Array.isArray(row.allergens) ? (row.allergens as string[]) : [],
      row.calories,
      row.notes,
      row.createdAt.toISOString(),
      row.updatedAt.toISOString(),
    );
  }
}
