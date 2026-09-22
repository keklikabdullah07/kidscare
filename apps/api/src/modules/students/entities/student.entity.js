/**
 * Domain entity for a Student. Thin wrapper over the Prisma model with
 * a `fromPrisma` factory. Future computed fields (full name, age,
 * attendance stats) belong here.
 */
export class Student {
    id;
    tenantId;
    parentId;
    firstName;
    lastName;
    dateOfBirth;
    gender;
    notes;
    passport;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(id, tenantId, parentId, firstName, lastName, dateOfBirth, gender, notes, passport, isActive, createdAt, updatedAt, deletedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.parentId = parentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.notes = notes;
        this.passport = passport;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
    static fromPrisma(p) {
        return new Student(p.id, p.tenantId, p.parentId ?? null, p.firstName, p.lastName, p.dateOfBirth, p.gender, p.notes, p.passport ?? null, p.isActive, p.createdAt, p.updatedAt, p.deletedAt);
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
