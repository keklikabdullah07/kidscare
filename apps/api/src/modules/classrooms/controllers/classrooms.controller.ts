import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Classroom, ClassroomDailyFlow } from '@kidscare/shared-types';
import {
  classroomCreateSchema,
  classroomTeacherAssignmentSchema,
  classroomUpdateSchema,
  type ClassroomCreate,
  type ClassroomTeacherAssignmentInput,
  type ClassroomUpdate,
} from '@kidscare/shared-schemas';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ClassroomsService } from '../services/classrooms.service';

@Controller('classrooms')
@UseGuards(TenantGuard)
export class ClassroomsController {
  constructor(@Inject(ClassroomsService) private readonly classroomsService: ClassroomsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async list(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Classroom[]> {
    return this.classroomsService.list(tenantId, {
      userId: user.userId,
      role: user.role === 'TEACHER' ? 'TEACHER' : user.role === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN',
    });
  }

  @Get(':id/daily-flow')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async getDailyFlow(
    @CurrentTenantId() tenantId: string,
    @Param('id') classroomId: string,
    @Query('date') dateQuery: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ClassroomDailyFlow> {
    return this.classroomsService.getDailyFlow(tenantId, classroomId, dateQuery ?? new Date().toISOString().slice(0, 10), {
      userId: user.userId,
      role: user.role === 'TEACHER' ? 'TEACHER' : user.role === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN',
    });
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(classroomCreateSchema)) body: ClassroomCreate,
  ): Promise<Classroom> {
    return this.classroomsService.create(tenantId, body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(classroomUpdateSchema)) body: ClassroomUpdate,
  ): Promise<Classroom> {
    return this.classroomsService.update(tenantId, id, body);
  }

  @Post(':id/teachers')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(200)
  async assignTeacher(
    @CurrentTenantId() tenantId: string,
    @Param('id') classroomId: string,
    @Body(new ZodValidationPipe(classroomTeacherAssignmentSchema))
    body: ClassroomTeacherAssignmentInput,
  ): Promise<Classroom> {
    return this.classroomsService.assignTeacher(tenantId, classroomId, body);
  }
}
