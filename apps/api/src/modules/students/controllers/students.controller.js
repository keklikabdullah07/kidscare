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
import { Controller, Delete, Get, HttpCode, Patch, Post, Put, UseGuards, } from '@nestjs/common';
import { assertStudentVisibleToUser } from '../../../common/utils/student-access';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
let StudentsController = (() => {
    let _classDecorators = [Controller('students'), UseGuards(TenantGuard), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findOne_decorators;
    let _getPassport_decorators;
    let _updatePassport_decorators;
    let _create_decorators;
    let _update_decorators;
    let _remove_decorators;
    var StudentsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [Get()];
            _findOne_decorators = [Get(':id'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _getPassport_decorators = [Get(':id/passport'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _updatePassport_decorators = [Put(':id/passport'), HttpCode(200)];
            _create_decorators = [Post(), HttpCode(201)];
            _update_decorators = [Patch(':id')];
            _remove_decorators = [Delete(':id'), HttpCode(200)];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPassport_decorators, { kind: "method", name: "getPassport", static: false, private: false, access: { has: obj => "getPassport" in obj, get: obj => obj.getPassport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updatePassport_decorators, { kind: "method", name: "updatePassport", static: false, private: false, access: { has: obj => "updatePassport" in obj, get: obj => obj.updatePassport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StudentsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        studentsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(studentsService) {
            this.studentsService = studentsService;
        }
        async findAll(tenantId) {
            const rows = await this.studentsService.findAll(tenantId);
            return rows.map((r) => this.toResponse(r));
        }
        async findOne(tenantId, id, user) {
            const row = await this.studentsService.findOne(tenantId, id);
            assertStudentVisibleToUser(row, user.role, user.userId);
            return this.toResponse(row);
        }
        async getPassport(tenantId, id, user) {
            const row = await this.studentsService.findOne(tenantId, id);
            assertStudentVisibleToUser(row, user.role, user.userId);
            return this.studentsService.getPassport(tenantId, id);
        }
        async updatePassport(tenantId, id, body) {
            return this.studentsService.updatePassport(tenantId, id, body);
        }
        async create(tenantId, body) {
            const created = await this.studentsService.create(tenantId, body);
            return this.toResponse(created);
        }
        async update(tenantId, id, body) {
            // Strip undefined keys — Prisma's StudentUpdateInput (with
            // exactOptionalPropertyTypes) rejects explicit `undefined`.
            const data = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
            const updated = await this.studentsService.update(tenantId, id, data);
            return this.toResponse(updated);
        }
        async remove(tenantId, id) {
            const removed = await this.studentsService.remove(tenantId, id);
            return this.toResponse(removed);
        }
        toResponse(s) {
            return {
                id: s.id,
                tenantId: s.tenantId,
                parentId: s.parentId,
                firstName: s.firstName,
                lastName: s.lastName,
                dateOfBirth: s.dateOfBirth.toISOString().slice(0, 10),
                gender: s.gender,
                notes: s.notes,
                passport: s.passport,
                isActive: s.isActive,
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString(),
                deletedAt: s.deletedAt ? s.deletedAt.toISOString() : null,
            };
        }
    };
    return StudentsController = _classThis;
})();
export { StudentsController };
