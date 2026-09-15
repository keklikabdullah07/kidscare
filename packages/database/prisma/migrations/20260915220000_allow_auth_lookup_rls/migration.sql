-- Allow unauthenticated SELECT on tenants for slug resolution during login
DROP POLICY IF EXISTS tenant_public_read ON "tenants";
CREATE POLICY tenant_public_read ON "tenants" FOR SELECT USING (true);

-- Allow unauthenticated SELECT on users for email lookup during login
DROP POLICY IF EXISTS user_auth_lookup ON "users";
CREATE POLICY user_auth_lookup ON "users" FOR SELECT USING (true);
