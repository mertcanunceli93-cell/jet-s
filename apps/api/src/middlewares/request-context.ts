import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id') || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
