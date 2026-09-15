import { BadRequestException } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import type { TenantsService } from '../services/tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: jest.Mocked<TenantsService>;

  beforeEach(() => {
    service = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<TenantsService>;
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

    it('throws BadRequestException for invalid payload', async () => {
      await expect(controller.updateMe('t-1', { name: 'X' })).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for unknown fields (strict schema)', async () => {
      await expect(
        controller.updateMe('t-1', { slug: 'renamed', name: 'Renamed' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
