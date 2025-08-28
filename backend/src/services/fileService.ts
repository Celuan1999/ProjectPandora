// src/services/fileService.ts

import { z } from 'zod';
import { parse } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { presignPut, presignGet } from '../lib/storage';
import { Response } from 'express';

const fileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255),
  clearance: z.enum(['public', 'private', 'restricted']).default('private'),
  createdAt: z.date().default(() => new Date()),
});

const renameSchema = z.object({
  fileId: z.string().uuid(),
  newName: z.string().min(1, 'Name is required').max(255),
});

const clearanceSchema = z.object({
  fileId: z.string().uuid(),
  clearance: z.enum(['public', 'private', 'restricted']),
});

type File = z.infer<typeof fileSchema>;

const db = {
  createFile: async (data: File) => ({ ...data }), // Placeholder
  listFilesByProject: async (projectId: string) => [{ id: 'uuid', projectId, name: 'file.txt', clearance: 'private', createdAt: new Date() }], // Placeholder
  updateFile: async (fileId: string, data: Partial<File>) => ({ id: fileId, ...data }), // Placeholder
  deleteFile: async (fileId: string) => true, // Placeholder
};

export async function uploadIntent(projectId: string, fileName: string, res: Response): Promise<void> {
  try {
    const url = await presignPut({
      bucket: 'project-pandora-files',
      key: `projects/${projectId}/${fileName}`,
    });
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

export async function complete(data: unknown, res: Response): Promise<void> {
  const validation = parse(fileSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const file = await db.createFile(validation.data);
    return json(res, 201, file);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function listByProject(projectId: string, res: Response): Promise<void> {
  try {
    const files = await db.listFilesByProject(projectId);
    return json(res, 200, files);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function downloadIntent(fileId: string, res: Response): Promise<void> {
  try {
    const file = await db.getFile(fileId); // Assume db.getFile exists
    if (!file) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'File not found',
      });
    }
    const url = await presignGet({
      bucket: 'project-pandora-files',
      key: `projects/${file.projectId}/${file.name}`,
    });
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

export async function rename(data: unknown, res: Response): Promise<void> {
  const validation = parse(renameSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const file = await db.updateFile(validation.data.fileId, { name: validation.data.newName });
    return json(res, 200, file);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteFile(fileId: string, res: Response): Promise<void> {
  try {
    const success = await db.deleteFile(fileId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'File not found',
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

export async function changeClearance(data: unknown, res: Response): Promise<void> {
  const validation = parse(clearanceSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const file = await db.updateFile(validation.data.fileId, { clearance: validation.data.clearance });
    return json(res, 200, file);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}