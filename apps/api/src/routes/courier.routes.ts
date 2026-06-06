import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getAllCouriers,
  getCourierById,
  updateCourier,
  toggleCourierStatus,
  getStats,
} from '../controllers/courier.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getAllCouriers);
router.get('/stats', getStats);
router.get('/:id', getCourierById);
router.patch('/:id', updateCourier);
router.patch('/:id/status', toggleCourierStatus);

export default router;
