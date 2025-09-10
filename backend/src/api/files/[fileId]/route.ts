// src/api/files/[fileId]/route.ts

import { Request, Response, Router } from 'express';
import { getFile, deleteFile } from '../../../services/fileService';

interface FileParams {
  fileId: string;
}

const router = Router();

router.get('/', async (req: Request<FileParams>, res: Response) => {
  const { fileId } = req.params;
  const result = await getFile(fileId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<FileParams>, res: Response) => {
  const { fileId } = req.params;
  const result = await deleteFile(fileId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;