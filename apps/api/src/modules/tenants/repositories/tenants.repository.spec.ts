import type { PrismaService } from '../../../prisma/prisma.service';
import type { Tenant as PrismaTenant } from '@kidscare/database';
import { TenantsRepository } from './tenants.repository';

const mockTenant: PrismaTenant = {
  id: 't-1',
  slug: 'demo',
  name: 'Demo Kreş',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('TenantsRepository', () => {
  let repo: TenantsRepository;
  let withTenant: jest.Mock;

  beforeEach(() => {
    withTenant = jest.fn();
    const prisma = { withTenant } as unknown as PrismaService;
    repo = new TenantsRepository(prisma);
  });

  describe('findById', () => {
    it('returns the tenant when found', async () => {
      withTenant.mockImplementation((fn) =>
        fn({ tenant: { findUnique: jest.fn().mockResolvedValue(mockTenant) } }),
      );
      await expect(repo.findById('t-1')).resolves.toEqual(mockTenant);
      expect(withTenant).toHaveBeenCalledTimes(1);
    });

    it('returns null when missing', async () => {
      withTenant.mockImplementation((fn) =>
        fn({ tenant: { findUnique: jest.fn().mockResolvedValue(null) } }),
      );
      await expect(repo.findById('missing')).resolves.toBeNull();
    });
  });

  describe('update', () => {
    it('returns the updated tenant', async () => {
      const updated = { ...mockTenant, name: 'New Name' };
      withTenant.mockImplementation((fn) =>
        fn({ tenant: { update: jest.fn().mockResolvedValue(updated) } }),
      );
      await expect(repo.update('t-1', { name: 'New Name' })).resolves.toEqual(updated);
    });
  });
});
