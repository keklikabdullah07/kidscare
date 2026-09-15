-- CreateTable
CREATE TABLE "daily_reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood" TEXT,
    "meals" JSONB DEFAULT '{}',
    "naps" JSONB DEFAULT '{}',
    "potty" JSONB DEFAULT '[]',
    "activities" JSONB DEFAULT '[]',
    "medications" JSONB DEFAULT '[]',
    "teacherNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_tenantId_studentId_date_key" ON "daily_reports"("tenantId", "studentId", "date");

-- CreateIndex
CREATE INDEX "daily_reports_tenantId_date_idx" ON "daily_reports"("tenantId", "date");

-- CreateIndex
CREATE INDEX "daily_reports_tenantId_studentId_idx" ON "daily_reports"("tenantId", "studentId");

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Row-Level Security ──────────────────────────────────────
ALTER TABLE "daily_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_reports" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "daily_reports"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ─── Application role grants ────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "daily_reports" TO kidscare_app;
