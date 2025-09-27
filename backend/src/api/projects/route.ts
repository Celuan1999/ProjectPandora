// src/api/projects/route.ts

import { Request, Response, Router } from 'express';
import { createProject, listProjects, listInaccessibleProjects, grantProjectAccess } from '../../services/projectService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const result = await createProject(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const result = await listProjects(userId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/inaccessible', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const result = await listInaccessibleProjects(userId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.post('/grant-access', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { projectId } = req.body;
  
  if (!projectId) {
    return res.status(400).json({ 
      type: '/errors/invalid-input', 
      title: 'Invalid Input', 
      status: 400, 
      detail: 'Project ID is required' 
    });
  }
  
  const result = await grantProjectAccess(userId, projectId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;