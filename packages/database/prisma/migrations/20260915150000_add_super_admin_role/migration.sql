-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "students" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "students_tenantId_parentId_idx" ON "students"("tenantId", "parentId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
