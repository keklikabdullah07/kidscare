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