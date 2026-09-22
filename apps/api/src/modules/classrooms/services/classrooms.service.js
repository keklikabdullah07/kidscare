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
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
let ClassroomsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClassroomsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClassroomsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        classroomsRepository;
        constructor(classroomsRepository) {
            this.classroomsRepository = classroomsRepository;
        }
        async list(tenantId, user) {
            const teacherId = user.role === 'TEACHER' ? user.userId : undefined;
            const rows = await this.classroomsRepository.findMany(tenantId, teacherId);
            return rows.map((row) => this.toResponse(row));
        }
        async create(tenantId, input) {
            try {
                const row = await this.classroomsRepository.create(tenantId, {
                    name: input.name,
                    ageGroup: input.ageGroup ?? null,
                });
                return this.toResponse(row);
            }
            catch (error) {
                if (this.isUniqueConstraintError(error)) {
                    throw new ConflictException('A classroom with this name already exists');
                }
                throw error;
            }
        }
        async update(tenantId, id, input) {
            const existing = await this.classroomsRepository.findById(tenantId, id);
            if (!existing)
                throw new NotFoundException('Classroom not found');
            const row = await this.classroomsRepository.update(tenantId, id, {
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.ageGroup !== undefined ? { ageGroup: input.ageGroup } : {}),
                ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
            });
            return this.toResponse(row);
        }
        async assignTeacher(tenantId, classroomId, input) {
            const classroom = await this.classroomsRepository.findById(tenantId, classroomId);
            if (!classroom)
                throw new NotFoundException('Classroom not found');
            const teacher = await this.classroomsRepository.findTeacher(tenantId, input.teacherId);
            if (!teacher)
                throw new NotFoundException('Active teacher not found');
            const row = await this.classroomsRepository.assignTeacher(tenantId, classroomId, input.teacherId);
            return this.toResponse(row);
        }
        toResponse(row) {
            const teachers = row.teacherAssignments.map((assignment) => ({
                id: assignment.id,
                teacherId: assignment.teacherId,
                assignedAt: assignment.assignedAt.toISOString(),
            }));
            return {
                id: row.id,
                tenantId: row.tenantId,
                name: row.name,
                ageGroup: row.ageGroup,
                isActive: row.isActive,
                teachers,
                studentCount: row.students.length,
                createdAt: row.createdAt.toISOString(),
                updatedAt: row.updatedAt.toISOString(),
            };
        }
        isUniqueConstraintError(error) {
            return (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002');
        }
    };
    return ClassroomsService = _classThis;
})();
export { ClassroomsService };
