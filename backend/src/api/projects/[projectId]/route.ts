// src/api/projects/[projectId]/route.ts

import { Request, Response, Router } from 'express';
import { getProject, updateProject, deleteProject } from '../../../services/projectService';

interface ProjectParams {
  projectId: string;
}

const router = Router();

router.get('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await getProject(projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.patch('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await updateProject(projectId, req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await deleteProject(projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;