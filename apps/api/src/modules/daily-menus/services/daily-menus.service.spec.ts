import type { DailyMenu as PrismaDailyMenu, Student as PrismaStudent } from '@kidscare/database';
import { DailyMenusService } from './daily-menus.service';
import type { DailyMenusRepository } from '../repositories/daily-menus.repository';
import type { StudentsRepository } from '../../students/repositories/students.repository';

const mockMenu: PrismaDailyMenu = {
  id: 'menu-1',
  tenantId: 't-1',
  date: new Date('2026-09-15'),
  breakfast: ['Yumurta', 'Peynir'],
  lunch: ['Tavuklu Pilav', 'Ayran'],
  snack: ['Fıstıklı Kek'],
  allergens: ['Yumurta', 'Süt / Laktoz', 'Fıstık'],
  calories: 900,
  notes: 'Taze pişirildi.',
  createdAt: new Date('2026-09-15T08:00:00Z'),
  updatedAt: new Date('2026-09-15T08:00:00Z'),
};

const mockStudents: PrismaStudent[] = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: new Date('2020-05-12'),
    gender: 'female',
    notes: null,
    passport: {
      allergies: ['Fıstık', 'Bal'],
    },
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 's-2',
    tenantId: 't-1',
    firstName: 'Can',
    lastName: 'Demir',
    dateOfBirth: new Date('2019-08-23'),
    gender: 'male',
    notes: null,
    passport: {
      allergies: [],
    },
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
];

describe('DailyMenusService', () => {
  let service: DailyMenusService;
  let menuRepo: jest.Mocked<DailyMenusRepository>;
  let studentsRepo: jest.Mocked<StudentsRepository>;

  beforeEach(() => {
    menuRepo = {
      findByDate: jest.fn(),
      findByDateRange: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<DailyMenusRepository>;

    studentsRepo = {
      findMany: jest.fn(),
    } as unknown as jest.Mocked<StudentsRepository>;

    service = new DailyMenusService(menuRepo, studentsRepo);
  });

  describe('getByDate', () => {
    it('returns daily menu with allergen warnings for affected students', async () => {
      menuRepo.findByDate.mockResolvedValue(mockMenu);
      studentsRepo.findMany.mockResolvedValue(mockStudents);

      const res = await service.getByDate('t-1', '2026-09-15');
      expect(res.menu).not.toBeNull();
      expect(res.menu?.id).toBe('menu-1');
      expect(res.allergenWarnings).toHaveLength(1);
      expect(res.allergenWarnings[0]?.studentName).toBe('Ada Yılmaz');
      expect(res.allergenWarnings[0]?.matchedAllergens).toContain('Fıstık');
    });

    it('returns null menu when no menu exists for the date', async () => {
      menuRepo.findByDate.mockResolvedValue(null);
      studentsRepo.findMany.mockResolvedValue(mockStudents);

      const res = await service.getByDate('t-1', '2026-09-16');
      expect(res.menu).toBeNull();
      expect(res.allergenWarnings).toHaveLength(0);
    });
  });

  describe('createOrUpdate', () => {
    it('creates or updates menu and computes allergen warnings', async () => {
      menuRepo.upsert.mockResolvedValue(mockMenu);
      studentsRepo.findMany.mockResolvedValue(mockStudents);

      const res = await service.createOrUpdate('t-1', {
        date: '2026-09-15',
        breakfast: ['Yumurta', 'Peynir'],
        allergens: ['Yumurta', 'Fıstık'],
      });

      expect(res.menu).not.toBeNull();
      expect(menuRepo.upsert).toHaveBeenCalledWith('t-1', expect.any(Date), expect.anything());
      expect(res.allergenWarnings[0]?.matchedAllergens).toContain('Fıstık');
    });
  });

  describe('delete', () => {
    it('deletes menu for date', async () => {
      menuRepo.delete.mockResolvedValue(mockMenu);
      await expect(service.delete('t-1', '2026-09-15')).resolves.not.toThrow();
      expect(menuRepo.delete).toHaveBeenCalledWith('t-1', expect.any(Date));
    });
  });
});
