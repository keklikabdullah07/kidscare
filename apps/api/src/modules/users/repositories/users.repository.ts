import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, User as PrismaUser, UserRole } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface IUsersRepository {
  findMany(tenantId: string, role?: UserRole): Promise<PrismaUser[]>;
  findById(tenantId: string, id: string): Promise<PrismaUser | null>;
  findByEmail(tenantId: string, email: string): Promise<PrismaUser | null>;
  insert(
    tenantId: string,
    data: Omit<Prisma.UserUncheckedCreateInput, 'tenantId'>,
  ): Promise<PrismaUser>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(tenantId: string, role?: UserRole): Promise<PrismaUser[]> {
    return this.prisma.withTenant((client) =>
      client.user.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(role ? { role } : {}),
        },
        orderBy: [{ role: 'asc' }, { email: 'asc' }],
      }),
    );
  }

  async findById(tenantId: string, id: string): Promise<PrismaUser | null> {
    return this.prisma.withTenant((client) =>
      client.user.findFirst({
        where: { id, tenantId, isActive: true },
      }),
    );
  }

  async findByEmail(tenantId: string, email: string): Promise<PrismaUser | null> {
    return this.prisma.withTenant((client) =>
      client.user.findFirst({
        where: { tenantId, email: email.toLowerCase() },
      }),
    );
  }

  async insert(
    tenantId: string,
    data: Omit<Prisma.UserUncheckedCreateInput, 'tenantId'>,
  ): Promise<PrismaUser> {
    return this.prisma.withTenant((client) =>
      client.user.create({
        data: { ...data, tenantId },
      }),
    );
  }
}
