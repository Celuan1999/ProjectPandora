// src/api/files/[fileId]/clearance/route.ts

import express from 'express';
import { changeClearance } from '../../../../services/fileService';

const router = express.Router();

router.patch('/', async (req, res) => {
  const result = await changeClearance(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;