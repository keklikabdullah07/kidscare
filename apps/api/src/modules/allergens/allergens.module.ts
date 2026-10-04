import { Module } from '@nestjs/common';
import { AllergenMatcher } from './allergen-matcher';

@Module({
  providers: [AllergenMatcher],
  exports: [AllergenMatcher],
})
export class AllergensModule {}
