import { TenantsController } from './tenants.controller';
describe('TenantsController', () => {
    let controller;
    let service;
    beforeEach(() => {
        service = {
            findOne: jest.fn(),
            update: jest.fn(),
        };
        controller = new TenantsController(service);
    });
    describe('getMe', () => {
        it('returns the current tenant serialized to response shape', async () => {
            service.findOne.mockResolvedValue({
                id: 't-1',
                slug: 'demo',
                name: 'Demo Kreş',
                status: 'ACTIVE',
                createdAt: new Date('2026-01-01T00:00:00Z'),
                updatedAt: new Date('2026-01-02T00:00:00Z'),
            });
            const result = await controller.getMe('t-1');
            expect(result).toEqual({
                id: 't-1',
                slug: 'demo',
                name: 'Demo Kreş',
                status: 'ACTIVE',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
            });
        });
        it('propagates NotFoundException from the service', async () => {
            service.findOne.mockRejectedValue(new Error('not found'));
            await expect(controller.getMe('missing')).rejects.toThrow('not found');
        });
    });
    describe('updateMe', () => {
        it('returns the updated tenant', async () => {
            service.update.mockResolvedValue({
                id: 't-1',
                slug: 'demo',
                name: 'Renamed',
                status: 'ACTIVE',
                createdAt: new Date('2026-01-01T00:00:00Z'),
                updatedAt: new Date('2026-01-03T00:00:00Z'),
            });
            const result = await controller.updateMe('t-1', { name: 'Renamed' });
            expect(result.name).toBe('Renamed');
        });
        // Validation moved to ZodValidationPipe at the HTTP boundary.
        // Strict/unknown-field cases are covered by integration tests.
    });
});
