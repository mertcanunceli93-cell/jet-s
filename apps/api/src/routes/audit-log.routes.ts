import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getAuditLogs } from '../controllers/audit-log.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getAuditLogs);

export default router;
