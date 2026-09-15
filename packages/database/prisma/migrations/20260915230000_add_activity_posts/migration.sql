-- CreateTable
CREATE TABLE "activity_posts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classroom" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "mediaUrls" JSONB NOT NULL DEFAULT '[]',
    "taggedStudentIds" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "activity_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_posts_tenantId_activityDate_idx" ON "activity_posts"("tenantId", "activityDate");

-- CreateIndex
CREATE INDEX "activity_posts_tenantId_classroom_idx" ON "activity_posts"("tenantId", "classroom");

-- AddForeignKey
ALTER TABLE "activity_posts" ADD CONSTRAINT "activity_posts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "activity_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_posts" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "activity_posts"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON "activity_posts" TO kidscare_app;
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'kidscare_user') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "activity_posts" TO kidscare_user;
  END IF;
END $$;
