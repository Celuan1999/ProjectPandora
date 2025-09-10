// src/routes.ts

import { Request, Response, Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { createP2P, viewOnce } from './services/p2pService';
import { addOverride, removeOverride, expireOverrides } from './services/overrideService';
import { complete } from './services/fileService'; // Added import

const router = Router();

router.post('/p2p', async (req: Request, res: Response) => {
  const result = await createP2P(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/p2p/:p2pId/view-once', async (req: Request<{ p2pId: string }>, res: Response) => {
  const result = await viewOnce(req.params.p2pId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.post('/access/overrides', async (req: Request, res: Response) => {
  const result = await addOverride(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/access/overrides/:overrideId', async (req: Request<{ overrideId: string }>, res: Response) => {
  const result = await removeOverride(req.params.overrideId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.post('/files/upload', async (req: Request, res: Response) => {
  const { filePath, content, id, projectId, name, clearance } = req.body;
  try {
    await fs.writeFile(filePath, content || '');
    const result = await complete({ id, projectId, name, clearance: clearance || 'private', createdAt: new Date() });
    if (result.error) return res.status(result.status).json(result.error);
    return res.status(200).json({ status: 'success', data: result.data });
  } catch (error) {
    return res.status(500).json({
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/files/download', async (req: Request<{}, {}, {}, { filePath: string }>, res: Response) => {
  const { filePath } = req.query;
  try {
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).json({
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'File not found',
    });
  }
});

export default router;