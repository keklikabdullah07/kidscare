-- CreateTable attendance_excuses
CREATE TABLE IF NOT EXISTS "attendance_excuses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_excuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable event_consents
CREATE TABLE IF NOT EXISTS "event_consents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classroomId" TEXT,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "price" DECIMAL(10,2),
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable event_consent_responses
CREATE TABLE IF NOT EXISTS "event_consent_responses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentUserId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_consent_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_excuses_tenantId_studentId_date_key" ON "attendance_excuses"("tenantId", "studentId", "date");
CREATE INDEX IF NOT EXISTS "attendance_excuses_tenantId_date_idx" ON "attendance_excuses"("tenantId", "date");
CREATE INDEX IF NOT EXISTS "attendance_excuses_tenantId_studentId_idx" ON "attendance_excuses"("tenantId", "studentId");

CREATE INDEX IF NOT EXISTS "event_consents_tenantId_eventDate_idx" ON "event_consents"("tenantId", "eventDate");
CREATE INDEX IF NOT EXISTS "event_consents_tenantId_classroomId_idx" ON "event_consents"("tenantId", "classroomId");

CREATE UNIQUE INDEX IF NOT EXISTS "event_consent_responses_consentId_studentId_key" ON "event_consent_responses"("consentId", "studentId");
CREATE INDEX IF NOT EXISTS "event_consent_responses_tenantId_consentId_idx" ON "event_consent_responses"("tenantId", "consentId");
CREATE INDEX IF NOT EXISTS "event_consent_responses_tenantId_studentId_idx" ON "event_consent_responses"("tenantId", "studentId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_excuses_tenantId_fkey') THEN
    ALTER TABLE "attendance_excuses" ADD CONSTRAINT "attendance_excuses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_excuses_studentId_fkey') THEN
    ALTER TABLE "attendance_excuses" ADD CONSTRAINT "attendance_excuses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_excuses_createdById_fkey') THEN
    ALTER TABLE "attendance_excuses" ADD CONSTRAINT "attendance_excuses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consents_tenantId_fkey') THEN
    ALTER TABLE "event_consents" ADD CONSTRAINT "event_consents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consents_classroomId_fkey') THEN
    ALTER TABLE "event_consents" ADD CONSTRAINT "event_consents_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consents_createdById_fkey') THEN
    ALTER TABLE "event_consents" ADD CONSTRAINT "event_consents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consent_responses_tenantId_fkey') THEN
    ALTER TABLE "event_consent_responses" ADD CONSTRAINT "event_consent_responses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consent_responses_consentId_fkey') THEN
    ALTER TABLE "event_consent_responses" ADD CONSTRAINT "event_consent_responses_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "event_consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consent_responses_studentId_fkey') THEN
    ALTER TABLE "event_consent_responses" ADD CONSTRAINT "event_consent_responses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_consent_responses_parentUserId_fkey') THEN
    ALTER TABLE "event_consent_responses" ADD CONSTRAINT "event_consent_responses_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Grants & RLS for kidscare_app
GRANT SELECT, INSERT, UPDATE, DELETE ON "attendance_excuses" TO kidscare_app;
ALTER TABLE "attendance_excuses" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "attendance_excuses";
CREATE POLICY tenant_isolation ON "attendance_excuses"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "event_consents" TO kidscare_app;
ALTER TABLE "event_consents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "event_consents";
CREATE POLICY tenant_isolation ON "event_consents"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "event_consent_responses" TO kidscare_app;
ALTER TABLE "event_consent_responses" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "event_consent_responses";
CREATE POLICY tenant_isolation ON "event_consent_responses"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
