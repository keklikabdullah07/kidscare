import type { ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;
  const SECRET = 'test-secret-very-long-and-random-12345678';

  beforeEach(() => {
    const config = { get: () => SECRET, getOrThrow: () => SECRET } as unknown as ConfigService;
    service = new JwtService(config);
  });

  describe('sign + verify', () => {
    it('round-trips valid claims', () => {
      const token = service.sign({ sub: 'u-1', tenantId: 't-1', role: 'ADMIN' });
      expect(service.verify(token)).toEqual({
        sub: 'u-1',
        tenantId: 't-1',
        role: 'ADMIN',
      });
    });
  });

  describe('verify', () => {
    it('throws on malformed token', () => {
      expect(() => service.verify('not-a-jwt')).toThrow();
    });

    it('throws on wrong secret', () => {
      const other = new JwtService({
        get: () => 'different-secret-very-long-random-1234',
        getOrThrow: () => 'different-secret-very-long-random-1234',
      } as unknown as ConfigService);
      const token = service.sign({ sub: 'u-1', tenantId: 't-1', role: 'ADMIN' });
      expect(() => other.verify(token)).toThrow();
    });
  });
});
