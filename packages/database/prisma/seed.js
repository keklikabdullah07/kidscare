import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const DEMO_TENANT_ID = 'demo-tenant-seed-001';
async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${DEMO_TENANT_ID}'`);
    const tenant = await tx.tenant.upsert({
      where: { id: DEMO_TENANT_ID },
      update: {},
      create: { id: DEMO_TENANT_ID, slug: 'demo', name: 'Demo Kreş' },
    });
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await tx.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.test' } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@demo.test',
        passwordHash,
        role: 'ADMIN',
      },
    });
    await tx.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@demo.test' } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'teacher@demo.test',
        passwordHash,
        role: 'TEACHER',
      },
    });
    console.log(`Seeded tenant ${tenant.slug} with id ${tenant.id}`);
  });
}
main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
