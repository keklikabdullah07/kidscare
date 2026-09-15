-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABSENT',
    "checkInTime" TEXT,
    "checkInBy" TEXT,
    "checkOutTime" TEXT,
    "checkOutBy" TEXT,
    "pickupContactId" TEXT,
    "pickupNote" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendances_tenantId_studentId_date_key" ON "attendances"("tenantId", "studentId", "date");

-- CreateIndex
CREATE INDEX "attendances_tenantId_date_idx" ON "attendances"("tenantId", "date");

-- CreateIndex
CREATE INDEX "attendances_tenantId_studentId_idx" ON "attendances"("tenantId", "studentId");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Row-Level Security ──────────────────────────────────────
ALTER TABLE "attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendances" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "attendances"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ─── Application role grants ────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "attendances" TO kidscare_app;
