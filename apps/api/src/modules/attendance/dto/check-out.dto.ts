import type { CheckOutInput } from '@kidscare/shared-types';

export class CheckOutDto implements CheckOutInput {
  checkOutTime?: string;
  checkOutBy!: string;
  pickupContactId?: string;
  pickupNote?: string;
  note?: string;
}
