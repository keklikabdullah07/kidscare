-- CreateTable
CREATE TABLE "daily_menus" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "breakfast" JSONB NOT NULL DEFAULT '[]',
    "lunch" JSONB NOT NULL DEFAULT '[]',
    "snack" JSONB NOT NULL DEFAULT '[]',
    "allergens" JSONB NOT NULL DEFAULT '[]',
    "calories" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_menus_tenantId_date_key" ON "daily_menus"("tenantId", "date");

-- CreateIndex
CREATE INDEX "daily_menus_tenantId_date_idx" ON "daily_menus"("tenantId", "date");

-- AddForeignKey
ALTER TABLE "daily_menus" ADD CONSTRAINT "daily_menus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Row-Level Security ──────────────────────────────────────
ALTER TABLE "daily_menus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_menus" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "daily_menus"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ─── Application role grants ────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "daily_menus" TO kidscare_app;
