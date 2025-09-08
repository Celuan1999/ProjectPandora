// src/api/audit/route.ts

import express from 'express';
import { list } from '../../services/auditService';

const router = express.Router();

router.get('/', async (req, res) => {
  const filters = req.query as { resourceId?: string; userId?: string };
  const result = await list(filters);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;