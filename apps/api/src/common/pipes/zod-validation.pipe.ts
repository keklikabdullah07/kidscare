import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validates `value` against a Zod schema. On success, returns the parsed
 * (and possibly transformed/coerced) value. On failure, throws a 400 with
 * `{ message, issues }` — the same shape the global AllExceptionsFilter
 * already understands, so clients always see a consistent payload.
 *
 * Usage (per-route):
 *   @Body(new ZodValidationPipe(loginSchema)) body: LoginInput
 *
 * Keeping it per-route (rather than a global pipe) avoids the need to
 * bind a schema to a route key — the controller already imports the
 * schema, so wiring it here is one line and zero indirection.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    if (!this.schema || typeof this.schema.safeParse !== 'function') {
      return value;
    }
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }
}
