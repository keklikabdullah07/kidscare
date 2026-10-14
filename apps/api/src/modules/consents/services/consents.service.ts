import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { CreateEventConsentInput, RespondEventConsentInput } from '@kidscare/shared-schemas';
import {
  ConsentsRepository,
  type ConsentCreatedWithRelations,
  type ConsentResponseWithStudent,
  type ConsentWithRelations,
} from '../repositories/consents.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { StudentsService } from '../../students/services/students.service';

export type ConsentWithMyResponse = ConsentWithRelations & {
  myResponse?: ConsentWithRelations['responses'][number] | null;
};

export type ConsentWithStats = ConsentWithRelations & {
  stats?: {
    totalResponses: number;
    approvedCount: number;
    declinedCount: number;
  };
};

export type ConsentListItem = ConsentWithMyResponse | ConsentWithStats;

@Injectable()
export class ConsentsService {
  constructor(
    @Inject(ConsentsRepository) private readonly repo: ConsentsRepository,
    @Inject(StudentsService) private readonly studentsService: StudentsService,
    @Optional()
    @Inject(NotificationsService)
    private readonly notificationsService?: NotificationsService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    input: CreateEventConsentInput,
  ): Promise<ConsentCreatedWithRelations> {
    const eventDate = new Date(input.eventDate);
    const deadline = input.deadline ? new Date(input.deadline) : null;

    const consent = await this.repo.create(tenantId, {
      tenantId,
      classroomId: input.classroomId ?? null,
      title: input.title,
      eventDate,
      location: input.location ?? null,
      price: input.price !== undefined ? input.price : null,
      description: input.description ?? null,
      deadline,
      createdById: userId,
      status: 'ACTIVE',
    });

    return consent;
  }

  async findAll(
    tenantId: string,
    user: { userId: string; role: string },
    filters?: { classroomId?: string; status?: string },
  ): Promise<ConsentListItem[]> {
    const consents = await this.repo.findAll(tenantId, filters);

    if (user.role === 'PARENT') {
      const parentStudents = await this.studentsService.findByParent(tenantId, user.userId);
      const studentIds = new Set(parentStudents.map((s) => s.id));
      const classroomIds = new Set(
        parentStudents
          .map((s) => s.classroomId)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      );

      // Veli sadece tüm kreşe açık veya çocuğunun sınıfına ait etkinlikleri görür
      const visibleConsents = consents.filter(
        (c) => !c.classroomId || classroomIds.has(c.classroomId),
      );

      return visibleConsents.map((consent): ConsentWithMyResponse => {
        const responses = consent.responses || [];
        const myResponse = responses.find((r) => studentIds.has(r.studentId));
        return {
          ...consent,
          myResponse: myResponse || null,
        };
      });
    }

    return consents.map((consent): ConsentWithStats => {
      const responses = consent.responses || [];
      const approvedCount = responses.filter((r) => r.decision === 'APPROVED').length;
      const declinedCount = responses.filter((r) => r.decision === 'DECLINED').length;
      return {
        ...consent,
        stats: {
          totalResponses: responses.length,
          approvedCount,
          declinedCount,
        },
      };
    });
  }

  async findOne(
    tenantId: string,
    _user: { userId: string; role: string },
    id: string,
  ): Promise<ConsentWithRelations> {
    const consent = await this.repo.findById(tenantId, id);
    if (!consent) {
      throw new NotFoundException('Etkinlik izin formu bulunamadı');
    }
    return consent;
  }

  async respond(
    tenantId: string,
    user: { userId: string; role: string },
    consentId: string,
    input: RespondEventConsentInput,
  ): Promise<ConsentResponseWithStudent> {
    const consent = await this.repo.findById(tenantId, consentId);
    if (!consent) {
      throw new NotFoundException('Etkinlik izin formu bulunamadı');
    }

    if (consent.status !== 'ACTIVE') {
      throw new BadRequestException('Bu etkinlik için izin onay süreci kapanmıştır.');
    }

    if (consent.deadline && new Date() > new Date(consent.deadline)) {
      throw new BadRequestException('Bu etkinlik için son onay tarihi geçmiştir.');
    }

    // Öğrenci veli kontrolü
    if (user.role === 'PARENT') {
      const student = await this.studentsService.findOne(tenantId, input.studentId);
      if (!student || student.parentId !== user.userId) {
        throw new ForbiddenException('Bu öğrenci için izin verme yetkiniz yoktur.');
      }
    }

    const response = await this.repo.respond(tenantId, {
      consentId,
      studentId: input.studentId,
      parentUserId: user.userId,
      decision: input.decision,
      notes: input.notes ?? null,
    });

    if (this.notificationsService) {
      const decisionText =
        input.decision === 'APPROVED' ? 'onaylandı ✅' : 'katılmayacak olarak bildirildi ❌';
      void this.notificationsService.notifyStudentParents(tenantId, input.studentId, {
        title: '📋 Gezi İzni Yanıtı Alındı',
        body: `${response.student?.firstName || 'Öğrenciniz'} için "${consent.title}" etkinliği ${decisionText}.`,
        type: 'SYSTEM',
        data: { consentId, studentId: input.studentId, decision: input.decision },
      });
    }

    return response;
  }
}
