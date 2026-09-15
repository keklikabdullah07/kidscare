import type { DailyMenuCreateInput } from '@kidscare/shared-types';

export class CreateDailyMenuDto implements DailyMenuCreateInput {
  date!: string;
  breakfast?: string[];
  lunch?: string[];
  snack?: string[];
  allergens?: string[];
  calories?: number | null;
  notes?: string | null;
}
