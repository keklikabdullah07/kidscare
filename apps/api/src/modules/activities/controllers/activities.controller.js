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
import { Controller, Delete, Get, Post, UseGuards, } from '@nestjs/common';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
let ActivitiesController = (() => {
    let _classDecorators = [Controller('activities'), UseGuards(TenantGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _getById_decorators;
    let _create_decorators;
    let _delete_decorators;
    var ActivitiesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _list_decorators = [Get(), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _getById_decorators = [Get(':id'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _create_decorators = [Post(), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
            _delete_decorators = [Delete(':id'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getById_decorators, { kind: "method", name: "getById", static: false, private: false, access: { has: obj => "getById" in obj, get: obj => obj.getById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ActivitiesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        activitiesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(activitiesService) {
            this.activitiesService = activitiesService;
        }
        async list(tenantId, query) {
            return this.activitiesService.list(tenantId, query);
        }
        async getById(tenantId, id) {
            return this.activitiesService.getById(tenantId, id);
        }
        async create(user, body) {
            return this.activitiesService.create(user.tenantId, user.userId, body);
        }
        async delete(tenantId, id) {
            return this.activitiesService.delete(tenantId, id);
        }
    };
    return ActivitiesController = _classThis;
})();
export { ActivitiesController };
