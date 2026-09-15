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
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { dailyMenuCreateInputSchema, dailyMenuUpdateInputSchema } from '@kidscare/shared-schemas';
import type { DailyMenu } from '../entities/daily-menu.entity';
import { DailyMenuResponseDto } from '../dto/daily-menu-response.dto';
import { DailyMenusService } from '../services/daily-menus.service';

@Controller('daily-menus')
@UseGuards(TenantGuard)
export class DailyMenusController {
  constructor(@Inject(DailyMenusService) private readonly service: DailyMenusService) {}

  @Get()
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
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @Body() body: unknown,
  ): Promise<DailyMenuResponseDto> {
    const parsed = dailyMenuCreateInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Geçersiz menü verisi',
        issues: parsed.error.issues,
      });
    }
    const result = await this.service.createOrUpdate(tenantId, parsed.data);
    return new DailyMenuResponseDto(
      result.menu ? this.toResponse(result.menu) : null,
      result.allergenWarnings,
    );
  }

  @Put(':date')
  @HttpCode(200)
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('date') date: string,
    @Body() body: unknown,
  ): Promise<DailyMenuResponseDto> {
    const parsed = dailyMenuUpdateInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Geçersiz menü güncelleme verisi',
        issues: parsed.error.issues,
      });
    }
    const result = await this.service.update(tenantId, date, parsed.data);
    return new DailyMenuResponseDto(
      result.menu ? this.toResponse(result.menu) : null,
      result.allergenWarnings,
    );
  }

  @Delete(':date')
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
