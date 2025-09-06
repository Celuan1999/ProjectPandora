// src/services/fileService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { storeFile, getFile } from '../lib/storage';
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
  createFile: async (data: File) => ({ ...data }),
  listFilesByProject: async (projectId: string) => [
    { id: 'uuid', projectId, name: 'file.txt', clearance: 'private', createdAt: new Date() },
  ],
  updateFile: async (fileId: string, data: Partial<File>) => ({ id: fileId, ...data }),
  deleteFile: async (fileId: string) => true,
  getFile: async (fileId: string) => ({
    id: fileId,
    projectId: 'project-uuid',
    name: 'file.txt',
    clearance: 'private',
    createdAt: new Date(),
  }),
};

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function uploadIntent(projectId: string, fileName: string, res: Response): Promise<void> {
  try {
    const filePath = await storeFile({ projectId, fileName });
    return json(res, 200, { filePath }); // Return local file path for client to upload to
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
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid file data',
    });
  }

  const fileData = validation.data;
  try {
    const file = await db.createFile(fileData);
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
    const file = await db.getFile(fileId);
    if (!file) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'File not found',
      });
    }
    const filePath = await getFile({ projectId: file.projectId, fileName: file.name });
    return json(res, 200, { filePath }); // Return file path for download
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
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid rename data',
    });
  }

  const renameData = validation.data;
  try {
    const file = await db.updateFile(renameData.fileId, { name: renameData.newName });
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
    const file = await db.getFile(fileId);
    if (!file) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'File not found',
      });
    }
    await db.deleteFile(fileId);
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
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid clearance data',
    });
  }

  const clearanceData = validation.data;
  try {
    const file = await db.updateFile(clearanceData.fileId, { clearance: clearanceData.clearance });
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