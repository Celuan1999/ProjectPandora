// src/api/projects/[projectId]/files/route.ts

import express from 'express';
import { listFilesByProject } from '../../../../services/projectService';

const router = express.Router();

router.get('/', async (req, res) => {
  const { projectId } = req.params;
  const result = await listFilesByProject(projectId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;