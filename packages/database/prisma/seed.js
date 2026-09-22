import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const DEMO_TENANT_ID = 'demo-tenant-seed-001';
async function main() {
    await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${DEMO_TENANT_ID}'`);
        const tenant = await tx.tenant.upsert({
            where: { id: DEMO_TENANT_ID },
            update: {},
            create: { id: DEMO_TENANT_ID, slug: 'demo', name: 'Demo Kreş' },
        });
        const passwordHash = await bcrypt.hash('demo1234', 10);
        await tx.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: 'superadmin@demo.test' } },
            update: { role: 'SUPER_ADMIN', passwordHash },
            create: {
                tenantId: tenant.id,
                email: 'superadmin@demo.test',
                passwordHash,
                role: 'SUPER_ADMIN',
            },
        });
        await tx.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.test' } },
            update: { role: 'ADMIN', passwordHash },
            create: {
                tenantId: tenant.id,
                email: 'admin@demo.test',
                passwordHash,
                role: 'ADMIN',
            },
        });
        await tx.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@demo.test' } },
            update: { role: 'TEACHER', passwordHash },
            create: {
                tenantId: tenant.id,
                email: 'teacher@demo.test',
                passwordHash,
                role: 'TEACHER',
            },
        });
        const parentUser = await tx.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: 'parent@demo.test' } },
            update: { role: 'PARENT', passwordHash },
            create: {
                tenantId: tenant.id,
                email: 'parent@demo.test',
                passwordHash,
                role: 'PARENT',
            },
        });
        // Seed Demo Student
        const student = await tx.student.upsert({
            where: { id: 'demo-student-001' },
            update: {
                parentId: parentUser.id,
            },
            create: {
                id: 'demo-student-001',
                tenantId: tenant.id,
                parentId: parentUser.id,
                firstName: 'Ada',
                lastName: 'Yılmaz',
                dateOfBirth: new Date('2021-04-15'),
                gender: 'Kız',
                isActive: true,
                passport: {
                    bloodType: 'A+',
                    allergies: ['Fıstık'],
                    dietaryRestrictions: ['Laktozsuz Süt'],
                    chronicConditions: [],
                    regularMedications: [],
                    emergencyContacts: [
                        {
                            id: 'c-1',
                            name: 'Mehmet Yılmaz',
                            relationship: 'Baba',
                            phone: '05551234567',
                            isAuthorizedPickup: true,
                        },
                    ],
                },
            },
        });
        // Seed Today's Date
        const today = new Date();
        const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        // Seed Attendance for Today
        await tx.attendance.upsert({
            where: {
                tenantId_studentId_date: {
                    tenantId: tenant.id,
                    studentId: student.id,
                    date: todayUtc,
                },
            },
            update: {
                status: 'PRESENT',
                checkInTime: '08:45',
            },
            create: {
                tenantId: tenant.id,
                studentId: student.id,
                date: todayUtc,
                status: 'PRESENT',
                checkInTime: '08:45',
                note: 'Giriş yapıldı',
            },
        });
        // Seed Daily Report for Today
        await tx.dailyReport.upsert({
            where: {
                tenantId_studentId_date: {
                    tenantId: tenant.id,
                    studentId: student.id,
                    date: todayUtc,
                },
            },
            update: {
                mood: 'HAPPY',
                meals: {
                    breakfast: 'ALL',
                    lunch: 'HALF',
                    afternoonSnack: 'ALL',
                },
                naps: {
                    startTime: '13:00',
                    endTime: '14:30',
                    quality: 'GOOD',
                },
                potty: [
                    { id: 'p-1', time: '10:30', type: 'POTTY' },
                    { id: 'p-2', time: '14:45', type: 'POTTY' },
                ],
                activities: ['🎨 Parmak Boyama', '🎵 Müzik ve Dans', '🧩 Ahşap Bloklar'],
                teacherNote: 'Ada bugün etkinliklere çok istekli katıldı ve arkadaşlarıyla harika vakit geçirdi.',
            },
            create: {
                tenantId: tenant.id,
                studentId: student.id,
                date: todayUtc,
                mood: 'HAPPY',
                meals: {
                    breakfast: 'ALL',
                    lunch: 'HALF',
                    afternoonSnack: 'ALL',
                },
                naps: {
                    startTime: '13:00',
                    endTime: '14:30',
                    quality: 'GOOD',
                },
                potty: [
                    { id: 'p-1', time: '10:30', type: 'POTTY' },
                    { id: 'p-2', time: '14:45', type: 'POTTY' },
                ],
                activities: ['🎨 Parmak Boyama', '🎵 Müzik ve Dans', '🧩 Ahşap Bloklar'],
                teacherNote: 'Ada bugün etkinliklere çok istekli katıldı ve arkadaşlarıyla harika vakit geçirdi.',
            },
        });
        // Seed Daily Menu for Today
        await tx.dailyMenu.upsert({
            where: {
                tenantId_date: {
                    tenantId: tenant.id,
                    date: todayUtc,
                },
            },
            update: {
                breakfast: [
                    'Haşlanmış Köy Yumurtası',
                    'Ezine Beyaz Peynir',
                    'Salatalık & Domates',
                    'Ihlamur',
                ],
                lunch: [
                    'Süzme Mercimek Çorbası',
                    'Fırında Köfte Patates',
                    'Şehriyeli Pirinç Pilavı',
                    'Ayran',
                ],
                snack: ['Fıstıklı ve Kakaolu Kurabiye', 'Mevsim Meyvesi'],
                allergens: ['Yumurta', 'Süt Ürünü', 'Fıstık'],
                calories: 880,
            },
            create: {
                tenantId: tenant.id,
                date: todayUtc,
                breakfast: [
                    'Haşlanmış Köy Yumurtası',
                    'Ezine Beyaz Peynir',
                    'Salatalık & Domates',
                    'Ihlamur',
                ],
                lunch: [
                    'Süzme Mercimek Çorbası',
                    'Fırında Köfte Patates',
                    'Şehriyeli Pirinç Pilavı',
                    'Ayran',
                ],
                snack: ['Fıstıklı ve Kakaolu Kurabiye', 'Mevsim Meyvesi'],
                allergens: ['Yumurta', 'Süt Ürünü', 'Fıstık'],
                calories: 880,
            },
        });
        console.log(`Seeded demo tenant with users (superadmin, admin, teacher, parent) and student Ada!`);
    });
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
