import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getRevenueAnalytics,
  getOrderAnalytics,
  getCourierPerformance,
  getTrends,
} from '../controllers/analytics.controller';

const router = Router();

router.use(requireAuth);

router.get('/revenue', getRevenueAnalytics);
router.get('/orders', getOrderAnalytics);
router.get('/couriers', getCourierPerformance);
router.get('/trends', getTrends);

export default router;
