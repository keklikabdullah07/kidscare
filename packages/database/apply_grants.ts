import { PrismaClient } from './src/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://kidscare_migrator:migrator_pw@localhost:5433/kidscare?schema=public' },
  },
});

async function main() {
  const content = fs.readFileSync(path.join(__dirname, 'prisma/grants_development.sql'), 'utf8');
  // Split commands by semicolon to run individually
  const commands = content
    .split(';')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  for (const cmd of commands) {
    await prisma.$executeRawUnsafe(cmd);
  }
  console.log('Successfully applied grants and RLS on development tables individually!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
