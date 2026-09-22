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
import { BadRequestException, Controller, Delete, Get, HttpCode, Post, Put, UseGuards, } from '@nestjs/common';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DailyMenuResponseDto } from '../dto/daily-menu-response.dto';
let DailyMenusController = (() => {
    let _classDecorators = [Controller('daily-menus'), UseGuards(TenantGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getByDate_decorators;
    let _getByRange_decorators;
    let _create_decorators;
    let _update_decorators;
    let _delete_decorators;
    var DailyMenusController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getByDate_decorators = [Get(), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _getByRange_decorators = [Get('range'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')];
            _create_decorators = [Post(), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), HttpCode(201)];
            _update_decorators = [Put(':date'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), HttpCode(200)];
            _delete_decorators = [Delete(':date'), Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), HttpCode(204)];
            __esDecorate(this, null, _getByDate_decorators, { kind: "method", name: "getByDate", static: false, private: false, access: { has: obj => "getByDate" in obj, get: obj => obj.getByDate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getByRange_decorators, { kind: "method", name: "getByRange", static: false, private: false, access: { has: obj => "getByRange" in obj, get: obj => obj.getByRange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DailyMenusController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        service = __runInitializers(this, _instanceExtraInitializers);
        constructor(service) {
            this.service = service;
        }
        async getByDate(tenantId, dateQuery) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const dateStr = dateQuery || todayStr;
            const result = await this.service.getByDate(tenantId, dateStr);
            return new DailyMenuResponseDto(result.menu ? this.toResponse(result.menu) : null, result.allergenWarnings);
        }
        async getByRange(tenantId, from, to) {
            if (!from || !to) {
                throw new BadRequestException('`from` ve `to` parametreleri zorunludur.');
            }
            const list = await this.service.getByRange(tenantId, from, to);
            return list.map((m) => new DailyMenuResponseDto(this.toResponse(m), []));
        }
        async create(tenantId, body) {
            const result = await this.service.createOrUpdate(tenantId, body);
            return new DailyMenuResponseDto(result.menu ? this.toResponse(result.menu) : null, result.allergenWarnings);
        }
        async update(tenantId, date, body) {
            const result = await this.service.update(tenantId, date, body);
            return new DailyMenuResponseDto(result.menu ? this.toResponse(result.menu) : null, result.allergenWarnings);
        }
        async delete(tenantId, date) {
            await this.service.delete(tenantId, date);
        }
        toResponse(entity) {
            return {
                id: entity.id,
                tenantId: entity.tenantId,
                date: entity.date,
                breakfast: entity.breakfast,
                lunch: entity.lunch,
                snack: entity.snack,
                allergens: entity.allergens,
                calories: entity.calories,
                notes: entity.notes,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            };
        }
    };
    return DailyMenusController = _classThis;
})();
export { DailyMenusController };
