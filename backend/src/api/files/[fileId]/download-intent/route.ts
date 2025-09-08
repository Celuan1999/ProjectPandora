// src/api/files/[fileId]/download-intent/route.ts

import express from 'express';
import { downloadIntent } from '../../../../services/fileService';

const router = express.Router();

router.get('/', async (req, res) => {
  const { fileId } = req.params;
  const result = await downloadIntent(fileId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;