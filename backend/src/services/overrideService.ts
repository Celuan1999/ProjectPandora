// src/services/overrideService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const overrideSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  resourceId: z.string().uuid(),
  resourceType: z.enum(['file', 'project']),
  clearance: z.enum(['public', 'private', 'restricted']),
  expiresAt: z.date().optional(),
});

const overrideCreateSchema = z.object({
  userId: z.string().uuid(),
  resourceId: z.string().uuid(),
  resourceType: z.enum(['file', 'project']),
  clearance: z.enum(['public', 'private', 'restricted']),
  expiresAt: z.date().optional(),
});

type Override = z.infer<typeof overrideSchema>;

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function addOverride(data: unknown): Promise<{ status: number; data?: Override; error?: any }> {
  const validation = parse(overrideCreateSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
  }
  try {
    const { data: override } = await supabase
      .from('overrides')
      .insert({ ...validation.data, id: crypto.randomUUID() })
      .select()
      .single();
    if (!override) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override creation failed' } };
    }
    const validatedOverride = overrideSchema.parse(override);
    return { status: 201, data: validatedOverride };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getOverride(overrideId: string): Promise<{ status: number; data?: Override; error?: any }> {
  const validation = parse(z.string().uuid(), overrideId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
  }
  try {
    const { data: override } = await supabase.from('overrides').select('*').eq('id', overrideId).single();
    if (!override) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
    }
    const validatedOverride = overrideSchema.parse(override);
    return { status: 200, data: validatedOverride };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateOverride(overrideId: string, data: unknown): Promise<{ status: number; data?: Override; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid(), data: z.object({ clearance: z.enum(['public', 'private', 'restricted']).optional(), expiresAt: z.date().optional() }) }), { id: overrideId, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
  }
  try {
    const { data: override } = await supabase.from('overrides').update(validation.data.data).eq('id', overrideId).select().single();
    if (!override) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
    }
    const validatedOverride = overrideSchema.parse(override);
    return { status: 200, data: validatedOverride };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteOverride(overrideId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid(), overrideId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
  }
  try {
    await supabase.from('overrides').delete().eq('id', overrideId);
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeOverride(overrideId: string): Promise<{ status: number; data?: null; error?: any }> {
  return deleteOverride(overrideId); // Alias for deleteOverride
}

export async function expireOverrides(): Promise<{ status: number; data?: any; error?: any }> {
  try {
    const { data: expiredOverrides } = await supabase
      .from('overrides')
      .delete()
      .lte('expiresAt', new Date().toISOString())
      .not('expiresAt', 'is', null)
      .select();
    return { status: 200, data: { expired: expiredOverrides?.length || 0 } };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}