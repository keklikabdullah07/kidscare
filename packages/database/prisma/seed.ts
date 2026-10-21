import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_TENANT_ID = 'demo-tenant-seed-001';

async function main() {
  await prisma.$transaction(
    async (tx) => {
      // 1. Multi-Tenancy RLS context
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${DEMO_TENANT_ID}'`);

      // 2. Tenant'ı bul ya da oluştur
      const tenant = await tx.tenant.upsert({
        where: { id: DEMO_TENANT_ID },
        update: { name: 'Demo KidsCare Anaokulu & Kreş' },
        create: { id: DEMO_TENANT_ID, slug: 'demo', name: 'Demo KidsCare Anaokulu & Kreş' },
      });

      console.log('🧹 Eski test verileri cascade sırasıyla temizleniyor...');

      // Eski bağımlı verileri sıralı olarak temizleyelim (Foreign Key hatası almamak için yaprak tablolardan köke)
      await tx.notification.deleteMany({ where: { tenantId: tenant.id } });
      await tx.userPushToken.deleteMany({ where: { tenantId: tenant.id } });
      await tx.mediaFile.deleteMany({ where: { tenantId: tenant.id } });
      await tx.passwordResetToken.deleteMany({ where: { tenantId: tenant.id } });

      await tx.paymentTransaction.deleteMany({ where: { tenantId: tenant.id } });
      await tx.billingInvoice.deleteMany({ where: { tenantId: tenant.id } });
      await tx.studentBillingPlan.deleteMany({ where: { tenantId: tenant.id } });
      await tx.eventConsentResponse.deleteMany({ where: { tenantId: tenant.id } });
      await tx.eventConsent.deleteMany({ where: { tenantId: tenant.id } });
      await tx.attendanceExcuse.deleteMany({ where: { tenantId: tenant.id } });
      await tx.messageReadReceipt.deleteMany({ where: { tenantId: tenant.id } });
      await tx.message.deleteMany({ where: { tenantId: tenant.id } });
      await tx.conversationParticipant.deleteMany({ where: { tenantId: tenant.id } });
      await tx.conversation.deleteMany({ where: { tenantId: tenant.id } });
      await tx.pickupEvent.deleteMany({ where: { tenantId: tenant.id } });
      await tx.pickupAuthorization.deleteMany({ where: { tenantId: tenant.id } });
      await tx.pickupContact.deleteMany({ where: { tenantId: tenant.id } });
      await tx.medicationRecord.deleteMany({ where: { tenantId: tenant.id } });
      await tx.portfolioItem.deleteMany({ where: { tenantId: tenant.id } });
      await tx.developmentObservation.deleteMany({ where: { tenantId: tenant.id } });
      await tx.homeActivitySuggestion.deleteMany({ where: { tenantId: tenant.id } });
      await tx.incidentRecord.deleteMany({ where: { tenantId: tenant.id } });
      await tx.parentRequest.deleteMany({ where: { tenantId: tenant.id } });
      await tx.dailyReport.deleteMany({ where: { tenantId: tenant.id } });
      await tx.attendance.deleteMany({ where: { tenantId: tenant.id } });
      await tx.dailyMenu.deleteMany({ where: { tenantId: tenant.id } });
      await tx.activityPost.deleteMany({ where: { tenantId: tenant.id } });
      await tx.classroomTeacher.deleteMany({ where: { tenantId: tenant.id } });
      await tx.student.deleteMany({ where: { tenantId: tenant.id } });
      await tx.classroom.deleteMany({ where: { tenantId: tenant.id } });
      await tx.user.deleteMany({ where: { tenantId: tenant.id } });

      console.log('✅ Eski veriler temizlendi.');

      // 3. Standart şifre hash'i
      const passwordHash = await bcrypt.hash('KidsCare.2026!', 10);

      // =========================================================================
      // A. KULLANICILAR: SUPERADMIN + 2 ADMIN + 1 SERVİS + 10 ÖĞRETMEN + 20 VELİ
      // =========================================================================
      console.log('👤 Yöneticiler, Öğretmenler ve Personel oluşturuluyor...');

      // Süper Admin
      const superadminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: 'superadmin@demo.test',
          passwordHash,
          role: 'SUPER_ADMIN',
          firstName: 'Ali',
          lastName: 'Kaya',
          phone: '05550000001',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
      });

      // 2 Admin Hesabı
      const admin1 = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@demo.test',
          passwordHash,
          role: 'ADMIN',
          firstName: 'Ayşe',
          lastName: 'Yılmaz',
          phone: '05550000002',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
      });

      const admin2 = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin2@demo.test',
          passwordHash,
          role: 'ADMIN',
          firstName: 'Kemal',
          lastName: 'Demir',
          phone: '05550000022',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
      });

      // Servis Görevlisi
      const serviceUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: 'service@demo.test',
          passwordHash,
          role: 'SERVICE_STAFF',
          firstName: 'Ahmet',
          lastName: 'Korkmaz',
          phone: '05559876543',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        },
      });

      // 10 Öğretmen Verisi
      const teacherDefs = [
        {
          email: 'teacher@demo.test',
          first: 'Zeynep',
          last: 'Demir',
          phone: '05551000001',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        },
        {
          email: 'teacher2@demo.test',
          first: 'Elif',
          last: 'Kaya',
          phone: '05551000002',
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        },
        {
          email: 'teacher3@demo.test',
          first: 'Fatma',
          last: 'Çelik',
          phone: '05551000003',
          photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
        },
        {
          email: 'teacher4@demo.test',
          first: 'Merve',
          last: 'Aydın',
          phone: '05551000004',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        },
        {
          email: 'teacher5@demo.test',
          first: 'Burcu',
          last: 'Özdemir',
          phone: '05551000005',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        {
          email: 'teacher6@demo.test',
          first: 'Selin',
          last: 'Arslan',
          phone: '05551000006',
          photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        },
        {
          email: 'teacher7@demo.test',
          first: 'Sinem',
          last: 'Kurt',
          phone: '05551000007',
          photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        },
        {
          email: 'teacher8@demo.test',
          first: 'Duygu',
          last: 'Polat',
          phone: '05551000008',
          photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
        },
        {
          email: 'teacher9@demo.test',
          first: 'Büşra',
          last: 'Şahin',
          phone: '05551000009',
          photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
        },
        {
          email: 'teacher10@demo.test',
          first: 'Esra',
          last: 'Koç',
          phone: '05551000010',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
      ];

      const teacherUsers = [];
      for (const t of teacherDefs) {
        const createdTeacher = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: t.email,
            passwordHash,
            role: 'TEACHER',
            firstName: t.first,
            lastName: t.last,
            phone: t.phone,
            avatarUrl: t.photo,
          },
        });
        teacherUsers.push(createdTeacher);
      }

      // =========================================================================
      // B. 10 SINIF VE ÖĞRETMEN ATAMALARI
      // =========================================================================
      console.log('🏫 10 Sınıf ve Öğretmen atamaları yapılıyor...');

      const classroomDefs = [
        { name: 'Minik Adımlar', ageGroup: '2 Yaş (Oyun Grubu)', teacherIdx: 0 },
        { name: 'Papatyalar Sınıfı', ageGroup: '3 Yaş', teacherIdx: 1 },
        { name: 'Menekşeler Sınıfı', ageGroup: '3 Yaş', teacherIdx: 2 },
        { name: 'Kelebekler Sınıfı', ageGroup: '4 Yaş', teacherIdx: 3 },
        { name: 'Yıldızlar Sınıfı', ageGroup: '4 Yaş', teacherIdx: 4 },
        { name: 'Gökkuşağı Sınıfı', ageGroup: '4-5 Yaş', teacherIdx: 5 },
        { name: 'Neşeli Bulutlar', ageGroup: '5 Yaş (Anasınıfı)', teacherIdx: 6 },
        { name: 'Bilginler Sınıfı', ageGroup: '5 Yaş (Anasınıfı)', teacherIdx: 7 },
        { name: 'Kaşifler Sınıfı', ageGroup: '5-6 Yaş (İlkokula Hazırlık)', teacherIdx: 8 },
        { name: 'Mucitler Sınıfı', ageGroup: '5-6 Yaş (İlkokula Hazırlık)', teacherIdx: 9 },
      ];

      const classrooms = [];
      for (const c of classroomDefs) {
        const cls = await tx.classroom.create({
          data: {
            tenantId: tenant.id,
            name: c.name,
            ageGroup: c.ageGroup,
            isActive: true,
          },
        });
        classrooms.push(cls);

        // Sınıf - Öğretmen Eşleştirmesi
        await tx.classroomTeacher.create({
          data: {
            tenantId: tenant.id,
            classroomId: cls.id,
            teacherId: teacherUsers[c.teacherIdx].id,
          },
        });
      }

      // =========================================================================
      // C. 20 ÖĞRENCİ VE VELİLERİ
      // =========================================================================
      console.log('👶 20 Öğrenci ve Velileri oluşturuluyor...');

      const studentDataList = [
        // Sınıf 1: Minik Adımlar (2 Yaş)
        {
          clsIdx: 0,
          first: 'Ada',
          last: 'Yılmaz',
          gender: 'Kız',
          dob: new Date('2024-04-15'),
          blood: 'A+',
          allergies: ['Fıstık'],
          diet: ['Laktozsuz Süt'],
          parent: {
            email: 'parent@demo.test',
            aliasEmail: 'parent1@demo.test',
            first: 'Selin',
            last: 'Yılmaz',
            phone: '05321110001',
            relation: 'Anne',
          },
          secondParent: { name: 'Mehmet Yılmaz', phone: '05321110002', relation: 'Baba' },
          tuition: 12500,
          service: 2500,
        },
        {
          clsIdx: 0,
          first: 'Mert',
          last: 'Kaya',
          gender: 'Erkek',
          dob: new Date('2024-06-22'),
          blood: '0+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent2@demo.test',
            first: 'Derya',
            last: 'Kaya',
            phone: '05321110003',
            relation: 'Anne',
          },
          secondParent: null,
          tuition: 12500,
          service: 0,
        },

        // Sınıf 2: Papatyalar (3 Yaş)
        {
          clsIdx: 1,
          first: 'Zeynep',
          last: 'Çelik',
          gender: 'Kız',
          dob: new Date('2023-02-10'),
          blood: 'B+',
          allergies: ['Çilek'],
          diet: [],
          parent: {
            email: 'parent3@demo.test',
            first: 'Gamze',
            last: 'Çelik',
            phone: '05321110004',
            relation: 'Anne',
          },
          secondParent: { name: 'Murat Çelik', phone: '05321110005', relation: 'Baba' },
          tuition: 13000,
          service: 2500,
        },
        {
          clsIdx: 1,
          first: 'Can',
          last: 'Demir',
          gender: 'Erkek',
          dob: new Date('2023-05-18'),
          blood: 'AB+',
          allergies: ['Yumurta Akı'],
          diet: ['Yumurtasız Tarifler'],
          parent: {
            email: 'parent4@demo.test',
            first: 'Ebru',
            last: 'Demir',
            phone: '05321110006',
            relation: 'Anne',
          },
          secondParent: { name: 'Serkan Demir', phone: '05321110007', relation: 'Baba' },
          tuition: 13000,
          service: 2500,
        },

        // Sınıf 3: Menekşeler (3 Yaş)
        {
          clsIdx: 2,
          first: 'Defne',
          last: 'Şahin',
          gender: 'Kız',
          dob: new Date('2023-08-12'),
          blood: 'A-',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent5@demo.test',
            first: 'Ahmet',
            last: 'Şahin',
            phone: '05321110008',
            relation: 'Baba',
          },
          secondParent: null,
          tuition: 13000,
          service: 0,
        },
        {
          clsIdx: 2,
          first: 'Kerem',
          last: 'Koç',
          gender: 'Erkek',
          dob: new Date('2023-11-04'),
          blood: '0+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent6@demo.test',
            first: 'Zeynep',
            last: 'Koç',
            phone: '05321110009',
            relation: 'Anne',
          },
          secondParent: { name: 'Erdem Koç', phone: '05321110010', relation: 'Baba' },
          tuition: 13000,
          service: 2500,
        },

        // Sınıf 4: Kelebekler (4 Yaş)
        {
          clsIdx: 3,
          first: 'Elif',
          last: 'Aydın',
          gender: 'Kız',
          dob: new Date('2022-01-20'),
          blood: 'B-',
          allergies: ['Ceviz'],
          diet: ['Kuruyemişsiz Diyet'],
          parent: {
            email: 'parent7@demo.test',
            first: 'Merve',
            last: 'Aydın',
            phone: '05321110011',
            relation: 'Anne',
          },
          secondParent: { name: 'Barış Aydın', phone: '05321110012', relation: 'Baba' },
          tuition: 13500,
          service: 2500,
        },
        {
          clsIdx: 3,
          first: 'Emir',
          last: 'Arslan',
          gender: 'Erkek',
          dob: new Date('2022-04-14'),
          blood: 'A+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent8@demo.test',
            first: 'Sinan',
            last: 'Arslan',
            phone: '05321110013',
            relation: 'Baba',
          },
          secondParent: null,
          tuition: 13500,
          service: 2500,
        },

        // Sınıf 5: Yıldızlar (4 Yaş)
        {
          clsIdx: 4,
          first: 'Nil',
          last: 'Özdemir',
          gender: 'Kız',
          dob: new Date('2022-07-09'),
          blood: '0+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent9@demo.test',
            first: 'Burcu',
            last: 'Özdemir',
            phone: '05321110014',
            relation: 'Anne',
          },
          secondParent: { name: 'Onur Özdemir', phone: '05321110015', relation: 'Baba' },
          tuition: 13500,
          service: 2500,
        },
        {
          clsIdx: 4,
          first: 'Alp',
          last: 'Doğan',
          gender: 'Erkek',
          dob: new Date('2022-09-30'),
          blood: 'AB-',
          allergies: ['Balık'],
          diet: ['Deniz Ürünleri Tüketemez'],
          parent: {
            email: 'parent10@demo.test',
            first: 'Melis',
            last: 'Doğan',
            phone: '05321110016',
            relation: 'Anne',
          },
          secondParent: { name: 'Tarık Doğan', phone: '05321110017', relation: 'Baba' },
          tuition: 13500,
          service: 0,
        },

        // Sınıf 6: Gökkuşağı (4-5 Yaş)
        {
          clsIdx: 5,
          first: 'Duru',
          last: 'Polat',
          gender: 'Kız',
          dob: new Date('2021-12-02'),
          blood: '0+',
          allergies: ['Susam'],
          diet: ['Simit ve Susamlı Ürün Verilmez'],
          parent: {
            email: 'parent11@demo.test',
            first: 'Burçin',
            last: 'Polat',
            phone: '05321110018',
            relation: 'Anne',
          },
          secondParent: { name: 'Kaan Polat', phone: '05321110019', relation: 'Baba' },
          tuition: 14000,
          service: 2500,
        },
        {
          clsIdx: 5,
          first: 'Bora',
          last: 'Kurt',
          gender: 'Erkek',
          dob: new Date('2022-03-17'),
          blood: 'A+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent12@demo.test',
            first: 'Aylin',
            last: 'Kurt',
            phone: '05321110020',
            relation: 'Anne',
          },
          secondParent: null,
          tuition: 14000,
          service: 2500,
        },

        // Sınıf 7: Neşeli Bulutlar (5 Yaş / Anasınıfı)
        {
          clsIdx: 6,
          first: 'Mira',
          last: 'Aksoy',
          gender: 'Kız',
          dob: new Date('2021-05-11'),
          blood: '0-',
          allergies: ['Penisilin (İlaç)'],
          diet: [],
          parent: {
            email: 'parent13@demo.test',
            first: 'Ceren',
            last: 'Aksoy',
            phone: '05321110021',
            relation: 'Anne',
          },
          secondParent: { name: 'Burak Aksoy', phone: '05321110022', relation: 'Baba' },
          tuition: 14000,
          service: 2500,
        },
        {
          clsIdx: 6,
          first: 'Yağız',
          last: 'Yıldız',
          gender: 'Erkek',
          dob: new Date('2021-08-25'),
          blood: 'B+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent14@demo.test',
            first: 'Ece',
            last: 'Yıldız',
            phone: '05321110023',
            relation: 'Anne',
          },
          secondParent: { name: 'Oğuz Yıldız', phone: '05321110024', relation: 'Baba' },
          tuition: 14000,
          service: 2500,
        },

        // Sınıf 8: Bilginler Sınıfı (5 Yaş / Anasınıfı)
        {
          clsIdx: 7,
          first: 'Lina',
          last: 'Güneş',
          gender: 'Kız',
          dob: new Date('2021-02-08'),
          blood: 'A+',
          allergies: ['İnek Sütü Proteini'],
          diet: ['Bitkisel Süt / Badem Sütü'],
          parent: {
            email: 'parent15@demo.test',
            first: 'Tolga',
            last: 'Güneş',
            phone: '05321110025',
            relation: 'Baba',
          },
          secondParent: null,
          tuition: 14000,
          service: 0,
        },
        {
          clsIdx: 7,
          first: 'Rüzgar',
          last: 'Bulut',
          gender: 'Erkek',
          dob: new Date('2021-10-19'),
          blood: 'AB-',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent16@demo.test',
            first: 'Hande',
            last: 'Bulut',
            phone: '05321110026',
            relation: 'Anne',
          },
          secondParent: { name: 'Kemal Bulut', phone: '05321110027', relation: 'Baba' },
          tuition: 14000,
          service: 2500,
        },

        // Sınıf 9: Kaşifler (5-6 Yaş / İlkokula Hazırlık)
        {
          clsIdx: 8,
          first: 'Beren',
          last: 'Çetin',
          gender: 'Kız',
          dob: new Date('2020-04-30'),
          blood: '0+',
          allergies: ['Domates / Asit Döküntüsü'],
          diet: ['Çiğ Domates Verilmez'],
          parent: {
            email: 'parent17@demo.test',
            first: 'Yasemin',
            last: 'Çetin',
            phone: '05321110028',
            relation: 'Anne',
          },
          secondParent: { name: 'Volkan Çetin', phone: '05321110029', relation: 'Baba' },
          tuition: 15000,
          service: 2500,
        },
        {
          clsIdx: 8,
          first: 'Efe',
          last: 'Tekin',
          gender: 'Erkek',
          dob: new Date('2020-07-14'),
          blood: 'A+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent18@demo.test',
            first: 'Pelin',
            last: 'Tekin',
            phone: '05321110030',
            relation: 'Anne',
          },
          secondParent: { name: 'Koray Tekin', phone: '05321110031', relation: 'Baba' },
          tuition: 15000,
          service: 2500,
        },

        // Sınıf 10: Mucitler (5-6 Yaş / İlkokula Hazırlık)
        {
          clsIdx: 9,
          first: 'Azra',
          last: 'Yücel',
          gender: 'Kız',
          dob: new Date('2020-09-09'),
          blood: 'B+',
          allergies: ['Arı Sokması Alerjisi'],
          diet: [],
          parent: {
            email: 'parent19@demo.test',
            first: 'Mine',
            last: 'Yücel',
            phone: '05321110032',
            relation: 'Anne',
          },
          secondParent: null,
          tuition: 15000,
          service: 2500,
        },
        {
          clsIdx: 9,
          first: 'Toprak',
          last: 'Erdem',
          gender: 'Erkek',
          dob: new Date('2020-12-12'),
          blood: '0+',
          allergies: [],
          diet: [],
          parent: {
            email: 'parent20@demo.test',
            first: 'Gözde',
            last: 'Erdem',
            phone: '05321110033',
            relation: 'Anne',
          },
          secondParent: { name: 'Cem Erdem', phone: '05321110034', relation: 'Baba' },
          tuition: 15000,
          service: 2500,
        },
      ];

      const createdStudents = [];
      const createdParents = [];
      const createdPickupContactsMap = new Map();

      for (let i = 0; i < studentDataList.length; i++) {
        const item = studentDataList[i];
        const studentId = `demo-student-${String(i + 1).padStart(3, '0')}`;

        // Birincil Veli Kullanıcısını Oluştur
        const parentUser = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: item.parent.email,
            passwordHash,
            role: 'PARENT',
            firstName: item.parent.first,
            lastName: item.parent.last,
            phone: item.parent.phone,
            avatarUrl:
              item.parent.relation === 'Anne'
                ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          },
        });
        createdParents.push(parentUser);

        // Eğer klasik alias email varsa (örn: parent@demo.test için Ada Yılmaz'a da bağlayabilmek üzere):
        if (item.parent.aliasEmail) {
          await tx.user.create({
            data: {
              tenantId: tenant.id,
              email: item.parent.aliasEmail,
              passwordHash,
              role: 'PARENT',
              firstName: 'Mehmet',
              lastName: 'Yılmaz (Baba)',
              phone: '05551234567',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            },
          });
        }

        // Acil durum kişileri listesi
        const emergencyContacts = [
          {
            id: `c-${i}-1`,
            name: `${item.parent.first} ${item.parent.last}`,
            relationship: item.parent.relation,
            phone: item.parent.phone,
            isAuthorizedPickup: true,
          },
        ];

        if (item.secondParent) {
          emergencyContacts.push({
            id: `c-${i}-2`,
            name: item.secondParent.name,
            relationship: item.secondParent.relation,
            phone: item.secondParent.phone,
            isAuthorizedPickup: true,
          });
        }

        emergencyContacts.push({
          id: `c-${i}-3`,
          name: i % 2 === 0 ? 'Fatma Teyze / Anneanne' : 'Ali Dede',
          relationship: i % 2 === 0 ? 'Anneanne' : 'Dede',
          phone: `0533000${String(i).padStart(4, '0')}`,
          isAuthorizedPickup: true,
        });

        // Öğrenciyi Oluştur
        const student = await tx.student.create({
          data: {
            id: studentId,
            tenantId: tenant.id,
            parentId: parentUser.id,
            classroomId: classrooms[item.clsIdx].id,
            firstName: item.first,
            lastName: item.last,
            dateOfBirth: item.dob,
            gender: item.gender,
            isActive: true,
            passport: {
              bloodType: item.blood,
              allergies: item.allergies,
              dietaryRestrictions: item.diet,
              chronicConditions: [],
              regularMedications: [],
              emergencyContacts,
            },
          },
        });
        createdStudents.push(student);

        // Teslimat Yetkilileri (PickupContact) kayıtları
        const studentContacts = [];
        for (const ec of emergencyContacts) {
          const pc = await tx.pickupContact.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              fullName: ec.name,
              relation: ec.relationship,
              phone: ec.phone,
              identityNote: 'Kimlik kontrolü ile teslim edilebilir',
              isActive: true,
            },
          });
          studentContacts.push(pc);
        }
        createdPickupContactsMap.set(student.id, studentContacts);

        // =========================================================================
        // D. FİNANSAL VERİLER: AİDAT PLANI, FATURALAR VE ÖDEMELER
        // =========================================================================
        await tx.studentBillingPlan.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            tuitionAmount: item.tuition,
            serviceAmount: item.service,
            activityAmount: 1000,
            discountPercent: i === 3 ? 10 : 0,
            dueDayOfMonth: 5,
            notes:
              item.service > 0 ? 'Eğitim + Servis + Etkinlik dahil' : 'Eğitim + Etkinlik dahil',
            isActive: true,
          },
        });

        const totalMonthly = (item.tuition + item.service + 1000) * (i === 3 ? 0.9 : 1.0);

        // 1. Fatura: Eylül 2026 (Geçmiş Ay — Tamamı Ödenmiş)
        const invoiceSep = await tx.billingInvoice.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            period: '2026-09',
            totalAmount: totalMonthly,
            paidAmount: totalMonthly,
            dueDate: new Date('2026-09-05'),
            status: 'PAID',
            notes: 'Eylül 2026 Dönem Aidatı',
          },
        });

        // Ödeme Dekont Kaydı
        await tx.paymentTransaction.create({
          data: {
            tenantId: tenant.id,
            invoiceId: invoiceSep.id,
            studentId: student.id,
            amount: totalMonthly,
            method: 'BANK_TRANSFER',
            referenceNo: `EFT-20260905-${String(i + 1).padStart(3, '0')}`,
            notes: 'Havale/EFT ile zamanında ödendi',
            recordedByUserId: admin1.id,
            paidAt: new Date('2026-09-04T10:30:00Z'),
          },
        });

        // 2. Fatura: Ekim 2026 (Cari Ay — Çeşitli Durumlar)
        if (i < 10) {
          const invOct = await tx.billingInvoice.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              period: '2026-10',
              totalAmount: totalMonthly,
              paidAmount: totalMonthly,
              dueDate: new Date('2026-10-05'),
              status: 'PAID',
              notes: 'Ekim 2026 Dönem Aidatı',
            },
          });
          await tx.paymentTransaction.create({
            data: {
              tenantId: tenant.id,
              invoiceId: invOct.id,
              studentId: student.id,
              amount: totalMonthly,
              method: i % 2 === 0 ? 'CREDIT_CARD' : 'BANK_TRANSFER',
              referenceNo: `POS-20261005-${String(i + 1).padStart(3, '0')}`,
              notes: 'Online kredi kartı / havale tahsilatı',
              recordedByUserId: admin1.id,
              paidAt: new Date('2026-10-03T14:15:00Z'),
            },
          });
        } else if (i < 16) {
          await tx.billingInvoice.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              period: '2026-10',
              totalAmount: totalMonthly,
              paidAmount: 0,
              dueDate: new Date('2026-10-25'),
              status: 'PENDING',
              notes: 'Ekim 2026 Dönem Aidatı (Vade Bekleniyor)',
            },
          });
        } else {
          await tx.billingInvoice.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              period: '2026-10',
              totalAmount: totalMonthly,
              paidAmount: 0,
              dueDate: new Date('2026-10-05'),
              status: 'OVERDUE',
              notes: 'Vadesi geçmiş aidat ödemesi (Hatırlatma SMS gönderildi)',
            },
          });
        }

        // 3. Fatura: Kasım 2026 (Gelecek Ay — PENDING)
        await tx.billingInvoice.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            period: '2026-11',
            totalAmount: totalMonthly,
            paidAmount: 0,
            dueDate: new Date('2026-11-25'),
            status: 'PENDING',
            notes: 'Kasım 2026 Dönem Aidatı',
          },
        });
      }

      console.log('💰 Finansal planlar, faturalar ve tahsilatlar kaydedildi.');

      // =========================================================================
      // E. OPERASYONEL VERİLER: YOKLAMA MATRİSİ (1-17 EKİM 2026)
      // =========================================================================
      console.log('📋 1-17 Ekim arası gerçekçi yoklama matrisi oluşturuluyor...');

      const attendanceDates: Date[] = [];
      for (let day = 1; day <= 17; day++) {
        const d = new Date(Date.UTC(2026, 9, day));
        const dayOfWeek = d.getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          attendanceDates.push(d);
        }
      }

      for (const d of attendanceDates) {
        for (let sIdx = 0; sIdx < createdStudents.length; sIdx++) {
          const st = createdStudents[sIdx];
          const seedNumber = (d.getUTCDate() * 7 + sIdx * 13) % 100;
          let status = 'PRESENT';
          let checkIn = '08:40';
          let checkOut = '17:15';
          let note = 'Giriş yapıldı';

          if (seedNumber < 8) {
            status = 'ABSENT';
            checkIn = null as any;
            checkOut = null as any;
            note = 'Haber verilmedi, devamsız';
          } else if (seedNumber < 16) {
            status = 'EXCUSED';
            checkIn = null as any;
            checkOut = null as any;
            note = 'Veli izin bildirdi / Doktor randevusu';

            await tx.attendanceExcuse.create({
              data: {
                tenantId: tenant.id,
                studentId: st.id,
                date: d,
                reason: sIdx % 2 === 0 ? 'SICKNESS' : 'FAMILY_LEAVE',
                notes: sIdx % 2 === 0 ? 'Mevsimsel grip ve istirahat raporu' : 'Aile ziyareti',
                status: 'ACKNOWLEDGED',
                createdById: st.parentId!,
              },
            });
          }

          await tx.attendance.create({
            data: {
              tenantId: tenant.id,
              studentId: st.id,
              date: d,
              status,
              checkInTime: checkIn,
              checkOutTime: checkOut,
              note,
            },
          });
        }
      }

      // =========================================================================
      // F. GÜNLÜK KARNELER: 15, 16 VE 17 EKİM 2026 (3 GÜNLÜK ZENGİN GEÇMİŞ)
      // =========================================================================
      console.log('📝 15-17 Ekim tarihleri için günlük karneler (Daily Reports) oluşturuluyor...');

      const reportDates = [
        new Date(Date.UTC(2026, 9, 15)),
        new Date(Date.UTC(2026, 9, 16)),
        new Date(Date.UTC(2026, 9, 17)),
      ];

      const pedagogicalNotesMatrix = [
        [
          'Bugün sabah çemberinde arkadaşlarına haftasonu anısını çok hevesli anlattı. Özgüveni çok gelişti.',
          'Parmak boyası ve yaprak baskısı etkinliğinde renk uyumuna ve detaylara çok özen gösterdi.',
          'Öğle uykusuna rahat geçti, kitap dinlerken uykuya daldı. İştahı ve neşesi çok yerindeydi.',
          'Arkadaşlarıyla blok köşesinde kule inşasında harika bir işbirliği sergiledi.',
          'Müzik ve ritim çalışmasında marakas ile tempoyu kusursuz yakaladı, çok keyif aldı.',
          'Bahçe etkinliğinde doğa dedektifliği yaptı, topladığı kozalakları sınıfa getirip inceledik.',
          'Bugün biraz sakin ve dinlenmek isteyen bir moddaydı, bireysel ahşap yapbozlarla vakit geçirdi.',
          'Sorumluluk köşesinde masaları toplamada öğretmenine gönüllü yardımcı oldu. Aferin!',
          'Montessori duyu materyallerinde dikkat süresi çok yüksekti, çalışmasını başarıyla tamamladı.',
          'Günün tüm etkinliklerine yüksek enerji ve merakla katıldı, arkadaşlarına örnek oldu.',
        ],
        [
          'Ekmek yapımı atölyesinde hamur yoğururken ince motor becerilerini harika kullandı.',
          'Sıra bekleme ve nezaket sözcüklerini (lütfen, teşekkür ederim) arkadaşlarına hatırlattı.',
          'Öğle yemeğinde sebze çorbasını bitirdi, yeni tatlara açık olduğunu gösterdi.',
          'Kitap okuma saatinde dinlediği masalın kahramanlarını sırasıyla doğru hatırladı.',
          'Serbest oyun zamanında drama köşesinde doktor rolünü çok başarıyla canlandırdı.',
          'Bahçede arkadaşlarıyla körebe oyununda kurallara tam uyum sağladı.',
          'Suluboya çalışmasında renkleri karıştırarak yeşil ve turuncu elde etmeyi keşfetti.',
          'Öğle uykusu öncesi ayakkabılarını kendi çıkarıp dolabına yerleştirdi, öz bakımı harika.',
          'Sayı sayma oyununda 1den 20ye kadar nesneleri birebir eşleyerek doğru saydı.',
          'Grup dans etkinliğinde ritme uygun adımlar attı, arkadaşlarına gülümsedi.',
        ],
        [
          'Sonbahar yaprak koleksiyonunda en büyük çınar yaprağını bulup büyüteçle damarlarını inceledi.',
          'Ahşap bloklarla yaptığı köprü tasarımında simetriyi çok doğal şekilde yakaladı.',
          'İkindi atıştırmalığında havuçlu kekini keyifle yedi, masasını peçeteyle sildi.',
          'Öğretmenine yardım ederek boya fırçalarını yıkadı ve kuruladı.',
          'Müzikli drama köşesinde hayvan seslerini taklit ederken sınıfa neşe kattı.',
          'Origami kağıt katlama çalışmasında üçgen katlamayı ilk denemede başardı.',
          'Bahçe saatinde karınca yuvalarını zarar vermeden gözlemledi, doğa sevgisi çok yüksek.',
          'Bugün arkadaşlarıyla oyuncak paylaşımında çok olgun ve uzlaşmacı davrandı.',
          'Denge tahtasında kollarını açarak dengesini başarıyla korudu, kaba motoru gelişiyor.',
          'Haftayı yüksek enerji, mutluluk ve yeni öğrenmelerle tamamladı, tebrik ederiz!',
        ],
      ];

      for (let dIdx = 0; dIdx < reportDates.length; dIdx++) {
        const rDate = reportDates[dIdx];
        const notesPool = pedagogicalNotesMatrix[dIdx];

        for (let sIdx = 0; sIdx < createdStudents.length; sIdx++) {
          const st = createdStudents[sIdx];
          await tx.dailyReport.create({
            data: {
              tenantId: tenant.id,
              studentId: st.id,
              date: rDate,
              mood:
                sIdx % 4 === 0
                  ? 'ENERGETIC'
                  : sIdx % 4 === 1
                    ? 'HAPPY'
                    : sIdx % 4 === 2
                      ? 'CALM'
                      : 'HAPPY',
              meals: {
                breakfast: sIdx % 5 === 0 ? 'HALF' : 'ALL',
                lunch: sIdx % 6 === 0 ? 'HALF' : 'ALL',
                afternoonSnack: 'ALL',
              },
              naps: {
                startTime: '13:00',
                endTime: '14:30',
                quality: sIdx % 7 === 0 ? 'RESTLESS' : 'GOOD',
              },
              potty: [
                { id: `p-${dIdx}-${sIdx}-1`, time: '10:15', type: 'POTTY' },
                { id: `p-${dIdx}-${sIdx}-2`, time: '14:45', type: 'POTTY' },
              ],
              activities: [
                '🎨 Sonbahar Yaprak Baskısı',
                '🎵 MEB Ritim & Orff Atölyesi',
                '🧩 Ahşap Bloklarla Kule Tasarımı',
                '🌳 Bahçede Doğa Dedektifliği',
              ],
              teacherNote: notesPool[sIdx % notesPool.length],
            },
          });
        }
      }

      // =========================================================================
      // G. GÜNLÜK YEMEK MENÜSÜ: 12-17 EKİM 2026 (TAM HAFTA)
      // =========================================================================
      console.log('🍲 12-17 Ekim haftalık yemek menüleri oluşturuluyor...');

      const weeklyMenus = [
        {
          date: new Date(Date.UTC(2026, 9, 12)),
          breakfast: [
            'Köy Yumurtalı Menemen',
            'Beyaz Peynir',
            'Yeşil Zeytin',
            'Papatya Çayı & Bal',
          ],
          lunch: [
            'Geleneksel Yayla Çorbası',
            'Fırında İzmir Köfte',
            'Sebzeli Bulgur Pilavı',
            'Ev Yapımı Yayık Ayranı',
          ],
          snack: ['Fırın Sütlaç', 'Mevsim Mandalinası'],
          allergens: ['Süt Ürünü', 'Gluten', 'Yumurta'],
          calories: 870,
          notes: 'Tüm sebzeler yerel organik tarım üreticilerinden temin edilmiştir.',
        },
        {
          date: new Date(Date.UTC(2026, 9, 13)),
          breakfast: ['Taze Kaşarlı Tost', 'Salatalık Dilimleri', 'Siyah Zeytin', 'Ihlamur'],
          lunch: [
            'Sarı Mercimek Çorbası',
            'Tavuklu Taze Bezelye Yemeği',
            'Arpa Şehriyeli Pirinç Pilavı',
            'Havuçlu Mor Lahana Salatası',
          ],
          snack: ['Elmalı Cevizli Tarçınlı Kek', 'Taze Süt'],
          allergens: ['Gluten', 'Süt Ürünü', 'Ceviz'],
          calories: 890,
          notes: 'Ceviz alerjisi olan öğrencilerimize cevizsiz meyve tabağı ikram edilmiştir.',
        },
        {
          date: new Date(Date.UTC(2026, 9, 14)),
          breakfast: ['Haşlanmış Yumurta', 'Kaşar Peyniri', 'Cherry Domates', 'Kuşburnu Çayı'],
          lunch: [
            'Geleneksel Ev Tarhanası',
            'Kıymalı Ispanak Yemeği',
            'Ev Yapımı Yoğurt',
            'Fırınlanmış Makarna',
          ],
          snack: ['Peynirli Ev Poğaçası', 'Amasya Elması Dilimleri'],
          allergens: ['Gluten', 'Süt Ürünü', 'Yumurta'],
          calories: 850,
          notes: 'Ispanaklar sirke ile 3 kez dezenfekte edilerek pişirilmiştir.',
        },
        {
          date: new Date(Date.UTC(2026, 9, 15)),
          breakfast: ['Krep & Doğal Çilek Reçeli', 'Tulum Peyniri', 'Yeşil Zeytin', 'Süt'],
          lunch: [
            'Ezogelin Çorbası',
            'Fırında Levrek Buğulama',
            'Fırın Elma Dilim Patates',
            'Mevsim Yeşillikleri Salatası',
          ],
          snack: ['Tahin Helvası & Fındıksız Kuru Üzüm', 'Taze Portakal Suyu'],
          allergens: ['Balık', 'Susam', 'Gluten', 'Süt Ürünü'],
          calories: 910,
          notes: 'Balık alerjisi olan öğrencilere tavuk göğsü buğulama alternatifi sunulmuştur.',
        },
        {
          date: new Date(Date.UTC(2026, 9, 16)),
          breakfast: [
            'Fırında Kaşarlı Ekmek Dilimleri',
            'Siyah Zeytin',
            'Mevsim Yeşillikleri',
            'Taze Sıkılmış Portakal Suyu',
          ],
          lunch: ['Sebzeli Şehriye Çorbası', 'Köy Tavuğu Sote', 'Bulgur Pilavı', 'Mevsim Salata'],
          snack: ['Ev Yapımı Yoğurt & Muz Dilimleri'],
          allergens: ['Süt Ürünü', 'Gluten'],
          calories: 860,
          notes: 'Alerjisi olan öğrencilerimize laktozsuz yoğurt verilmiştir.',
        },
        {
          date: new Date(Date.UTC(2026, 9, 17)),
          breakfast: [
            'Organik Haşlanmış Köy Yumurtası',
            'Ezine Beyaz Peyniri',
            'Çengelköy Salatalığı & Cherry Domates',
            'Ihlamur & Bal',
          ],
          lunch: [
            'Geleneksel Süzme Mercimek Çorbası',
            'Fırında Anne Köftesi & Elma Dilim Patates',
            'Şehriyeli Yayla Pirinç Pilavı',
            'Ev Yapımı Yayık Ayranı',
          ],
          snack: ['Fırından Yeni Çıkmış Havuçlu Kek', 'Mevsim Meyvesi (Amasya Elması)'],
          allergens: ['Yumurta', 'Süt Ürünü', 'Gluten'],
          calories: 890,
          notes: 'Tüm sebzelerimiz yerel üreticilerden taze temin edilmiştir.',
        },
      ];

      for (const m of weeklyMenus) {
        await tx.dailyMenu.create({
          data: {
            tenantId: tenant.id,
            date: m.date,
            breakfast: m.breakfast,
            lunch: m.lunch,
            snack: m.snack,
            allergens: m.allergens,
            calories: m.calories,
            notes: m.notes,
          },
        });
      }

      // =========================================================================
      // H. VELİ TALEPLERİ (ParentRequest)
      // =========================================================================
      console.log('📩 Gerçekçi Veli Talepleri (ParentRequest) ekleniyor...');

      const parentRequestsData = [
        {
          parentIdx: 0,
          studentIdx: 0,
          type: 'IZIN' as const,
          subject: 'Pazartesi Günü Diş Randevusu İzni',
          desc: 'Ada pazartesi sabah 10:00 da diş doktoru kontrolüne gidecek, okula 11:30 gibi getireceğiz.',
          status: 'APPROVED' as const,
          resolverId: admin1.id,
          resNote: 'Bilgilendirme alındı, sınıf öğretmenine iletildi.',
        },
        {
          parentIdx: 1,
          studentIdx: 1,
          type: 'BILGI_TALEP' as const,
          subject: 'Kışlık Yedek Kıyafet İhtiyacı',
          desc: 'Dolabındaki yedek eşofman ve çoraplar yeterli mi, getirmemiz gereken bir şey var mı?',
          status: 'APPROVED' as const,
          resolverId: teacherUsers[0].id,
          resNote: 'Merhaba Derya Hanım, yedek kıyafetleri tam, teşekkür ederiz.',
        },
        {
          parentIdx: 2,
          studentIdx: 2,
          type: 'DEGISIKLIK' as const,
          subject: 'Akşam Teslim Alma Yetkisi',
          desc: 'Bugün akşam Zeynep i teyzesi Merve Hanım teslim alacak. Bilgileri kimlik kontrolü için sistemde mevcuttur.',
          status: 'APPROVED' as const,
          resolverId: admin1.id,
          resNote: 'Onaylandı, teslimat listesine not düşüldü.',
        },
        {
          parentIdx: 3,
          studentIdx: 3,
          type: 'BILGI_TALEP' as const,
          subject: 'Doğum Günü Kutlaması Planlaması',
          desc: 'Can ın haftaya doğum günü var, sınıfta küçük bir meyve tabağı ve kutlama yapabilir miyiz?',
          status: 'PENDING' as const,
          resolverId: null,
          resNote: null,
        },
        {
          parentIdx: 4,
          studentIdx: 4,
          type: 'DIGER' as const,
          subject: 'Servis Güzergahı Değişikliği',
          desc: 'Bu hafta Perşembe günü okul çıkışında anneannesinin adresine bırakılmasını rica ediyoruz.',
          status: 'APPROVED' as const,
          resolverId: serviceUser.id,
          resNote: 'Servis güzergahı güncellendi ve şoföre bilgi verildi.',
        },
        {
          parentIdx: 6,
          studentIdx: 6,
          type: 'IZIN' as const,
          subject: 'Haftasonu Aile Seyahati Nedeniyle Cuma İzni',
          desc: 'Cuma günü öğleden sonra ailece şehir dışına çıkacağımız için Elif i 13:00 de teslim alacağız.',
          status: 'PENDING' as const,
          resolverId: null,
          resNote: null,
        },
      ];

      for (const pr of parentRequestsData) {
        await tx.parentRequest.create({
          data: {
            tenantId: tenant.id,
            parentId: createdParents[pr.parentIdx].id,
            studentId: createdStudents[pr.studentIdx].id,
            type: pr.type,
            subject: pr.subject,
            description: pr.desc,
            status: pr.status,
            resolvedById: pr.resolverId,
            resolvedAt: pr.resolverId ? new Date() : null,
            resolutionNote: pr.resNote,
          },
        });
      }

      // =========================================================================
      // I. REVİR VE OLAY KAYITLARI (IncidentRecord - 5 Farklı Kayıt)
      // =========================================================================
      console.log('🩹 Revir ve Olay Kayıtları (IncidentRecord) ekleniyor...');

      await tx.incidentRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[0].id, // Ada Yılmaz
          category: 'DUSME',
          occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Bahçe oyununda koşarken dizini hafifçe çim zemine çarptı.',
          actionTaken:
            'Revirde antiseptik sprey ile temizlendi, soğuk kompres ve yara bandı uygulandı.',
          parentNotified: true,
          parentNotifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
          parentNotifiedById: teacherUsers[0].id,
          reportedById: teacherUsers[0].id,
        },
      });

      await tx.incidentRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[3].id, // Can Demir
          category: 'HASTALIK',
          occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          description: 'Öğle uykusundan sonra hafif kırgınlık hissedildi, ateşi 37.8°C ölçüldü.',
          actionTaken: 'Revirde dinlendirildi, ılık su verildi ve veli bilgilendirildi.',
          parentNotified: true,
          parentNotifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
          parentNotifiedById: teacherUsers[1].id,
          reportedById: teacherUsers[1].id,
        },
      });

      await tx.incidentRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[1].id, // Mert Kaya
          category: 'YARALANMA',
          occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          description:
            'Etkinlik masasında el işi kağıdının kenarı sol işaret parmağını hafifçe kesti.',
          actionTaken:
            'Sabunlu suyla yıkandı, antiseptik sürüldü ve sevimli figürlü yara bandı yapıştırıldı.',
          parentNotified: true,
          parentNotifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
          parentNotifiedById: teacherUsers[0].id,
          reportedById: teacherUsers[0].id,
        },
      });

      await tx.incidentRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[16].id, // Beren Çetin
          category: 'KAZA',
          occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Yemekhaneye inerken basamağın kenarına takılıp bileğini hafifçe burktu.',
          actionTaken:
            'Revirde buz kompresi uygulandı, dinlendirildi, yürümesinde aksama gözlenmedi.',
          parentNotified: true,
          parentNotifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
          parentNotifiedById: teacherUsers[8].id,
          reportedById: teacherUsers[8].id,
        },
      });

      await tx.incidentRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[15].id, // Rüzgar Bulut
          category: 'DAVRANIS',
          occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'Blok inşa köşesinde arkadaşıyla aynı ahşap parça için anlaşmazlık yaşadı.',
          actionTaken:
            'Öğretmen rehberliğinde duygu çemberi yapıldı, sırayla oynama kuralı hatırlatıldı ve barış sağlandı.',
          parentNotified: true,
          parentNotifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          parentNotifiedById: teacherUsers[7].id,
          reportedById: teacherUsers[7].id,
        },
      });

      // =========================================================================
      // J. GELİŞİM GÖZLEMLERİ (DevelopmentObservation - 12 MEB Gözlemi)
      // =========================================================================
      console.log('🌱 MEB Gelişim Gözlemleri (DevelopmentObservation) ekleniyor...');

      const devObservationsDefs = [
        {
          studentIdx: 0,
          teacherIdx: 0,
          domain: 'MOTOR' as const,
          skill: 'İnce Motor & Makas Kullanımı',
          note: 'Düz ve dalgalı çizgileri makasla taşırmadan kesme becerisinde belirgin ilerleme var.',
        },
        {
          studentIdx: 0,
          teacherIdx: 0,
          domain: 'SOSYAL_DUYGUSAL' as const,
          skill: 'Sıra Bekleme ve Paylaşma',
          note: 'Oyun alanında arkadaşlarıyla oyuncakları paylaşırken nezaket ifadelerini düzenli kullanıyor.',
        },
        {
          studentIdx: 2,
          teacherIdx: 1,
          domain: 'DIL' as const,
          skill: 'Kendini İfade Etme & Sözcük Dağarcığı',
          note: 'Masal anlatımından sonra sorulan açık uçlu sorulara 4-5 kelimelik tam cümlelerle cevap veriyor.',
        },
        {
          studentIdx: 3,
          teacherIdx: 1,
          domain: 'MOTOR' as const,
          skill: 'Kaba Motor & Denge Becerileri',
          note: 'Denge tahtasında kollarını yana açarak adım adım yürüdü, koordinasyonu çok başarılı.',
        },
        {
          studentIdx: 1,
          teacherIdx: 0,
          domain: 'OZ_BAKIM' as const,
          skill: 'Giyim Kuşam & Kendi Başına Ayakkabı Giyme',
          note: 'Bahçe saati öncesi cırt cırtlı spor ayakkabısını kendi başına giyip montunun fermuarını çekti.',
        },
        {
          studentIdx: 10,
          teacherIdx: 5,
          domain: 'BILISSEL' as const,
          skill: 'Örüntü Kurma & Gruplama',
          note: 'Renk ve şekillere göre ikili örüntüleri (Kırmızı-Mavi-Kırmızı-Mavi) hatasız tamamlıyor.',
        },
        {
          studentIdx: 16,
          teacherIdx: 8,
          domain: 'SANAT' as const,
          skill: 'Kil ve Doğal Çamur Modelleme',
          note: 'Doğal kili parmaklarıyla yoğurup kuş yuvası ve yumurtalar modelledi, yaratıcılığı üst düzey.',
        },
        {
          studentIdx: 14,
          teacherIdx: 7,
          domain: 'BILISSEL' as const,
          skill: '1-10 Arası Rakam Nesne Eşleme',
          note: 'Montessori sayı çubukları ile 1den 10a kadar sayı kartlarını hatasız eşleştirdi.',
        },
        {
          studentIdx: 19,
          teacherIdx: 9,
          domain: 'DIL' as const,
          skill: 'Tekerleme ve Şiir Ezberleme',
          note: 'Sonbahar şiirini ritim eşliğinde sınıfın önünde jest ve mimiklerini kullanarak akıcı okudu.',
        },
        {
          studentIdx: 18,
          teacherIdx: 9,
          domain: 'SOSYAL_DUYGUSAL' as const,
          skill: 'Duyguları Tanıma ve Empati',
          note: 'Üzülen arkadaşının yanına giderek sarıldı ve kendi sevdiği oyuncağı onunla paylaştı.',
        },
        {
          studentIdx: 12,
          teacherIdx: 6,
          domain: 'SANAT' as const,
          skill: 'Suluboya ve Renk Geçişleri',
          note: 'Ana renkleri karıştırarak ara renkler elde etmeyi çok sevdi, fırçayı kağıda dengeli uyguladı.',
        },
        {
          studentIdx: 13,
          teacherIdx: 6,
          domain: 'OZ_BAKIM' as const,
          skill: 'El Yıkama ve Hijyen Rutinleri',
          note: 'Yemek öncesi ve tuvalet sonrası ellerini 20 saniye sabunlayıp kurulama kuralını titizlikle uyguluyor.',
        },
      ];

      const createdObservations = [];
      for (const d of devObservationsDefs) {
        const obs = await tx.developmentObservation.create({
          data: {
            tenantId: tenant.id,
            studentId: createdStudents[d.studentIdx].id,
            teacherId: teacherUsers[d.teacherIdx].id,
            domain: d.domain,
            skillName: d.skill,
            observation: d.note,
            isParentVisible: true,
          },
        });
        createdObservations.push(obs);
      }

      // =========================================================================
      // K. PORTFOLYO ÇALIŞMALARI (PortfolioItem - 8 Fotoğraflı Proje)
      // =========================================================================
      console.log('🎨 Portfolyo Öğrenci Çalışmaları (PortfolioItem) ekleniyor...');

      const portfolioDefs = [
        {
          studentIdx: 0,
          obsIdx: 0,
          title: '🎨 Sonbahar Yaprak Baskısı Tablom',
          desc: 'Okul bahçesinden topladığımız çınar ve meşe yapraklarını guaj boya ile boyayıp kraft kağıda bastım.',
          url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
        },
        {
          studentIdx: 0,
          obsIdx: 1,
          title: '✂️ Geometrik Şekillerle Ev Kolajı',
          desc: 'Makas kullanarak üçgen, kare ve daireleri kestim ve hayalimdeki köy evini oluşturdum.',
          url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600',
        },
        {
          studentIdx: 2,
          obsIdx: 2,
          title: '📖 Kendi Resimli Masal Kitabım',
          desc: 'Ormanda kaybolan sevimli sincabın hikayesini çizip öğretmenime anlattım, birlikte kitaplaştırdık.',
          url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
        },
        {
          studentIdx: 3,
          obsIdx: 3,
          title: '🏰 Ahşap Bloklarla Gökdelen Tasarımı',
          desc: '32 adet ahşap blok kullanarak devrilmeyen, dengeli ve simetrik bir kule inşa ettim.',
          url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600',
        },
        {
          studentIdx: 16,
          obsIdx: 6,
          title: '🏺 Doğal Çamurdan Hayvan Heykelleri',
          desc: 'Seramik çamurunu yoğurarak minik kuşlar ve yuvalar hazırladım. Kuruyunca parmak boyasıyla renklendirdim.',
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
        },
        {
          studentIdx: 19,
          obsIdx: 8,
          title: '🔬 Büyüteç Altında Yaprak Damarları Çizimi',
          desc: 'Sonbahar yaprağının damarlarını büyüteçle inceleyip pastel boya ile detaylıca kağıda aktardım.',
          url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600',
        },
        {
          studentIdx: 14,
          obsIdx: 7,
          title: '🌈 Renkli Düğmelerle Sayı Eşleme Panosu',
          desc: 'Karton üzerine 1den 10a kadar yazdığım kutucuklara doğru sayıda ahşap düğme yerleştirdim.',
          url: 'https://images.unsplash.com/photo-1584697964190-705b89368d43?w=600',
        },
        {
          studentIdx: 1,
          obsIdx: 4,
          title: '🧩 Ahşap Parçalarla Kendi Yapbozum',
          desc: '12 parçalı doğa temalı yapbozu kendi başıma süresini ölçerek 3 dakikada tamamladım.',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600',
        },
      ];

      for (const p of portfolioDefs) {
        await tx.portfolioItem.create({
          data: {
            tenantId: tenant.id,
            studentId: createdStudents[p.studentIdx].id,
            observationId: createdObservations[p.obsIdx]?.id,
            title: p.title,
            description: p.desc,
            mediaUrl: p.url,
            isParentVisible: true,
          },
        });
      }

      // =========================================================================
      // K2. EV ETKİNLİK ÖNERİLERİ (HomeActivitySuggestion - 6 Örnek Etkinlik)
      // =========================================================================
      console.log('💡 Ev Etkinlik Önerileri (HomeActivitySuggestion) ekleniyor...');

      const homeActivitiesDefs = [
        {
          domain: 'BILISSEL' as const,
          ageGroup: '4-5 Yaş',
          title: '🔍 Ev İçi Doğa & Nesne Sınıflandırma',
          description:
            'Evinizdeki farklı doku, renk ve büyüklükteki nesneleri (düğme, yaprak, tahta kaşık) toplayıp çocuğunuzla birlikte boyut ve rengine göre sepetlere eşleyin.',
        },
        {
          domain: 'DIL' as const,
          ageGroup: '4-5 Yaş',
          title: '📖 Resimlerle Masal Tamamlama Oyunu',
          description:
            'Bir masal kitabını okurken son sayfaya gelmeden durun. Çocuğunuzdan hikayenin sonunu kendi hayal gücüyle anlatmasını isteyin.',
        },
        {
          domain: 'MOTOR' as const,
          ageGroup: '3-4 Yaş',
          title: '🧶 İpten Lazer Parkuru (Kaba Motor)',
          description:
            'Koridorda iki duvar arasına renkli ipler bağlayarak eğlenceli bir engelli parkur hazırlayın. Çocuğunuz iplere dokunmadan altından ve üstünden geçsin.',
        },
        {
          domain: 'SOSYAL_DUYGUSAL' as const,
          ageGroup: '4-5 Yaş',
          title: '🎭 Duygu Aynası ve Yüz İfadeleri',
          description:
            'Ayna karşısına geçip mutlu, şaşkın, üzgün ve heyecanlı yüz ifadeleri yapın. Bugün kendisini hangi duyguya daha yakın hissettiğini konuşun.',
        },
        {
          domain: 'OZ_BAKIM' as const,
          ageGroup: '3-4 Yaş',
          title: '🧦 Renkli Çorap Eşleme ve Katlama',
          description:
            'Yıkanmış renkli çorapları ortaya koyun. Eşlerini bulup iç içe katlamasını destekleyin, el-göz koordinasyonu ve sorumluluk bilincini pekiştirin.',
        },
        {
          domain: 'SANAT' as const,
          ageGroup: '4-5 Yaş',
          title: '🍃 Doğal Malzemelerle Sonbahar Kolajı',
          description:
            'Bahçeden toplanan yaprak, dal ve kozalakları kağıt üzerine yapıştırarak eğlenceli bir doğa resmi oluşturun.',
        },
      ];

      for (const h of homeActivitiesDefs) {
        await tx.homeActivitySuggestion.create({
          data: {
            tenantId: tenant.id,
            domain: h.domain,
            ageGroup: h.ageGroup,
            title: h.title,
            description: h.description,
          },
        });
      }

      // =========================================================================
      // L. ETKİNLİK GALERİSİ PAYLAŞIMLARI (ActivityPost - 4 Post)
      // =========================================================================
      console.log('📸 Galeri Etkinlik Paylaşımları ekleniyor...');

      await tx.activityPost.create({
        data: {
          tenantId: tenant.id,
          authorId: teacherUsers[0].id,
          title: '🎨 Minik Adımlar Sonbahar Sanat Sergisi',
          description:
            'Çocuklarımız topladıkları sonbahar yapraklarıyla rengarenk baskılar yaptılar!',
          classroom: classrooms[0].name,
          activityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          tags: ['Sanat', 'Sonbahar', 'Yaratıcılık'],
          mediaUrls: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600'],
          taggedStudentIds: [createdStudents[0].id, createdStudents[1].id],
        },
      });

      await tx.activityPost.create({
        data: {
          tenantId: tenant.id,
          authorId: teacherUsers[3].id,
          title: '🦋 Kelebekler Sınıfı Doğa Dedektifleri',
          description: 'Bahçemizdeki karınca yuvalarını ve bitki köklerini büyüteçlerle keşfettik.',
          classroom: classrooms[3].name,
          activityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['Bilim', 'Keşif', 'Doğa'],
          mediaUrls: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600'],
          taggedStudentIds: [createdStudents[6].id, createdStudents[7].id],
        },
      });

      await tx.activityPost.create({
        data: {
          tenantId: tenant.id,
          authorId: teacherUsers[1].id,
          title: '🥖 Minik Şefler Ekmek ve Kurabiye Atölyesi',
          description:
            'Önlüklerimizi taktık, organik un ve zeytinyağı ile kendi ekmek hamurumuzu yoğurduk!',
          classroom: classrooms[1].name,
          activityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: ['Mutfak Atölyesi', 'Duyu', 'İnce Motor'],
          mediaUrls: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'],
          taggedStudentIds: [createdStudents[2].id, createdStudents[3].id],
        },
      });

      await tx.activityPost.create({
        data: {
          tenantId: tenant.id,
          authorId: teacherUsers[6].id,
          title: '🎵 Orff Çalgıları ile Ritim ve Dans Günü',
          description:
            'Ksilofon, tef ve marakaslarla doğaçlama ritim orkestrası kurduk, çok eğlendik.',
          classroom: classrooms[6].name,
          activityDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          tags: ['Müzik', 'Orff', 'Ritim'],
          mediaUrls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'],
          taggedStudentIds: [createdStudents[12].id, createdStudents[13].id],
        },
      });

      // =========================================================================
      // M. İZİNLER: 2 ETKİNLİK İZNİ VE VELİ YANITLARI (EventConsent)
      // =========================================================================
      console.log('🎪 Etkinlik İzinleri ve Veli Yanıtları ekleniyor...');

      // 1. Etkinlik: Doğa Gezisi
      const consent1 = await tx.eventConsent.create({
        data: {
          tenantId: tenant.id,
          title: '🌳 Atatürk Arboretumu & Doğa Bilim Atölyesi',
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: 'Atatürk Arboretumu, Sarıyer / İstanbul',
          price: 250,
          description:
            'Ağaç türlerini yerinde inceleyeceğimiz, yaprak koleksiyonu yapacağımız ve açık hava pikniği gerçekleştireceğimiz doğa gezimiz. Çocuklarımızın spor ayakkabı giymeleri rica olunur.',
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          createdById: admin1.id,
        },
      });

      for (let i = 0; i < 15; i++) {
        await tx.eventConsentResponse.create({
          data: {
            tenantId: tenant.id,
            consentId: consent1.id,
            studentId: createdStudents[i].id,
            parentUserId: createdParents[i].id,
            decision: i === 4 || i === 11 ? 'DECLINED' : 'APPROVED',
            notes:
              i === 4
                ? 'O tarihte şehir dışında olacağız'
                : i === 11
                  ? 'Doktor kontrolü nedeniyle katılamayacak'
                  : 'Katılımı onaylıyorum',
          },
        });
      }

      // 2. Etkinlik: Kukla Tiyatrosu
      const consent2 = await tx.eventConsent.create({
        data: {
          tenantId: tenant.id,
          title: '🎭 Devlet Tiyatrosu: Küçük Prens Kukla Oyunu',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          location: 'AKM Çocuk Sahnesi, Taksim / İstanbul',
          price: 180,
          description:
            'MEB onaylı tiyatro oyununda dostluk ve paylaşma teması işlenecektir. Servis okulumuzdan kalkacaktır.',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          createdById: admin1.id,
        },
      });

      for (let i = 0; i < 8; i++) {
        await tx.eventConsentResponse.create({
          data: {
            tenantId: tenant.id,
            consentId: consent2.id,
            studentId: createdStudents[i].id,
            parentUserId: createdParents[i].id,
            decision: i === 6 ? 'DECLINED' : 'APPROVED',
            notes: i === 6 ? 'Kardeşinin doğum günü nedeniyle katılamayacak' : 'Onay verildi',
          },
        });
      }

      // =========================================================================
      // N. İLAÇ TAKİBİ (MedicationRecord - 6 Gerçekçi Senaryo)
      // =========================================================================
      console.log('💊 İlaç Takip Kayıtları (MedicationRecord) ekleniyor...');

      // 1. Ada Yılmaz: Zaditen Alerji Damlası (GIVEN)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[0].id,
          medicationName: 'Zaditen Alerji Damlası 1mg/ml',
          dosage: 'Günde 1 kez, 5 damla',
          instructions: 'Sabah kahvaltısından yarım saat sonra meyve suyuna damlatılarak verilsin.',
          scheduledAt: new Date(Date.UTC(2026, 9, 17, 6, 30)),
          givenAt: new Date(Date.UTC(2026, 9, 17, 6, 45)),
          status: 'GIVEN',
          requestedById: createdParents[0].id,
          approvedById: teacherUsers[0].id,
          administeredById: teacherUsers[0].id,
          parentApprovalNote: 'Mevsimsel polen ve toz alerjisi reçeteli ilacıdır.',
        },
      });

      // 2. Can Demir: Ventolin Nebulizatör (APPROVED - Saat Bekliyor)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[3].id,
          medicationName: 'Ventolin Nebulizatör Çözelti 2.5mg',
          dosage: '1 flakon buhar ile',
          instructions: 'Öğle uykusundan hemen önce maske ile 10 dakika buhar verilecek.',
          scheduledAt: new Date(Date.UTC(2026, 9, 17, 10, 0)),
          givenAt: null,
          status: 'APPROVED',
          requestedById: createdParents[3].id,
          approvedById: teacherUsers[1].id,
          administeredById: null,
          parentApprovalNote: 'Hafif öksürük ve bronş rahatlatıcı reçetesi ektedir.',
        },
      });

      // 3. Beren Çetin: Calpol Şurup (REQUESTED - Veli Talep Etti)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[16].id,
          medicationName: 'Calpol Şurup 120mg/5ml',
          dosage: '1 ölçek (5ml)',
          instructions: 'Ölçülen ateşi 38.0°C üzerine çıkarsa verilmesi rica olunur.',
          scheduledAt: new Date(Date.UTC(2026, 9, 17, 11, 0)),
          givenAt: null,
          status: 'REQUESTED',
          requestedById: createdParents[16].id,
          approvedById: null,
          administeredById: null,
          parentApprovalNote: 'Ateş yükselirse lütfen beni aradıktan sonra içirin.',
        },
      });

      // 4. Toprak Erdem: Augmentin Antibiyotik (GIVEN)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[19].id,
          medicationName: 'Augmentin BID 400mg Oral Süspansiyon',
          dosage: '5 ml (1 tam ölçek)',
          instructions: 'Öğle yemeği bitiminde tok karnına verilecek.',
          scheduledAt: new Date(Date.UTC(2026, 9, 17, 9, 30)),
          givenAt: new Date(Date.UTC(2026, 9, 17, 9, 45)),
          status: 'GIVEN',
          requestedById: createdParents[19].id,
          approvedById: teacherUsers[9].id,
          administeredById: teacherUsers[9].id,
          parentApprovalNote: 'KBB uzmanı doktor tavsiyesiyle 7 günlük antibiyotik tedavisidir.',
        },
      });

      // 5. Defne Şahin: Oftalmotrim Göz Damlası (SKIPPED)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[4].id,
          medicationName: 'Oftalmotrim Göz Damlası',
          dosage: 'Her iki göze 1er damla',
          instructions: 'Öğle uykusuna yatarken damlatılacak.',
          scheduledAt: new Date(Date.UTC(2026, 9, 16, 10, 0)),
          givenAt: null,
          status: 'SKIPPED',
          requestedById: createdParents[4].id,
          approvedById: teacherUsers[2].id,
          administeredById: null,
          skipReason:
            'Öğrenci arabada derin uyuduğu ve huzursuzlanmaması için öğle uykusunda atlandı, veliye bilgi verildi.',
        },
      });

      // 6. Yağız Yıldız: Ferro Sanol Damla (GIVEN)
      await tx.medicationRecord.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[13].id,
          medicationName: 'Ferro Sanol Damla 30mg/ml',
          dosage: 'Günde 10 damla',
          instructions: 'Kahvaltı sonrası C vitamini portakal suyu ile verilecek.',
          scheduledAt: new Date(Date.UTC(2026, 9, 16, 6, 30)),
          givenAt: new Date(Date.UTC(2026, 9, 16, 6, 40)),
          status: 'GIVEN',
          requestedById: createdParents[13].id,
          approvedById: teacherUsers[6].id,
          administeredById: teacherUsers[6].id,
          parentApprovalNote: 'Demir takviyesidir, süt ürünüyle aynı anda vermeyiniz.',
        },
      });

      // =========================================================================
      // O. TESLİMAT GÜVENLİĞİ: YETKİ BELGELERİ VE TESLİM TUTANAKLARI
      // =========================================================================
      console.log(
        '🛡️ Teslimat İzinleri (PickupAuthorization) ve Olayları (PickupEvent) ekleniyor...',
      );

      const adaContacts = createdPickupContactsMap.get(createdStudents[0].id) || [];
      const mertContacts = createdPickupContactsMap.get(createdStudents[1].id) || [];
      const zeynepContacts = createdPickupContactsMap.get(createdStudents[2].id) || [];
      const efeContacts = createdPickupContactsMap.get(createdStudents[17].id) || [];

      // 4 Adet PickupAuthorization
      const auth1 = await tx.pickupAuthorization.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[0].id,
          pickupContactId: adaContacts[2]?.id, // Anneanne
          requestedById: createdParents[0].id,
          reviewedById: admin1.id,
          status: 'APPROVED',
          validFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          note: 'Ekim ayı boyunca haftaiçi okul çıkışlarında anneanne Fatma Hanım teslim alabilir.',
        },
      });

      const auth2 = await tx.pickupAuthorization.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[1].id,
          pickupContactId: mertContacts[1]?.id,
          requestedById: createdParents[1].id,
          reviewedById: admin1.id,
          status: 'APPROVED',
          validFrom: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          note: 'Tek seferlik izin: Dayısı Emre Bey kimlik göstererek teslim alacaktır.',
        },
      });

      await tx.pickupAuthorization.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[2].id,
          pickupContactId: zeynepContacts[2]?.id,
          requestedById: createdParents[2].id,
          reviewedById: null,
          status: 'PENDING',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          note: 'Komşumuz Aysel Hanım için teslimat izni talep ediyoruz.',
        },
      });

      const auth4 = await tx.pickupAuthorization.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[17].id,
          pickupContactId: null,
          requestedById: createdParents[17].id,
          reviewedById: admin1.id,
          status: 'APPROVED',
          validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          note: 'Okul servisi ile sabah ve akşam transfer yetkisi.',
        },
      });

      // 8 Adet Gerçekleşmiş Teslim Tutanağı (PickupEvent)
      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[0].id,
          pickupContactId: adaContacts[2]?.id,
          authorizationId: auth1.id,
          pickupPersonName: 'Fatma Teyze / Anneanne',
          pickupPersonPhone: '05330000000',
          verificationMethod: 'ID_CHECK',
          verifiedByUserId: teacherUsers[0].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 15)),
          note: 'T.C. Kimlik Kartı kontrolü yapıldı, imza alınarak güvenle teslim edildi.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[1].id,
          pickupContactId: mertContacts[0]?.id,
          authorizationId: null,
          pickupPersonName: 'Derya Kaya (Anne)',
          pickupPersonPhone: '05321110003',
          verificationMethod: 'KNOWN_FACE',
          verifiedByUserId: teacherUsers[0].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 20)),
          note: 'Bizzat anneye teslim edildi.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[3].id,
          pickupContactId: null,
          authorizationId: null,
          pickupPersonName: 'Serkan Demir (Baba)',
          pickupPersonPhone: '05321110007',
          verificationMethod: 'KNOWN_FACE',
          verifiedByUserId: teacherUsers[1].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 30)),
          note: 'Bizzat babaya teslim edildi.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[4].id,
          pickupContactId: null,
          authorizationId: null,
          pickupPersonName: 'Ahmet Şahin (Baba)',
          pickupPersonPhone: '05321110008',
          verificationMethod: 'KNOWN_FACE',
          verifiedByUserId: teacherUsers[2].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 10)),
          note: 'Giriş kartı teyit edildi.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[10].id,
          pickupContactId: null,
          authorizationId: null,
          pickupPersonName: 'Kaan Polat (Baba)',
          pickupPersonPhone: '05321110019',
          verificationMethod: 'KNOWN_FACE',
          verifiedByUserId: teacherUsers[5].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 25)),
          note: 'İmza karşılığı teslimat.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[13].id,
          pickupContactId: null,
          authorizationId: null,
          pickupPersonName: 'Ece Yıldız (Anne)',
          pickupPersonPhone: '05321110023',
          verificationMethod: 'KNOWN_FACE',
          verifiedByUserId: teacherUsers[6].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 35)),
          note: 'Anne bizzat teslim aldı.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[16].id,
          pickupContactId: null,
          authorizationId: null,
          pickupPersonName: 'Merve Hanım (Teyze)',
          pickupPersonPhone: '05329998877',
          verificationMethod: 'PHONE_CONFIRM',
          verifiedByUserId: teacherUsers[8].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 14, 40)),
          note: 'Anne telefonla aranarak teyit alındı, kimlik bilgileri kaydedildi.',
        },
      });

      await tx.pickupEvent.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[17].id,
          pickupContactId: null,
          authorizationId: auth4.id,
          pickupPersonName: 'Ahmet Korkmaz (Servis Görevlisi)',
          pickupPersonPhone: '05559876543',
          verificationMethod: 'OTHER',
          verifiedByUserId: teacherUsers[8].id,
          occurredAt: new Date(Date.UTC(2026, 9, 16, 13, 50)),
          note: 'Öğrenci 34 KC 102 plakalı okul servis aracına teslim edilmiştir.',
        },
      });

      // =========================================================================
      // P. MESAJLAŞMA: SOHBETLER, MESAJLAR VE OKUNDU BİLGİLERİ (6 Sohbet, 20+ Mesaj)
      // =========================================================================
      console.log('💬 Mesajlaşma Kanalları (Conversations & Messages) ekleniyor...');

      // 1. Sohbet: Ada Yılmaz - Veli & Öğretmen (SAGLIK)
      const conv1 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[0].id,
          subject: 'Ada nın Alerji Damlası ve Öğle Uykusu Durumu',
          category: 'SAGLIK',
          status: 'OPEN',
          isCritical: false,
          createdById: createdParents[0].id,
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv1.id, userId: createdParents[0].id },
          { tenantId: tenant.id, conversationId: conv1.id, userId: teacherUsers[0].id },
          { tenantId: tenant.id, conversationId: conv1.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv1.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv1.id, userId: superadminUser.id },
        ],
      });
      const m1_1 = await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv1.id,
          senderId: createdParents[0].id,
          content:
            'Merhaba Zeynep Öğretmenim, Ada nın alerji damlasını çantasına koydum. Sabah kahvaltıdan sonra 5 damla verebilir misiniz?',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      });
      const m1_2 = await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv1.id,
          senderId: teacherUsers[0].id,
          content:
            'Merhaba Selin Hanım, damlayı teslim aldım. Kahvaltı sonrası meyve suyuyla birlikte verdim, hiç zorlanmadı.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      });
      const m1_3 = await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv1.id,
          senderId: createdParents[0].id,
          content: 'Çok teşekkür ederim öğretmenim, öğle uykusuna rahat geçti mi acaba?',
          createdAt: new Date(Date.now() - 50 * 60 * 1000),
        },
      });
      const m1_4 = await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv1.id,
          senderId: teacherUsers[0].id,
          content: 'Evet, masal dinlerken hemen uykuya daldı. İştahı ve keyfi de çok yerinde.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      });
      await tx.messageReadReceipt.createMany({
        data: [
          { tenantId: tenant.id, messageId: m1_1.id, userId: teacherUsers[0].id },
          { tenantId: tenant.id, messageId: m1_2.id, userId: createdParents[0].id },
          { tenantId: tenant.id, messageId: m1_3.id, userId: teacherUsers[0].id },
          { tenantId: tenant.id, messageId: m1_4.id, userId: createdParents[0].id },
        ],
      });

      // 2. Sohbet: Mert Kaya - Veli & Öğretmen (GUNLUK_BILGI)
      const conv2 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[1].id,
          subject: 'Yedek Yağmurluk ve Çizme',
          category: 'GUNLUK_BILGI',
          status: 'OPEN',
          isCritical: false,
          createdById: teacherUsers[0].id,
          lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv2.id, userId: teacherUsers[0].id },
          { tenantId: tenant.id, conversationId: conv2.id, userId: createdParents[1].id },
          { tenantId: tenant.id, conversationId: conv2.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv2.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv2.id, userId: superadminUser.id },
        ],
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv2.id,
          senderId: teacherUsers[0].id,
          content:
            'İyi günler Derya Hanım, yarın bahçe etkinliğimizde su birikintisi gözlemi yapacağız. Mert in yedek yağmurluğunu gönderebilirseniz çok seviniriz.',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv2.id,
          senderId: createdParents[1].id,
          content:
            'Harika bir fikir Zeynep Öğretmenim, sarı yağmurluğu ve çizmelerini çantasına ekliyorum.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      });

      // 3. Sohbet: Can Demir - Veli & Yönetim (ODEME)
      const conv3 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[3].id,
          subject: 'Ekim Ayı Servis ve Aidat Dekont İletimi',
          category: 'ODEME',
          status: 'CLOSED',
          isCritical: false,
          createdById: createdParents[3].id,
          lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv3.id, userId: createdParents[3].id },
          { tenantId: tenant.id, conversationId: conv3.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv3.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv3.id, userId: superadminUser.id },
        ],
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv3.id,
          senderId: createdParents[3].id,
          content:
            'Ayşe Hanım merhaba, Can ın Ekim ayı eğitim ve servis aidatını EFT ile gönderdim. Dekont numarasını açıklama kısmına ekledim.',
          createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        },
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv3.id,
          senderId: admin1.id,
          content:
            'Merhaba Ebru Hanım, ödemeniz muhasebe kayıtlarımıza ulaştı ve faturanız ödendi olarak güncellendi. Teşekkür ederiz.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      // 4. Sohbet: Beren Çetin - Veli & Öğretmen (IZIN)
      const conv4 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[16].id,
          subject: 'Arboretum Doğa Gezisi Hazırlığı',
          category: 'IZIN',
          status: 'OPEN',
          isCritical: false,
          createdById: createdParents[16].id,
          lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv4.id, userId: createdParents[16].id },
          { tenantId: tenant.id, conversationId: conv4.id, userId: teacherUsers[8].id },
          { tenantId: tenant.id, conversationId: conv4.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv4.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv4.id, userId: superadminUser.id },
        ],
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv4.id,
          senderId: createdParents[16].id,
          content:
            'Büşra Öğretmenim, Arboretum gezisi için izin formunu doldurdum. Yanına sırt çantasıyla matara koymamız yeterli midir?',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv4.id,
          senderId: teacherUsers[8].id,
          content:
            'Evet Yasemin Hanım, spor ayakkabı ve su matarası yeterlidir. Atıştırmalıklar okulumuz tarafından karşılanacaktır.',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      });

      // 5. Sohbet: Zeynep Çelik - Veli & Yönetim (TESLIM)
      const conv5 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: createdStudents[2].id,
          subject: 'Akşam Teslimatında Teyze Yetkilendirmesi',
          category: 'TESLIM',
          status: 'CLOSED',
          isCritical: false,
          createdById: createdParents[2].id,
          lastMessageAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv5.id, userId: createdParents[2].id },
          { tenantId: tenant.id, conversationId: conv5.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv5.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv5.id, userId: superadminUser.id },
        ],
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv5.id,
          senderId: createdParents[2].id,
          content:
            'Kemal Bey iyi günler, Zeynep i akşam teyzesi Merve Hanım alacak. Sistemden izin tanımladım, kontrol edebilir misiniz?',
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv5.id,
          senderId: admin2.id,
          content:
            'Gamze Hanım merhaba, teslimat izniniz onaylanmış ve nöbetçi öğretmenimize bilgi iletilmiştir.',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      });

      // 6. Sohbet: Genel Kreş Yönetimi Duyurusu (DUYURU & CRITICAL)
      const conv6 = await tx.conversation.create({
        data: {
          tenantId: tenant.id,
          studentId: null,
          subject: '📢 2026-2027 Güz Dönemi Veli Toplantısı ve MEB Semineri Bildirisi',
          category: 'DUYURU',
          status: 'OPEN',
          isCritical: true,
          createdById: admin2.id,
          lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      });
      await tx.conversationParticipant.createMany({
        data: [
          { tenantId: tenant.id, conversationId: conv6.id, userId: admin1.id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: admin2.id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: superadminUser.id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: teacherUsers[0].id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: createdParents[0].id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: createdParents[1].id },
          { tenantId: tenant.id, conversationId: conv6.id, userId: createdParents[2].id },
        ],
      });
      await tx.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: conv6.id,
          senderId: admin2.id,
          content:
            'Değerli Velilerimiz, 25 Ekim Cumartesi günü saat 11:00 de okulumuz konferans salonunda Güz Dönemi Veli Bilgilendirme Toplantısı ve Çocuk Gelişiminde Sınırlar konulu uzman pedagog seminerimiz gerçekleştirilecektir. Katılımınızı önemle rica ederiz.',
          isCritical: true,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      });

      console.log('🎉 Tüm demo verileri (12 Menü eksiksiz) başarıyla oluşturuldu!');
    },
    { maxWait: 45000, timeout: 180000 },
  );
}

main()
  .catch((err) => {
    console.error('❌ Seed işleminde hata oluştu:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
