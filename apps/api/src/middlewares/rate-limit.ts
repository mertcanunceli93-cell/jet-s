import { NextFunction, Request, Response } from 'express';
import { redisIncrWithTtl } from '../lib/redis';
import { logger } from '../lib/logger';

type LimiterConfig = {
  keyPrefix: string;
  windowSeconds: number;
  maxRequests: number;
};

function resolveIdentity(req: Request) {
  const ip = req.ip || 'unknown-ip';
  const userId = req.user?.userId || 'anonymous';
  return { ip, userId };
}

function createLimiter(config: LimiterConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { ip, userId } = resolveIdentity(req);
    const key = `${config.keyPrefix}:${ip}:${userId}`;
    const hits = await redisIncrWithTtl(key, config.windowSeconds);
    if (hits !== null && hits > config.maxRequests) {
      logger.warn('abuse.rate_limited', {
        requestId: req.requestId,
        path: req.path,
        ip,
        userId,
        keyPrefix: config.keyPrefix,
      });
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    return next();
  };
}

export const pricingRateLimiter = createLimiter({
  keyPrefix: 'rate:pricing',
  windowSeconds: Number(process.env.RATE_LIMIT_PRICING_WINDOW_SEC || 60),
  maxRequests: Number(process.env.RATE_LIMIT_PRICING_MAX || 30),
});

export const authRateLimiter = createLimiter({
  keyPrefix: 'rate:auth',
  windowSeconds: Number(process.env.RATE_LIMIT_AUTH_WINDOW_SEC || 60),
  maxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX || 20),
});
