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
import { Student } from '../entities/student.entity';
let StudentsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StudentsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StudentsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        repo;
        usersService;
        constructor(repo, usersService) {
            this.repo = repo;
            this.usersService = usersService;
        }
        async findAll(tenantId) {
            const rows = await this.repo.findMany(tenantId);
            return rows.map((row) => Student.fromPrisma(row));
        }
        async findOne(tenantId, id) {
            const found = await this.repo.findById(tenantId, id);
            if (!found)
                throw new NotFoundException(`Student ${id} not found`);
            return Student.fromPrisma(found);
        }
        async create(tenantId, input) {
            if (input.parentId) {
                await this.usersService.assertParentUser(tenantId, input.parentId);
            }
            const created = await this.repo.insert(tenantId, {
                firstName: input.firstName,
                lastName: input.lastName,
                dateOfBirth: new Date(input.dateOfBirth),
                gender: input.gender ?? null,
                notes: input.notes ?? null,
                passport: input.passport ?? {},
                parentId: input.parentId ?? null,
            });
            return Student.fromPrisma(created);
        }
        async update(tenantId, id, input) {
            // Verify exists so we map Prisma's P2025 to a NotFoundException.
            const existing = await this.repo.findById(tenantId, id);
            if (!existing)
                throw new NotFoundException(`Student ${id} not found`);
            const data = {};
            if (input.firstName !== undefined)
                data.firstName = input.firstName;
            if (input.lastName !== undefined)
                data.lastName = input.lastName;
            if (input.dateOfBirth !== undefined)
                data.dateOfBirth = new Date(input.dateOfBirth);
            if (input.gender !== undefined)
                data.gender = input.gender;
            if (input.notes !== undefined)
                data.notes = input.notes;
            if (input.passport !== undefined)
                data.passport = input.passport;
            if (input.isActive !== undefined)
                data.isActive = input.isActive;
            if (input.parentId !== undefined) {
                if (input.parentId) {
                    await this.usersService.assertParentUser(tenantId, input.parentId);
                    data.parent = { connect: { id: input.parentId } };
                }
                else {
                    data.parent = { disconnect: true };
                }
            }
            const updated = await this.repo.update(tenantId, id, data);
            return Student.fromPrisma(updated);
        }
        async getPassport(tenantId, id) {
            const student = await this.findOne(tenantId, id);
            return (student.passport ?? {
                bloodType: 'UNKNOWN',
                allergies: [],
                dietaryRestrictions: [],
                chronicConditions: [],
                regularMedications: [],
                emergencyContacts: [],
            });
        }
        async updatePassport(tenantId, id, passport) {
            const updated = await this.update(tenantId, id, {
                passport: passport,
            });
            return (updated.passport ?? {
                bloodType: 'UNKNOWN',
                allergies: [],
                dietaryRestrictions: [],
                chronicConditions: [],
                regularMedications: [],
                emergencyContacts: [],
            });
        }
        async remove(tenantId, id) {
            const existing = await this.repo.findById(tenantId, id);
            if (!existing)
                throw new NotFoundException(`Student ${id} not found`);
            const removed = await this.repo.softDelete(tenantId, id);
            return Student.fromPrisma(removed);
        }
    };
    return StudentsService = _classThis;
})();
export { StudentsService };
