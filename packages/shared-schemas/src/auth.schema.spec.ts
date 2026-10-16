import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyResetTokenSchema,
} from './auth.schema';

describe('loginSchema', () => {
  it('accepts a valid login payload', () => {
    expect(() =>
      loginSchema.parse({
        tenantSlug: 'demo-kres',
        email: 'admin@demo.com',
        password: 'x',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() =>
      loginSchema.parse({
        tenantSlug: 'demo-kres',
        email: 'not-an-email',
        password: 'x',
      }),
    ).toThrow();
  });

  it('rejects a slug with uppercase letters', () => {
    expect(() =>
      loginSchema.parse({
        tenantSlug: 'Demo-Kres',
        email: 'admin@demo.com',
        password: 'x',
      }),
    ).toThrow();
  });
});

describe('signupSchema', () => {
  it('accepts a valid signup payload', () => {
    expect(() =>
      signupSchema.parse({
        tenantSlug: 'yeni-kres',
        tenantName: 'Yeni Kreş',
        email: 'admin@yeni.com',
        password: 'strongpass1',
      }),
    ).not.toThrow();
  });

  it('rejects a password shorter than 8 chars', () => {
    expect(() =>
      signupSchema.parse({
        tenantSlug: 'yeni-kres',
        tenantName: 'Yeni Kreş',
        email: 'admin@yeni.com',
        password: 'short',
      }),
    ).toThrow();
  });

  it('rejects a tenant name shorter than 2 chars', () => {
    expect(() =>
      signupSchema.parse({
        tenantSlug: 'yeni-kres',
        tenantName: 'Y',
        email: 'admin@yeni.com',
        password: 'strongpass1',
      }),
    ).toThrow();
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid payload', () => {
    expect(() =>
      forgotPasswordSchema.parse({
        tenantSlug: 'demo',
        email: 'user@example.com',
      }),
    ).not.toThrow();
  });

  it('rejects invalid email', () => {
    expect(() =>
      forgotPasswordSchema.parse({
        tenantSlug: 'demo',
        email: 'not-email',
      }),
    ).toThrow();
  });
});

describe('verifyResetTokenSchema', () => {
  it('accepts valid token', () => {
    expect(() =>
      verifyResetTokenSchema.parse({
        token: 'a1b2c3d4e5f6g7h8i9j0k1l2',
      }),
    ).not.toThrow();
  });

  it('rejects short token', () => {
    expect(() =>
      verifyResetTokenSchema.parse({
        token: 'short',
      }),
    ).toThrow();
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid new password', () => {
    expect(() =>
      resetPasswordSchema.parse({
        token: 'a1b2c3d4e5f6g7h8i9j0k1l2',
        newPassword: 'MySecurePassword123!',
      }),
    ).not.toThrow();
  });

  it('rejects password shorter than 8 characters', () => {
    expect(() =>
      resetPasswordSchema.parse({
        token: 'a1b2c3d4e5f6g7h8i9j0k1l2',
        newPassword: 'short',
      }),
    ).toThrow();
  });
});
