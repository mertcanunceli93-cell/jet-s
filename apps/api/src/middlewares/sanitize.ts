import { NextFunction, Request, Response } from 'express';

const suspiciousKeys = ['$where', '$gt', '$gte', '$lt', '$lte', '$ne', '$regex'];

function sanitizeObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(obj)) {
      if (suspiciousKeys.includes(key)) continue;
      sanitized[key] = sanitizeObject(nested);
    }
    return sanitized;
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query) as Request['query'];
  next();
}
