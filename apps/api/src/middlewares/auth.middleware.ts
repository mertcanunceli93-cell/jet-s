import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';
import { sendError } from '../lib/response';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required.');
  }
  return secret;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Yetkilendirme reddedildi.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret()) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('auth.invalid_token', { requestId: req.requestId });
    return sendError(res, 'Geçersiz token.', 401);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return sendError(res, 'Bu işlem için yetkiniz yok.', 403);
    }
    next();
  };
};
