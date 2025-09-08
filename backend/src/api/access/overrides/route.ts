// src/api/access/overrides/route.ts

import express from 'express';
import { addOverride } from '../../../services/overrideService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await addOverride(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;