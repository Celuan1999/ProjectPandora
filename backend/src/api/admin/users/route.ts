// backend/src/api/admin/users/route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

const router = Router();

// Define the custom request interface
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
  context?: { requestId: string };
}

router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const requestId = req.context?.requestId;
  logger.info('Fetching admin users', { requestId });
  res.json({ message: 'Admin users endpoint' });
});

export { router };