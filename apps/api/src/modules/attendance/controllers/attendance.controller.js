var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Get, HttpCode, Post, Put, UseGuards, } from '@nestjs/common';
import { assertStudentVisibleToUser } from '../../../common/utils/student-access';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
let AttendanceController = (() => {
    let _classDecorators = [Controller(), UseGuards(TenantGuard), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findByDate_decorators;
    let _findByStudentAndDate_decorators;
    let _checkIn_decorators;
    let _checkOut_decorators;
    let _update_decorators;
    var AttendanceController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findByDate_decorators = [Get('attendance')];
            _findByStudentAndDate_decorators = [Get('students/:studentId/attendance/:date'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _checkIn_decorators = [Post('students/:studentId/attendance/:date/check-in'), HttpCode(200)];
            _checkOut_decorators = [Post('students/:studentId/attendance/:date/check-out'), HttpCode(200)];
            _update_decorators = [Put('students/:studentId/attendance/:date'), HttpCode(200)];
            __esDecorate(this, null, _findByDate_decorators, { kind: "method", name: "findByDate", static: false, private: false, access: { has: obj => "findByDate" in obj, get: obj => obj.findByDate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByStudentAndDate_decorators, { kind: "method", name: "findByStudentAndDate", static: false, private: false, access: { has: obj => "findByStudentAndDate" in obj, get: obj => obj.findByStudentAndDate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkIn_decorators, { kind: "method", name: "checkIn", static: false, private: false, access: { has: obj => "checkIn" in obj, get: obj => obj.checkIn }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkOut_decorators, { kind: "method", name: "checkOut", static: false, private: false, access: { has: obj => "checkOut" in obj, get: obj => obj.checkOut }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AttendanceController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        service = __runInitializers(this, _instanceExtraInitializers);
        studentsService;
        constructor(service, studentsService) {
            this.service = service;
            this.studentsService = studentsService;
        }
        async findByDate(tenantId, dateQuery) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const dateStr = dateQuery || todayStr;
            const list = await this.service.findByDate(tenantId, dateStr);
            return list.map((a) => this.toResponse(a));
        }
        async findByStudentAndDate(tenantId, studentId, date, user) {
            const student = await this.studentsService.findOne(tenantId, studentId);
            assertStudentVisibleToUser(student, user.role, user.userId);
            const item = await this.service.findByStudentAndDate(tenantId, studentId, date);
            return item ? this.toResponse(item) : null;
        }
        async checkIn(tenantId, studentId, date, body) {
            const saved = await this.service.checkIn(tenantId, studentId, date, body);
            return this.toResponse(saved);
        }
        async checkOut(tenantId, studentId, date, body) {
            const saved = await this.service.checkOut(tenantId, studentId, date, body);
            return this.toResponse(saved);
        }
        async update(tenantId, studentId, date, body) {
            const saved = await this.service.update(tenantId, studentId, date, body);
            return this.toResponse(saved);
        }
        toResponse(entity) {
            return {
                id: entity.id,
                tenantId: entity.tenantId,
                studentId: entity.studentId,
                date: entity.date,
                status: entity.status,
                checkInTime: entity.checkInTime,
                checkInBy: entity.checkInBy,
                checkOutTime: entity.checkOutTime,
                checkOutBy: entity.checkOutBy,
                pickupContactId: entity.pickupContactId,
                pickupNote: entity.pickupNote,
                note: entity.note,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            };
        }
    };
    return AttendanceController = _classThis;
})();
export { AttendanceController };
