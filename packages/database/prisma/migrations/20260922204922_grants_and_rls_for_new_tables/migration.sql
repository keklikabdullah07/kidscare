-- Grants + RLS policies for pickup, medication, messaging, incident tables
-- Added because the originating migrations (20260922204921_add_pickup_and_medication,
-- 20260922210925_add_messaging_and_incidents) shipped without them, so the
-- `kidscare_app` role can not DELETE/INSERT and the tables are not isolated
-- by tenant. This migration is safe to apply to a fresh DB as well as the
-- existing dev/staging schemas.

-- ===== pickup_contacts =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "pickup_contacts" TO kidscare_app;
ALTER TABLE "pickup_contacts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pickup_contacts"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== pickup_authorizations =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "pickup_authorizations" TO kidscare_app;
ALTER TABLE "pickup_authorizations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pickup_authorizations"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== pickup_events =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "pickup_events" TO kidscare_app;
ALTER TABLE "pickup_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pickup_events"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== medication_records =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "medication_records" TO kidscare_app;
ALTER TABLE "medication_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "medication_records"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== conversations =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "conversations" TO kidscare_app;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "conversations"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== conversation_participants =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "conversation_participants" TO kidscare_app;
ALTER TABLE "conversation_participants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "conversation_participants"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== messages =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "messages" TO kidscare_app;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "messages"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== message_read_receipts =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "message_read_receipts" TO kidscare_app;
ALTER TABLE "message_read_receipts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "message_read_receipts"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== parent_requests =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "parent_requests" TO kidscare_app;
ALTER TABLE "parent_requests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "parent_requests"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- ===== incident_records =====
GRANT SELECT, INSERT, UPDATE, DELETE ON "incident_records" TO kidscare_app;
ALTER TABLE "incident_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "incident_records"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
