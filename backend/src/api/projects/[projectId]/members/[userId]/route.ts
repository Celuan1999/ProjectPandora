// src/api/projects/[projectId]/members/[userId]/route.ts

import { Request, Response, Router } from 'express';
import { removeProjectMember } from '../../../../../services/projectService';

interface ProjectMemberParams { projectId: string; userId: string; }

const router = Router();

router.delete('/', async (req: Request<ProjectMemberParams>, res: Response) => {
  const { projectId, userId } = req.params;
  const result = await removeProjectMember(userId, projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;