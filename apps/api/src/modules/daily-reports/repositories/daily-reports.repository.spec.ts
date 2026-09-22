import { DailyReportsRepository } from './daily-reports.repository';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { DailyReport as PrismaDailyReport } from '@kidscare/database';

const mockPrismaReport: PrismaDailyReport = {
  id: 'dr-1',
  tenantId: 't-1',
  studentId: 's-1',
  date: new Date('2026-09-15'),
  mood: 'HAPPY',
  meals: {},
  naps: {},
  potty: [],
  activities: [],
  medications: [],
  teacherNote: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DailyReportsRepository', () => {
  let repo: DailyReportsRepository;
  let withTenant: jest.Mock;

  beforeEach(() => {
    withTenant = jest.fn();
    const prisma = { withTenant } as unknown as PrismaService;
    repo = new DailyReportsRepository(prisma);
  });

  it('findByStudentAndDate queries scoped client', async () => {
    const findUnique = jest.fn().mockResolvedValue(mockPrismaReport);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) =>
      fn({ dailyReport: { findUnique } }),
    );
    const date = new Date('2026-09-15');
    const res = await repo.findByStudentAndDate('t-1', 's-1', date);
    expect(res?.id).toBe('dr-1');
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        tenantId_studentId_date: {
          tenantId: 't-1',
          studentId: 's-1',
          date,
        },
      },
    });
  });

  it('findByDate queries scoped client with order', async () => {
    const findMany = jest.fn().mockResolvedValue([mockPrismaReport]);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) =>
      fn({ dailyReport: { findMany } }),
    );
    const date = new Date('2026-09-15');
    const res = await repo.findByDate('t-1', date);
    expect(res).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith({
      where: { tenantId: 't-1', date },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('upsert delegates to prisma upsert with create & update data', async () => {
    const upsert = jest.fn().mockResolvedValue(mockPrismaReport);
    withTenant.mockImplementation((fn: (c: unknown) => unknown) => fn({ dailyReport: { upsert } }));
    const date = new Date('2026-09-15');
    const res = await repo.upsert('t-1', 's-1', date, {
      mood: 'HAPPY',
    });
    expect(res.id).toBe('dr-1');
    expect(upsert).toHaveBeenCalledWith({
      where: {
        tenantId_studentId_date: {
          tenantId: 't-1',
          studentId: 's-1',
          date,
        },
      },
      create: expect.objectContaining({
        tenantId: 't-1',
        studentId: 's-1',
        mood: 'HAPPY',
      }),
      update: { mood: 'HAPPY' },
    });
  });

  it('bulkUpsert calls prisma upsert once per item and returns rows in order', async () => {
    const upsert = jest
      .fn()
      .mockImplementation(
        async ({
          where,
        }: {
          where: { tenantId_studentId_date: { studentId: string } };
        }) => ({
          ...mockPrismaReport,
          studentId: where.tenantId_studentId_date.studentId,
        }),
      );
    withTenant.mockImplementation((fn: (c: unknown) => unknown) => fn({ dailyReport: { upsert } }));
    const date = new Date('2026-09-15');
    const res = await repo.bulkUpsert('t-1', date, [
      { studentId: 's-1', data: { mood: 'HAPPY' } },
      { studentId: 's-2', data: { meals: { breakfast: 'ALL' } } },
    ]);
    expect(res).toHaveLength(2);
    expect(res[0]?.studentId).toBe('s-1');
    expect(res[1]?.studentId).toBe('s-2');
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId_studentId_date: expect.objectContaining({ studentId: 's-1' }),
        }),
        create: expect.objectContaining({ studentId: 's-1' }),
        update: { mood: 'HAPPY' },
      }),
    );
    expect(upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId_studentId_date: expect.objectContaining({ studentId: 's-2' }),
        }),
        create: expect.objectContaining({ studentId: 's-2' }),
        update: { meals: { breakfast: 'ALL' } },
      }),
    );
  });

  it('bulkUpsert returns empty array when no items', async () => {
    const upsert = jest.fn();
    withTenant.mockImplementation((fn: (c: unknown) => unknown) => fn({ dailyReport: { upsert } }));
    const date = new Date('2026-09-15');
    const res = await repo.bulkUpsert('t-1', date, []);
    expect(res).toHaveLength(0);
    expect(upsert).not.toHaveBeenCalled();
  });
});
