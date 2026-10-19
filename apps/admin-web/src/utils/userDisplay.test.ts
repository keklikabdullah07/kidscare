import { describe, it, expect } from 'vitest';
import {
  getUserDisplayName,
  getTeacherDisplayName,
  getParentDisplayName,
  getParentDropdownLabel,
  getStudentDisambiguatedLabel,
} from './userDisplay';

describe('userDisplay utilities', () => {
  it('formats user display name correctly', () => {
    expect(getUserDisplayName({ firstName: 'Ali', lastName: 'Veli' })).toBe('Ali Veli');
    expect(getUserDisplayName({ email: 'teacher.ayse@demo.test' })).toBe('Öğretmen');
    expect(getUserDisplayName(null, 'Misafir')).toBe('Misafir');
  });

  it('formats teacher display name with prefix', () => {
    expect(getTeacherDisplayName({ firstName: 'Fatma', lastName: 'Demir' })).toBe(
      'Öğrt. Fatma Demir',
    );
    expect(getTeacherDisplayName({ firstName: 'Öğrt. Fatma', lastName: 'Demir' })).toBe(
      'Öğrt. Fatma Demir',
    );
  });

  it('formats parent display name cleanly', () => {
    expect(getParentDisplayName({ firstName: 'Mehmet', lastName: 'Yılmaz' })).toBe('Mehmet Yılmaz');
    expect(getParentDisplayName(null)).toBe('Veli Bilgisi Yok');
  });

  it('formats parent dropdown label with disambiguation', () => {
    // With phone
    expect(
      getParentDropdownLabel({
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        phone: '0555 123 4567',
      }),
    ).toBe('Ayşe Yılmaz (0555 123 4567)');

    // With real email
    expect(
      getParentDropdownLabel({
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        email: 'ayse.yilmaz@gmail.com',
      }),
    ).toBe('Ayşe Yılmaz (ayse.yilmaz@gmail.com)');

    // Fallback when no extra info
    expect(
      getParentDropdownLabel({
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        email: 'parent@demo.test',
      }),
    ).toBe('Ayşe Yılmaz');
  });

  it('formats student disambiguated label with classroom and birth year', () => {
    expect(
      getStudentDisambiguatedLabel({
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        classroomName: 'Papatyalar Sınıfı',
        dateOfBirth: '2021-04-15',
      }),
    ).toBe('Ahmet Yılmaz (Papatyalar Sınıfı • D.T: 2021)');

    expect(
      getStudentDisambiguatedLabel({
        firstName: 'Zeynep',
        lastName: 'Kaya',
      }),
    ).toBe('Zeynep Kaya');
  });
});
