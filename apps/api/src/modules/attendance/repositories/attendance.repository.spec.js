import { AttendanceRepository } from './attendance.repository';
const mockPrismaAttendance = {
    id: 'att-1',
    tenantId: 't-1',
    studentId: 's-1',
    date: new Date('2026-09-15'),
    status: 'PRESENT',
    checkInTime: '08:30',
    checkInBy: 'Ahmet Yılmaz',
    checkOutTime: null,
    checkOutBy: null,
    pickupContactId: null,
    pickupNote: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};
describe('AttendanceRepository', () => {
    let repo;
    let withTenant;
    beforeEach(() => {
        withTenant = jest.fn();
        const prisma = { withTenant };
        repo = new AttendanceRepository(prisma);
    });
    it('findByStudentAndDate queries scoped client', async () => {
        const findUnique = jest.fn().mockResolvedValue(mockPrismaAttendance);
        withTenant.mockImplementation((fn) => fn({ attendance: { findUnique } }));
        const date = new Date('2026-09-15');
        const res = await repo.findByStudentAndDate('t-1', 's-1', date);
        expect(res?.id).toBe('att-1');
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
        const findMany = jest.fn().mockResolvedValue([mockPrismaAttendance]);
        withTenant.mockImplementation((fn) => fn({ attendance: { findMany } }));
        const date = new Date('2026-09-15');
        const res = await repo.findByDate('t-1', date);
        expect(res).toHaveLength(1);
        expect(findMany).toHaveBeenCalledWith({
            where: { tenantId: 't-1', date },
            orderBy: { createdAt: 'asc' },
        });
    });
    it('upsert delegates to prisma upsert with create & update data', async () => {
        const upsert = jest.fn().mockResolvedValue(mockPrismaAttendance);
        withTenant.mockImplementation((fn) => fn({ attendance: { upsert } }));
        const date = new Date('2026-09-15');
        const res = await repo.upsert('t-1', 's-1', date, {
            status: 'PRESENT',
            checkInTime: '08:30',
        });
        expect(res.id).toBe('att-1');
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
                status: 'PRESENT',
            }),
            update: { status: 'PRESENT', checkInTime: '08:30' },
        });
    });
});
