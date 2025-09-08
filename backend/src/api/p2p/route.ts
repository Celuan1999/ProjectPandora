// src/api/p2p/route.ts

import express from 'express';
import { createP2P } from '../../services/p2pService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await createP2P(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;