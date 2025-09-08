// src/api/p2p/[p2pId]/route.ts

import express from 'express';
import { viewOnce, cancel } from '../../../services/p2pService';

const router = express.Router();

router.get('/', async (req, res) => {
  const { p2pId } = req.params;
  const result = await viewOnce(p2pId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req, res) => {
  const { p2pId } = req.params;
  const result = await cancel(p2pId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;