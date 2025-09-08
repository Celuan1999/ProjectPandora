// src/api/files/[fileId]/route.ts

import express from 'express';
import { updateFile, deleteFile } from '../../../services/fileService';

const router = express.Router();

router.patch('/', async (req, res) => {
  const { fileId } = req.params;
  const result = await updateFile(fileId, req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req, res) => {
  const { fileId } = req.params;
  const result = await deleteFile(fileId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;