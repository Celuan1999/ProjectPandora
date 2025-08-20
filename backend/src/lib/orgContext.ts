// backend/src/lib/orgContext.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

interface OrgContext {
  orgId: string;
  role: string;
  clearance: number;
}

interface RequestWithOrg extends Request {
  org?: OrgContext;
}

export const resolveOrgContext = async (req: RequestWithOrg, res: Response, next: NextFunction) => {
  const requestId = req.session?.requestId;
  const orgId = req.headers['x-org-id'] as string;
  if (!orgId) {
    logger.warn({ requestId }, 'Missing organization ID');
    return res.status(400).json({ error: 'Organization ID required' });
  }
  req.org = { orgId, role: 'MEMBER', clearance: 1 }; // Placeholder: Fetch from Supabase
  next();
};