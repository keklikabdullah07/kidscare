import { DailyMenusController } from './daily-menus.controller';
import type { DailyMenusService } from '../services/daily-menus.service';
import { DailyMenu } from '../entities/daily-menu.entity';

describe('DailyMenusController', () => {
  let controller: DailyMenusController;
  let service: jest.Mocked<DailyMenusService>;

  const mockMenuEntity = new DailyMenu(
    'menu-1',
    't-1',
    '2026-09-15',
    ['Yumurta'],
    ['Köfte'],
    ['Muz'],
    ['Yumurta'],
    800,
    null,
    '2026-09-15T00:00:00.000Z',
    '2026-09-15T00:00:00.000Z',
  );

  beforeEach(() => {
    service = {
      getByDate: jest.fn(),
      getByRange: jest.fn(),
      createOrUpdate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<DailyMenusService>;

    controller = new DailyMenusController(service);
  });

  describe('getByDate', () => {
    it('returns daily menu response dto', async () => {
      service.getByDate.mockResolvedValue({
        menu: mockMenuEntity,
        allergenWarnings: [],
      });

      const res = await controller.getByDate('t-1', '2026-09-15');
      expect(res.menu?.id).toBe('menu-1');
      expect(res.allergenWarnings).toEqual([]);
    });
  });

  describe('create', () => {
    it('forwards the parsed payload to the service', async () => {
      service.createOrUpdate.mockResolvedValue({
        menu: mockMenuEntity,
        allergenWarnings: [],
      });

      const res = await controller.create('t-1', {
        date: '2026-09-15',
        breakfast: ['Yumurta'],
        lunch: ['Köfte'],
        snack: ['Muz'],
        allergens: ['Yumurta'],
      });

      expect(res.menu?.id).toBe('menu-1');
      expect(service.createOrUpdate).toHaveBeenCalledWith('t-1', expect.anything());
    });
  });

  describe('delete', () => {
    it('deletes menu for date', async () => {
      service.delete.mockResolvedValue();
      await expect(controller.delete('t-1', '2026-09-15')).resolves.not.toThrow();
      expect(service.delete).toHaveBeenCalledWith('t-1', '2026-09-15');
    });
  });
});
