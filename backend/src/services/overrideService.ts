// src/services/overrideService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const overrideSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
  resourceId: z.string().uuid({ message: 'Invalid UUID for resourceId' }),
  resourceType: z.enum(['file', 'project', 'team']),
  permission: z.enum(['read', 'write', 'admin']),
  expiresAt: z.date().optional(),
});

type Override = z.infer<typeof overrideSchema>;

const db = {
  addOverride: async (data: Override) => ({ ...data }),
  removeOverride: async (id: string) => true,
  expireOverrides: async () => 0,
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function addOverride(data: unknown): Promise<{ status: number; data?: Override; error?: any }> {
  const validation = parse(overrideSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
  }
  try {
    const override = await db.addOverride(validation.data);
    return { status: 201, data: override };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeOverride(id: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for id' }), id);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
  }
  try {
    const success = await db.removeOverride(id);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function expireOverrides(): Promise<{ status: number; data?: { expired: number }; error?: any }> {
  try {
    const count = await db.expireOverrides();
    return { status: 200, data: { expired: count } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}