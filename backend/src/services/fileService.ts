// src/services/fileService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const fileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  clearance: z.enum(['public', 'private', 'restricted']),
  createdAt: z.date(),
});

const fileUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  clearance: z.enum(['public', 'private', 'restricted']).optional(),
});

type File = z.infer<typeof fileSchema>;

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function listByProject(projectId: string): Promise<{ status: number; data?: File[]; error?: any }> {
  const validation = parse(z.string().uuid(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const { data: files } = await supabase.from('files').select('*').eq('projectId', projectId);
    if (!files) {
      return { status: 200, data: [] };
    }
    const validatedFiles = z.array(fileSchema).parse(files);
    return { status: 200, data: validatedFiles };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function rename(data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(fileUpdateSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid rename data' } };
  }
  try {
    const { data: file } = await supabase.from('files').select('*').eq('id', validation.data.id).single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    if (validation.data.name) {
      const oldPath = path.join('Uploads', file.projectId, file.name);
      const newPath = path.join('Uploads', file.projectId, validation.data.name);
      await fs.rename(oldPath, newPath);
    }
    const { data: updatedFile } = await supabase
      .from('files')
      .update({ name: validation.data.name || file.name })
      .eq('id', validation.data.id)
      .select()
      .single();
    if (!updatedFile) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found after update' } };
    }
    const validatedFile = fileSchema.parse(updatedFile);
    return { status: 200, data: validatedFile };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateFile(id: string, data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(fileUpdateSchema.omit({ id: true }), data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid update data' } };
  }
  try {
    const { data: file } = await supabase.from('files').select('*').eq('id', id).single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    if (validation.data.name) {
      const oldPath = path.join('Uploads', file.projectId, file.name);
      const newPath = path.join('Uploads', file.projectId, validation.data.name);
      await fs.rename(oldPath, newPath);
    }
    const { data: updatedFile } = await supabase
      .from('files')
      .update({
        name: validation.data.name || file.name,
        clearance: validation.data.clearance || file.clearance,
      })
      .eq('id', id)
      .select()
      .single();
    if (!updatedFile) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found after update' } };
    }
    const validatedFile = fileSchema.parse(updatedFile);
    return { status: 200, data: validatedFile };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function changeClearance(data: unknown): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid(), clearance: z.enum(['public', 'private', 'restricted']) }), data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid clearance data' } };
  }
  try {
    const { data: file } = await supabase
      .from('files')
      .update({ clearance: validation.data.clearance })
      .eq('id', validation.data.id)
      .select()
      .single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    const validatedFile = fileSchema.parse(file);
    return { status: 200, data: validatedFile };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function uploadIntent(projectId: string, name: string): Promise<{ status: number; data?: any; error?: any }> {
  const validation = parse(z.object({ projectId: z.string().uuid(), name: z.string().min(1) }), { projectId, name });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid upload intent data' } };
  }
  try {
    const filePath = path.join('Uploads', projectId, name);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return { status: 200, data: { filePath } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function downloadIntent(fileId: string): Promise<{ status: number; data?: any; error?: any }> {
  const validation = parse(z.string().uuid(), fileId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
  }
  try {
    const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    const filePath = path.join('Uploads', file.projectId, file.name);
    await fs.access(filePath);
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
    const { data: file } = await supabase.from('files').insert(validation.data).select().single();
    return { status: 201, data: file };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteFile(fileId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid(), fileId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
  }
  try {
    const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    const filePath = path.join('Uploads', file.projectId, file.name);
    await fs.unlink(filePath);
    await supabase.from('files').delete().eq('id', fileId);
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getFile(fileId: string): Promise<{ status: number; data?: File; error?: any }> {
  const validation = parse(z.string().uuid(), fileId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
  }
  try {
    const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
    if (!file) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
    }
    const validatedFile = fileSchema.parse(file);
    return { status: 200, data: validatedFile };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}