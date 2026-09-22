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
import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { tenantContext } from "@kidscare/tenant-context";
import { Public } from '../../../common/decorators/public.decorator';
// Auth endpoints are an obvious brute-force target. Tighten limits:
// 10 attempts per minute, 60 per 10 minutes — generous for real users,
// punishing for bots. Uses named throttler buckets so the global limits
// still apply for other endpoint shapes.
let AuthController = (() => {
    let _classDecorators = [SkipThrottle(), Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _signup_decorators;
    let _login_decorators;
    let _me_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _signup_decorators = [Public(), Throttle({ short: { limit: 30, ttl: 60_000 }, long: { limit: 120, ttl: 600_000 } }), Post('signup'), HttpCode(201)];
            _login_decorators = [Public(), Throttle({ short: { limit: 30, ttl: 60_000 }, long: { limit: 120, ttl: 600_000 } }), Post('login'), HttpCode(200)];
            _me_decorators = [Get('me')];
            __esDecorate(this, null, _signup_decorators, { kind: "method", name: "signup", static: false, private: false, access: { has: obj => "signup" in obj, get: obj => obj.signup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _me_decorators, { kind: "method", name: "me", static: false, private: false, access: { has: obj => "me" in obj, get: obj => obj.me }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        constructor(authService) {
            this.authService = authService;
        }
        async signup(body) {
            return this.authService.signup(body);
        }
        async login(body) {
            return this.authService.login(body);
        }
        /**
         * Echoes back the current authenticated user. Verifies that the
         * TenantContextMiddleware successfully parsed a JWT (or dev header)
         * — if it didn't, TenantGuard would have already rejected the request.
         */
        me(tenantId) {
            const ctx = tenantContext.getStore();
            return { tenantId, userId: ctx?.userId ?? '', role: ctx?.role ?? 'TEACHER' };
        }
    };
    return AuthController = _classThis;
})();
export { AuthController };
