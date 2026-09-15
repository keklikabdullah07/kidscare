import type { AllergenWarningSummary, DailyMenu as IDailyMenu } from '@kidscare/shared-types';

export class DailyMenuResponseDto {
  constructor(
    public readonly menu: IDailyMenu | null,
    public readonly allergenWarnings: AllergenWarningSummary[],
  ) {}
}
