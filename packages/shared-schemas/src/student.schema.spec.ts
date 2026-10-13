import { studentCreateSchema, studentUpdateSchema } from './student.schema';

describe('studentCreateSchema', () => {
  it('accepts a valid payload', () => {
    expect(() =>
      studentCreateSchema.parse({
        firstName: 'Ada',
        lastName: 'Yılmaz',
        dateOfBirth: '2020-05-12',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid date format', () => {
    expect(() =>
      studentCreateSchema.parse({
        firstName: 'Ada',
        lastName: 'Yılmaz',
        dateOfBirth: '12-05-2020',
      }),
    ).toThrow();
  });

  it('rejects empty firstName', () => {
    expect(() =>
      studentCreateSchema.parse({
        firstName: '',
        lastName: 'Yılmaz',
        dateOfBirth: '2020-05-12',
      }),
    ).toThrow();
  });

  it('rejects a future date of birth', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().slice(0, 10);
    expect(() =>
      studentCreateSchema.parse({
        firstName: 'Ada',
        lastName: 'Yılmaz',
        dateOfBirth: dateStr,
      }),
    ).toThrow('Doğum tarihi bugünden ileri bir tarih olamaz');
  });

  it('rejects emergency contact with empty or blank phone', () => {
    expect(() =>
      studentCreateSchema.parse({
        firstName: 'Ada',
        lastName: 'Yılmaz',
        dateOfBirth: '2020-05-12',
        passport: {
          emergencyContacts: [
            {
              id: 'c1',
              name: 'Veli',
              relationship: 'Anne',
              phone: '',
            },
          ],
        },
      }),
    ).toThrow();
  });
});

describe('studentUpdateSchema', () => {
  it('accepts a partial update', () => {
    expect(() => studentUpdateSchema.parse({ firstName: 'Yeni' })).not.toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() => studentUpdateSchema.parse({ tenantId: 'hack' })).toThrow();
  });

  it('accepts null for nullable fields', () => {
    expect(() => studentUpdateSchema.parse({ gender: null, notes: null })).not.toThrow();
  });
});
