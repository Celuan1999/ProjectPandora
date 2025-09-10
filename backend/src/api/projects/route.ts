// src/api/projects/route.ts

import { Request, Response, Router } from 'express';
import { createProject, listProjects } from '../../services/projectService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const result = await createProject(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/', async (req: Request, res: Response) => {
  const result = await listProjects();
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;