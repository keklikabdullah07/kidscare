import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, ActivityPost as PrismaActivityPost } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface IActivitiesRepository {
  findMany(
    tenantId: string,
    options?: {
      classroom?: string | undefined;
      tag?: string | undefined;
      studentId?: string | undefined;
      limit?: number | undefined;
      offset?: number | undefined;
    },
  ): Promise<PrismaActivityPost[]>;
  findById(tenantId: string, id: string): Promise<PrismaActivityPost | null>;
  create(
    tenantId: string,
    data: Omit<Prisma.ActivityPostUncheckedCreateInput, 'tenantId'>,
  ): Promise<PrismaActivityPost>;
  softDelete(tenantId: string, id: string): Promise<PrismaActivityPost>;
}

@Injectable()
export class ActivitiesRepository implements IActivitiesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(
    tenantId: string,
    options: {
      classroom?: string | undefined;
      tag?: string | undefined;
      studentId?: string | undefined;
      limit?: number | undefined;
      offset?: number | undefined;
    } = {},
  ): Promise<PrismaActivityPost[]> {
    return this.prisma.withTenant(async (client) => {
      const where: Prisma.ActivityPostWhereInput = {
        tenantId,
        deletedAt: null,
      };

      if (options.classroom) {
        where.OR = [{ classroom: options.classroom }, { classroom: null }];
      }

      const posts = await client.activityPost.findMany({
        where,
        orderBy: { activityDate: 'desc' },
        take: options.limit ?? 30,
        skip: options.offset ?? 0,
      });

      // Filter in-memory for JSON array fields if tag/studentId is specified
      return posts.filter((post) => {
        if (options.tag) {
          const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
          if (!tags.includes(options.tag)) return false;
        }
        if (options.studentId) {
          const tagged = Array.isArray(post.taggedStudentIds)
            ? (post.taggedStudentIds as string[])
            : [];
          if (tagged.length > 0 && !tagged.includes(options.studentId)) return false;
        }
        return true;
      });
    });
  }

  async findById(tenantId: string, id: string): Promise<PrismaActivityPost | null> {
    return this.prisma.withTenant((client) =>
      client.activityPost.findFirst({
        where: {
          id,
          tenantId,
          deletedAt: null,
        },
      }),
    );
  }

  async create(
    tenantId: string,
    data: Omit<Prisma.ActivityPostUncheckedCreateInput, 'tenantId'>,
  ): Promise<PrismaActivityPost> {
    return this.prisma.withTenant((client) =>
      client.activityPost.create({
        data: {
          ...data,
          tenantId,
        },
      }),
    );
  }

  async softDelete(tenantId: string, id: string): Promise<PrismaActivityPost> {
    return this.prisma.withTenant((client) =>
      client.activityPost.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    );
  }
}
