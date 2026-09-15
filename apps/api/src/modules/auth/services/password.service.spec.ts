import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  describe('hash', () => {
    it('produces a bcrypt hash that does not equal the plain input', async () => {
      const hash = await service.hash('hunter2');
      expect(hash).not.toBe('hunter2');
      expect(hash.length).toBeGreaterThan(50);
      expect(hash.startsWith('$2')).toBe(true);
    });
  });

  describe('verify', () => {
    it('returns true for matching password', async () => {
      const hash = await service.hash('hunter2');
      await expect(service.verify('hunter2', hash)).resolves.toBe(true);
    });

    it('returns false for wrong password', async () => {
      const hash = await service.hash('hunter2');
      await expect(service.verify('wrong', hash)).resolves.toBe(false);
    });
  });
});
