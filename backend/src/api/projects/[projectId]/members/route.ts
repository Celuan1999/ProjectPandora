// src/api/projects/[projectId]/route.ts

import express from 'express';
import { updateProject, deleteProject } from '../../../../services/projectService';

const router = express.Router();

router.patch('/', async (req, res) => {
  const { projectId } = req.params;
  const result = await updateProject(projectId, req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req, res) => {
  const { projectId } = req.params;
  const result = await deleteProject(projectId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;