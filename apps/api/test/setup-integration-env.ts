import { readFileSync } from 'fs';
import { join } from 'path';

// Minimal .env loader (no dependency on `dotenv`). Runs once before the
// integration suite spins up; populates process.env with values from the
// workspace-root `.env` file. Existing process.env values win.
const envPath = join(__dirname, '..', '..', '..', '.env');
try {
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m || !m[1]) continue;
    const key = m[1];
    const raw = m[2] ?? '';
    if (process.env[key] === undefined) {
      process.env[key] = raw;
    }
  }
} catch {
  // .env missing — leave process.env untouched
}

export default async function setupIntegrationEnv(): Promise<void> {
  // Top-level side effects above already populated process.env; this
  // function exists only because Jest's `globalSetup` requires a default
  // export. Return a resolved promise so Jest knows we're done.
  return Promise.resolve();
}
