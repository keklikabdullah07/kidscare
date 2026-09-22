export type ClassroomTeacherAssignment = {
  id: string;
  teacherId: string;
  assignedAt: string;
};

export type Classroom = {
  id: string;
  tenantId: string;
  name: string;
  ageGroup: string | null;
  isActive: boolean;
  teachers: ClassroomTeacherAssignment[];
  studentCount: number;
  createdAt: string;
  updatedAt: string;
};
