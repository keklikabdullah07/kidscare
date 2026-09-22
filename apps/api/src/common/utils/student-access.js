import { ForbiddenException } from '@nestjs/common';
/** Parents may only access students explicitly linked via parentId. */
export function assertStudentVisibleToUser(student, role, userId) {
    if (role === 'PARENT' && student.parentId !== userId) {
        throw new ForbiddenException('You may only access your linked children');
    }
}
