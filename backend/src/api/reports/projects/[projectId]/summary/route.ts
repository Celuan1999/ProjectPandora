// src/api/reports/projects/[projectId]/summary/route.ts

import express from 'express';
import { getProjectSummary } from '../../../../../services/auditService';

const router = express.Router();

router.get('/', async (req, res) => {
  const { projectId } = req.params;
  const result = await getProjectSummary(projectId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;