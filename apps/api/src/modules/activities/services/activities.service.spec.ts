import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { ActivityPost as PrismaActivityPost } from '@kidscare/database';
import { ActivitiesService } from './activities.service';
import type { ActivitiesRepository } from '../repositories/activities.repository';

const basePost: PrismaActivityPost = {
  id: 'post-1',
  tenantId: 't-1',
  authorId: 'u-1',
  title: 'Papatyalar Sanat Etkinliği',
  description: 'Boya çalışması',
  classroom: 'Papatyalar Sınıfı',
  activityDate: new Date('2026-09-15T10:00:00Z'),
  tags: ['Sanat'],
  mediaUrls: ['https://example.com/art.jpg'],
  taggedStudentIds: ['child-1'],
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
  deletedAt: null,
};

const otherClassPost: PrismaActivityPost = {
  id: 'post-2',
  tenantId: 't-1',
  authorId: 'u-1',
  title: 'Menekşeler Müzik Etkinliği',
  description: 'Şarkı çalışması',
  classroom: 'Menekşeler Sınıfı',
  activityDate: new Date('2026-09-15T11:00:00Z'),
  tags: ['Müzik'],
  mediaUrls: ['https://example.com/music.jpg'],
  taggedStudentIds: ['other-child'],
  createdAt: new Date('2026-09-15T11:00:00Z'),
  updatedAt: new Date('2026-09-15T11:00:00Z'),
  deletedAt: null,
};

const generalPost: PrismaActivityPost = {
  id: 'post-3',
  tenantId: 't-1',
  authorId: 'u-1',
  title: 'Tüm Kreş Tiyatro Gösterisi',
  description: 'Genel etkinlik',
  classroom: null,
  activityDate: new Date('2026-09-15T14:00:00Z'),
  tags: ['Tiyatro'],
  mediaUrls: [],
  taggedStudentIds: [],
  createdAt: new Date('2026-09-15T14:00:00Z'),
  updatedAt: new Date('2026-09-15T14:00:00Z'),
  deletedAt: null,
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let repo: jest.Mocked<ActivitiesRepository>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    repo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as jest.Mocked<ActivitiesRepository>;
    prisma = {
      withTenant: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;
    service = new ActivitiesService(repo, prisma);
  });

  it('lists all posts for ADMIN role without isolation', async () => {
    repo.findMany.mockResolvedValue([basePost, otherClassPost, generalPost]);
    const res = await service.list(
      't-1',
      { limit: 10, offset: 0 },
      {
        userId: 'admin-1',
        tenantId: 't-1',
        role: 'ADMIN',
      },
    );
    expect(res).toHaveLength(3);
  });

  it('filters posts for PARENT role isolating other classes', async () => {
    (prisma.withTenant as jest.Mock).mockImplementation((callback) => {
      return callback({
        student: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'child-1',
              classroomId: 'c-1',
              classroom: { name: 'Papatyalar Sınıfı' },
            },
          ]),
        },
      });
    });

    repo.findMany.mockResolvedValue([basePost, otherClassPost, generalPost]);

    const res = await service.list(
      't-1',
      { limit: 10, offset: 0 },
      {
        userId: 'parent-1',
        tenantId: 't-1',
        role: 'PARENT',
      },
    );

    // Çocuğun sınıfı (basePost) ve Genel kreş etkinliği (generalPost) dönmeli,
    // Menekşeler sınıfı (otherClassPost) veliden izole edilmeli!
    expect(res).toHaveLength(2);
    expect(res.map((p) => p.id)).toEqual(['post-1', 'post-3']);
  });

  it('creates activity post and maps DTO correctly', async () => {
    repo.create.mockResolvedValue(basePost);
    const res = await service.create('t-1', 'u-1', {
      title: 'Papatyalar Sanat Etkinliği',
      description: 'Boya çalışması',
      classroom: 'Papatyalar Sınıfı',
      tags: ['Sanat'],
      mediaUrls: ['https://example.com/art.jpg'],
      taggedStudentIds: ['child-1'],
    });
    expect(res.title).toBe('Papatyalar Sanat Etkinliği');
  });

  it('throws NotFoundException on delete if post not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.delete('t-1', 'missing-id')).rejects.toThrow(NotFoundException);
  });
});
