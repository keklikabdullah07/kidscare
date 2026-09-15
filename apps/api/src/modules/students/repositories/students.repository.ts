import { Injectable } from '@nestjs/common';
import type { Prisma, Student as PrismaStudent } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface IStudentsRepository {
  findMany(tenantId: string, options?: { includeDeleted?: boolean }): Promise<PrismaStudent[]>;
  findById(
    tenantId: string,
    id: string,
    options?: { includeDeleted?: boolean },
  ): Promise<PrismaStudent | null>;
  insert(tenantId: string, data: Prisma.StudentCreateWithoutTenantInput): Promise<PrismaStudent>;
  update(tenantId: string, id: string, data: Prisma.StudentUpdateInput): Promise<PrismaStudent>;
  softDelete(tenantId: string, id: string): Promise<PrismaStudent>;
}

@Injectable()
export class StudentsRepository implements IStudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    tenantId: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<PrismaStudent[]> {
    return this.prisma.withTenant((client) =>
      client.student.findMany({
        where: {
          tenantId,
          ...(options.includeDeleted ? {} : { deletedAt: null }),
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    );
  }

  async findById(
    tenantId: string,
    id: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<PrismaStudent | null> {
    return this.prisma.withTenant((client) =>
      client.student.findFirst({
        where: {
          id,
          tenantId,
          ...(options.includeDeleted ? {} : { deletedAt: null }),
        },
      }),
    );
  }

  async insert(
    tenantId: string,
    data: Prisma.StudentCreateWithoutTenantInput,
  ): Promise<PrismaStudent> {
    return this.prisma.withTenant((client) =>
      // tenantId comes from the explicit arg (matches the RLS session
      // variable set by withTenantContext); the relation field needs it.
      client.student.create({ data: { ...data, tenantId } }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    data: Prisma.StudentUpdateInput,
  ): Promise<PrismaStudent> {
    return this.prisma.withTenant((client) => client.student.update({ where: { id }, data }));
  }

  async softDelete(tenantId: string, id: string): Promise<PrismaStudent> {
    return this.prisma.withTenant((client) =>
      client.student.update({ where: { id }, data: { deletedAt: new Date() } }),
    );
  }
}
