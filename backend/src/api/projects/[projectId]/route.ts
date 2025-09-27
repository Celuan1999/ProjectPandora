// src/api/projects/[projectId]/route.ts

import { Request, Response, Router } from 'express';
import { getProject, updateProject, deleteProject } from '../../../services/projectService';

interface ProjectParams {
  projectId: number;
}

const router = Router();

router.get('/:projectId', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await getProject(Number(projectId));
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.patch('/:projectId', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await updateProject(Number(projectId), req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/:projectId', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await deleteProject(Number(projectId));
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;