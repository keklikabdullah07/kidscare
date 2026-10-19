/**
 * User Display Name Utilities
 * Prevents raw email addresses from appearing across KidsCare UI.
 * Formats names professionally with appropriate pedagogical titles.
 */

export interface NameableUser {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  phone?: string | null;
}

/**
 * Formats a clean human-readable name from a user object.
 * Always prefers firstName + lastName.
 * Falls back to formatted username prefix without domain.
 */
export function getUserDisplayName(user?: NameableUser | null, fallbackRole = 'Kullanıcı'): string {
  if (!user) return fallbackRole;

  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;

  if (user.email) {
    const prefix = user.email.split('@')[0] || '';
    const lowerPrefix = prefix.toLowerCase();
    if (lowerPrefix.startsWith('parent')) return 'Veli';
    if (lowerPrefix.startsWith('teacher')) return 'Öğretmen';
    if (lowerPrefix.startsWith('admin')) return 'Yönetici';
    if (lowerPrefix.startsWith('superadmin')) return 'Süper Admin';

    // Format e.g. "mehmet.yilmaz" -> "Mehmet Yilmaz"
    const cleaned = prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (cleaned) return cleaned;
  }

  return fallbackRole;
}

/**
 * Formats teacher name with pedagogical title prefix ("Öğrt. Ad Soyad").
 */
export function getTeacherDisplayName(teacher?: NameableUser | null): string {
  if (!teacher) return 'Öğretmen Atanmadı';
  const name = getUserDisplayName(teacher, 'Öğretmen');
  if (name.startsWith('Öğrt.')) return name;
  return `Öğrt. ${name}`;
}

/**
 * Formats parent name cleanly ("Ad Soyad (Veli)" or just "Ad Soyad").
 */
export function getParentDisplayName(parent?: NameableUser | null): string {
  if (!parent) return 'Veli Bilgisi Yok';
  return getUserDisplayName(parent, 'Veli');
}

/**
 * Disambiguates parents in select dropdowns by appending phone or email.
 * Prevents choosing the wrong parent when two parents share identical names.
 * Example: "Ayşe Yılmaz (0555 123 4567)" or "Ayşe Yılmaz (ayse@example.com)"
 */
export function getParentDropdownLabel(parent?: NameableUser | null): string {
  if (!parent) return 'Veli seçilmedi';
  const baseName = getParentDisplayName(parent);
  if (parent.phone) {
    return `${baseName} (${parent.phone})`;
  }
  if (parent.email && !parent.email.includes('demo.test')) {
    return `${baseName} (${parent.email})`;
  }
  return baseName;
}

/**
 * Disambiguates students with identical names by appending classroom and birth year.
 * Example: "Ahmet Yılmaz (Papatyalar Sınıfı • D.T: 2021)"
 */
export function getStudentDisambiguatedLabel(
  student?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string | Date | null;
    classroomName?: string | null;
  } | null,
): string {
  if (!student) return 'Öğrenci seçilmedi';
  const fullName = `${student.firstName} ${student.lastName}`.trim();
  const details: string[] = [];

  if (student.classroomName) {
    details.push(student.classroomName);
  }

  if (student.dateOfBirth) {
    const year =
      typeof student.dateOfBirth === 'string'
        ? student.dateOfBirth.slice(0, 4)
        : student.dateOfBirth.getFullYear();
    details.push(`D.T: ${year}`);
  }

  if (details.length > 0) {
    return `${fullName} (${details.join(' • ')})`;
  }
  return fullName;
}
