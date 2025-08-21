// backend/src/api/projects/route.ts
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../lib/auth';
import { resolveOrgContext } from '../../lib/orgContext';
import { createProject } from '../../services/projectService';
import { logger } from '../../lib/logger';
import { SECURITY_LEVELS } from '../../types/enum';

const router = Router();

interface CreateProjectRequest {
  teamId: string;
  title: string;
  description?: string;
  clearanceLevel: number;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: string;
}

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
  context?: { requestId: string };
  org?: { orgId: string; role: string; clearance: number };
}

router.post('/', requireAuth, resolveOrgContext, async (req: AuthenticatedRequest, res: Response) => {
  const requestId = req.context?.requestId;
  const { teamId, title, description, clearanceLevel, budget_amount, budget_currency, deadline, owner_id } = req.body as CreateProjectRequest;

  if (!teamId || !title || !Object.values(SECURITY_LEVELS).includes(clearanceLevel)) {
    logger.warn('Invalid request body', { requestId });
    return res.status(400).json({ error: 'Team ID, title, and valid clearance level are required' });
  }

  if (req.org!.clearance < clearanceLevel) {
    logger.warn('Insufficient clearance', { requestId, userId: req.user!.userId, clearanceLevel });
    return res.status(403).json({ error: 'Insufficient clearance' });
  }

  try {
    const project = await createProject(
      { userId: req.user!.userId, orgId: req.org!.orgId, role: req.org!.role, clearance: req.org!.clearance },
      { teamId, title, description, budget_amount, budget_currency, deadline, owner_id }
    );

    logger.info('Project created', { requestId, projectId: project.id });
    return res.status(201).json({ projectId: project.id, title, description });
  } catch (error: any) {
    logger.error('Error creating project', { requestId, error: error.message });
    return res.status(400).json({ error: error.message });
  }
});

export { router };