export class DailyReport {
    id;
    tenantId;
    studentId;
    date;
    mood;
    meals;
    naps;
    potty;
    activities;
    medications;
    teacherNote;
    createdAt;
    updatedAt;
    constructor(id, tenantId, studentId, date, mood, meals, naps, potty, activities, medications, teacherNote, createdAt, updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.studentId = studentId;
        this.date = date;
        this.mood = mood;
        this.meals = meals;
        this.naps = naps;
        this.potty = potty;
        this.activities = activities;
        this.medications = medications;
        this.teacherNote = teacherNote;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromPrisma(row) {
        // Format Date to YYYY-MM-DD
        const dateStr = row.date instanceof Date
            ? row.date.toISOString().slice(0, 10)
            : String(row.date).slice(0, 10);
        return new DailyReport(row.id, row.tenantId, row.studentId, dateStr, row.mood ?? null, row.meals ?? null, row.naps ?? null, row.potty ?? null, row.activities ?? null, row.medications ?? null, row.teacherNote ?? null, row.createdAt.toISOString(), row.updatedAt.toISOString());
    }
}
