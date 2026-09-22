export class Attendance {
    id;
    tenantId;
    studentId;
    date;
    status;
    checkInTime;
    checkInBy;
    checkOutTime;
    checkOutBy;
    pickupContactId;
    pickupNote;
    note;
    createdAt;
    updatedAt;
    constructor(id, tenantId, studentId, date, status, checkInTime, checkInBy, checkOutTime, checkOutBy, pickupContactId, pickupNote, note, createdAt, updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.studentId = studentId;
        this.date = date;
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkInBy = checkInBy;
        this.checkOutTime = checkOutTime;
        this.checkOutBy = checkOutBy;
        this.pickupContactId = pickupContactId;
        this.pickupNote = pickupNote;
        this.note = note;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromPrisma(row) {
        const dateStr = row.date instanceof Date
            ? row.date.toISOString().slice(0, 10)
            : String(row.date).slice(0, 10);
        return new Attendance(row.id, row.tenantId, row.studentId, dateStr, row.status, row.checkInTime, row.checkInBy, row.checkOutTime, row.checkOutBy, row.pickupContactId, row.pickupNote, row.note, row.createdAt.toISOString(), row.updatedAt.toISOString());
    }
}
