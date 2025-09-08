// src/api/access/overrides/[overrideId]/route.ts

import express from 'express';
import { removeOverride } from '../../../../services/overrideService';

const router = express.Router();

router.delete('/', async (req, res) => {
  const { overrideId } = req.params;
  const result = await removeOverride(overrideId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;