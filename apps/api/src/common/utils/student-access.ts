import { ForbiddenException } from '@nestjs/common';
import type { UserRole } from '@kidscare/shared-types';

/** Parents may only access students explicitly linked via parentId. */
export function assertStudentVisibleToUser(
  student: { parentId: string | null },
  role: UserRole,
  userId: string,
): void {
  if (role === 'PARENT' && student.parentId !== userId) {
    throw new ForbiddenException('You may only access your linked children');
  }
}
