// src/api/projects/route.ts

import express from 'express';
import { createProject, listProjects } from '../../services/projectService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await createProject(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.get('/', async (req, res) => {
  const result = await listProjects();
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;