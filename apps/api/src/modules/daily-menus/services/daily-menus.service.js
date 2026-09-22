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
import { Injectable, NotFoundException } from '@nestjs/common';
import { DailyMenu } from '../entities/daily-menu.entity';
let DailyMenusService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DailyMenusService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DailyMenusService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        repository;
        studentsRepository;
        constructor(repository, studentsRepository) {
            this.repository = repository;
            this.studentsRepository = studentsRepository;
        }
        parseDate(dateStr) {
            const parts = dateStr.split('-');
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            return new Date(Date.UTC(year, month - 1, day));
        }
        async getByDate(tenantId, dateStr) {
            const date = this.parseDate(dateStr);
            const row = await this.repository.findByDate(tenantId, date);
            const menu = row ? DailyMenu.fromPrisma(row) : null;
            const warnings = await this.computeAllergenWarnings(tenantId, menu ? menu.allergens : []);
            return { menu, allergenWarnings: warnings };
        }
        async getByRange(tenantId, fromStr, toStr) {
            const from = this.parseDate(fromStr);
            const to = this.parseDate(toStr);
            const rows = await this.repository.findByDateRange(tenantId, from, to);
            return rows.map((r) => DailyMenu.fromPrisma(r));
        }
        async createOrUpdate(tenantId, input) {
            const date = this.parseDate(input.date);
            const data = {};
            if (input.breakfast !== undefined)
                data.breakfast = input.breakfast;
            if (input.lunch !== undefined)
                data.lunch = input.lunch;
            if (input.snack !== undefined)
                data.snack = input.snack;
            if (input.allergens !== undefined)
                data.allergens = input.allergens;
            if (input.calories !== undefined)
                data.calories = input.calories;
            if (input.notes !== undefined)
                data.notes = input.notes;
            const saved = await this.repository.upsert(tenantId, date, data);
            const menu = DailyMenu.fromPrisma(saved);
            const warnings = await this.computeAllergenWarnings(tenantId, menu.allergens);
            return { menu, allergenWarnings: warnings };
        }
        async update(tenantId, dateStr, input) {
            const date = this.parseDate(dateStr);
            const data = {};
            if (input.breakfast !== undefined)
                data.breakfast = input.breakfast;
            if (input.lunch !== undefined)
                data.lunch = input.lunch;
            if (input.snack !== undefined)
                data.snack = input.snack;
            if (input.allergens !== undefined)
                data.allergens = input.allergens;
            if (input.calories !== undefined)
                data.calories = input.calories;
            if (input.notes !== undefined)
                data.notes = input.notes;
            const saved = await this.repository.upsert(tenantId, date, data);
            const menu = DailyMenu.fromPrisma(saved);
            const warnings = await this.computeAllergenWarnings(tenantId, menu.allergens);
            return { menu, allergenWarnings: warnings };
        }
        async delete(tenantId, dateStr) {
            const date = this.parseDate(dateStr);
            try {
                await this.repository.delete(tenantId, date);
            }
            catch {
                throw new NotFoundException(`Menü bulunamadı (${dateStr})`);
            }
        }
        async computeAllergenWarnings(tenantId, menuAllergens) {
            if (!menuAllergens || menuAllergens.length === 0) {
                return [];
            }
            const students = await this.studentsRepository.findMany(tenantId);
            const warnings = [];
            const normalizedMenuAllergens = menuAllergens.map((a) => a.trim().toLocaleLowerCase('tr'));
            for (const student of students) {
                if (!student.isActive)
                    continue;
                const passport = student.passport;
                const studentAllergies = passport?.allergies ?? [];
                if (!Array.isArray(studentAllergies) || studentAllergies.length === 0) {
                    continue;
                }
                const matched = [];
                for (const sa of studentAllergies) {
                    const normSa = sa.trim().toLocaleLowerCase('tr');
                    if (!normSa)
                        continue;
                    // Check exact match or substring in menu allergens
                    const hasMatch = normalizedMenuAllergens.some((ma) => ma.includes(normSa) || normSa.includes(ma));
                    if (hasMatch) {
                        matched.push(sa);
                    }
                }
                if (matched.length > 0) {
                    warnings.push({
                        studentId: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        matchedAllergens: matched,
                    });
                }
            }
            return warnings;
        }
    };
    return DailyMenusService = _classThis;
})();
export { DailyMenusService };
