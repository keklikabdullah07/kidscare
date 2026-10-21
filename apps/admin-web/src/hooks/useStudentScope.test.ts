import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../api/students', () => ({
  listStudents: vi.fn(),
}));
vi.mock('../api/classrooms', () => ({
  listClassrooms: vi.fn(),
}));

import { useStudentScope } from './useStudentScope';

describe('useStudentScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('locks to single child and hides classroom filter when user is PARENT', async () => {
    const { useAuth } = await import('../features/auth/AuthContext');
    const { listStudents } = await import('../api/students');
    const { listClassrooms } = await import('../api/classrooms');

    vi.mocked(useAuth).mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'parent-1', role: 'PARENT', tenantId: 'demo' },
      },
      login: async () => {},
      signup: async () => {},
      logout: () => {},
    } as never);

    vi.mocked(listStudents).mockResolvedValue([
      {
        id: 'child-1',
        firstName: 'Ada',
        lastName: 'Yılmaz',
        classroomId: 'c1',
        parentId: 'parent-1',
        passport: null,
      },
    ] as never);
    vi.mocked(listClassrooms).mockResolvedValue([]);

    const { result } = renderHook(() => useStudentScope());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isParent).toBe(true);
    expect(result.current.showClassroomFilter).toBe(false);
    expect(result.current.selectedStudentId).toBe('child-1');
    expect(result.current.availableStudents).toHaveLength(1);
    expect(result.current.showStudentFilter).toBe(false);
    expect(result.current.activeChild?.id).toBe('child-1');
  });

  it('locks to teacher classrooms and scopes students when user is TEACHER', async () => {
    const { useAuth } = await import('../features/auth/AuthContext');
    const { listStudents } = await import('../api/students');
    const { listClassrooms } = await import('../api/classrooms');

    vi.mocked(useAuth).mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'teacher-1', role: 'TEACHER', tenantId: 'demo' },
      },
      login: async () => {},
      signup: async () => {},
      logout: () => {},
    } as never);

    vi.mocked(listClassrooms).mockResolvedValue([
      {
        id: 'c1',
        name: 'Papatyalar',
        teachers: [{ id: 'a1', teacherId: 'teacher-1', assignedAt: '2026-01-01' }],
      },
      {
        id: 'c2',
        name: 'Güller',
        teachers: [
          { id: 'a2', teacherId: 'other-teacher', assignedAt: '2026-01-01' },
          { id: 'a3', teacherId: 'teacher-1', assignedAt: '2026-02-01' },
        ],
      },
    ] as never);

    vi.mocked(listStudents).mockResolvedValue([
      { id: 's1', firstName: 'Ali', classroomId: 'c1', parentId: 'p1', passport: null },
      { id: 's2', firstName: 'Veli', classroomId: 'c2', parentId: 'p2', passport: null },
    ] as never);

    const { result } = renderHook(() => useStudentScope());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isTeacher).toBe(true);
    expect(result.current.availableClassrooms).toHaveLength(2);
    expect(result.current.availableStudents).toHaveLength(2);
    expect(result.current.showClassroomFilter).toBe(true);
    expect(result.current.hasMultipleClassrooms).toBe(true);
  });

  it('exposes singleClassroom and hides classroom filter when teacher has only 1 classroom', async () => {
    const { useAuth } = await import('../features/auth/AuthContext');
    const { listStudents } = await import('../api/students');
    const { listClassrooms } = await import('../api/classrooms');

    vi.mocked(useAuth).mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'teacher-1', role: 'TEACHER', tenantId: 'demo' },
      },
      login: async () => {},
      signup: async () => {},
      logout: () => {},
    } as never);

    vi.mocked(listClassrooms).mockResolvedValue([
      {
        id: 'c1',
        name: 'Minik Adımlar',
        teachers: [{ id: 'a1', teacherId: 'teacher-1', assignedAt: '2026-01-01' }],
      },
    ] as never);

    vi.mocked(listStudents).mockResolvedValue([
      { id: 's1', firstName: 'Ali', classroomId: 'c1', parentId: 'p1', passport: null },
    ] as never);

    const { result } = renderHook(() => useStudentScope());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasMultipleClassrooms).toBe(false);
    expect(result.current.singleClassroom?.name).toBe('Minik Adımlar');
    expect(result.current.showClassroomFilter).toBe(false);
    expect(result.current.selectedClassroomId).toBe('c1');
  });

  it('exposes singleChild and hides student filter when PARENT has only 1 child', async () => {
    const { useAuth } = await import('../features/auth/AuthContext');
    const { listStudents } = await import('../api/students');
    const { listClassrooms } = await import('../api/classrooms');

    vi.mocked(useAuth).mockReturnValue({
      state: {
        status: 'authenticated',
        user: { id: 'parent-1', role: 'PARENT', tenantId: 'demo' },
      },
      login: async () => {},
      signup: async () => {},
      logout: () => {},
    } as never);

    vi.mocked(listStudents).mockResolvedValue([
      {
        id: 'child-1',
        firstName: 'Ada',
        lastName: 'Yılmaz',
        classroomId: 'c1',
        parentId: 'parent-1',
        passport: null,
      },
    ] as never);
    vi.mocked(listClassrooms).mockResolvedValue([]);

    const { result } = renderHook(() => useStudentScope());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.singleChild?.firstName).toBe('Ada');
    expect(result.current.hasMultipleChildren).toBe(false);
    expect(result.current.showStudentFilter).toBe(false);
    expect(result.current.showClassroomFilter).toBe(false);
  });
});
