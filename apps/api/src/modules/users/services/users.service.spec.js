import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
describe('UsersService', () => {
    let service;
    let repo;
    let password;
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
        };
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
        await expect(service.invite('t-1', { email: 'a@b.com', password: 'demo1234', role: 'PARENT' })).rejects.toThrow(ConflictException);
    });
});
