-- Restrict user_auth_lookup RLS policy strictly to kidscare_auth_lookup role.
-- Previously without 'TO kidscare_auth_lookup', the policy was applied to PUBLIC (including kidscare_app),
-- causing all SELECT queries by the app to bypass tenant isolation.
DROP POLICY IF EXISTS user_auth_lookup ON "users";
CREATE POLICY user_auth_lookup ON "users" FOR SELECT TO kidscare_auth_lookup USING (true);
