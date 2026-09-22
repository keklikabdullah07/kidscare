import { studentPassportSchema, bloodTypeSchema, emergencyContactSchema, studentCreateSchema, } from './student.schema';
describe('studentPassportSchema', () => {
    it('parses valid passport with default values', () => {
        const parsed = studentPassportSchema.parse({});
        expect(parsed.bloodType).toBe('UNKNOWN');
        expect(parsed.allergies).toEqual([]);
        expect(parsed.dietaryRestrictions).toEqual([]);
        expect(parsed.emergencyContacts).toEqual([]);
    });
    it('validates blood types correctly', () => {
        expect(bloodTypeSchema.safeParse('A+').success).toBe(true);
        expect(bloodTypeSchema.safeParse('0-').success).toBe(true);
        expect(bloodTypeSchema.safeParse('INVALID').success).toBe(false);
    });
    it('validates emergency contact correctly', () => {
        const contact = {
            id: 'ec-1',
            name: 'Veli',
            relationship: 'Anne',
            phone: '123456',
            isAuthorizedPickup: true,
        };
        expect(emergencyContactSchema.safeParse(contact).success).toBe(true);
    });
    it('validates full passport payload', () => {
        const payload = {
            bloodType: 'A+',
            allergies: ['Fıstık', 'Laktoz'],
            dietaryRestrictions: ['Vejetaryen'],
            chronicConditions: ['Astım'],
            regularMedications: ['Ventolin sprey'],
            emergencyContacts: [
                {
                    id: 'ec-1',
                    name: 'Ahmet Yılmaz',
                    relationship: 'Baba',
                    phone: '+90 555 123 4567',
                    isAuthorizedPickup: true,
                },
            ],
            doctorName: 'Dr. Ayşe Kaya',
            doctorPhone: '+90 532 987 6543',
            specialNotes: 'Öğle uykusundan önce masal dinlemeyi sever.',
        };
        const parsed = studentPassportSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.bloodType).toBe('A+');
            expect(parsed.data.allergies).toHaveLength(2);
            expect(parsed.data.emergencyContacts[0]?.isAuthorizedPickup).toBe(true);
        }
    });
    it('allows optional passport in studentCreateSchema', () => {
        const valid = studentCreateSchema.safeParse({
            firstName: 'Ali',
            lastName: 'Can',
            dateOfBirth: '2020-05-15',
            passport: {
                bloodType: '0+',
                allergies: ['Toz'],
            },
        });
        expect(valid.success).toBe(true);
    });
});
