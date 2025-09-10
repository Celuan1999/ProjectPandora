// src/api/access/overrides/[overrideId]/route.ts

import { Request, Response, Router } from 'express';
import { getOverride, updateOverride, deleteOverride } from '../../../../services/overrideService';

interface OverrideParams {
  overrideId: string;
}

const router = Router();

router.get('/', async (req: Request<OverrideParams>, res: Response) => {
  const { overrideId } = req.params;
  const result = await getOverride(overrideId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.patch('/', async (req: Request<OverrideParams>, res: Response) => {
  const { overrideId } = req.params;
  const result = await updateOverride(overrideId, req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<OverrideParams>, res: Response) => {
  const { overrideId } = req.params;
  const result = await deleteOverride(overrideId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;