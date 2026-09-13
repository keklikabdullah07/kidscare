=== git log (commits in task range) ===
3811032 feat(infra): docker-compose with Postgres + Redis and three-role separation

=== git diff --stat ===
.env.example | 13 +++++++++++++
docker-compose.yml | 32 ++++++++++++++++++++++++++++++++
docker/init/01-roles.sql | 9 +++++++++
docker/init/02-extensions.sql | 2 ++
4 files changed, 56 insertions(+)

=== git diff -U10 ===
diff --git a/.env.example b/.env.example
new file mode 100644
index 0000000..3a440d4
--- /dev/null
+++ b/.env.example
@@ -0,0 +1,13 @@
+# Migration role — schema owner, used only by prisma migrate / db push
+DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5433/kidscare?schema=public +
+# Normal application role — used by the NestJS app at runtime
+DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5433/kidscare?schema=public +
+# Login-only role — read by auth module's login handler ONLY (see spec §7.5)
+DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5433/kidscare?schema=public +
+REDIS_URL=redis://localhost:6379
+JWT_SECRET=replace-me
+NODE_ENV=development
+PORT=3000
\ No newline at end of file
diff --git a/docker-compose.yml b/docker-compose.yml
new file mode 100644
index 0000000..b2674cc
--- /dev/null
+++ b/docker-compose.yml
@@ -0,0 +1,32 @@
+services:

- postgres:
- image: postgres:16-alpine
- container_name: kidscare-postgres
- environment:
-      POSTGRES_USER: postgres
-      POSTGRES_PASSWORD: postgres
-      POSTGRES_DB: kidscare
- ports:
-      - '5433:5432'
- volumes:
-      - postgres-data:/var/lib/postgresql/data
-      - ./docker/init:/docker-entrypoint-initdb.d:ro
- healthcheck:
-      test: ['CMD-SHELL', 'pg_isready -U postgres']
-      interval: 5s
-      timeout: 5s
-      retries: 5
-
- redis:
- image: redis:7-alpine
- container_name: kidscare-redis
- ports:
-      - '6379:6379'
- healthcheck:
-      test: ['CMD', 'redis-cli', 'ping']
-      interval: 5s
-      timeout: 5s
-      retries: 5
-

+volumes:

- postgres-data:
  \ No newline at end of file
  diff --git a/docker/init/01-roles.sql b/docker/init/01-roles.sql
  new file mode 100644
  index 0000000..f3753d4
  --- /dev/null
  +++ b/docker/init/01-roles.sql
  @@ -0,0 +1,9 @@
  +-- 02-extensions.sql runs first; roles must exist before grants apply.
-

+CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
+CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
+CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw'; +
+GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator;
+GRANT CONNECT ON DATABASE kidscare TO kidscare_app;
+GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
\ No newline at end of file
diff --git a/docker/init/02-extensions.sql b/docker/init/02-extensions.sql
new file mode 100644
index 0000000..9860ab7
--- /dev/null
+++ b/docker/init/02-extensions.sql
@@ -0,0 +1,2 @@
+CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
+CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\ No newline at end of file
