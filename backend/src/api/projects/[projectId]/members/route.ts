// src/api/projects/[projectId]/members/route.ts

import { Request, Response, Router } from 'express';
import { addProjectMember, listProjectMembers } from '../../../../services/projectService';

interface ProjectParams {
  projectId: string;
}

const router = Router();

router.post('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await addProjectMember({ ...req.body, projectId });
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await listProjectMembers(projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;