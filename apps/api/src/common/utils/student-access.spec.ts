import { ForbiddenException } from '@nestjs/common';
import { assertStudentVisibleToUser } from './student-access';

describe('assertStudentVisibleToUser', () => {
  const student = {
    parentId: 'parent-1',
    classroomId: 'classroom-a',
    passport: { serviceStaffId: 'service-1' },
  };

  it('allows SUPER_ADMIN and ADMIN to access any student', () => {
    expect(() =>
      assertStudentVisibleToUser(student, 'SUPER_ADMIN', 'admin-user-id'),
    ).not.toThrow();
    expect(() =>
      assertStudentVisibleToUser(student, 'ADMIN', 'admin-user-id'),
    ).not.toThrow();
  });

  describe('PARENT role', () => {
    it('allows parent to access linked student', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'PARENT', 'parent-1'),
      ).not.toThrow();
    });

    it('throws ForbiddenException when parent tries to access another child', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'PARENT', 'other-parent-id'),
      ).toThrow(ForbiddenException);
    });
  });

  describe('TEACHER role', () => {
    it('allows teacher to access student in their assigned classroom', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'TEACHER', 'teacher-1', ['classroom-a', 'classroom-b']),
      ).not.toThrow();
    });

    it('throws ForbiddenException when teacher accesses student from another classroom', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'TEACHER', 'teacher-1', ['classroom-x', 'classroom-y']),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when teacher has no classrooms assigned', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'TEACHER', 'teacher-1', []),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when student has no classroom assigned', () => {
      const unassignedStudent = { parentId: 'p-1', classroomId: null };
      expect(() =>
        assertStudentVisibleToUser(unassignedStudent, 'TEACHER', 'teacher-1', ['classroom-a']),
      ).toThrow(ForbiddenException);
    });
  });

  describe('SERVICE_STAFF role', () => {
    it('allows service staff to access assigned student', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'SERVICE_STAFF', 'service-1'),
      ).not.toThrow();
    });

    it('throws ForbiddenException when service staff accesses student on another route', () => {
      expect(() =>
        assertStudentVisibleToUser(student, 'SERVICE_STAFF', 'other-service-id'),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when student has no service staff assigned', () => {
      const nonServiceStudent = { parentId: 'p-1', classroomId: 'c-1', passport: {} };
      expect(() =>
        assertStudentVisibleToUser(nonServiceStudent, 'SERVICE_STAFF', 'service-1'),
      ).toThrow(ForbiddenException);
    });
  });
});
