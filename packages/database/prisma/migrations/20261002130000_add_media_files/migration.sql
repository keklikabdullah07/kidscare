-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('STUDENT_AVATAR', 'DAILY_REPORT', 'ACTIVITY', 'PORTFOLIO', 'HEALTH_RECORD', 'GENERAL');

-- CreateTable media_files
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL DEFAULT 'GENERAL',
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_fileKey_key" ON "media_files"("fileKey");
CREATE INDEX "media_files_tenantId_category_idx" ON "media_files"("tenantId", "category");
CREATE INDEX "media_files_tenantId_uploadedById_idx" ON "media_files"("tenantId", "uploadedById");
CREATE INDEX "media_files_tenantId_createdAt_idx" ON "media_files"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants & RLS for kidscare_app
GRANT SELECT, INSERT, UPDATE, DELETE ON "media_files" TO kidscare_app;
ALTER TABLE "media_files" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "media_files"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
