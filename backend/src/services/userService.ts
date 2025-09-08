// src/services/userService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const userSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
});

type User = z.infer<typeof userSchema>;

const db = {
  createUser: async (data: User) => ({ ...data }),
  updateUser: async (id: string, data: Partial<User>) => ({ id, ...data }),
  deleteUser: async (id: string) => true,
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createUser(data: unknown): Promise<{ status: number; data?: User; error?: any }> {
  const validation = parse(userSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user data' } };
  }
  try {
    const user = await db.createUser(validation.data);
    return { status: 201, data: user };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateUser(id: string, data: unknown): Promise<{ status: number; data?: User; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid({ message: 'Invalid UUID for id' }), data: userUpdateSchema }), { id, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user update data' } };
  }
  try {
    const user = await db.updateUser(id, validation.data.data);
    return { status: 200, data: user };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteUser(id: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for id' }), id);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
  }
  try {
    const success = await db.deleteUser(id);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}