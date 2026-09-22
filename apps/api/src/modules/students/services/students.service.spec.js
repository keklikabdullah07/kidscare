import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
const mockStudent = {
    id: 's-1',
    tenantId: 't-1',
    parentId: null,
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: new Date('2020-05-12'),
    gender: null,
    notes: null,
    passport: {
        bloodType: 'A+',
        allergies: ['Fıstık'],
        dietaryRestrictions: [],
        chronicConditions: [],
        regularMedications: [],
        emergencyContacts: [],
    },
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
};
describe('StudentsService', () => {
    let service;
    let repo;
    beforeEach(() => {
        repo = {
            findMany: jest.fn(),
            findById: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };
        const usersService = {
            assertParentUser: jest.fn().mockResolvedValue(undefined),
        };
        service = new StudentsService(repo, usersService);
    });
    describe('findAll', () => {
        it('returns mapped students', async () => {
            repo.findMany.mockResolvedValue([mockStudent]);
            const result = await service.findAll('t-1');
            expect(result).toHaveLength(1);
            expect(result[0]?.firstName).toBe('Ada');
            expect(result[0]?.fullName).toBe('Ada Yılmaz');
        });
    });
    describe('findOne', () => {
        it('returns the student when found', async () => {
            repo.findById.mockResolvedValue(mockStudent);
            const result = await service.findOne('t-1', 's-1');
            expect(result.id).toBe('s-1');
            expect(result.passport?.bloodType).toBe('A+');
        });
        it('throws NotFoundException when missing', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.findOne('t-1', 'missing')).rejects.toThrow(NotFoundException);
        });
    });
    describe('getPassport', () => {
        it('returns the student passport', async () => {
            repo.findById.mockResolvedValue(mockStudent);
            const passport = await service.getPassport('t-1', 's-1');
            expect(passport.bloodType).toBe('A+');
            expect(passport.allergies).toContain('Fıstık');
        });
    });
    describe('updatePassport', () => {
        it('updates student passport', async () => {
            const updatedMock = {
                ...mockStudent,
                passport: {
                    bloodType: '0+',
                    allergies: ['Süt'],
                    dietaryRestrictions: [],
                    chronicConditions: [],
                    regularMedications: [],
                    emergencyContacts: [],
                },
            };
            repo.findById.mockResolvedValue(mockStudent);
            repo.update.mockResolvedValue(updatedMock);
            const result = await service.updatePassport('t-1', 's-1', {
                bloodType: '0+',
                allergies: ['Süt'],
                dietaryRestrictions: [],
                chronicConditions: [],
                regularMedications: [],
                emergencyContacts: [],
            });
            expect(result.bloodType).toBe('0+');
            expect(result.allergies).toContain('Süt');
        });
    });
    describe('create', () => {
        it('converts the ISO date and inserts', async () => {
            repo.insert.mockResolvedValue(mockStudent);
            await service.create('t-1', {
                firstName: 'Ada',
                lastName: 'Yılmaz',
                dateOfBirth: '2020-05-12',
            });
            expect(repo.insert).toHaveBeenCalledWith('t-1', {
                firstName: 'Ada',
                lastName: 'Yılmaz',
                dateOfBirth: new Date('2020-05-12'),
                gender: null,
                notes: null,
                passport: {},
                parentId: null,
            });
        });
    });
    describe('update', () => {
        it('updates and returns the new student', async () => {
            repo.findById.mockResolvedValue(mockStudent);
            repo.update.mockResolvedValue({ ...mockStudent, firstName: 'Yeni' });
            const result = await service.update('t-1', 's-1', { firstName: 'Yeni' });
            expect(result.firstName).toBe('Yeni');
        });
        it('throws NotFoundException when missing', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.update('t-1', 'missing', { firstName: 'X' })).rejects.toThrow(NotFoundException);
            expect(repo.update).not.toHaveBeenCalled();
        });
        it('omits undefined keys from the update payload', async () => {
            repo.findById.mockResolvedValue(mockStudent);
            repo.update.mockResolvedValue(mockStudent);
            await service.update('t-1', 's-1', { firstName: 'Yeni' });
            const updateCall = repo.update.mock.calls[0];
            expect(updateCall).toBeDefined();
            const data = updateCall?.[2];
            expect(data).toEqual({ firstName: 'Yeni' });
            expect(data).not.toHaveProperty('lastName');
        });
    });
    describe('remove', () => {
        it('soft-deletes the student', async () => {
            repo.findById.mockResolvedValue(mockStudent);
            repo.softDelete.mockResolvedValue({ ...mockStudent, deletedAt: new Date() });
            const result = await service.remove('t-1', 's-1');
            expect(result.deletedAt).not.toBeNull();
        });
        it('throws NotFoundException when missing', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.remove('t-1', 'missing')).rejects.toThrow(NotFoundException);
        });
    });
});
