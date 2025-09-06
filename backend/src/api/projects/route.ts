// src/api/projects/route.ts

import express from 'express';
import { createProject, addProjectMember, removeProjectMember } from '../../services/projectService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await createProject(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.post('/:projectId/members', async (req, res) => {
  const result = await addProjectMember(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/:projectId/members/:userId', async (req, res) => {
  const { userId, projectId } = req.params;
  const result = await removeProjectMember(userId, projectId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export { router };