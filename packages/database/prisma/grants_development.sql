-- Grants + RLS policies for development and portfolio tables
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
