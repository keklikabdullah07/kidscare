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
import { Attendance } from '../entities/attendance.entity';
let AttendanceService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AttendanceService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AttendanceService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        repo;
        constructor(repo) {
            this.repo = repo;
        }
        async findByDate(tenantId, dateStr) {
            const date = new Date(dateStr);
            const rows = await this.repo.findByDate(tenantId, date);
            return rows.map((row) => Attendance.fromPrisma(row));
        }
        async findByStudentAndDate(tenantId, studentId, dateStr) {
            const date = new Date(dateStr);
            const row = await this.repo.findByStudentAndDate(tenantId, studentId, date);
            return row ? Attendance.fromPrisma(row) : null;
        }
        async checkIn(tenantId, studentId, dateStr, input) {
            const date = new Date(dateStr);
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const updateData = {
                status: 'PRESENT',
                checkInTime: input.checkInTime || currentTime,
                checkInBy: input.checkInBy ?? null,
                ...(input.note !== undefined ? { note: input.note } : {}),
            };
            const saved = await this.repo.upsert(tenantId, studentId, date, updateData);
            return Attendance.fromPrisma(saved);
        }
        async checkOut(tenantId, studentId, dateStr, input) {
            const date = new Date(dateStr);
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const updateData = {
                status: 'LEFT',
                checkOutTime: input.checkOutTime || currentTime,
                checkOutBy: input.checkOutBy,
                pickupContactId: input.pickupContactId ?? null,
                pickupNote: input.pickupNote ?? null,
                ...(input.note !== undefined ? { note: input.note } : {}),
            };
            const saved = await this.repo.upsert(tenantId, studentId, date, updateData);
            return Attendance.fromPrisma(saved);
        }
        async update(tenantId, studentId, dateStr, input) {
            const date = new Date(dateStr);
            const updateData = {};
            if (input.status !== undefined)
                updateData.status = input.status;
            if (input.checkInTime !== undefined)
                updateData.checkInTime = input.checkInTime;
            if (input.checkInBy !== undefined)
                updateData.checkInBy = input.checkInBy;
            if (input.checkOutTime !== undefined)
                updateData.checkOutTime = input.checkOutTime;
            if (input.checkOutBy !== undefined)
                updateData.checkOutBy = input.checkOutBy;
            if (input.pickupContactId !== undefined)
                updateData.pickupContactId = input.pickupContactId;
            if (input.pickupNote !== undefined)
                updateData.pickupNote = input.pickupNote;
            if (input.note !== undefined)
                updateData.note = input.note;
            const saved = await this.repo.upsert(tenantId, studentId, date, updateData);
            return Attendance.fromPrisma(saved);
        }
    };
    return AttendanceService = _classThis;
})();
export { AttendanceService };
