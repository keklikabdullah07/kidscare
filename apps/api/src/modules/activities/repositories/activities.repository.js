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
let ActivitiesRepository = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ActivitiesRepository = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ActivitiesRepository = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findMany(tenantId, options = {}) {
            return this.prisma.withTenant(async (client) => {
                const where = {
                    tenantId,
                    deletedAt: null,
                };
                if (options.classroom) {
                    where.OR = [{ classroom: options.classroom }, { classroom: null }];
                }
                const posts = await client.activityPost.findMany({
                    where,
                    orderBy: { activityDate: 'desc' },
                    take: options.limit ?? 30,
                    skip: options.offset ?? 0,
                });
                // Filter in-memory for JSON array fields if tag/studentId is specified
                return posts.filter((post) => {
                    if (options.tag) {
                        const tags = Array.isArray(post.tags) ? post.tags : [];
                        if (!tags.includes(options.tag))
                            return false;
                    }
                    if (options.studentId) {
                        const tagged = Array.isArray(post.taggedStudentIds)
                            ? post.taggedStudentIds
                            : [];
                        if (tagged.length > 0 && !tagged.includes(options.studentId))
                            return false;
                    }
                    return true;
                });
            });
        }
        async findById(tenantId, id) {
            return this.prisma.withTenant((client) => client.activityPost.findFirst({
                where: {
                    id,
                    tenantId,
                    deletedAt: null,
                },
            }));
        }
        async create(tenantId, data) {
            return this.prisma.withTenant((client) => client.activityPost.create({
                data: {
                    ...data,
                    tenantId,
                },
            }));
        }
        async softDelete(tenantId, id) {
            return this.prisma.withTenant((client) => client.activityPost.update({
                where: { id },
                data: { deletedAt: new Date() },
            }));
        }
    };
    return ActivitiesRepository = _classThis;
})();
export { ActivitiesRepository };
