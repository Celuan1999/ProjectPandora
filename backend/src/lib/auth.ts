// backend/src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from './crypto';
import { logger } from './logger';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
  context?: { requestId: string }; // Changed from session to context
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  req.context = { requestId }; // Changed from req.session

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    logger.warn({ requestId }, 'Missing authorization token');
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      logger.warn({ requestId }, 'Invalid or expired token');
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = { userId: user.id, email: user.email! };
    logger.info({ requestId, userId: user.id }, 'User authenticated');
    next();
  } catch (error) {
    logger.error({ requestId, error: (error as Error).message }, 'Authentication error');
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};