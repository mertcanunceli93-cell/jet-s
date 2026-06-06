import { Router } from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderDetails, 
  getAvailableOrders, 
  getAllOrders, 
  acceptOrder, 
  updateOrderStatus,
  getAdminStats,
  getAllUsers,
  getCourierLocations
} from '../controllers/order.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.schemas';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createOrderSchema), createOrder);
router.get('/my', getMyOrders);
router.get('/available', getAvailableOrders);
router.get('/all', requireRole(['ADMIN']), getAllOrders);
router.get('/stats', requireRole(['ADMIN']), getAdminStats);
router.get('/users', requireRole(['ADMIN']), getAllUsers);
router.get('/couriers/locations', requireRole(['ADMIN']), getCourierLocations);
router.get('/:id', getOrderDetails);
router.post('/:id/accept', acceptOrder);
router.patch('/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

export default router;
