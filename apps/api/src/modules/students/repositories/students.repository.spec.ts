import type { PrismaService } from '../../../prisma/prisma.service';
import type { Student as PrismaStudent } from '@kidscare/database';
import { StudentsRepository } from './students.repository';

const mockStudent: PrismaStudent = {
  id: 's-1',
  tenantId: 't-1',
  parentId: null,
  classroomId: null,
  firstName: 'Ada',
  lastName: 'Yılmaz',
  dateOfBirth: new Date('2020-05-12'),
  gender: null,
  notes: null,
  passport: {},
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
};

describe('StudentsRepository', () => {
  let repo: StudentsRepository;
  let withTenant: jest.Mock;

  beforeEach(() => {
    withTenant = jest.fn();
    const prisma = { withTenant } as unknown as PrismaService;
    repo = new StudentsRepository(prisma);
  });

  describe('findMany', () => {
    it('returns rows for tenant, excluding soft-deleted by default', async () => {
      withTenant.mockImplementation((fn) =>
        fn({ student: { findMany: jest.fn().mockResolvedValue([mockStudent]) } }),
      );
      await expect(repo.findMany('t-1')).resolves.toEqual([mockStudent]);
    });

    it('passes includeDeleted flag through when set', async () => {
      const findMany = jest.fn().mockResolvedValue([mockStudent]);
      withTenant.mockImplementation((fn) => fn({ student: { findMany } }));
      await repo.findMany('t-1', { includeDeleted: true });
      // Verify the where clause did NOT include deletedAt: null
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ deletedAt: expect.anything() }),
        }),
      );
    });

    it('includes deletedAt: null filter by default', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      withTenant.mockImplementation((fn) => fn({ student: { findMany } }));
      await repo.findMany('t-1');
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns the student when found', async () => {
      withTenant.mockImplementation((fn) =>
        fn({ student: { findFirst: jest.fn().mockResolvedValue(mockStudent) } }),
      );
      await expect(repo.findById('t-1', 's-1')).resolves.toEqual(mockStudent);
    });

    it('returns null when not found', async () => {
      withTenant.mockImplementation((fn) =>
        fn({ student: { findFirst: jest.fn().mockResolvedValue(null) } }),
      );
      await expect(repo.findById('t-1', 'missing')).resolves.toBeNull();
    });
  });

  describe('insert', () => {
    it('creates a student under the given tenant', async () => {
      withTenant.mockImplementation((fn) =>
        fn({
          student: {
            create: jest.fn().mockImplementation(({ data }) => ({
              ...mockStudent,
              ...data,
            })),
          },
        }),
      );
      const result = await repo.insert('t-1', {
        firstName: 'Ada',
        lastName: 'Yılmaz',
        dateOfBirth: new Date('2020-05-12'),
      });
      expect(result.tenantId).toBe('t-1');
      expect(result.firstName).toBe('Ada');
    });
  });

  describe('update', () => {
    it('updates the student', async () => {
      const updated = { ...mockStudent, firstName: 'Yeni' };
      withTenant.mockImplementation((fn) =>
        fn({ student: { update: jest.fn().mockResolvedValue(updated) } }),
      );
      await expect(repo.update('t-1', 's-1', { firstName: 'Yeni' })).resolves.toEqual(updated);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt to now', async () => {
      const update = jest.fn().mockResolvedValue({ ...mockStudent, deletedAt: new Date() });
      withTenant.mockImplementation((fn) => fn({ student: { update } }));
      await repo.softDelete('t-1', 's-1');
      expect(update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
