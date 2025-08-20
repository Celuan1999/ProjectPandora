// backend/src/api/admin/users/route.ts
import { Router } from 'express';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const requestId = req.session?.requestId;
  logger.info({ requestId }, 'Fetching admin users');
  res.json({ message: 'Admin users endpoint' });
});

export { router };