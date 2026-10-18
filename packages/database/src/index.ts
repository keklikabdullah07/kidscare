export { PrismaClient } from './client';
export { withTenantContext, Prisma } from './middleware/tenant.middleware';
export { createAuthLookupClient } from './client/auth-lookup-client';
export { AUTH_LOOKUP_USER_COLUMNS, AUTH_LOOKUP_TENANT_COLUMNS } from './auth-lookup-columns';
// Re-export the model types so app code can name them from
// `@kidscare/database` without deep-importing the generated client.
export type {
  Tenant,
  User,
  Student,
  DailyReport,
  Attendance,
  DailyMenu,
  ActivityPost,
  TenantStatus,
  UserRole,
  DevelopmentDomain,
  DevelopmentObservation,
  PortfolioItem,
  HomeActivitySuggestion,
  UserPushToken,
  Notification,
  MediaFile,
  AttendanceExcuse,
  EventConsent,
  EventConsentResponse,
  StudentBillingPlan,
  BillingInvoice,
  PaymentTransaction,
  BroadcastLog,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyAnswer,
} from './generated/client';

export {
  NotificationType,
  MediaCategory,
  InvoiceStatus,
  PaymentMethod,
  BroadcastTargetType,
  BroadcastPriority,
  SurveyStatus,
  SurveyQuestionType,
} from './generated/client';
