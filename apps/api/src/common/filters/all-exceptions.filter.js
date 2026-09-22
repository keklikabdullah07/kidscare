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
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { ZodError } from 'zod';
/**
 * Global exception filter. Returns a stable JSON shape for every error
 * so the client never has to inspect stack traces:
 *
 *   { status: number, message: string, path?: string, issues?: unknown }
 *
 * - HttpException (including Nest built-ins) keeps its status + message
 * - ZodError surfaces 422 with field issues
 * - Everything else becomes 500 with a generic message in production
 *   and the raw message in development
 */
let AllExceptionsFilter = (() => {
    let _classDecorators = [Catch()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AllExceptionsFilter = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AllExceptionsFilter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new Logger(AllExceptionsFilter.name);
        catch(exception, host) {
            const ctx = host.switchToHttp();
            const res = ctx.getResponse();
            const req = ctx.getRequest();
            let status = HttpStatus.INTERNAL_SERVER_ERROR;
            let message = 'Internal server error';
            let issues;
            if (exception instanceof HttpException) {
                status = exception.getStatus();
                const resp = exception.getResponse();
                if (typeof resp === 'string') {
                    message = resp;
                }
                else if (resp && typeof resp === 'object') {
                    const r = resp;
                    message =
                        typeof r.message === 'string'
                            ? r.message
                            : Array.isArray(r.message)
                                ? r.message.join(', ')
                                : message;
                    if (r.issues)
                        issues = r.issues;
                }
            }
            else if (exception instanceof ZodError) {
                status = HttpStatus.UNPROCESSABLE_ENTITY;
                message = 'Validation failed';
                issues = exception.issues;
            }
            else if (exception instanceof Error) {
                message =
                    process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
            }
            this.logger.error(`${req.method} ${req.url} → ${status}: ${message}`, exception instanceof Error ? exception.stack : String(exception));
            res.status(status).json({
                status,
                message,
                path: req.url,
                ...(issues ? { issues } : {}),
            });
        }
    };
    return AllExceptionsFilter = _classThis;
})();
export { AllExceptionsFilter };
