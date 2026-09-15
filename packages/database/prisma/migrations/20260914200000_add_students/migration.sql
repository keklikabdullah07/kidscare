-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_tenantId_idx" ON "students"("tenantId");

CREATE INDEX "students_tenantId_deletedAt_idx" ON "students"("tenantId", "deletedAt");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Row-Level Security ──────────────────────────────────────
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "students"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ─── Application role grants ────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "students" TO kidscare_app;

-- (No auth_lookup grant needed — login only reads tenants + users.)
