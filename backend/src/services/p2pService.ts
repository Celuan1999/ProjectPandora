// src/services/p2pService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { getFile } from '../lib/storage';

const p2pSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  fileId: z.string().uuid({ message: 'Invalid UUID for fileId' }),
  recipientId: z.string().uuid({ message: 'Invalid UUID for recipientId' }),
  viewOnce: z.boolean().default(false),
  expiresAt: z.date().optional(),
});

type P2P = z.infer<typeof p2pSchema>;
type File = { id: string; projectId: string; name: string; clearance: string; createdAt: Date };

const db = {
  createP2P: async (data: P2P) => ({ ...data }),
  getP2P: async (id: string) => ({ id, fileId: 'file-uuid', recipientId: 'user-uuid', viewOnce: true, expiresAt: new Date() }),
  cancelP2P: async (id: string) => true,
  getFile: async (fileId: string) => ({ id: fileId, projectId: 'project-uuid', name: 'file.txt', clearance: 'private', createdAt: new Date() }),
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createP2P(data: unknown): Promise<{ status: number; data?: P2P; error?: any }> {
  const validation = parse(p2pSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P data' } };
  }
  try {
    const p2p = await db.createP2P(validation.data);
    return { status: 201, data: p2p };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function viewOnce(p2pId: string): Promise<{ status: number; data?: { filePath: string }; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for p2pId' }), p2pId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P ID' } };
  }
  try {
    const p2p = await db.getP2P(p2pId);
    if (!p2p || !p2p.viewOnce) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'P2P share not found or not view-once' } };
    }
    const file = await db.getFile(p2p.fileId);
    const filePath = await getFile({ projectId: file.projectId, fileName: file.name });
    await db.cancelP2P(p2pId);
    return { status: 200, data: { filePath } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function cancel(p2pId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for p2pId' }), p2pId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P ID' } };
  }
  try {
    const success = await db.cancelP2P(p2pId);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'P2P share not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}