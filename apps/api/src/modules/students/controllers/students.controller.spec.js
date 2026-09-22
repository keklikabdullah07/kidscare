import { StudentsController } from './students.controller';
import { Student } from '../entities/student.entity';
const entity = new Student('s-1', 't-1', null, 'Ada', 'Yılmaz', new Date('2020-05-12'), null, null, {
    bloodType: 'A+',
    allergies: ['Fıstık'],
    dietaryRestrictions: [],
    chronicConditions: [],
    regularMedications: [],
    emergencyContacts: [],
}, true, new Date('2026-01-01T00:00:00Z'), new Date('2026-01-01T00:00:00Z'), null);
describe('StudentsController', () => {
    let controller;
    let service;
    beforeEach(() => {
        service = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getPassport: jest.fn(),
            updatePassport: jest.fn(),
            remove: jest.fn(),
        };
        controller = new StudentsController(service);
    });
    describe('findAll', () => {
        it('returns StudentResponse array', async () => {
            service.findAll.mockResolvedValue([entity]);
            const result = await controller.findAll('t-1');
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 's-1',
                firstName: 'Ada',
                dateOfBirth: '2020-05-12',
            });
        });
    });
    describe('findOne', () => {
        it('returns serialized student', async () => {
            service.findOne.mockResolvedValue(entity);
            const result = await controller.findOne('t-1', 's-1', {
                tenantId: 't-1',
                userId: 'u-1',
                role: 'ADMIN',
            });
            expect(result.id).toBe('s-1');
        });
    });
    describe('getPassport', () => {
        it('returns student passport', async () => {
            service.getPassport.mockResolvedValue({
                bloodType: 'A+',
                allergies: ['Fıstık'],
                dietaryRestrictions: [],
                chronicConditions: [],
                regularMedications: [],
                emergencyContacts: [],
            });
            const result = await controller.getPassport('t-1', 's-1', {
                tenantId: 't-1',
                userId: 'u-1',
                role: 'ADMIN',
            });
            expect(result.bloodType).toBe('A+');
            expect(result.allergies).toContain('Fıstık');
        });
    });
    describe('updatePassport', () => {
        it('updates and returns passport on valid payload', async () => {
            const payload = {
                bloodType: '0+',
                allergies: ['Laktoz'],
                dietaryRestrictions: [],
                chronicConditions: [],
                regularMedications: [],
                emergencyContacts: [],
            };
            service.updatePassport.mockResolvedValue(payload);
            const result = await controller.updatePassport('t-1', 's-1', payload);
            expect(result.bloodType).toBe('0+');
        });
    });
    describe('create', () => {
        it('returns 201 student on valid payload', async () => {
            service.create.mockResolvedValue(entity);
            await expect(controller.create('t-1', {
                firstName: 'Ada',
                lastName: 'Yılmaz',
                dateOfBirth: '2020-05-12',
            })).resolves.toMatchObject({ id: 's-1' });
        });
        // Validation moved to ZodValidationPipe at the HTTP boundary.
    });
    describe('update', () => {
        it('strips undefined keys and returns updated student', async () => {
            service.update.mockResolvedValue(Object.assign(new Student(entity.id, entity.tenantId, entity.parentId, 'Yeni', entity.lastName, entity.dateOfBirth, entity.gender, entity.notes, entity.passport, entity.isActive, entity.createdAt, new Date(), entity.deletedAt)));
            await expect(controller.update('t-1', 's-1', { firstName: 'Yeni' })).resolves.toMatchObject({
                firstName: 'Yeni',
            });
        });
    });
    describe('remove', () => {
        it('returns the soft-deleted student', async () => {
            service.remove.mockResolvedValue(Object.assign(new Student(entity.id, entity.tenantId, entity.parentId, entity.firstName, entity.lastName, entity.dateOfBirth, entity.gender, entity.notes, entity.passport, false, entity.createdAt, entity.updatedAt, new Date())));
            await expect(controller.remove('t-1', 's-1')).resolves.toMatchObject({
                deletedAt: expect.any(String),
            });
        });
    });
});
