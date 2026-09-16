import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
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
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let issues: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (resp && typeof resp === 'object') {
        const r = resp as Record<string, unknown>;
        message =
          typeof r.message === 'string'
            ? r.message
            : Array.isArray(r.message)
              ? r.message.join(', ')
              : message;
        if (r.issues) issues = r.issues;
      }
    } else if (exception instanceof ZodError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = 'Validation failed';
      issues = exception.issues;
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
    }

    this.logger.error(
      `${req.method} ${req.url} → ${status}: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    res.status(status).json({
      status,
      message,
      path: req.url,
      ...(issues ? { issues } : {}),
    });
  }
}