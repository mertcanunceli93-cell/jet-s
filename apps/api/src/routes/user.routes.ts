import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
