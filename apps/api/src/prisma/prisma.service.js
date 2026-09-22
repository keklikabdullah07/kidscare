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
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClient, withTenantContext } from "@kidscare/database";
import { tenantContext } from "@kidscare/tenant-context";
let PrismaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = PrismaClient;
    var PrismaService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PrismaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor(config) {
            super({
                datasources: {
                    db: {
                        url: config?.get('DATABASE_APP_URL') ??
                            process.env.DATABASE_APP_URL ??
                            config?.get('DATABASE_URL') ??
                            process.env.DATABASE_URL ??
                            'postgresql://kidscare_app:app_pw@localhost:5433/kidscare?schema=public',
                    },
                },
            });
        }
        /**
         * Run `fn` with a tenant-scoped Prisma client. The current
         * `TenantContextValue` (set by TenantContextMiddleware) is bound via
         * `withTenantContext` — every query inside `fn` runs inside a
         * transaction that sets `app.tenant_id` first, so RLS policies filter
         * to the current tenant.
         *
         * Throws ForbiddenException if no context is present. TenantGuard
         * should have rejected the request earlier; this is defence in depth
         * so a misconfigured guard cannot leak data.
         */
        async withTenant(fn) {
            const ctx = tenantContext.getStore();
            if (!ctx)
                throw new ForbiddenException('Missing tenant context');
            // Cast: $extends returns a structurally-compatible client with all
            // PrismaClient model methods. The exact generic type is complex and
            // not worth hand-rolling for a one-line wrapper.
            const scoped = this.$extends(withTenantContext(ctx));
            return fn(scoped);
        }
        async onModuleInit() {
            await this.$connect();
        }
        async onModuleDestroy() {
            await this.$disconnect();
        }
    };
    return PrismaService = _classThis;
})();
export { PrismaService };
