-- CreateEnum safely
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DevelopmentDomain') THEN
    CREATE TYPE "DevelopmentDomain" AS ENUM ('DIL', 'MOTOR', 'SOSYAL_DUYGUSAL', 'BILISSEL', 'OZ_BAKIM', 'SANAT');
  END IF;
END $$;

-- CreateTable development_observations
CREATE TABLE IF NOT EXISTS "development_observations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "domain" "DevelopmentDomain" NOT NULL,
    "skillName" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isParentVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable portfolio_items
CREATE TABLE IF NOT EXISTS "portfolio_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "observationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "isParentVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable home_activity_suggestions
CREATE TABLE IF NOT EXISTS "home_activity_suggestions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" "DevelopmentDomain" NOT NULL,
    "ageGroup" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_activity_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "development_observations_tenantId_studentId_observedAt_idx" ON "development_observations"("tenantId", "studentId", "observedAt");
CREATE INDEX IF NOT EXISTS "development_observations_tenantId_domain_idx" ON "development_observations"("tenantId", "domain");

CREATE INDEX IF NOT EXISTS "portfolio_items_tenantId_studentId_idx" ON "portfolio_items"("tenantId", "studentId");

CREATE INDEX IF NOT EXISTS "home_activity_suggestions_tenantId_domain_idx" ON "home_activity_suggestions"("tenantId", "domain");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'development_observations_tenantId_fkey') THEN
    ALTER TABLE "development_observations" ADD CONSTRAINT "development_observations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'development_observations_studentId_fkey') THEN
    ALTER TABLE "development_observations" ADD CONSTRAINT "development_observations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'development_observations_teacherId_fkey') THEN
    ALTER TABLE "development_observations" ADD CONSTRAINT "development_observations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_tenantId_fkey') THEN
    ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_studentId_fkey') THEN
    ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_observationId_fkey') THEN
    ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "development_observations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_activity_suggestions_tenantId_fkey') THEN
    ALTER TABLE "home_activity_suggestions" ADD CONSTRAINT "home_activity_suggestions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Grants & RLS for kidscare_app
GRANT SELECT, INSERT, UPDATE, DELETE ON "development_observations" TO kidscare_app;
ALTER TABLE "development_observations" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "development_observations";
CREATE POLICY tenant_isolation ON "development_observations"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "portfolio_items" TO kidscare_app;
ALTER TABLE "portfolio_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "portfolio_items";
CREATE POLICY tenant_isolation ON "portfolio_items"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "home_activity_suggestions" TO kidscare_app;
ALTER TABLE "home_activity_suggestions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "home_activity_suggestions";
CREATE POLICY tenant_isolation ON "home_activity_suggestions"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
