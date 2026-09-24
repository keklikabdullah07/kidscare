import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Classroom,
  ClassroomDailyFlow,
  ClassroomTeacherAssignment,
} from '@kidscare/shared-types';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { DailyReport } from '../../daily-reports/entities/daily-report.entity';
import type {
  ClassroomCreate,
  ClassroomTeacherAssignmentInput,
  ClassroomUpdate,
} from '@kidscare/shared-schemas';
import {
  ClassroomsRepository,
  type IClassroomsRepository,
} from '../repositories/classrooms.repository';

type ClassroomUser = { userId: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' };

@Injectable()
export class ClassroomsService {
  constructor(
    @Inject(ClassroomsRepository)
    private readonly classroomsRepository: IClassroomsRepository,
  ) {}

  async list(tenantId: string, user: ClassroomUser): Promise<Classroom[]> {
    const teacherId = user.role === 'TEACHER' ? user.userId : undefined;
    const rows = await this.classroomsRepository.findMany(tenantId, teacherId);
    return rows.map((row) => this.toResponse(row));
  }

  async findById(
    tenantId: string,
    classroomId: string,
    teacherId?: string,
  ): Promise<Classroom | null> {
    const row = await this.classroomsRepository.findById(tenantId, classroomId, teacherId);
    return row ? this.toResponse(row) : null;
  }

  async getDailyFlow(
    tenantId: string,
    classroomId: string,
    dateString: string,
    user: ClassroomUser,
  ): Promise<ClassroomDailyFlow> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new BadRequestException('Date must use YYYY-MM-DD format');
    }

    const date = new Date(`${dateString}T00:00:00.000Z`);
    const teacherId = user.role === 'TEACHER' ? user.userId : undefined;
    const row = await this.classroomsRepository.findDailyFlow(
      tenantId,
      classroomId,
      date,
      teacherId,
    );
    if (!row) throw new NotFoundException('Classroom not found');

    return {
      classroom: { id: row.id, name: row.name, ageGroup: row.ageGroup },
      date: dateString,
      students: row.students.map((student) => ({
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          isActive: student.isActive,
        },
        attendance: student.attendances[0] ? Attendance.fromPrisma(student.attendances[0]) : null,
        dailyReport: student.dailyReports[0]
          ? DailyReport.fromPrisma(student.dailyReports[0])
          : null,
      })),
    };
  }

  async create(tenantId: string, input: ClassroomCreate): Promise<Classroom> {
    try {
      const row = await this.classroomsRepository.create(tenantId, {
        name: input.name,
        ageGroup: input.ageGroup ?? null,
      });
      return this.toResponse(row);
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('A classroom with this name already exists');
      }
      throw error;
    }
  }

  async update(tenantId: string, id: string, input: ClassroomUpdate): Promise<Classroom> {
    const existing = await this.classroomsRepository.findById(tenantId, id);
    if (!existing) throw new NotFoundException('Classroom not found');

    const row = await this.classroomsRepository.update(tenantId, id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.ageGroup !== undefined ? { ageGroup: input.ageGroup } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
    return this.toResponse(row);
  }

  async assignTeacher(
    tenantId: string,
    classroomId: string,
    input: ClassroomTeacherAssignmentInput,
  ): Promise<Classroom> {
    const classroom = await this.classroomsRepository.findById(tenantId, classroomId);
    if (!classroom) throw new NotFoundException('Classroom not found');

    const teacher = await this.classroomsRepository.findTeacher(tenantId, input.teacherId);
    if (!teacher) throw new NotFoundException('Active teacher not found');

    const row = await this.classroomsRepository.assignTeacher(
      tenantId,
      classroomId,
      input.teacherId,
    );
    return this.toResponse(row);
  }

  private toResponse(row: {
    id: string;
    tenantId: string;
    name: string;
    ageGroup: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    teacherAssignments: Array<{ id: string; teacherId: string; assignedAt: Date }>;
    students: Array<{ id: string }>;
  }): Classroom {
    const teachers: ClassroomTeacherAssignment[] = row.teacherAssignments.map((assignment) => ({
      id: assignment.id,
      teacherId: assignment.teacherId,
      assignedAt: assignment.assignedAt.toISOString(),
    }));

    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      ageGroup: row.ageGroup,
      isActive: row.isActive,
      teachers,
      studentCount: row.students.length,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}
