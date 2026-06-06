import { Router } from 'express';
import { calculatePrice } from '../controllers/price.controller';
import {
  createEntity,
  deleteEntity,
  getPricingConfig,
  listAuditLogs,
  listEntity,
  updateEntity,
  upsertSetting,
} from '../controllers/pricing-admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { calculatePriceSchema, pricingEntityParamsSchema } from '../validators/pricing.schemas';
import { pricingRateLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/calculate', pricingRateLimiter, validateBody(calculatePriceSchema), calculatePrice);

router.get('/admin/config', requireAuth, requireRole(['ADMIN']), getPricingConfig);
router.get('/admin/audit-logs', requireAuth, requireRole(['ADMIN']), listAuditLogs);
router.get('/admin/:entity', requireAuth, requireRole(['ADMIN']), validateParams(pricingEntityParamsSchema), listEntity);
router.post('/admin/:entity', requireAuth, requireRole(['ADMIN']), validateParams(pricingEntityParamsSchema), createEntity);
router.patch('/admin/:entity/:id', requireAuth, requireRole(['ADMIN']), validateParams(pricingEntityParamsSchema), updateEntity);
router.delete('/admin/:entity/:id', requireAuth, requireRole(['ADMIN']), validateParams(pricingEntityParamsSchema), deleteEntity);
router.put('/admin/settings/:key', requireAuth, requireRole(['ADMIN']), upsertSetting);

export default router;
