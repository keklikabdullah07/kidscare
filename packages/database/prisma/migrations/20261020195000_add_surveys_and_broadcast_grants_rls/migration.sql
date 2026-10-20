-- ===== surveys =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "surveys" TO kidscare_app;
ALTER TABLE "surveys" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "surveys";
CREATE POLICY tenant_isolation ON "surveys"
  USING ("tenant_id" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));

-- ===== survey child tables =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_questions" TO kidscare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_responses" TO kidscare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "survey_answers" TO kidscare_app;

-- ===== broadcast_logs =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "broadcast_logs" TO kidscare_app;
ALTER TABLE "broadcast_logs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "broadcast_logs";
CREATE POLICY tenant_isolation ON "broadcast_logs"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
