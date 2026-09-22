import { dailyMenuCreateInputSchema, dailyMenuSchema, dailyMenuUpdateInputSchema, } from './daily-menu.schema';
describe('dailyMenuCreateInputSchema', () => {
    it('validates a valid full daily menu payload', () => {
        const input = {
            date: '2026-09-15',
            breakfast: ['Haşlanmış Yumurta', 'Beyaz Peynir', 'Zeytin', 'Ihlamur'],
            lunch: ['Mercimek Çorbası', 'Kıymalı Bezelye', 'Pirinç Pilavı', 'Ayran'],
            snack: ['Muz', 'Fındıklı Kurabiye'],
            allergens: ['Yumurta', 'Süt / Laktoz', 'Kuruyemiş'],
            calories: 950,
            notes: 'Sebzeler taze olarak yerel üreticiden temin edilmiştir.',
        };
        const parsed = dailyMenuCreateInputSchema.parse(input);
        expect(parsed.date).toBe('2026-09-15');
        expect(parsed.breakfast).toHaveLength(4);
        expect(parsed.allergens).toContain('Yumurta');
        expect(parsed.calories).toBe(950);
    });
    it('defaults empty arrays if meals or allergens are omitted', () => {
        const input = {
            date: '2026-09-15',
        };
        const parsed = dailyMenuCreateInputSchema.parse(input);
        expect(parsed.breakfast).toEqual([]);
        expect(parsed.lunch).toEqual([]);
        expect(parsed.snack).toEqual([]);
        expect(parsed.allergens).toEqual([]);
        expect(parsed.calories).toBeUndefined();
    });
    it('rejects invalid date format', () => {
        expect(() => dailyMenuCreateInputSchema.parse({
            date: '15-09-2026',
        })).toThrow();
    });
});
describe('dailyMenuUpdateInputSchema', () => {
    it('allows updating specific meal categories', () => {
        const update = {
            lunch: ['Tarhana Çorbası', 'Fırın Tavuk'],
            allergens: ['Gluten'],
        };
        const parsed = dailyMenuUpdateInputSchema.parse(update);
        expect(parsed.lunch).toHaveLength(2);
        expect(parsed.allergens).toEqual(['Gluten']);
    });
});
describe('dailyMenuSchema', () => {
    it('validates a complete daily menu object', () => {
        const menu = {
            id: 'menu-1',
            tenantId: 'tenant-1',
            date: '2026-09-15',
            breakfast: ['Yulaf Ezmesi', 'Meyve'],
            lunch: ['Köfte', 'Patates'],
            snack: ['Kek'],
            allergens: ['Gluten', 'Süt'],
            calories: 1000,
            notes: null,
            createdAt: '2026-09-15T00:00:00.000Z',
            updatedAt: '2026-09-15T00:00:00.000Z',
        };
        const parsed = dailyMenuSchema.parse(menu);
        expect(parsed.id).toBe('menu-1');
    });
});
