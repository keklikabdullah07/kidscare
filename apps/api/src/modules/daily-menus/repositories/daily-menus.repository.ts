import { Inject, Injectable } from '@nestjs/common';
import type { DailyMenu as PrismaDailyMenu, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface IDailyMenusRepository {
  findByDate(tenantId: string, date: Date): Promise<PrismaDailyMenu | null>;
  findByDateRange(tenantId: string, from: Date, to: Date): Promise<PrismaDailyMenu[]>;
  upsert(
    tenantId: string,
    date: Date,
    data: {
      breakfast?: string[];
      lunch?: string[];
      snack?: string[];
      allergens?: string[];
      calories?: number | null;
      notes?: string | null;
    },
  ): Promise<PrismaDailyMenu>;
  delete(tenantId: string, date: Date): Promise<PrismaDailyMenu>;
}

@Injectable()
export class DailyMenusRepository implements IDailyMenusRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByDate(tenantId: string, date: Date): Promise<PrismaDailyMenu | null> {
    return this.prisma.withTenant((client) =>
      client.dailyMenu.findUnique({
        where: {
          tenantId_date: {
            tenantId,
            date,
          },
        },
      }),
    );
  }

  async findByDateRange(tenantId: string, from: Date, to: Date): Promise<PrismaDailyMenu[]> {
    return this.prisma.withTenant((client) =>
      client.dailyMenu.findMany({
        where: {
          tenantId,
          date: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { date: 'asc' },
      }),
    );
  }

  async upsert(
    tenantId: string,
    date: Date,
    data: {
      breakfast?: string[];
      lunch?: string[];
      snack?: string[];
      allergens?: string[];
      calories?: number | null;
      notes?: string | null;
    },
  ): Promise<PrismaDailyMenu> {
    const breakfast = data.breakfast ?? [];
    const lunch = data.lunch ?? [];
    const snack = data.snack ?? [];
    const allergens = data.allergens ?? [];
    const calories = data.calories ?? null;
    const notes = data.notes ?? null;

    const createData: Prisma.DailyMenuUncheckedCreateInput = {
      tenantId,
      date,
      breakfast,
      lunch,
      snack,
      allergens,
      calories,
      notes,
    };

    const updateData: Prisma.DailyMenuUpdateInput = {};
    if (data.breakfast !== undefined) updateData.breakfast = breakfast;
    if (data.lunch !== undefined) updateData.lunch = lunch;
    if (data.snack !== undefined) updateData.snack = snack;
    if (data.allergens !== undefined) updateData.allergens = allergens;
    if (data.calories !== undefined) updateData.calories = calories;
    if (data.notes !== undefined) updateData.notes = notes;

    return this.prisma.withTenant((client) =>
      client.dailyMenu.upsert({
        where: {
          tenantId_date: {
            tenantId,
            date,
          },
        },
        create: createData,
        update: updateData,
      }),
    );
  }

  async delete(tenantId: string, date: Date): Promise<PrismaDailyMenu> {
    return this.prisma.withTenant((client) =>
      client.dailyMenu.delete({
        where: {
          tenantId_date: {
            tenantId,
            date,
          },
        },
      }),
    );
  }
}
