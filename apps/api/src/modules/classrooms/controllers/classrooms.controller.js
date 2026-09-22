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
import { Controller, Get, HttpCode, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
let ClassroomsController = (() => {
    let _classDecorators = [Controller('classrooms'), UseGuards(TenantGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _create_decorators;
    let _update_decorators;
    let _assignTeacher_decorators;
    var ClassroomsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _list_decorators = [Get(), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
            _create_decorators = [Post(), Roles('SUPER_ADMIN', 'ADMIN'), HttpCode(201)];
            _update_decorators = [Patch(':id'), Roles('SUPER_ADMIN', 'ADMIN')];
            _assignTeacher_decorators = [Post(':id/teachers'), Roles('SUPER_ADMIN', 'ADMIN'), HttpCode(200)];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _assignTeacher_decorators, { kind: "method", name: "assignTeacher", static: false, private: false, access: { has: obj => "assignTeacher" in obj, get: obj => obj.assignTeacher }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClassroomsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        classroomsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(classroomsService) {
            this.classroomsService = classroomsService;
        }
        async list(tenantId, user) {
            return this.classroomsService.list(tenantId, {
                userId: user.userId,
                role: user.role === 'TEACHER' ? 'TEACHER' : user.role === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN',
            });
        }
        async create(tenantId, body) {
            return this.classroomsService.create(tenantId, body);
        }
        async update(tenantId, id, body) {
            return this.classroomsService.update(tenantId, id, body);
        }
        async assignTeacher(tenantId, classroomId, body) {
            return this.classroomsService.assignTeacher(tenantId, classroomId, body);
        }
    };
    return ClassroomsController = _classThis;
})();
export { ClassroomsController };
