// src/services/auditService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const auditEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  resourceId: z.string().uuid(),
  resourceType: z.enum(['file', 'project', 'team', 'org']),
  timestamp: z.date(),
  details: z.record(z.string(), z.any()).optional(), // Fixed z.record
});

type AuditEvent = z.infer<typeof auditEventSchema>;

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function emit(data: unknown): Promise<{ status: number; data?: AuditEvent; error?: any }> {
  const validation = parse(auditEventSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid audit data' } };
  }
  try {
    const { data: event } = await supabase.from('audit_events').insert(validation.data).select().single();
    return { status: 201, data: event };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function list(filters: { resourceId?: string; userId?: string }): Promise<{ status: number; data?: AuditEvent[]; error?: any }> {
  try {
    let query = supabase.from('audit_events').select('*');
    if (filters.resourceId) query = query.eq('resourceId', filters.resourceId);
    if (filters.userId) query = query.eq('userId', filters.userId);
    const { data: events } = await query;
    const validatedEvents = z.array(auditEventSchema).parse(events || []);
    return { status: 200, data: validatedEvents };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getReassignments(): Promise<{ status: number; data?: AuditEvent[]; error?: any }> {
  try {
    const { data: events } = await supabase.from('audit_events').select('*').eq('action', 'reassign');
    const validatedEvents = z.array(auditEventSchema).parse(events || []);
    return { status: 200, data: validatedEvents };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function report(resourceId: string): Promise<{ status: number; data?: AuditEvent[]; error?: any }> {
  const validation = parse(z.string().uuid(), resourceId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid resource ID' } };
  }
  try {
    const { data: events } = await supabase.from('audit_events').select('*').eq('resourceId', resourceId);
    const validatedEvents = z.array(auditEventSchema).parse(events || []);
    return { status: 200, data: validatedEvents };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}