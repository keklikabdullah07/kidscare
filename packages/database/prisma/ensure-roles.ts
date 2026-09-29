import { PrismaClient } from '../src/generated/client';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[ensure-roles] No DATABASE_URL set, skipping.');
    return;
  }

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    console.log('[ensure-roles] Verifying database roles...');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kidscare_app') THEN
          CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kidscare_migrator') THEN
          CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kidscare_auth_lookup') THEN
          CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw';
        END IF;
      END
      $$;
    `);

    // Grant roles on public schema
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        BEGIN
          GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator, kidscare_app, kidscare_auth_lookup;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
        BEGIN
          GRANT CREATE ON SCHEMA public TO kidscare_migrator;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
        BEGIN
          GRANT ALL ON SCHEMA public TO kidscare_app;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END
      $$;
    `);

    console.log('[ensure-roles] Database roles verified successfully.');
  } catch (err) {
    console.warn('[ensure-roles] Note during role verification:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('[ensure-roles] Failed to ensure roles:', e);
});
