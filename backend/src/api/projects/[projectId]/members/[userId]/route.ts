// src/api/projects/[projectId]/members/[userId]/route.ts

import express from 'express';
import { removeProjectMember } from '../../../../../services/projectService';

const router = express.Router();

router.delete('/', async (req, res) => {
  const { projectId, userId } = req.params;
  const result = await removeProjectMember(userId, projectId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;