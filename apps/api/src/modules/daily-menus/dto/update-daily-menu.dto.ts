import type { DailyMenuUpdateInput } from '@kidscare/shared-types';

export class UpdateDailyMenuDto implements DailyMenuUpdateInput {
  breakfast?: string[];
  lunch?: string[];
  snack?: string[];
  allergens?: string[];
  calories?: number | null;
  notes?: string | null;
}
