var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable } from '@nestjs/common';
import { Student } from '../../students/entities/student.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { DailyReport } from '../../daily-reports/entities/daily-report.entity';
let ParentService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ParentService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ParentService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        studentsRepository;
        attendanceRepository;
        dailyReportsRepository;
        constructor(studentsRepository, attendanceRepository, dailyReportsRepository) {
            this.studentsRepository = studentsRepository;
            this.attendanceRepository = attendanceRepository;
            this.dailyReportsRepository = dailyReportsRepository;
        }
        parseDate(dateStr) {
            const parts = dateStr.split('-');
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            return new Date(Date.UTC(year, month - 1, day));
        }
        async getChildrenOverview(tenantId, parentUserId, userRole, dateStr) {
            const date = this.parseDate(dateStr);
            const allStudents = await this.studentsRepository.findMany(tenantId);
            // Parents may only see students explicitly linked to their own account.
            let targetStudents = allStudents.filter((s) => s.isActive);
            if (userRole === 'PARENT') {
                targetStudents = targetStudents.filter((s) => s.parentId === parentUserId);
            }
            const overviews = [];
            for (const rawStudent of targetStudents) {
                const studentEntity = Student.fromPrisma(rawStudent);
                const [rawAttendance, rawDailyReport] = await Promise.all([
                    this.attendanceRepository.findByStudentAndDate(tenantId, rawStudent.id, date),
                    this.dailyReportsRepository.findByStudentAndDate(tenantId, rawStudent.id, date),
                ]);
                const todayAttendance = rawAttendance ? Attendance.fromPrisma(rawAttendance) : null;
                const todayDailyReport = rawDailyReport ? DailyReport.fromPrisma(rawDailyReport) : null;
                overviews.push({
                    student: {
                        id: studentEntity.id,
                        tenantId: studentEntity.tenantId,
                        parentId: studentEntity.parentId,
                        firstName: studentEntity.firstName,
                        lastName: studentEntity.lastName,
                        dateOfBirth: studentEntity.dateOfBirth.toISOString().slice(0, 10),
                        gender: studentEntity.gender,
                        notes: studentEntity.notes,
                        passport: studentEntity.passport,
                        isActive: studentEntity.isActive,
                        createdAt: studentEntity.createdAt.toISOString(),
                        updatedAt: studentEntity.updatedAt.toISOString(),
                        deletedAt: studentEntity.deletedAt ? studentEntity.deletedAt.toISOString() : null,
                    },
                    todayAttendance: todayAttendance
                        ? {
                            id: todayAttendance.id,
                            tenantId: todayAttendance.tenantId,
                            studentId: todayAttendance.studentId,
                            date: todayAttendance.date,
                            status: todayAttendance.status,
                            checkInTime: todayAttendance.checkInTime,
                            checkInBy: todayAttendance.checkInBy,
                            checkOutTime: todayAttendance.checkOutTime,
                            checkOutBy: todayAttendance.checkOutBy,
                            pickupContactId: todayAttendance.pickupContactId,
                            pickupNote: todayAttendance.pickupNote,
                            note: todayAttendance.note,
                            createdAt: todayAttendance.createdAt,
                            updatedAt: todayAttendance.updatedAt,
                        }
                        : null,
                    todayDailyReport: todayDailyReport
                        ? {
                            id: todayDailyReport.id,
                            tenantId: todayDailyReport.tenantId,
                            studentId: todayDailyReport.studentId,
                            date: todayDailyReport.date,
                            mood: todayDailyReport.mood,
                            meals: todayDailyReport.meals,
                            naps: todayDailyReport.naps,
                            potty: todayDailyReport.potty,
                            activities: todayDailyReport.activities,
                            medications: todayDailyReport.medications,
                            teacherNote: todayDailyReport.teacherNote,
                            createdAt: todayDailyReport.createdAt,
                            updatedAt: todayDailyReport.updatedAt,
                        }
                        : null,
                });
            }
            return overviews;
        }
    };
    return ParentService = _classThis;
})();
export { ParentService };
