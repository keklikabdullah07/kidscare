-- 02-extensions.sql runs first; roles must exist before grants apply.

CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw';

GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator;
GRANT CONNECT ON DATABASE kidscare TO kidscare_app;
GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;

-- kidscare_migrator needs CREATEDB + CREATE on schema to run prisma migrate reset
-- (drops + recreates the database) and to apply new migrations.
ALTER ROLE kidscare_migrator CREATEDB;
GRANT CREATE ON SCHEMA public TO kidscare_migrator;

-- kidscare_migrator must be able to ALTER kidscare_auth_lookup so the
-- `auth_lookup_bypassrls` migration (granting BYPASSRLS to the lookup
-- role) applies on a fresh DB without manual intervention. WITH ADMIN
-- OPTION gives the migrator full control over the role's properties.
GRANT kidscare_auth_lookup TO kidscare_migrator WITH ADMIN OPTION;

-- Default privileges: future tables created by kidscare_migrator are
-- automatically accessible to kidscare_app. Without this, every new
-- migration that adds a tenant-scoped table needs an explicit GRANT.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kidscare_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO kidscare_app;