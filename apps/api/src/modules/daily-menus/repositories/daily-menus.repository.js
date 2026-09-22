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
let DailyMenusRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DailyMenusRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DailyMenusRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findByDate(tenantId, date) {
            return this.prisma.withTenant((client) => client.dailyMenu.findUnique({
                where: {
                    tenantId_date: {
                        tenantId,
                        date,
                    },
                },
            }));
        }
        async findByDateRange(tenantId, from, to) {
            return this.prisma.withTenant((client) => client.dailyMenu.findMany({
                where: {
                    tenantId,
                    date: {
                        gte: from,
                        lte: to,
                    },
                },
                orderBy: { date: 'asc' },
            }));
        }
        async upsert(tenantId, date, data) {
            const breakfast = data.breakfast ?? [];
            const lunch = data.lunch ?? [];
            const snack = data.snack ?? [];
            const allergens = data.allergens ?? [];
            const calories = data.calories ?? null;
            const notes = data.notes ?? null;
            const createData = {
                tenantId,
                date,
                breakfast,
                lunch,
                snack,
                allergens,
                calories,
                notes,
            };
            const updateData = {};
            if (data.breakfast !== undefined)
                updateData.breakfast = breakfast;
            if (data.lunch !== undefined)
                updateData.lunch = lunch;
            if (data.snack !== undefined)
                updateData.snack = snack;
            if (data.allergens !== undefined)
                updateData.allergens = allergens;
            if (data.calories !== undefined)
                updateData.calories = calories;
            if (data.notes !== undefined)
                updateData.notes = notes;
            return this.prisma.withTenant((client) => client.dailyMenu.upsert({
                where: {
                    tenantId_date: {
                        tenantId,
                        date,
                    },
                },
                create: createData,
                update: updateData,
            }));
        }
        async delete(tenantId, date) {
            return this.prisma.withTenant((client) => client.dailyMenu.delete({
                where: {
                    tenantId_date: {
                        tenantId,
                        date,
                    },
                },
            }));
        }
    };
    return DailyMenusRepository = _classThis;
})();
export { DailyMenusRepository };
