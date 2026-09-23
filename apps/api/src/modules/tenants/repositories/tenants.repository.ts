import { Inject, Injectable } from '@nestjs/common';
import type { Tenant as PrismaTenant, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

import type { OperationalAlertItem, OperationalAlertsResponse } from '@kidscare/shared-types';

export interface ITenantsRepository {
  findById(tenantId: string): Promise<PrismaTenant | null>;
  update(tenantId: string, data: Prisma.TenantUpdateInput): Promise<PrismaTenant>;
  getOperationalAlerts(tenantId: string): Promise<OperationalAlertsResponse>;
}

@Injectable()
export class TenantsRepository implements ITenantsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findById(tenantId: string): Promise<PrismaTenant | null> {
    return this.prisma.withTenant((client) =>
      client.tenant.findUnique({ where: { id: tenantId } }),
    );
  }

  async update(tenantId: string, data: Prisma.TenantUpdateInput): Promise<PrismaTenant> {
    return this.prisma.withTenant((client) =>
      client.tenant.update({ where: { id: tenantId }, data }),
    );
  }

  async getOperationalAlerts(tenantId: string): Promise<OperationalAlertsResponse> {
    return this.prisma.withTenant(async (client) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        pendingMeds,
        openIncidents,
        pendingPickups,
        pendingRequests,
        totalStudents,
        attendances,
        reports,
      ] = await Promise.all([
        client.medicationRecord.findMany({
          where: { tenantId, status: 'REQUESTED' },
          include: { student: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        client.incidentRecord.findMany({
          where: { tenantId, parentNotified: false },
          include: { student: { select: { firstName: true, lastName: true } } },
          orderBy: { occurredAt: 'desc' },
          take: 10,
        }),
        client.pickupAuthorization.findMany({
          where: { tenantId, status: 'PENDING' },
          include: {
            student: { select: { firstName: true, lastName: true } },
            pickupContact: { select: { fullName: true, relation: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        client.parentRequest.findMany({
          where: { tenantId, status: 'PENDING' },
          include: { student: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        client.student.count({
          where: { tenantId, isActive: true, deletedAt: null },
        }),
        client.attendance.count({
          where: { tenantId, date: today },
        }),
        client.dailyReport.count({
          where: { tenantId, date: today },
        }),
      ]);

      const items: OperationalAlertItem[] = [
        ...pendingMeds.map((m) => ({
          id: m.id,
          type: 'MEDICATION' as const,
          title: `İlaç Onayı: ${m.medicationName} (${m.dosage})`,
          description: `Veli ilaç verilmesini talep etti. Onay/Red bekleniyor.`,
          studentName: `${m.student.firstName} ${m.student.lastName}`,
          createdAt: m.createdAt.toISOString(),
          actionUrl: '/medication',
          urgency: 'HIGH' as const,
        })),
        ...openIncidents.map((inc) => ({
          id: inc.id,
          type: 'INCIDENT' as const,
          title: `Olay / Kaza: ${inc.category}`,
          description: `Veli henüz bilgilendirilmedi: ${inc.description.slice(0, 60)}...`,
          studentName: `${inc.student.firstName} ${inc.student.lastName}`,
          createdAt: inc.occurredAt.toISOString(),
          actionUrl: '/incidents',
          urgency: 'HIGH' as const,
        })),
        ...pendingPickups.map((p) => ({
          id: p.id,
          type: 'PICKUP' as const,
          title: `Teslimat İzni: ${p.pickupContact?.fullName || 'Yetkili Kişi'}`,
          description: `İlişki: ${p.pickupContact?.relation || 'Belirtilmedi'} - Onay bekleniyor.`,
          studentName: `${p.student.firstName} ${p.student.lastName}`,
          createdAt: p.createdAt.toISOString(),
          actionUrl: '/pickup',
          urgency: 'HIGH' as const,
        })),
        ...pendingRequests.map((req) => ({
          id: req.id,
          type: 'PARENT_REQUEST' as const,
          title: `Veli Talebi: ${req.subject}`,
          description: req.description.slice(0, 80),
          studentName: req.student ? `${req.student.firstName} ${req.student.lastName}` : undefined,
          createdAt: req.createdAt.toISOString(),
          actionUrl: '/requests',
          urgency: 'MEDIUM' as const,
        })),
      ];

      return {
        immediateActions: {
          pendingMedicationsCount: pendingMeds.length,
          openIncidentsCount: openIncidents.length,
          pendingPickupAuthorizationsCount: pendingPickups.length,
          pendingParentRequestsCount: pendingRequests.length,
          items,
        },
        dailyCompletion: {
          totalStudents,
          markedAttendanceCount: attendances,
          unmarkedAttendanceCount: Math.max(0, totalStudents - attendances),
          filledDailyReportsCount: reports,
          pendingDailyReportsCount: Math.max(0, totalStudents - reports),
        },
        trends: {
          consecutiveAbsentStudents: [],
        },
      };
    });
  }
}

// Re-export so other modules can depend on the interface token without
// importing the concrete file directly.
export const ITenantsRepositoryToken = 'ITenantsRepository';

// Suppress unused-import warning when only the interface is referenced.
void Inject;
