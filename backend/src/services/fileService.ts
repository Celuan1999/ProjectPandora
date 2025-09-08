// src/services/fileService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { storeFile, getFile } from '../lib/storage';

const fileSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  projectId: z.string().uuid({ message: 'Invalid UUID for projectId' }),
  name: z.string().min(1, 'Name is required').max(255),
  clearance: z.enum(['public', 'private', 'restricted']).default('private'),
  createdAt: z.date().default(() => new Date()),
});

const renameSchema = z.object({
  fileId: z.string().uuid({ message: 'Invalid UUID for fileId' }),
  newName: z.string().min(1, 'Name is required').max(255),
});

const clearanceSchema = z.object({
  fileId: z.string().uuid({ message: 'Invalid UUID for fileId' }),
  clearance: z.enum(['public', 'private', 'restricted']),
});

type File = z.infer<typeof fileSchema>;

const db = {
  createFile: async (data: File) => ({ ...data }),
  listFilesByProject: async (projectId: string) => [{ id: 'file-uuid', projectId, name: 'file.txt', clearance: 'private', createdAt: new Date() }],
  updateFile: async (fileId: string, data: Partial<File>) => ({ id: fileId, ...data }),
  deleteFile: async (fileId: string) => true,
  getFile: async (fileId: string) => ({ id: fileId, projectId: 'project-uuid', name: 'file.txt', clearance: 'private', createdAt: new Date() }),
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function uploadIntent(projectId: string, fileName: string): Promise<{ status: number; data?: { filePath: string }; error?: any }> {
  const validation = parse(z.object({ projectId: z.string().uuid({ message: 'Invalid UUID for projectId' }), fileName: z.string().min(1) }), { projectId, fileName });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid input' } };
  }
  try {
    const filePath = await storeFile({ projectId, fileName });
    return { status: 200, data: { filePath } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function complete(data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(fileSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file data' } };
  }
  try {
    const file = await db.createFile(validation.data);
    return { status: 201, data: file };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function listByProject(projectId: string): Promise<{ status: number; data?: File[]; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for projectId' }), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const files = await db.listFilesByProject(projectId);
    return { status: 200, data: files };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function downloadIntent(fileId: string): Promise<{ status: number; data?: { filePath: string }; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for fileId' }), fileId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
  }
  try {
    const file = await db.getFile(fileId);
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    const filePath = await getFile({ projectId: file.projectId, fileName: file.name });
    return { status: 200, data: { filePath } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function rename(data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(renameSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid rename data' } };
  }
  try {
    const file = await db.updateFile(validation.data.fileId, { name: validation.data.newName });
    return { status: 200, data: file };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateFile(id: string, data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid({ message: 'Invalid UUID for id' }), data: fileSchema.partial() }), { id, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file update data' } };
  }
  try {
    const file = await db.updateFile(id, validation.data.data);
    return { status: 200, data: file };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteFile(fileId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for fileId' }), fileId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
  }
  try {
    const success = await db.deleteFile(fileId);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function changeClearance(data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(clearanceSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid clearance data' } };
  }
  try {
    const file = await db.updateFile(validation.data.fileId, { clearance: validation.data.clearance });
    return { status: 200, data: file };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}