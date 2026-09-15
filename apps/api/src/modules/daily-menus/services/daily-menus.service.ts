import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AllergenWarningSummary,
  DailyMenuCreateInput,
  DailyMenuUpdateInput,
} from '@kidscare/shared-types';
import { StudentsRepository } from '../../students/repositories/students.repository';
import { DailyMenu } from '../entities/daily-menu.entity';
import { DailyMenusRepository } from '../repositories/daily-menus.repository';

export interface DailyMenuWithWarnings {
  menu: DailyMenu | null;
  allergenWarnings: AllergenWarningSummary[];
}

@Injectable()
export class DailyMenusService {
  constructor(
    private readonly repository: DailyMenusRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  async getByDate(tenantId: string, dateStr: string): Promise<DailyMenuWithWarnings> {
    const date = this.parseDate(dateStr);
    const row = await this.repository.findByDate(tenantId, date);
    const menu = row ? DailyMenu.fromPrisma(row) : null;

    const warnings = await this.computeAllergenWarnings(tenantId, menu ? menu.allergens : []);

    return { menu, allergenWarnings: warnings };
  }

  async getByRange(tenantId: string, fromStr: string, toStr: string): Promise<DailyMenu[]> {
    const from = this.parseDate(fromStr);
    const to = this.parseDate(toStr);
    const rows = await this.repository.findByDateRange(tenantId, from, to);
    return rows.map((r) => DailyMenu.fromPrisma(r));
  }

  async createOrUpdate(
    tenantId: string,
    input: DailyMenuCreateInput,
  ): Promise<DailyMenuWithWarnings> {
    const date = this.parseDate(input.date);
    const data: Parameters<typeof this.repository.upsert>[2] = {};
    if (input.breakfast !== undefined) data.breakfast = input.breakfast;
    if (input.lunch !== undefined) data.lunch = input.lunch;
    if (input.snack !== undefined) data.snack = input.snack;
    if (input.allergens !== undefined) data.allergens = input.allergens;
    if (input.calories !== undefined) data.calories = input.calories;
    if (input.notes !== undefined) data.notes = input.notes;

    const saved = await this.repository.upsert(tenantId, date, data);
    const menu = DailyMenu.fromPrisma(saved);
    const warnings = await this.computeAllergenWarnings(tenantId, menu.allergens);

    return { menu, allergenWarnings: warnings };
  }

  async update(
    tenantId: string,
    dateStr: string,
    input: DailyMenuUpdateInput,
  ): Promise<DailyMenuWithWarnings> {
    const date = this.parseDate(dateStr);
    const data: Parameters<typeof this.repository.upsert>[2] = {};
    if (input.breakfast !== undefined) data.breakfast = input.breakfast;
    if (input.lunch !== undefined) data.lunch = input.lunch;
    if (input.snack !== undefined) data.snack = input.snack;
    if (input.allergens !== undefined) data.allergens = input.allergens;
    if (input.calories !== undefined) data.calories = input.calories;
    if (input.notes !== undefined) data.notes = input.notes;

    const saved = await this.repository.upsert(tenantId, date, data);
    const menu = DailyMenu.fromPrisma(saved);
    const warnings = await this.computeAllergenWarnings(tenantId, menu.allergens);

    return { menu, allergenWarnings: warnings };
  }

  async delete(tenantId: string, dateStr: string): Promise<void> {
    const date = this.parseDate(dateStr);
    try {
      await this.repository.delete(tenantId, date);
    } catch {
      throw new NotFoundException(`Menü bulunamadı (${dateStr})`);
    }
  }

  private async computeAllergenWarnings(
    tenantId: string,
    menuAllergens: string[],
  ): Promise<AllergenWarningSummary[]> {
    if (!menuAllergens || menuAllergens.length === 0) {
      return [];
    }

    const students = await this.studentsRepository.findMany(tenantId);
    const warnings: AllergenWarningSummary[] = [];

    const normalizedMenuAllergens = menuAllergens.map((a) => a.trim().toLocaleLowerCase('tr'));

    for (const student of students) {
      if (!student.isActive) continue;

      const passport = student.passport as { allergies?: string[] } | null;
      const studentAllergies = passport?.allergies ?? [];
      if (!Array.isArray(studentAllergies) || studentAllergies.length === 0) {
        continue;
      }

      const matched: string[] = [];

      for (const sa of studentAllergies) {
        const normSa = sa.trim().toLocaleLowerCase('tr');
        if (!normSa) continue;

        // Check exact match or substring in menu allergens
        const hasMatch = normalizedMenuAllergens.some(
          (ma) => ma.includes(normSa) || normSa.includes(ma),
        );

        if (hasMatch) {
          matched.push(sa);
        }
      }

      if (matched.length > 0) {
        warnings.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          matchedAllergens: matched,
        });
      }
    }

    return warnings;
  }
}
