-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ATTENDANCE_CHECK_IN', 'ATTENDANCE_CHECK_OUT', 'DAILY_REPORT_SAVED', 'MEDICATION_GIVEN', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateTable user_push_tokens
CREATE TABLE "user_push_tokens" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'mobile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "data" JSONB DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_push_tokens_userId_token_key" ON "user_push_tokens"("userId", "token");
CREATE INDEX "user_push_tokens_tenantId_userId_idx" ON "user_push_tokens"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "notifications_tenantId_userId_isRead_idx" ON "notifications"("tenantId", "userId", "isRead");
CREATE INDEX "notifications_tenantId_createdAt_idx" ON "notifications"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants & RLS for kidscare_app
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_push_tokens" TO kidscare_app;
ALTER TABLE "user_push_tokens" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "user_push_tokens"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "notifications" TO kidscare_app;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "notifications"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
