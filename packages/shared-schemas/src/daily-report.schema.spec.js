import { dailyReportInputSchema, dailyReportSchema, mealPortionSchema, pottyEntrySchema, studentMoodSchema, } from './daily-report.schema';
describe('daily-report schemas', () => {
    it('validates meal portions correctly', () => {
        expect(mealPortionSchema.safeParse('ALL').success).toBe(true);
        expect(mealPortionSchema.safeParse('HALF').success).toBe(true);
        expect(mealPortionSchema.safeParse('LITTLE').success).toBe(true);
        expect(mealPortionSchema.safeParse('NONE').success).toBe(true);
        expect(mealPortionSchema.safeParse('INVALID').success).toBe(false);
    });
    it('validates student moods correctly', () => {
        expect(studentMoodSchema.safeParse('HAPPY').success).toBe(true);
        expect(studentMoodSchema.safeParse('CALM').success).toBe(true);
        expect(studentMoodSchema.safeParse('UNKNOWN').success).toBe(false);
    });
    it('validates potty entry schema', () => {
        const valid = pottyEntrySchema.safeParse({
            id: 'p-1',
            time: '10:30',
            type: 'POTTY',
            notes: 'Başarılı',
        });
        expect(valid.success).toBe(true);
        const invalidTime = pottyEntrySchema.safeParse({
            id: 'p-1',
            time: '25:70',
            type: 'POTTY',
        });
        expect(invalidTime.success).toBe(false);
    });
    it('validates dailyReportInputSchema with full payload', () => {
        const payload = {
            mood: 'HAPPY',
            meals: {
                breakfast: 'ALL',
                lunch: 'HALF',
                afternoonSnack: 'ALL',
                notes: 'Sebzeleri çok sevdi',
            },
            naps: {
                startTime: '13:00',
                endTime: '14:30',
                quality: 'GOOD',
                notes: 'Hemen uykuya daldı',
            },
            potty: [
                {
                    id: 'p-1',
                    time: '11:00',
                    type: 'WET',
                },
            ],
            activities: ['Resim Çizme', 'Bahçe Zamanı'],
            medications: [
                {
                    id: 'm-1',
                    name: 'Ventolin',
                    time: '12:00',
                    givenBy: 'Ayşe Öğretmen',
                },
            ],
            teacherNote: 'Günü çok neşeli ve enerjik geçti.',
        };
        const parsed = dailyReportInputSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
    });
    it('validates dailyReportSchema with null values', () => {
        const report = {
            id: 'dr-1',
            tenantId: 't-1',
            studentId: 's-1',
            date: '2026-09-15',
            mood: null,
            meals: null,
            naps: null,
            potty: null,
            activities: null,
            medications: null,
            teacherNote: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const parsed = dailyReportSchema.safeParse(report);
        expect(parsed.success).toBe(true);
    });
});
