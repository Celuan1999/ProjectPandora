// src/api/files/[fileId]/download-intent/route.ts

import { Request, Response, Router } from 'express';
import { downloadIntent } from '../../../../services/fileService';

interface FileParams { fileId: string; }

const router = Router();

router.get('/', async (req: Request<FileParams>, res: Response) => {
  const { fileId } = req.params;
  const result = await downloadIntent(fileId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;