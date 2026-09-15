import { DailyMenusRepository } from './daily-menus.repository';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { DailyMenu as PrismaDailyMenu } from '@kidscare/database';

const mockPrismaMenu: PrismaDailyMenu = {
  id: 'menu-1',
  tenantId: 't-1',
  date: new Date('2026-09-15'),
  breakfast: ['Yumurta', 'Peynir'],
  lunch: ['Tavuk', 'Pilav'],
  snack: ['Muz'],
  allergens: ['Yumurta'],
  calories: 850,
  notes: 'Taze',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DailyMenusRepository', () => {
  let repo: DailyMenusRepository;
  let withTenant: jest.Mock;

  beforeEach(() => {
    withTenant = jest.fn();
    const prisma = { withTenant } as unknown as PrismaService;
    repo = new DailyMenusRepository(prisma);
  });

  it('findByDate queries scoped client for unique tenant and date', async () => {
    const findUnique = jest.fn().mockResolvedValue(mockPrismaMenu);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) =>
      fn({ dailyMenu: { findUnique } }),
    );
    const date = new Date('2026-09-15');
    const res = await repo.findByDate('t-1', date);
    expect(res?.id).toBe('menu-1');
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        tenantId_date: {
          tenantId: 't-1',
          date,
        },
      },
    });
  });

  it('findByDateRange queries scoped client within date interval', async () => {
    const findMany = jest.fn().mockResolvedValue([mockPrismaMenu]);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) => fn({ dailyMenu: { findMany } }));
    const from = new Date('2026-09-01');
    const to = new Date('2026-09-30');
    const res = await repo.findByDateRange('t-1', from, to);
    expect(res).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        tenantId: 't-1',
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });
  });

  it('upsert creates or updates menu', async () => {
    const upsert = jest.fn().mockResolvedValue(mockPrismaMenu);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) => fn({ dailyMenu: { upsert } }));
    const date = new Date('2026-09-15');
    const res = await repo.upsert('t-1', date, {
      breakfast: ['Yumurta'],
      lunch: ['Tavuk'],
    });
    expect(res.id).toBe('menu-1');
    expect(upsert).toHaveBeenCalledWith({
      where: {
        tenantId_date: {
          tenantId: 't-1',
          date,
        },
      },
      create: expect.objectContaining({
        tenantId: 't-1',
        date,
        breakfast: ['Yumurta'],
      }),
      update: expect.objectContaining({
        breakfast: ['Yumurta'],
      }),
    });
  });

  it('delete removes menu for tenant and date', async () => {
    const del = jest.fn().mockResolvedValue(mockPrismaMenu);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) =>
      fn({ dailyMenu: { delete: del } }),
    );
    const date = new Date('2026-09-15');
    const res = await repo.delete('t-1', date);
    expect(res.id).toBe('menu-1');
    expect(del).toHaveBeenCalledWith({
      where: {
        tenantId_date: {
          tenantId: 't-1',
          date,
        },
      },
    });
  });
});
