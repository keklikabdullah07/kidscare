import type { Student } from '@kidscare/shared-types';

/**
 * Response shape for /students endpoints. The shared `Student` type is
 * the wire format — NestJS serializes the `Student` entity instance to
 * JSON with the same field names, so no separate mapping class is needed.
 */
export type StudentResponse = Student;
