CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageGroup" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "classroom_teachers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "classroom_teachers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "students" ADD COLUMN "classroomId" TEXT;

CREATE UNIQUE INDEX "classrooms_tenantId_name_key" ON "classrooms"("tenantId", "name");
CREATE INDEX "classrooms_tenantId_isActive_idx" ON "classrooms"("tenantId", "isActive");
CREATE UNIQUE INDEX "classroom_teachers_tenantId_classroomId_teacherId_key" ON "classroom_teachers"("tenantId", "classroomId", "teacherId");
CREATE INDEX "classroom_teachers_tenantId_teacherId_removedAt_idx" ON "classroom_teachers"("tenantId", "teacherId", "removedAt");
CREATE INDEX "classroom_teachers_tenantId_classroomId_removedAt_idx" ON "classroom_teachers"("tenantId", "classroomId", "removedAt");
CREATE INDEX "students_tenantId_classroomId_idx" ON "students"("tenantId", "classroomId");

ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classroom_teachers" ADD CONSTRAINT "classroom_teachers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classroom_teachers" ADD CONSTRAINT "classroom_teachers_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classroom_teachers" ADD CONSTRAINT "classroom_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "classrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classrooms" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "classrooms"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

ALTER TABLE "classroom_teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classroom_teachers" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "classroom_teachers"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON "classrooms" TO kidscare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "classroom_teachers" TO kidscare_app;
