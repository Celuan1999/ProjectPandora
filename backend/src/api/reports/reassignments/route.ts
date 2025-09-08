// src/api/reports/reassignments/route.ts

import express from 'express';
import { getReassignments } from '../../../services/auditService';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await getReassignments();
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;