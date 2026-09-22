import { DailyReportsRepository } from './daily-reports.repository';
const mockPrismaReport = {
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
    let repo;
    let withTenant;
    beforeEach(() => {
        withTenant = jest.fn();
        const prisma = { withTenant };
        repo = new DailyReportsRepository(prisma);
    });
    it('findByStudentAndDate queries scoped client', async () => {
        const findUnique = jest.fn().mockResolvedValue(mockPrismaReport);
        withTenant.mockImplementation((fn) => fn({ dailyReport: { findUnique } }));
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
        withTenant.mockImplementation((fn) => fn({ dailyReport: { findMany } }));
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
        withTenant.mockImplementation((fn) => fn({ dailyReport: { upsert } }));
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
});
