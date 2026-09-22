export class DailyMenu {
    id;
    tenantId;
    date;
    breakfast;
    lunch;
    snack;
    allergens;
    calories;
    notes;
    createdAt;
    updatedAt;
    constructor(id, tenantId, date, breakfast, lunch, snack, allergens, calories, notes, createdAt, updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.date = date;
        this.breakfast = breakfast;
        this.lunch = lunch;
        this.snack = snack;
        this.allergens = allergens;
        this.calories = calories;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromPrisma(row) {
        const dateStr = row.date instanceof Date
            ? row.date.toISOString().slice(0, 10)
            : String(row.date).slice(0, 10);
        return new DailyMenu(row.id, row.tenantId, dateStr, Array.isArray(row.breakfast) ? row.breakfast : [], Array.isArray(row.lunch) ? row.lunch : [], Array.isArray(row.snack) ? row.snack : [], Array.isArray(row.allergens) ? row.allergens : [], row.calories, row.notes, row.createdAt.toISOString(), row.updatedAt.toISOString());
    }
}
