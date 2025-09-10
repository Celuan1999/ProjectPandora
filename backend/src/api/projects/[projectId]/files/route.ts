// src/api/projects/[projectId]/files/route.ts

import { Request, Response, Router } from 'express';
import { listByProject } from '../../../../services/fileService';

interface ProjectParams { projectId: string; }

const router = Router();

router.get('/', async (req: Request<ProjectParams>, res: Response) => {
  const { projectId } = req.params;
  const result = await listByProject(projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;