import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
const mockTenant = {
    id: 't-1',
    slug: 'demo',
    name: 'Demo Kreş',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};
describe('TenantsService', () => {
    let service;
    let repo;
    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        service = new TenantsService(repo);
    });
    describe('findOne', () => {
        it('returns the tenant when found', async () => {
            repo.findById.mockResolvedValue(mockTenant);
            const result = await service.findOne('t-1');
            expect(result.id).toBe('t-1');
            expect(result.name).toBe('Demo Kreş');
            expect(result).toBeInstanceOf(Object);
            expect(repo.findById).toHaveBeenCalledWith('t-1');
        });
        it('throws NotFoundException when missing', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
        });
    });
    describe('update', () => {
        it('updates and returns the new tenant', async () => {
            const updated = { ...mockTenant, name: 'New' };
            repo.findById.mockResolvedValue(mockTenant);
            repo.update.mockResolvedValue(updated);
            const result = await service.update('t-1', { name: 'New' });
            expect(result.name).toBe('New');
            expect(repo.update).toHaveBeenCalledWith('t-1', { name: 'New' });
        });
        it('throws NotFoundException when tenant does not exist', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.update('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
            expect(repo.update).not.toHaveBeenCalled();
        });
    });
});
