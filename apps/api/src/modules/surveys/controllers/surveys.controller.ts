import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createSurveySchema,
  submitSurveyResponseSchema,
  updateSurveyStatusSchema,
  type CreateSurveyInput,
  type SubmitSurveyResponseInput,
  type UpdateSurveyStatusInput,
} from '@kidscare/shared-schemas';
import type {
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
  SurveyStatus,
} from '@kidscare/shared-types';
import { SurveysService } from '../services/surveys.service';

@Controller('surveys')
@UseGuards(TenantGuard)
export class SurveysController {
  constructor(
    @Inject(SurveysService)
    private readonly service: SurveysService,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createSurvey(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createSurveySchema)) dto: CreateSurveyInput,
  ): Promise<{ success: boolean; id: string }> {
    return this.service.createSurvey(user.tenantId, user.userId, dto);
  }

  @Get('stats')
  @Get('stats/overview')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async getStatsOverview(@CurrentUser() user: CurrentUserPayload): Promise<SurveyStatsOverviewDto> {
    return this.service.getStatsOverview(user.tenantId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getSurveys(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') statusQuery?: string,
    @Query('classroomId') classroomIdQuery?: string,
  ): Promise<SurveyListItemDto[]> {
    const status = statusQuery as SurveyStatus | undefined;
    return this.service.getSurveys(
      user.tenantId,
      { status, classroomId: classroomIdQuery },
      user.userId,
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getSurveyById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<SurveyDetailDto> {
    return this.service.getSurveyById(user.tenantId, id, user.userId);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSurveyStatusSchema)) dto: UpdateSurveyStatusInput,
  ): Promise<{ success: boolean }> {
    return this.service.updateSurveyStatus(user.tenantId, id, dto.status);
  }

  @Post(':id/respond')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  @HttpCode(HttpStatus.OK)
  async submitResponse(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(submitSurveyResponseSchema)) dto: SubmitSurveyResponseInput,
  ): Promise<{ success: boolean }> {
    return this.service.submitSurveyResponse(user.tenantId, id, user.userId, dto);
  }
}
