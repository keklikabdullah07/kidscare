import { createAuthLookupClient } from './auth-lookup-client';

describe('createAuthLookupClient', () => {
  it('returns a PrismaClient instance', () => {
    const client = createAuthLookupClient('postgresql://x:y@localhost:5433/z');
    expect(client).toBeDefined();
    expect(typeof client.$connect).toBe('function');
    void client.$disconnect();
  });
});
