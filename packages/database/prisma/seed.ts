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
        teacherNote:
          'Ada bugün etkinliklere çok istekli katıldı ve arkadaşlarıyla harika vakit geçirdi.',
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
        teacherNote:
          'Ada bugün etkinliklere çok istekli katıldı ve arkadaşlarıyla harika vakit geçirdi.',
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

    // ======================================================================
    // P1 — Pickup, Medication, Messaging, Incidents demo data
    // ======================================================================

    // ----- Classrooms + teacher assignment -----
    const arilarClass = await tx.classroom.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Arılar Sınıfı' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Arılar Sınıfı', ageGroup: '3-4 yaş', isActive: true },
    });

    const teacherUser = await tx.user.findFirst({
      where: { tenantId: tenant.id, email: 'teacher@demo.test' },
    });

    if (teacherUser) {
      await tx.classroomTeacher.upsert({
        where: {
          tenantId_classroomId_teacherId: {
            tenantId: tenant.id,
            classroomId: arilarClass.id,
            teacherId: teacherUser.id,
          },
        },
        update: { removedAt: null },
        create: {
          tenantId: tenant.id,
          classroomId: arilarClass.id,
          teacherId: teacherUser.id,
        },
      });
      // Assign Ada to Arılar Sınıfı
      await tx.student.update({
        where: { id: student.id },
        data: { classroomId: arilarClass.id },
      });
    }

    // ----- Pickup contacts -----
    await tx.pickupContact.upsert({
      where: { id: 'demo-pc-1' },
      update: {},
      create: {
        id: 'demo-pc-1',
        tenantId: tenant.id,
        studentId: student.id,
        fullName: 'Ayşe Teyze',
        relation: 'Teyze',
        phone: '05559876543',
        identityNote: 'TC 12345678901',
        isActive: true,
      },
    });
    await tx.pickupContact.upsert({
      where: { id: 'demo-pc-2' },
      update: {},
      create: {
        id: 'demo-pc-2',
        tenantId: tenant.id,
        studentId: student.id,
        fullName: 'Ali Amca',
        relation: 'Komşu',
        phone: '05551112233',
        identityNote: null,
        isActive: true,
      },
    });

    // ----- Pickup authorization (PENDING) -----
    await tx.pickupAuthorization.upsert({
      where: { id: 'demo-pa-1' },
      update: {},
      create: {
        id: 'demo-pa-1',
        tenantId: tenant.id,
        studentId: student.id,
        pickupContactId: 'demo-pc-1',
        requestedById: parentUser.id,
        status: 'PENDING',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        note: 'Bu hafta sonu için tek seferlik yetki talebi.',
      },
    });

    // ----- Pickup event (historical) -----
    if (teacherUser) {
      await tx.pickupEvent.upsert({
        where: { id: 'demo-pe-1' },
        update: {},
        create: {
          id: 'demo-pe-1',
          tenantId: tenant.id,
          studentId: student.id,
          pickupContactId: 'demo-pc-1',
          pickupPersonName: 'Ayşe Teyze',
          pickupPersonPhone: '05559876543',
          verificationMethod: 'ID_CHECK',
          verifiedByUserId: teacherUser.id,
          occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: 'Dün teslim alındı.',
        },
      });
    }

    // ----- Medication record (APPROVED, scheduled today) -----
    await tx.medicationRecord.upsert({
      where: { id: 'demo-med-1' },
      update: {},
      create: {
        id: 'demo-med-1',
        tenantId: tenant.id,
        studentId: student.id,
        medicationName: 'Parol Şurup',
        dosage: '5 ml',
        instructions: 'Yemekten sonra, ateş 38°C üzerindeyse verilecek.',
        scheduledAt: new Date(todayUtc.getTime() + 13 * 60 * 60 * 1000),
        status: 'APPROVED',
        requestedById: parentUser.id,
        approvedById: teacherUser?.id,
        parentApprovalNote: 'Veli onayladı, ateşi çıkarsa verilsin.',
      },
    });

    // ----- Conversation (OPEN, with participants + messages) -----
    await tx.conversation.upsert({
      where: { id: 'demo-conv-1' },
      update: {},
      create: {
        id: 'demo-conv-1',
        tenantId: tenant.id,
        subject: 'Yarın için özel not',
        category: 'GUNLUK_BILGI',
        status: 'OPEN',
        isCritical: false,
        studentId: student.id,
        createdById: parentUser.id,
        lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    });

    const adminUser = await tx.user.findFirst({
      where: { tenantId: tenant.id, email: 'admin@demo.test' },
    });

    if (adminUser) {
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId: 'demo-conv-1', userId: parentUser.id },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          conversationId: 'demo-conv-1',
          userId: parentUser.id,
        },
      });
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId: 'demo-conv-1', userId: adminUser.id },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          conversationId: 'demo-conv-1',
          userId: adminUser.id,
        },
      });
    }

    await tx.message.upsert({
      where: { id: 'demo-msg-1' },
      update: {},
      create: {
        id: 'demo-msg-1',
        tenantId: tenant.id,
        conversationId: 'demo-conv-1',
        senderId: parentUser.id,
        content:
          'Merhaba, yarın Ada biraz huysuz olabilir, gece uykusu az oldu. Sabah erken gelirse diye bilgilendirmek istedim.',
        isCritical: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    });
    if (adminUser) {
      await tx.message.upsert({
        where: { id: 'demo-msg-2' },
        update: {},
        create: {
          id: 'demo-msg-2',
          tenantId: tenant.id,
          conversationId: 'demo-conv-1',
          senderId: adminUser.id,
          content: 'Teşekkürler, notumuzu aldık. Sabah sınıf öğretmenine ileteceğim.',
          isCritical: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      });
    }

    // ----- Parent request (PENDING) -----
    await tx.parentRequest.upsert({
      where: { id: 'demo-pr-1' },
      update: {},
      create: {
        id: 'demo-pr-1',
        tenantId: tenant.id,
        parentId: parentUser.id,
        studentId: student.id,
        type: 'IZIN',
        subject: 'Cuma günü izin',
        description:
          'Cuma günü doktor randevumuz var, Ada kreşe gelemeyecek. İzin olarak değerlendirilmesini rica ederim.',
        status: 'PENDING',
      },
    });

    // ----- Incident record (PENDING parent notification) -----
    if (teacherUser) {
      await tx.incidentRecord.upsert({
        where: { id: 'demo-inc-1' },
        update: {},
        create: {
          id: 'demo-inc-1',
          tenantId: tenant.id,
          studentId: student.id,
          category: 'DUSME',
          occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          description: 'Bahçede koşarken ayağı kaydı ve düştü. Sağ dizinde hafif kızarıklık oluştu.',
          actionTaken: 'Yara temizlendi, buz konuldu. Çocuk sakinleştirildi.',
          parentNotified: false,
          reportedById: teacherUser.id,
        },
      });
    }

    // ======================================================================
    // EXTRA — More students, classrooms, varied data
    // ======================================================================

    // Second classroom
    const kelebeklerClass = await tx.classroom.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Kelebekler Sınıfı' } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Kelebekler Sınıfı',
        ageGroup: '4-5 yaş',
        isActive: true,
      },
    });

    // Second teacher for Kelebekler
    const teacher2User = await tx.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'teacher2@demo.test' } },
      update: { role: 'TEACHER', passwordHash },
      create: {
        tenantId: tenant.id,
        email: 'teacher2@demo.test',
        passwordHash,
        role: 'TEACHER',
      },
    });

    await tx.classroomTeacher.upsert({
      where: {
        tenantId_classroomId_teacherId: {
          tenantId: tenant.id,
          classroomId: kelebeklerClass.id,
          teacherId: teacher2User.id,
        },
      },
      update: { removedAt: null },
      create: {
        tenantId: tenant.id,
        classroomId: kelebeklerClass.id,
        teacherId: teacher2User.id,
      },
    });

    // Second parent
    const parent2User = await tx.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'parent2@demo.test' } },
      update: { role: 'PARENT', passwordHash },
      create: {
        tenantId: tenant.id,
        email: 'parent2@demo.test',
        passwordHash,
        role: 'PARENT',
      },
    });

    // 3 more students
    const extraStudents = [
      {
        id: 'demo-student-002',
        firstName: 'Mehmet',
        lastName: 'Demir',
        gender: 'Erkek',
        dateOfBirth: new Date('2020-08-20'),
        classroomId: arilarClass.id,
        parentId: parent2User.id,
        bloodType: 'B+',
        allergies: ['Süt'],
        dietaryRestrictions: [],
        emergencyContactName: 'Ayşe Demir',
        emergencyContactRel: 'Anne',
        emergencyContactPhone: '05552223344',
      },
      {
        id: 'demo-student-003',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        gender: 'Kız',
        dateOfBirth: new Date('2019-11-10'),
        classroomId: kelebeklerClass.id,
        parentId: parentUser.id,
        bloodType: '0+',
        allergies: [],
        dietaryRestrictions: ['Vejetaryen'],
        emergencyContactName: 'Ali Kaya',
        emergencyContactRel: 'Baba',
        emergencyContactPhone: '05553334455',
      },
      {
        id: 'demo-student-004',
        firstName: 'Ali',
        lastName: 'Öztürk',
        gender: 'Erkek',
        dateOfBirth: new Date('2021-02-05'),
        classroomId: arilarClass.id,
        parentId: parent2User.id,
        bloodType: 'AB+',
        allergies: ['Fıstık', 'Balık'],
        dietaryRestrictions: ['Glutensiz'],
        emergencyContactName: 'Fatma Öztürk',
        emergencyContactRel: 'Anne',
        emergencyContactPhone: '05554445566',
      },
    ];

    for (const s of extraStudents) {
      await tx.student.upsert({
        where: { id: s.id },
        update: { classroomId: s.classroomId, parentId: s.parentId },
        create: {
          id: s.id,
          tenantId: tenant.id,
          firstName: s.firstName,
          lastName: s.lastName,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth,
          classroomId: s.classroomId,
          parentId: s.parentId,
          isActive: true,
          passport: {
            bloodType: s.bloodType,
            allergies: s.allergies,
            dietaryRestrictions: s.dietaryRestrictions,
            chronicConditions: [],
            regularMedications: [],
            emergencyContacts: [
              {
                id: `ec-${s.id}`,
                name: s.emergencyContactName,
                relationship: s.emergencyContactRel,
                phone: s.emergencyContactPhone,
                isAuthorizedPickup: true,
              },
            ],
          },
        },
      });

      // Pickup contacts for each new student
      await tx.pickupContact.upsert({
        where: { id: `pc-${s.id}-1` },
        update: {},
        create: {
          id: `pc-${s.id}-1`,
          tenantId: tenant.id,
          studentId: s.id,
          fullName: s.emergencyContactName,
          relation: s.emergencyContactRel,
          phone: s.emergencyContactPhone,
          isActive: true,
        },
      });
      await tx.pickupContact.upsert({
        where: { id: `pc-${s.id}-2` },
        update: {},
        create: {
          id: `pc-${s.id}-2`,
          tenantId: tenant.id,
          studentId: s.id,
          fullName: 'Büyükanne',
          relation: 'Büyükanne',
          phone: '05559998877',
          isActive: true,
        },
      });

      // Today's attendance
      await tx.attendance.upsert({
        where: {
          tenantId_studentId_date: { tenantId: tenant.id, studentId: s.id, date: todayUtc },
        },
        update: { status: 'PRESENT' },
        create: {
          tenantId: tenant.id,
          studentId: s.id,
          date: todayUtc,
          status: 'PRESENT',
          checkInTime: '08:30',
        },
      });
    }

    // Pickup events for past 7 days (varied)
    const pickupVerifications = ['ID_CHECK', 'PHONE_CONFIRM', 'KNOWN_FACE'] as const;
    const pickersByStudent = [
      { studentId: 'demo-student-001', names: ['Ayşe Teyze', 'Mehmet Yılmaz (Baba)'] },
      { studentId: 'demo-student-002', names: ['Ayşe Demir', 'Ali Demir (Dede)'] },
      { studentId: 'demo-student-003', names: ['Ali Kaya', 'Zeynep Kaya (Anne)'] },
    ];

    for (let daysAgo = 1; daysAgo <= 5; daysAgo++) {
      const day = new Date(todayUtc);
      day.setUTCDate(day.getUTCDate() - daysAgo);
      for (const { studentId, names } of pickersByStudent) {
        if (daysAgo === 3) continue; // skip one day to simulate absence
        const picker = names[daysAgo % names.length]!;
        const verification = pickupVerifications[daysAgo % pickupVerifications.length]!;
        await tx.pickupEvent.upsert({
          where: { id: `pe-${studentId}-${daysAgo}` },
          update: {},
          create: {
            id: `pe-${studentId}-${daysAgo}`,
            tenantId: tenant.id,
            studentId,
            pickupPersonName: picker,
            verificationMethod: verification,
            verifiedByUserId: teacherUser!.id,
            occurredAt: new Date(day.getTime() + 16 * 60 * 60 * 1000), // 16:00
            note: daysAgo === 2 ? 'Aile büyükleri ziyarete geldi.' : null,
          },
        });
      }
    }

    // Past daily reports (last 3 days) for Ada — history view
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      const day = new Date(todayUtc);
      day.setUTCDate(day.getUTCDate() - daysAgo);
      await tx.dailyReport.upsert({
        where: {
          tenantId_studentId_date: { tenantId: tenant.id, studentId: 'demo-student-001', date: day },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          studentId: 'demo-student-001',
          date: day,
          mood: daysAgo === 1 ? 'CALM' : 'HAPPY',
          meals: {
            breakfast: 'ALL',
            lunch: daysAgo === 2 ? 'LITTLE' : 'ALL',
            afternoonSnack: 'ALL',
          },
          naps: {
            startTime: '13:00',
            endTime: daysAgo === 1 ? '14:00' : '14:30',
            quality: daysAgo === 1 ? 'INTERRUPTED' : 'GOOD',
          },
          potty: [{ id: `p-hist-${daysAgo}-1`, time: '10:30', type: 'POTTY' }],
          activities: daysAgo === 2 ? ['📚 Hikaye', '🎨 Boyama'] : ['🎵 Müzik', '🧩 Bloklar'],
          teacherNote:
            daysAgo === 1
              ? 'Biraz yorgundu, erken uyudu.'
              : 'Güzel bir gün geçirdi, arkadaşlarıyla oynadı.',
        },
      });
    }

    // Future medication (REQUESTED, needs approval)
    await tx.medicationRecord.upsert({
      where: { id: 'demo-med-2' },
      update: {},
      create: {
        id: 'demo-med-2',
        tenantId: tenant.id,
        studentId: 'demo-student-002',
        medicationName: 'Augmentin Şurup',
        dosage: '5 ml',
        instructions: 'Antibiyotik, sabah-akşam 5 gün süreyle. Doktor reçetesi ektedir.',
        scheduledAt: new Date(todayUtc.getTime() + 36 * 60 * 60 * 1000),
        status: 'REQUESTED',
        requestedById: parent2User.id,
        parentApprovalNote: 'Doktor reçetesi elimde.',
      },
    });

    // Medication GIVEN (historical, yesterday)
    await tx.medicationRecord.upsert({
      where: { id: 'demo-med-3' },
      update: {},
      create: {
        id: 'demo-med-3',
        tenantId: tenant.id,
        studentId: 'demo-student-001',
        medicationName: 'Parol Şurup',
        dosage: '5 ml',
        scheduledAt: new Date(todayUtc.getTime() - 12 * 60 * 60 * 1000),
        givenAt: new Date(todayUtc.getTime() - 11 * 60 * 60 * 1000),
        status: 'GIVEN',
        requestedById: parentUser.id,
        approvedById: adminUser!.id,
        administeredById: teacherUser!.id,
      },
    });

    // Second conversation (closed)
    await tx.conversation.upsert({
      where: { id: 'demo-conv-2' },
      update: {},
      create: {
        id: 'demo-conv-2',
        tenantId: tenant.id,
        subject: 'Aylık menü hakkında',
        category: 'GUNLUK_BILGI',
        status: 'CLOSED',
        isCritical: false,
        createdById: parentUser.id,
        lastMessageAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });
    if (adminUser) {
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId: 'demo-conv-2', userId: parentUser.id },
        },
        update: {},
        create: { tenantId: tenant.id, conversationId: 'demo-conv-2', userId: parentUser.id },
      });
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId: 'demo-conv-2', userId: adminUser.id },
        },
        update: {},
        create: { tenantId: tenant.id, conversationId: 'demo-conv-2', userId: adminUser.id },
      });
    }
    await tx.message.upsert({
      where: { id: 'demo-msg-3' },
      update: {},
      create: {
        id: 'demo-msg-3',
        tenantId: tenant.id,
        conversationId: 'demo-conv-2',
        senderId: parentUser.id,
        content: 'Bu ayki menüde fıstık olabilir mi? Ada alerjisi var.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });
    if (adminUser) {
      await tx.message.upsert({
        where: { id: 'demo-msg-4' },
        update: {},
        create: {
          id: 'demo-msg-4',
          tenantId: tenant.id,
          conversationId: 'demo-conv-2',
          senderId: adminUser.id,
          content:
            'Merhaba, menüde fıstık var ama alternatif olarak fıstıksız seçenek sunuyoruz. Detaylar menü sayfasında.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
      });
    }

    // Second parent request (APPROVED historical)
    await tx.parentRequest.upsert({
      where: { id: 'demo-pr-2' },
      update: {},
      create: {
        id: 'demo-pr-2',
        tenantId: tenant.id,
        parentId: parent2User.id,
        studentId: 'demo-student-002',
        type: 'BILGI_TALEP',
        subject: 'Geçen hafta menü içeriği',
        description: 'Geçen hafta menüsündeki çorba isimlerini öğrenebilir miyim?',
        status: 'APPROVED',
        resolvedById: adminUser?.id,
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolutionNote: 'Geçen hafta Pazartesi: şehriye, Salı: domates... detay menüde.',
      },
    });

    // Historical incident (parent already notified)
    await tx.incidentRecord.upsert({
      where: { id: 'demo-inc-2' },
      update: {},
      create: {
        id: 'demo-inc-2',
        tenantId: tenant.id,
        studentId: 'demo-student-002',
        category: 'YARALANMA',
        occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Parmak ucu kapıya sıkıştı, hafif kanama oldu.',
        actionTaken: 'Yara temizlendi, yara bandı uygulandı.',
        parentNotified: true,
        parentNotifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        parentNotifiedById: teacher2User.id,
        reportedById: teacher2User.id,
      },
    });

    // Activity posts for gallery
    await tx.activityPost.upsert({
      where: { id: 'demo-ap-1' },
      update: {},
      create: {
        id: 'demo-ap-1',
        tenantId: tenant.id,
        authorId: teacherUser!.id,
        title: '🎨 Parmak Boyama Etkinliği',
        description: 'Çocuklarımız bugün renkli parmak boyalarıyla harika sanat eserleri yarattı!',
        classroom: 'Arılar Sınıfı',
        activityDate: new Date(todayUtc.getTime() - 24 * 60 * 60 * 1000),
        tags: ['Sanat', 'Boyama', 'Yaratıcılık'],
        mediaUrls: [],
        taggedStudentIds: ['demo-student-001', 'demo-student-002'],
      },
    });
    await tx.activityPost.upsert({
      where: { id: 'demo-ap-2' },
      update: {},
      create: {
        id: 'demo-ap-2',
        tenantId: tenant.id,
        authorId: teacher2User.id,
        title: '🌳 Bahçe Etkinliği',
        description: 'Doğayı keşfediyoruz. Çocuklar yaprakları topladı ve ağaçları tanıdı.',
        classroom: 'Kelebekler Sınıfı',
        activityDate: new Date(todayUtc.getTime() - 2 * 24 * 60 * 60 * 1000),
        tags: ['Doğa', 'Bahçe', 'Keşif'],
        mediaUrls: [],
        taggedStudentIds: ['demo-student-003'],
      },
    });

    console.log(`Seeded demo tenant with users (superadmin, admin, 2 teachers, 2 parents) and 4 students!`);
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
