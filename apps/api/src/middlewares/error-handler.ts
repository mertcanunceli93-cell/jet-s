import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { sendError } from '../lib/response';

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 'Route not found.', 404);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (err instanceof ZodError) {
    return sendError(res, 'Validation failed.', 400);
  }

  logger.error('request.failed', {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: isDevelopment && err instanceof Error ? err.stack : undefined,
  });

  // Don't expose internal errors in production
  const errorMessage = isDevelopment && err instanceof Error ? err.message : 'Internal server error.';
  return sendError(res, errorMessage);
}
