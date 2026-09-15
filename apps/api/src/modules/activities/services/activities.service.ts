import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ActivityPost } from '@kidscare/shared-types';
import type { ActivityPost as PrismaActivityPost } from '@kidscare/database';
import type { CreateActivityPostInput, ActivityFilterQueryInput } from '@kidscare/shared-schemas';
import { ActivitiesRepository } from '../repositories/activities.repository';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(ActivitiesRepository) private readonly activitiesRepository: ActivitiesRepository,
  ) {}

  private mapToDto(post: PrismaActivityPost): ActivityPost {
    return {
      id: post.id,
      tenantId: post.tenantId,
      authorId: post.authorId,
      title: post.title,
      description: post.description,
      classroom: post.classroom,
      activityDate: post.activityDate.toISOString(),
      tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
      mediaUrls: Array.isArray(post.mediaUrls) ? (post.mediaUrls as string[]) : [],
      taggedStudentIds: Array.isArray(post.taggedStudentIds)
        ? (post.taggedStudentIds as string[])
        : [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, filter?: ActivityFilterQueryInput): Promise<ActivityPost[]> {
    const posts = await this.activitiesRepository.findMany(tenantId, filter);
    return posts.map((p) => this.mapToDto(p));
  }

  async getById(tenantId: string, id: string): Promise<ActivityPost> {
    const post = await this.activitiesRepository.findById(tenantId, id);
    if (!post) {
      throw new NotFoundException(`Activity post #${id} not found`);
    }
    return this.mapToDto(post);
  }

  async create(
    tenantId: string,
    authorId: string,
    input: CreateActivityPostInput,
  ): Promise<ActivityPost> {
    const post = await this.activitiesRepository.create(tenantId, {
      authorId,
      title: input.title,
      description: input.description ?? null,
      classroom: input.classroom ?? null,
      activityDate: input.activityDate ? new Date(input.activityDate) : new Date(),
      tags: input.tags,
      mediaUrls: input.mediaUrls,
      taggedStudentIds: input.taggedStudentIds,
    });
    return this.mapToDto(post);
  }

  async delete(tenantId: string, id: string): Promise<{ success: boolean }> {
    const post = await this.activitiesRepository.findById(tenantId, id);
    if (!post) {
      throw new NotFoundException(`Activity post #${id} not found`);
    }
    await this.activitiesRepository.softDelete(tenantId, id);
    return { success: true };
  }
}
