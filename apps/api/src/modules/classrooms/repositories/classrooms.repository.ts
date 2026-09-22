import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

type ClassroomWithDetails = Prisma.ClassroomGetPayload<{
  include: {
    teacherAssignments: {
      where: { removedAt: null };
      select: { id: true; teacherId: true; assignedAt: true };
    };
    students: { where: { isActive: true }; select: { id: true } };
  };
}>;

type ClassroomDailyFlowRow = Prisma.ClassroomGetPayload<{
  include: {
    students: {
      where: { isActive: true };
      include: { dailyReports: true; attendances: true };
    };
  };
}>;

export interface IClassroomsRepository {
  findMany(tenantId: string, teacherId?: string): Promise<ClassroomWithDetails[]>;
  findDailyFlow(
    tenantId: string,
    classroomId: string,
    date: Date,
    teacherId?: string,
  ): Promise<ClassroomDailyFlowRow | null>;
  findById(
    tenantId: string,
    id: string,
    teacherId?: string,
  ): Promise<ClassroomWithDetails | null>;
  create(
    tenantId: string,
    data: Omit<Prisma.ClassroomUncheckedCreateInput, 'tenantId'>,
  ): Promise<ClassroomWithDetails>;
  update(
    tenantId: string,
    id: string,
    data: Prisma.ClassroomUpdateInput,
  ): Promise<ClassroomWithDetails>;
  findTeacher(tenantId: string, teacherId: string): Promise<{ id: string } | null>;
  assignTeacher(
    tenantId: string,
    classroomId: string,
    teacherId: string,
  ): Promise<ClassroomWithDetails>;
}

@Injectable()
export class ClassroomsRepository implements IClassroomsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private readonly details = {
    teacherAssignments: {
      where: { removedAt: null },
      select: { id: true, teacherId: true, assignedAt: true },
    },
    students: { where: { isActive: true }, select: { id: true } },
  } satisfies Prisma.ClassroomInclude;

  async findMany(tenantId: string, teacherId?: string): Promise<ClassroomWithDetails[]> {
    return this.prisma.withTenant((client) =>
      client.classroom.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(teacherId
            ? { teacherAssignments: { some: { teacherId, removedAt: null } } }
            : {}),
        },
        include: this.details,
        orderBy: { name: 'asc' },
      }),
    );
  }

  async findDailyFlow(
    tenantId: string,
    classroomId: string,
    date: Date,
    teacherId?: string,
  ): Promise<ClassroomDailyFlowRow | null> {
    return this.prisma.withTenant((client) =>
      client.classroom.findFirst({
        where: {
          tenantId,
          id: classroomId,
          isActive: true,
          ...(teacherId
            ? { teacherAssignments: { some: { teacherId, removedAt: null } } }
            : {}),
        },
        include: {
          students: {
            where: { isActive: true },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            include: {
              dailyReports: { where: { date } },
              attendances: { where: { date } },
            },
          },
        },
      }),
    );
  }

  async findById(
    tenantId: string,
    id: string,
    teacherId?: string,
  ): Promise<ClassroomWithDetails | null> {
    return this.prisma.withTenant((client) =>
      client.classroom.findFirst({
        where: {
          tenantId,
          id,
          ...(teacherId
            ? { teacherAssignments: { some: { teacherId, removedAt: null } } }
            : {}),
        },
        include: this.details,
      }),
    );
  }

  async create(
    tenantId: string,
    data: Omit<Prisma.ClassroomUncheckedCreateInput, 'tenantId'>,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.withTenant((client) =>
      client.classroom.create({
        data: { ...data, tenantId },
        include: this.details,
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    data: Prisma.ClassroomUpdateInput,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.classroom.findFirst({ where: { tenantId, id } });
      if (!existing) throw new Error('Classroom not found');
      return client.classroom.update({ where: { id: existing.id }, data, include: this.details });
    });
  }

  async findTeacher(tenantId: string, teacherId: string): Promise<{ id: string } | null> {
    return this.prisma.withTenant((client) =>
      client.user.findFirst({ where: { tenantId, id: teacherId, role: 'TEACHER', isActive: true }, select: { id: true } }),
    );
  }

  async assignTeacher(
    tenantId: string,
    classroomId: string,
    teacherId: string,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.withTenant(async (client) => {
      await client.classroomTeacher.upsert({
        where: { tenantId_classroomId_teacherId: { tenantId, classroomId, teacherId } },
        create: { tenantId, classroomId, teacherId },
        update: { removedAt: null },
      });
      const classroom = await client.classroom.findFirst({
        where: { tenantId, id: classroomId },
        include: this.details,
      });
      if (!classroom) throw new Error('Classroom not found');
      return classroom;
    });
  }
}
