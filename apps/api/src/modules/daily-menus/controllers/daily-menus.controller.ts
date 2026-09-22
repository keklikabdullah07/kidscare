import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { z } from 'zod';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  dailyMenuCreateInputSchema,
  dailyMenuUpdateInputSchema,
} from '@kidscare/shared-schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type { DailyMenu } from '../entities/daily-menu.entity';
import { DailyMenuResponseDto } from '../dto/daily-menu-response.dto';
import { DailyMenusService } from '../services/daily-menus.service';

type DailyMenuCreateInput = z.infer<typeof dailyMenuCreateInputSchema>;
type DailyMenuUpdateInput = z.infer<typeof dailyMenuUpdateInputSchema>;

@Controller('daily-menus')
@UseGuards(TenantGuard)
export class DailyMenusController {
  constructor(@Inject(DailyMenusService) private readonly service: DailyMenusService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getByDate(
    @CurrentTenantId() tenantId: string,
    @Query('date') dateQuery?: string,
  ): Promise<DailyMenuResponseDto> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    const result = await this.service.getByDate(tenantId, dateStr);
    return new DailyMenuResponseDto(
      result.menu ? this.toResponse(result.menu) : null,
      result.allergenWarnings,
    );
  }

  @Get('range')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getByRange(
    @CurrentTenantId() tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<DailyMenuResponseDto[]> {
    if (!from || !to) {
      throw new BadRequestException('`from` ve `to` parametreleri zorunludur.');
    }
    const list = await this.service.getByRange(tenantId, from, to);
    return list.map((m) => new DailyMenuResponseDto(this.toResponse(m), []));
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(dailyMenuCreateInputSchema)) body: DailyMenuCreateInput,
  ): Promise<DailyMenuResponseDto> {
    const result = await this.service.createOrUpdate(tenantId, body);
    return new DailyMenuResponseDto(
      result.menu ? this.toResponse(result.menu) : null,
      result.allergenWarnings,
    );
  }

  @Put(':date')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(200)
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(dailyMenuUpdateInputSchema)) body: DailyMenuUpdateInput,
  ): Promise<DailyMenuResponseDto> {
    const result = await this.service.update(tenantId, date, body);
    return new DailyMenuResponseDto(
      result.menu ? this.toResponse(result.menu) : null,
      result.allergenWarnings,
    );
  }

  @Delete(':date')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(204)
  async delete(@CurrentTenantId() tenantId: string, @Param('date') date: string): Promise<void> {
    await this.service.delete(tenantId, date);
  }

  private toResponse(entity: DailyMenu) {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      breakfast: entity.breakfast,
      lunch: entity.lunch,
      snack: entity.snack,
      allergens: entity.allergens,
      calories: entity.calories,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
