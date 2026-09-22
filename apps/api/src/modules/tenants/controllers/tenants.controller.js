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
import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
let TenantsController = (() => {
    let _classDecorators = [Controller('tenants'), UseGuards(TenantGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMe_decorators;
    let _updateMe_decorators;
    var TenantsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMe_decorators = [Get('me'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')];
            _updateMe_decorators = [Patch('me'), Roles('SUPER_ADMIN', 'ADMIN')];
            __esDecorate(this, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: obj => "getMe" in obj, get: obj => obj.getMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateMe_decorators, { kind: "method", name: "updateMe", static: false, private: false, access: { has: obj => "updateMe" in obj, get: obj => obj.updateMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TenantsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        tenantsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(tenantsService) {
            this.tenantsService = tenantsService;
        }
        async getMe(tenantId) {
            const tenant = await this.tenantsService.findOne(tenantId);
            return this.toResponse(tenant);
        }
        async updateMe(tenantId, body) {
            // Strip undefined entries — Prisma's TenantUpdateInput (with
            // exactOptionalPropertyTypes) rejects explicit `undefined` values.
            const data = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
            const updated = await this.tenantsService.update(tenantId, data);
            return this.toResponse(updated);
        }
        toResponse(t) {
            return {
                id: t.id,
                slug: t.slug,
                name: t.name,
                status: t.status,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            };
        }
    };
    return TenantsController = _classThis;
})();
export { TenantsController };
