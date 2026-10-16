import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PasswordResetTokenRecord {
  id: string;
  tenantId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}

@Injectable()
export class PasswordResetRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createToken(
    tenantId: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord> {
    return this.prisma.passwordResetToken.create({
      data: {
        tenantId,
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
