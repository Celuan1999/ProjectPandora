// src/services/p2pService.ts

import { z } from 'zod';
import { parse } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { presignGet } from '../lib/storage';
import { Response } from 'express';

const p2pSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(),
  recipientId: z.string().uuid(),
  viewOnce: z.boolean().default(false),
  expiresAt: z.date().optional(),
});

type P2P = z.infer<typeof p2pSchema>;

const db = {
  createP2P: async (data: P2P) => ({ ...data }), // Placeholder
  getP2P: async (id: string) => ({ id, fileId: 'file-uuid', recipientId: 'user-uuid', viewOnce: true, expiresAt: new Date() }), // Placeholder
  cancelP2P: async (id: string) => true, // Placeholder
};

export async function createP2P(data: unknown, res: Response): Promise<void> {
  const validation = parse(p2pSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const p2p = await db.createP2P(validation.data);
    return json(res, 201, p2p);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function viewOnce(p2pId: string, res: Response): Promise<void> {
  try {
    const p2p = await db.getP2P(p2pId);
    if (!p2p || !p2p.viewOnce) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'P2P share not found or not view-once',
      });
    }
    const file = await db.getFile(p2p.fileId); // Assume db.getFile exists
    const url = await presignGet({
      bucket: 'project-pandora-files',
      key: `projects/${file.projectId}/${file.name}`,
      expiresIn: 60, // Short-lived for view-once
    });
    await db.cancelP2P(p2pId); // Expire after viewing
    return json(res, 200, { presignedUrl: url });
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function cancel(p2pId: string, res: Response): Promise<void> {
  try {
    const success = await db.cancelP2P(p2pId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'P2P share not found',
      });
    }
    return json(res, 204, null);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}