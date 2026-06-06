import { Router } from 'express';
import { calculatePrice } from '../controllers/price.controller';
import { pricingRateLimiter } from '../middlewares/rate-limit';
import { validateBody } from '../middlewares/validate';
import { calculatePriceSchema } from '../validators/pricing.schemas';

const router = Router();

router.post('/calculate', pricingRateLimiter, validateBody(calculatePriceSchema), calculatePrice);

export default router;
