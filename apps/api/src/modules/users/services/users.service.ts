import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { UserInvite } from '@kidscare/shared-schemas';
import type { UserRole } from '@kidscare/shared-types';
import { PasswordService } from '../../auth/services/password.service';
import type { IUsersRepository } from '../repositories/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';

function cuid(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(12)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .toLowerCase()
    .slice(0, 25 - ts.length);
  return `${ts}${rand}`;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUsersRepository') private readonly repo: IUsersRepository,
    @Inject(PasswordService) private readonly password: PasswordService,
  ) {}

  async list(tenantId: string, role?: UserRole): Promise<UserResponseDto[]> {
    const rows = await this.repo.findMany(tenantId, role);
    return rows.map((row) => this.toResponse(row));
  }

  async invite(tenantId: string, input: UserInvite): Promise<UserResponseDto> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.repo.findByEmail(tenantId, email);
    if (existing) {
      throw new ConflictException('A user with this email already exists in this tenant');
    }

    const passwordHash = await this.password.hash(input.password);
    const created = await this.repo.insert(tenantId, {
      id: cuid(),
      email,
      passwordHash,
      role: input.role,
      isActive: true,
    });
    return this.toResponse(created);
  }

  async assertParentUser(tenantId: string, parentId: string): Promise<void> {
    const user = await this.repo.findById(tenantId, parentId);
    if (!user || user.role !== 'PARENT') {
      throw new BadRequestException('parentId must reference an active PARENT user');
    }
  }

  private toResponse(row: {
    id: string;
    tenantId: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      email: row.email,
      role: row.role,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
