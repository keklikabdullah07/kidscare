import { ConsentsService } from './consents.service';
import type {
  ConsentCreatedWithRelations,
  ConsentResponseWithStudent,
  ConsentWithRelations,
  ConsentsRepository,
} from '../repositories/consents.repository';
import type { StudentsService } from '../../students/services/students.service';
import { Student } from '../../students/entities/student.entity';

describe('ConsentsService', () => {
  let service: ConsentsService;
  let repo: jest.Mocked<ConsentsRepository>;
  let studentsService: jest.Mocked<StudentsService>;

  const mockStudent = new Student(
    'student-1',
    't-1',
    'parent-1',
    'Ada',
    'Yılmaz',
    new Date('2020-05-12'),
    null,
    null,
    null,
    true,
    new Date(),
    new Date(),
    null,
    'class-1',
  );

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      respond: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ConsentsRepository>;

    studentsService = {
      findByParent: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<StudentsService>;

    service = new ConsentsService(repo, studentsService);
  });

  describe('create', () => {
    it('creates an event consent with ACTIVE status', async () => {
      repo.create.mockResolvedValue({
        id: 'consent-1',
        title: 'Müze Gezisi',
        status: 'ACTIVE',
      } as unknown as ConsentCreatedWithRelations);

      const res = await service.create('t-1', 'u-admin', {
        title: 'Müze Gezisi',
        eventDate: '2026-10-25T10:00:00Z',
        location: 'Arkeoloji Müzesi',
        price: 150,
      });

      expect(res.id).toBe('consent-1');
      expect(repo.create).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({
          title: 'Müze Gezisi',
          status: 'ACTIVE',
          createdById: 'u-admin',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns consents and attaches parent response for PARENT role', async () => {
      studentsService.findByParent.mockResolvedValue([mockStudent]);

      repo.findAll.mockResolvedValue([
        {
          id: 'consent-1',
          classroomId: 'class-1',
          title: 'Tiyatro',
          responses: [{ studentId: 'student-1', decision: 'APPROVED' }],
        } as unknown as ConsentWithRelations,
      ]);

      const res = await service.findAll('t-1', { userId: 'parent-1', role: 'PARENT' });
      expect(res).toHaveLength(1);
      const first = res[0];
      if (first && 'myResponse' in first) {
        expect(first.myResponse).toBeDefined();
        expect(first.myResponse?.decision).toBe('APPROVED');
      } else {
        throw new Error('Expected myResponse to be present');
      }
    });
  });

  describe('respond', () => {
    it('allows parent to submit consent decision', async () => {
      repo.findById.mockResolvedValue({
        id: 'consent-1',
        title: 'Tiyatro',
        status: 'ACTIVE',
        deadline: null,
      } as unknown as ConsentWithRelations);

      studentsService.findOne.mockResolvedValue(mockStudent);

      repo.respond.mockResolvedValue({
        id: 'resp-1',
        consentId: 'consent-1',
        studentId: 'student-1',
        decision: 'APPROVED',
      } as unknown as ConsentResponseWithStudent);

      const res = await service.respond(
        't-1',
        { userId: 'parent-1', role: 'PARENT' },
        'consent-1',
        {
          studentId: 'student-1',
          decision: 'APPROVED',
        },
      );

      expect(res.decision).toBe('APPROVED');
      expect(repo.respond).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({
          consentId: 'consent-1',
          studentId: 'student-1',
          decision: 'APPROVED',
        }),
      );
    });
  });

  describe('cancel', () => {
    it('cancels trip consent for staff member', async () => {
      repo.findById.mockResolvedValue({
        id: 'consent-1',
        title: 'Hayvanat Bahçesi',
        status: 'ACTIVE',
        responses: [],
      } as unknown as ConsentWithRelations);

      repo.updateStatus.mockResolvedValue({
        id: 'consent-1',
        title: 'Hayvanat Bahçesi',
        status: 'CANCELLED',
      } as unknown as ConsentWithRelations);

      const res = await service.cancel(
        't-1',
        { userId: 'teacher-1', role: 'TEACHER' },
        'consent-1',
      );

      expect(res.status).toBe('CANCELLED');
      expect(repo.updateStatus).toHaveBeenCalledWith('t-1', 'consent-1', 'CANCELLED');
    });

    it('throws ForbiddenException if parent tries to cancel trip', async () => {
      repo.findById.mockResolvedValue({
        id: 'consent-1',
        status: 'ACTIVE',
      } as unknown as ConsentWithRelations);

      await expect(
        service.cancel('t-1', { userId: 'parent-1', role: 'PARENT' }, 'consent-1'),
      ).rejects.toThrow('Bu etkinliği iptal etme yetkiniz yoktur.');
    });
  });
});
