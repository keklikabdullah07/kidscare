import type { AuthResponse } from '@kidscare/shared-types';

/**
 * Response shape for /auth/signup and /auth/login. The shared
 * `AuthResponse` type is the wire format — NestJS serializes the
 * returned object directly, no separate mapping class needed.
 */
export type AuthResponseDto = AuthResponse;
