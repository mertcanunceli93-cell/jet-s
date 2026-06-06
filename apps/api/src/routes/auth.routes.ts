import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.schemas';
import { authRateLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
