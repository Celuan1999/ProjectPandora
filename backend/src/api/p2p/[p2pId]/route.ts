// src/api/p2p/[p2pId]/route.ts

import { Request, Response, Router } from 'express';
import { viewOnce, cancel } from '../../../services/p2pService';

interface P2PParams { p2pId: string; }

const router = Router();

router.get('/view-once', async (req: Request<P2PParams>, res: Response) => {
  const { p2pId } = req.params;
  const result = await viewOnce(p2pId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<P2PParams>, res: Response) => {
  const { p2pId } = req.params;
  const result = await cancel(p2pId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;