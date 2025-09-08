// src/api/files/upload-intent/route.ts

import express from 'express';
import { uploadIntent } from '../../../services/fileService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { projectId, name } = req.body;
  const result = await uploadIntent(projectId, name);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;