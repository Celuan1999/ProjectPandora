// src/api/access/overrides/route.ts

import { Request, Response, Router } from 'express';
import { addOverride } from '../../../services/overrideService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const result = await addOverride(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;