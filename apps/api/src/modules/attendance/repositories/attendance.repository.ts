import { Inject, Injectable } from '@nestjs/common';
import type { Attendance as PrismaAttendance, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface IAttendanceRepository {
  findByDate(tenantId: string, date: Date): Promise<PrismaAttendance[]>;
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
}

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByDate(tenantId: string, date: Date): Promise<PrismaAttendance[]> {
    return this.prisma.withTenant((client) =>
      client.attendance.findMany({
        where: { tenantId, date },
        orderBy: { createdAt: 'asc' },
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
