import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { IUsersRepository } from '../repositories/users.repository';
import type { PasswordService } from '../../auth/services/password.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<IUsersRepository>;
  let password: jest.Mocked<PasswordService>;

  beforeEach(() => {
    repo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      insert: jest.fn(),
    };
    password = {
      hash: jest.fn().mockResolvedValue('hashed'),
      verify: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;
    service = new UsersService(repo, password);
  });

  it('invite rejects duplicate email', async () => {
    repo.findByEmail.mockResolvedValue({
      id: 'u-1',
      tenantId: 't-1',
      email: 'a@b.com',
      passwordHash: 'x',
      role: 'PARENT',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await expect(
      service.invite('t-1', { email: 'a@b.com', password: 'demo1234', role: 'PARENT' }),
    ).rejects.toThrow(ConflictException);
  });
});
