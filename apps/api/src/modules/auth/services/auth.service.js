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
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { runWithTenant } from "@kidscare/tenant-context";
/**
 * Generates a cuid-shaped id without bringing in the `@paralleldrive/cuid2`
 * dependency just for two callsites. Format matches Prisma's `cuid()`:
 * 25 chars, lowercase + digits, timestamp prefix for sortability.
 */
function cuid() {
    const ts = Date.now().toString(36);
    const rand = randomBytes(12)
        .toString('base64')
        .replace(/[+/=]/g, '')
        .toLowerCase()
        .slice(0, 25 - ts.length);
    return `${ts}${rand}`;
}
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        lookupRepo;
        password;
        jwt;
        prisma;
        constructor(lookupRepo, password, jwt, prisma) {
            this.lookupRepo = lookupRepo;
            this.password = password;
            this.jwt = jwt;
            this.prisma = prisma;
        }
        async signup(input) {
            const existing = await this.lookupRepo.findTenantBySlug(input.tenantSlug);
            if (existing)
                throw new ConflictException('Tenant slug already taken');
            const tenantId = cuid();
            const userId = cuid();
            const passwordHash = await this.password.hash(input.password);
            // Run the two inserts under a synthetic tenant context. The
            // 'system' userId is a sentinel used only for the SET LOCAL session
            // variable inside the transaction; both INSERTs are RLS-constrained
            // by `tenantId = current_setting('app.tenant_id')`.
            await runWithTenant({ tenantId, userId: 'system', role: 'ADMIN' }, async () => this.prisma.withTenant(async (client) => {
                await client.tenant.create({
                    data: {
                        id: tenantId,
                        slug: input.tenantSlug,
                        name: input.tenantName,
                    },
                });
                await client.user.create({
                    data: {
                        id: userId,
                        tenantId,
                        email: input.email,
                        passwordHash,
                        role: 'ADMIN',
                    },
                });
            }));
            const claims = {
                sub: userId,
                tenantId,
                role: 'ADMIN',
            };
            return {
                token: this.jwt.sign(claims),
                user: { id: userId, tenantId, email: input.email, role: 'ADMIN' },
            };
        }
        async login(input) {
            const tenant = await this.lookupRepo.findTenantBySlug(input.tenantSlug);
            if (!tenant)
                throw new UnauthorizedException('Invalid credentials');
            const lookupUser = await this.lookupRepo.findUserByEmail(tenant.id, input.email);
            if (!lookupUser)
                throw new UnauthorizedException('Invalid credentials');
            const valid = await this.password.verify(input.password, lookupUser.passwordHash);
            if (!valid)
                throw new UnauthorizedException('Invalid credentials');
            // `kidscare_auth_lookup` cannot SELECT `role` / `isActive` (column-
            // level GRANT). Fetch the remaining fields under a synthetic app
            // context scoped to the resolved tenant — still RLS-constrained.
            const fullUser = await runWithTenant({ tenantId: tenant.id, userId: 'system', role: 'ADMIN' }, async () => this.prisma.withTenant((client) => client.user.findUnique({
                where: { id: lookupUser.id },
                select: {
                    id: true,
                    tenantId: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            })));
            if (!fullUser || !fullUser.isActive) {
                throw new UnauthorizedException('Invalid credentials');
            }
            const role = fullUser.role;
            const claims = {
                sub: fullUser.id,
                tenantId: fullUser.tenantId,
                role,
            };
            return {
                token: this.jwt.sign(claims),
                user: {
                    id: fullUser.id,
                    tenantId: fullUser.tenantId,
                    email: fullUser.email,
                    role,
                },
            };
        }
    };
    return AuthService = _classThis;
})();
export { AuthService };
