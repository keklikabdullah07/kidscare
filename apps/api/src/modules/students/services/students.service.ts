import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import type { StudentCreate, StudentPassportInput, StudentUpdate } from '@kidscare/shared-schemas';
import type { StudentPassport } from '@kidscare/shared-types';
import { UsersService } from '../../users/services/users.service';
import { Student } from '../entities/student.entity';
import type { IStudentsRepository } from '../repositories/students.repository';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('IStudentsRepository') private readonly repo: IStudentsRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async findAll(tenantId: string): Promise<Student[]> {
    const rows = await this.repo.findMany(tenantId);
    return rows.map((row) => Student.fromPrisma(row));
  }

  async findOne(tenantId: string, id: string): Promise<Student> {
    const found = await this.repo.findById(tenantId, id);
    if (!found) throw new NotFoundException(`Student ${id} not found`);
    return Student.fromPrisma(found);
  }

  async create(tenantId: string, input: StudentCreate): Promise<Student> {
    if (input.parentId) {
      await this.usersService.assertParentUser(tenantId, input.parentId);
    }

    const created = await this.repo.insert(tenantId, {
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender ?? null,
      notes: input.notes ?? null,
      passport: (input.passport as unknown as Prisma.InputJsonValue) ?? {},
      parentId: input.parentId ?? null,
    });
    return Student.fromPrisma(created);
  }

  async update(tenantId: string, id: string, input: StudentUpdate): Promise<Student> {
    // Verify exists so we map Prisma's P2025 to a NotFoundException.
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) throw new NotFoundException(`Student ${id} not found`);

    const data: Prisma.StudentUpdateInput = {};
    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.dateOfBirth !== undefined) data.dateOfBirth = new Date(input.dateOfBirth);
    if (input.gender !== undefined) data.gender = input.gender;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.passport !== undefined)
      data.passport = input.passport as unknown as Prisma.InputJsonValue;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.parentId !== undefined) {
      if (input.parentId) {
        await this.usersService.assertParentUser(tenantId, input.parentId);
        data.parent = { connect: { id: input.parentId } };
      } else {
        data.parent = { disconnect: true };
      }
    }

    const updated = await this.repo.update(tenantId, id, data);
    return Student.fromPrisma(updated);
  }

  async getPassport(tenantId: string, id: string): Promise<StudentPassport> {
    const student = await this.findOne(tenantId, id);
    return (
      student.passport ?? {
        bloodType: 'UNKNOWN',
        allergies: [],
        dietaryRestrictions: [],
        chronicConditions: [],
        regularMedications: [],
        emergencyContacts: [],
      }
    );
  }

  async updatePassport(
    tenantId: string,
    id: string,
    passport: StudentPassportInput,
  ): Promise<StudentPassport> {
    const updated = await this.update(tenantId, id, {
      passport: passport,
    });
    return (
      updated.passport ?? {
        bloodType: 'UNKNOWN',
        allergies: [],
        dietaryRestrictions: [],
        chronicConditions: [],
        regularMedications: [],
        emergencyContacts: [],
      }
    );
  }

  async remove(tenantId: string, id: string): Promise<Student> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) throw new NotFoundException(`Student ${id} not found`);
    const removed = await this.repo.softDelete(tenantId, id);
    return Student.fromPrisma(removed);
  }
}
