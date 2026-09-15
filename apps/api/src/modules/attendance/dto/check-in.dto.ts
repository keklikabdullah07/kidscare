import type { CheckInInput } from '@kidscare/shared-types';

export class CheckInDto implements CheckInInput {
  checkInTime?: string;
  checkInBy?: string;
  note?: string;
}
