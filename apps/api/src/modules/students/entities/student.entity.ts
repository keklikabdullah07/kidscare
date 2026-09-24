import type { Student as PrismaStudent } from '@kidscare/database';
import type { StudentPassport } from '@kidscare/shared-types';

/**
 * Domain entity for a Student. Thin wrapper over the Prisma model with
 * a `fromPrisma` factory. Future computed fields (full name, age,
 * attendance stats) belong here.
 */
export class Student {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly parentId: string | null,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dateOfBirth: Date,
    public readonly gender: string | null,
    public readonly notes: string | null,
    public readonly passport: StudentPassport | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly classroomId: string | null = null,
  ) {}

  static fromPrisma(p: PrismaStudent): Student {
    return new Student(
      p.id,
      p.tenantId,
      p.parentId ?? null,
      p.firstName,
      p.lastName,
      p.dateOfBirth,
      p.gender,
      p.notes,
      (p.passport as unknown as StudentPassport) ?? null,
      p.isActive,
      p.createdAt,
      p.updatedAt,
      p.deletedAt,
      p.classroomId ?? null,
    );
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
