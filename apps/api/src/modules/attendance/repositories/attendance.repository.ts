import { Inject, Injectable } from '@nestjs/common';
import type {
  Attendance as PrismaAttendance,
  AttendanceExcuse as PrismaAttendanceExcuse,
  Prisma,
} from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type AttendanceExcuseWithStudent = PrismaAttendanceExcuse & {
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export interface IAttendanceRepository {
  findByDate(tenantId: string, date: Date, studentIds?: string[]): Promise<PrismaAttendance[]>;
  findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    studentIds?: string[],
  ): Promise<PrismaAttendance[]>;
  findByStudentAndDate(
    tenantId: string,
    studentId: string,
    date: Date,
  ): Promise<PrismaAttendance | null>;
  upsert(
    tenantId: string,
    studentId: string,
    date: Date,
    data: Prisma.AttendanceUpdateInput,
  ): Promise<PrismaAttendance>;
  createExcuse(
    tenantId: string,
    data: {
      studentId: string;
      date: Date;
      reason: string;
      notes?: string | null;
      createdById: string;
    },
  ): Promise<AttendanceExcuseWithStudent>;
  findExcuses(
    tenantId: string,
    params: { date?: Date; studentId?: string; studentIds?: string[] },
  ): Promise<AttendanceExcuseWithStudent[]>;
}

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByDate(tenantId: string, date: Date, studentIds?: string[]): Promise<PrismaAttendance[]> {
    return this.prisma.withTenant((client) =>
      client.attendance.findMany({
        where: {
          tenantId,
          date,
          ...(studentIds && studentIds.length > 0 ? { studentId: { in: studentIds } } : {}),
        },
        orderBy: { createdAt: 'asc' },
      }),
    );
  }

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    studentIds?: string[],
  ): Promise<PrismaAttendance[]> {
    return this.prisma.withTenant((client) =>
      client.attendance.findMany({
        where: {
          tenantId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          ...(studentIds && studentIds.length > 0 ? { studentId: { in: studentIds } } : {}),
        },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
    );
  }

  async findByStudentAndDate(
    tenantId: string,
    studentId: string,
    date: Date,
  ): Promise<PrismaAttendance | null> {
    return this.prisma.withTenant((client) =>
      client.attendance.findUnique({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId,
            date,
          },
        },
      }),
    );
  }

  async createExcuse(
    tenantId: string,
    data: {
      studentId: string;
      date: Date;
      reason: string;
      notes?: string | null;
      createdById: string;
    },
  ): Promise<AttendanceExcuseWithStudent> {
    return this.prisma.withTenant((client) =>
      client.attendanceExcuse.upsert({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId: data.studentId,
            date: data.date,
          },
        },
        create: {
          tenantId,
          studentId: data.studentId,
          date: data.date,
          reason: data.reason,
          notes: data.notes ?? null,
          createdById: data.createdById,
        },
        update: {
          reason: data.reason,
          notes: data.notes ?? null,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    );
  }

  async findExcuses(
    tenantId: string,
    params: { date?: Date; studentId?: string; studentIds?: string[] },
  ): Promise<AttendanceExcuseWithStudent[]> {
    const where: Prisma.AttendanceExcuseWhereInput = { tenantId };
    if (params.date) {
      where.date = params.date;
    }
    if (params.studentId) {
      where.studentId = params.studentId;
    } else if (params.studentIds && params.studentIds.length > 0) {
      where.studentId = { in: params.studentIds };
    }

    return this.prisma.withTenant((client) =>
      client.attendanceExcuse.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async upsert(
    tenantId: string,
    studentId: string,
    date: Date,
    data: Prisma.AttendanceUpdateInput,
  ): Promise<PrismaAttendance> {
    const createData: Prisma.AttendanceUncheckedCreateInput = {
      tenantId,
      studentId,
      date,
      status: typeof data.status === 'string' ? data.status : 'ABSENT',
      checkInTime: typeof data.checkInTime === 'string' ? data.checkInTime : null,
      checkInBy: typeof data.checkInBy === 'string' ? data.checkInBy : null,
      checkOutTime: typeof data.checkOutTime === 'string' ? data.checkOutTime : null,
      checkOutBy: typeof data.checkOutBy === 'string' ? data.checkOutBy : null,
      pickupContactId: typeof data.pickupContactId === 'string' ? data.pickupContactId : null,
      pickupNote: typeof data.pickupNote === 'string' ? data.pickupNote : null,
      note: typeof data.note === 'string' ? data.note : null,
    };

    return this.prisma.withTenant((client) =>
      client.attendance.upsert({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId,
            date,
          },
        },
        create: createData,
        update: data,
      }),
    );
  }
}
