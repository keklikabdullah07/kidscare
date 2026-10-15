import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { InvoiceStatus } from '@kidscare/database';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createBillingPlanInputSchema,
  createInvoiceInputSchema,
  recordPaymentInputSchema,
} from '@kidscare/shared-schemas';
import type {
  CreateBillingPlanInput,
  CreateInvoiceInput,
  FinanceSummaryStats,
  RecordPaymentInput,
} from '@kidscare/shared-types';
import { FinanceService } from '../services/finance.service';
import type { InvoiceWithDetails, PlanWithStudent } from '../repositories/finance.repository';

@Controller('finance')
@UseGuards(TenantGuard)
export class FinanceController {
  constructor(@Inject(FinanceService) private readonly financeService: FinanceService) {}

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getStats(
    @CurrentTenantId() tenantId: string,
    @Query('period') period?: string,
  ): Promise<FinanceSummaryStats> {
    return this.financeService.getStats(tenantId, period);
  }

  @Get('invoices')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async listInvoices(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('classroomId') classroomId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('period') period?: string,
  ): Promise<InvoiceWithDetails[]> {
    return this.financeService.listInvoices(tenantId, {
      studentId,
      classroomId,
      status,
      period,
    });
  }

  @Post('invoices')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(201)
  async createInvoice(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(createInvoiceInputSchema)) body: CreateInvoiceInput,
  ): Promise<InvoiceWithDetails> {
    return this.financeService.createInvoice(tenantId, body);
  }

  @Post('payments')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(201)
  async recordPayment(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(recordPaymentInputSchema)) body: RecordPaymentInput,
  ): Promise<InvoiceWithDetails> {
    return this.financeService.recordPayment(tenantId, user.userId, body);
  }

  @Get('plans')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async listBillingPlans(@CurrentTenantId() tenantId: string): Promise<PlanWithStudent[]> {
    return this.financeService.listBillingPlans(tenantId);
  }

  @Post('plans')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(200)
  async saveBillingPlan(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(createBillingPlanInputSchema)) body: CreateBillingPlanInput,
  ): Promise<PlanWithStudent> {
    return this.financeService.saveBillingPlan(tenantId, body);
  }

  @Post('invoices/:id/remind')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(200)
  async sendReminder(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.financeService.sendPaymentReminder(tenantId, id);
  }

  @Get('my-child')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  async getMyChildBilling(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<InvoiceWithDetails[]> {
    return this.financeService.getMyChildBilling(tenantId, user.userId);
  }
}
