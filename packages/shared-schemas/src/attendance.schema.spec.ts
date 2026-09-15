import {
  attendanceSchema,
  attendanceStatusSchema,
  checkInInputSchema,
  checkOutInputSchema,
  attendanceUpdateInputSchema,
} from './attendance.schema';

describe('attendance schemas', () => {
  it('validates attendance status correctly', () => {
    expect(attendanceStatusSchema.safeParse('PRESENT').success).toBe(true);
    expect(attendanceStatusSchema.safeParse('ABSENT').success).toBe(true);
    expect(attendanceStatusSchema.safeParse('EXCUSED').success).toBe(true);
    expect(attendanceStatusSchema.safeParse('LEFT').success).toBe(true);
    expect(attendanceStatusSchema.safeParse('INVALID').success).toBe(false);
  });

  it('validates checkInInputSchema', () => {
    const valid = checkInInputSchema.safeParse({
      checkInTime: '08:30',
      checkInBy: 'Ahmet Yılmaz (Baba)',
      note: 'Neşeli geldi',
    });
    expect(valid.success).toBe(true);

    const invalidTime = checkInInputSchema.safeParse({
      checkInTime: '8:30', // needs leading zero
    });
    expect(invalidTime.success).toBe(false);
  });

  it('validates checkOutInputSchema requiring checkOutBy', () => {
    const valid = checkOutInputSchema.safeParse({
      checkOutTime: '17:15',
      checkOutBy: 'Ayşe Yılmaz (Anne)',
      pickupContactId: 'ec-1',
    });
    expect(valid.success).toBe(true);

    const missingWho = checkOutInputSchema.safeParse({
      checkOutTime: '17:15',
    });
    expect(missingWho.success).toBe(false);
  });

  it('validates attendanceUpdateInputSchema allowing nulls', () => {
    const valid = attendanceUpdateInputSchema.safeParse({
      status: 'EXCUSED',
      note: 'Doktor randevusu nedeniyle izinli',
      checkInTime: null,
      checkOutTime: null,
    });
    expect(valid.success).toBe(true);
  });

  it('validates full attendanceSchema', () => {
    const record = {
      id: 'att-1',
      tenantId: 't-1',
      studentId: 's-1',
      date: '2026-09-15',
      status: 'PRESENT',
      checkInTime: '08:30',
      checkInBy: 'Baba',
      checkOutTime: null,
      checkOutBy: null,
      pickupContactId: null,
      pickupNote: null,
      note: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(attendanceSchema.safeParse(record).success).toBe(true);
  });
});
