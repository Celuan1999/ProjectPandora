// backend/src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from './crypto';
import { logger } from './logger';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
  context?: { requestId: string };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  req.context = { requestId };

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    logger.warn('Missing authorization token', { requestId });
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      logger.warn('Invalid or expired token', { requestId });
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = { userId: user.id, email: user.email! };
    logger.info('User authenticated', { requestId, userId: user.id });
    next();
  } catch (error) {
    logger.error('Authentication error', { requestId, error: (error as Error).message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};