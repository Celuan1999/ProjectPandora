// src/api/files/complete/route.ts

import express from 'express';
import { complete } from '../../../../services/fileService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await complete(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;