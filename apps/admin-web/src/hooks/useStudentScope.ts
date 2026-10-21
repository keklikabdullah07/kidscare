import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { listStudents } from '../api/students';
import { listClassrooms } from '../api/classrooms';
import type { Classroom, Student, UserRole } from '@kidscare/shared-types';

export interface UseStudentScopeResult {
  role: UserRole;
  isStaff: boolean;
  isTeacher: boolean;
  isParent: boolean;
  loading: boolean;
  classrooms: Classroom[];
  students: Student[];
  availableClassrooms: Classroom[];
  availableStudents: Student[];
  selectedClassroomId: string;
  setSelectedClassroomId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  showClassroomFilter: boolean;
  showStudentFilter: boolean;
  activeChild?: Student | null;
  refresh: () => Promise<void>;
  // Adaptive scope (Spec 0062):
  hasMultipleClassrooms: boolean;
  singleClassroom: Classroom | null;
  hasMultipleChildren: boolean;
  singleChild: Student | null;
}

export function useStudentScope(): UseStudentScopeResult {
  const { state } = useAuth();
  const role: UserRole = state.status === 'authenticated' ? state.user.role : 'PARENT';
  const currentUserId = state.status === 'authenticated' ? state.user.id : null;

  const isStaff = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isTeacher = role === 'TEACHER';
  const isParent = role === 'PARENT';

  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [classList, studentList] = await Promise.all([
        isParent
          ? (Promise.resolve([]) as Promise<Classroom[]>)
          : listClassrooms().catch(() => [] as Classroom[]),
        listStudents().catch(() => [] as Student[]),
      ]);
      setClassrooms(classList);
      setStudents(studentList);
    } finally {
      setLoading(false);
    }
  }, [isParent]);

  useEffect(() => {
    void load();
  }, [load, role, currentUserId]);

  // Öğretmen için sadece kendi sınıfları
  const availableClassrooms = useMemo(() => {
    if (isStaff) return classrooms;
    if (isTeacher) {
      if (!currentUserId) return [];
      const assigned = classrooms.filter((cls) =>
        cls.teachers?.some((t) => t.teacherId === currentUserId),
      );
      if (assigned.length > 0) return assigned;
      if (classrooms.length === 1) return classrooms;
      return [];
    }
    return [];
  }, [isStaff, isTeacher, classrooms, currentUserId]);

  const teacherClassroomIds = useMemo(
    () => new Set(availableClassrooms.map((c) => c.id)),
    [availableClassrooms],
  );

  // Rol bazlı erişilebilir öğrenciler
  const availableStudents = useMemo(() => {
    if (isParent) {
      // Veli: Backend zaten sadece velinin çocuklarını döner; savunmacı kontrol:
      if (currentUserId) {
        return students.filter((s) => {
          if (s.parentId === currentUserId) return true;
          const pass = (s.passport as Record<string, unknown> | null) ?? {};
          return pass['secondaryParentId'] === currentUserId;
        });
      }
      return students;
    }
    if (isTeacher) {
      if (teacherClassroomIds.size === 0) return [];
      let pool = students.filter(
        (s) => s.classroomId != null && teacherClassroomIds.has(s.classroomId),
      );
      if (selectedClassroomId) {
        pool = pool.filter((s) => s.classroomId === selectedClassroomId);
      }
      return pool;
    }
    if (selectedClassroomId) {
      return students.filter((s) => s.classroomId === selectedClassroomId);
    }
    return students;
  }, [isParent, isTeacher, students, currentUserId, teacherClassroomIds, selectedClassroomId]);

  // Otomatik seçim senkronizasyonu
  useEffect(() => {
    if (isParent) {
      if (availableStudents.length === 1) {
        setSelectedStudentId(availableStudents[0]?.id ?? '');
      } else if (
        availableStudents.length > 1 &&
        (!selectedStudentId || !availableStudents.some((s) => s.id === selectedStudentId))
      ) {
        setSelectedStudentId(availableStudents[0]?.id ?? '');
      }
    } else if (isTeacher) {
      if (availableClassrooms.length === 1 && !selectedClassroomId) {
        setSelectedClassroomId(availableClassrooms[0]?.id ?? '');
      }
    }
  }, [
    isParent,
    isTeacher,
    availableStudents,
    availableClassrooms,
    selectedStudentId,
    selectedClassroomId,
  ]);

  const showClassroomFilter = isStaff || (isTeacher && availableClassrooms.length > 1);
  const showStudentFilter = isParent ? availableStudents.length > 1 : true;
  const activeChild = isParent
    ? (availableStudents.find((s) => s.id === selectedStudentId) ?? availableStudents[0] ?? null)
    : null;

  // Adaptive scope (Spec 0062):
  // Çok sınıf: yalnızca birden fazla sınıf varsa (veli hariç — veli sınıf görmez)
  const hasMultipleClassrooms = isParent ? false : availableClassrooms.length > 1;
  // Tek sınıf rozeti: öğretmen/staff için (veli hariç) ve yalnızca 1 sınıf varsa
  const singleClassroom =
    !isParent && availableClassrooms.length === 1 ? (availableClassrooms[0] ?? null) : null;

  // Çok çocuk: yalnızca veli ise ve birden fazla çocuk varsa
  const hasMultipleChildren = isParent && availableStudents.length > 1;
  const singleChild =
    isParent && availableStudents.length === 1 ? (availableStudents[0] ?? null) : null;

  return {
    role,
    isStaff,
    isTeacher,
    isParent,
    loading,
    classrooms,
    students,
    availableClassrooms,
    availableStudents,
    selectedClassroomId,
    setSelectedClassroomId,
    selectedStudentId,
    setSelectedStudentId,
    showClassroomFilter,
    showStudentFilter,
    activeChild,
    refresh: load,
    hasMultipleClassrooms,
    singleClassroom,
    hasMultipleChildren,
    singleChild,
  };
}
