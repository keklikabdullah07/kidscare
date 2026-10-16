-- CreateTable password_reset_tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_tenantId_idx" ON "password_reset_tokens"("tenantId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_tokens_tenantId_fkey') THEN
    ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_tokens_userId_fkey') THEN
    ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Grants & RLS for kidscare_app
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kidscare_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "password_reset_tokens" TO kidscare_app;
  END IF;
END $$;

ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "password_reset_tokens";
CREATE POLICY tenant_isolation ON "password_reset_tokens"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- Auth lookup role can read and update if needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kidscare_auth_lookup') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "password_reset_tokens" TO kidscare_auth_lookup;
  END IF;
END $$;
