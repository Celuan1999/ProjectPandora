// src/services/userService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
});

const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
});

type User = z.infer<typeof userSchema>;

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createUser(data: unknown): Promise<{ status: number; data?: User; error?: any }> {
  const validation = parse(userCreateSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user data' } };
  }
  try {
    const { data: user } = await supabase.from('users').insert({ ...validation.data, id: crypto.randomUUID() }).select().single();
    if (!user) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User creation failed' } };
    }
    const validatedUser = userSchema.parse(user);
    return { status: 201, data: validatedUser };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getUsers(): Promise<{ status: number; data?: User[]; error?: any }> {
  try {
    const { data: users } = await supabase.from('users').select('*');
    const validatedUsers = z.array(userSchema).parse(users || []);
    return { status: 200, data: validatedUsers };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateUser(id: string, data: unknown): Promise<{ status: number; data?: User; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid(), data: z.object({ name: z.string().min(1).optional(), email: z.string().email().optional(), role: z.enum(['admin', 'member', 'viewer']).optional() }) }), { id, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid update data' } };
  }
  try {
    const { data: user } = await supabase.from('users').update(validation.data.data).eq('id', id).select().single();
    if (!user) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
    }
    const validatedUser = userSchema.parse(user);
    return { status: 200, data: validatedUser };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getUser(userId: string): Promise<{ status: number; data?: User; error?: any }> {
  const validation = parse(z.string().uuid(), userId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
  }
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
    }
    return { status: 200, data: user };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteUser(userId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid(), userId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
  }
  try {
    await supabase.from('users').delete().eq('id', userId);
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}