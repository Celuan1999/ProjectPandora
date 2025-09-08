// src/services/auditService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const auditEventSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
  action: z.string().min(1, 'Action is required'),
  resourceId: z.string().uuid({ message: 'Invalid UUID for resourceId' }),
  resourceType: z.enum(['file', 'project', 'team', 'org']),
  timestamp: z.date().default(() => new Date()),
  details: z.object({}).optional(),
});

type AuditEvent = z.infer<typeof auditEventSchema>;

const db = {
  emitEvent: async (data: AuditEvent) => ({ ...data }),
  listEvents: async (filters: { resourceId?: string; userId?: string }) => [
    { id: 'uuid', userId: 'user-uuid', action: 'view', resourceId: 'resource-uuid', resourceType: 'file', timestamp: new Date() },
  ],
  getReassignments: async () => [{ id: 'uuid', userId: 'user-uuid', action: 'reassign', resourceId: 'resource-uuid', resourceType: 'project', timestamp: new Date() }],
  getProjectSummary: async (projectId: string) => ({
    projectId,
    totalEvents: 10,
    actions: ['view', 'edit'],
  }),
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function emit(data: unknown): Promise<{ status: number; data?: AuditEvent; error?: any }> {
  const validation = parse(auditEventSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid audit event data' } };
  }
  try {
    const event = await db.emitEvent(validation.data);
    return { status: 201, data: event };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function list(filters: { resourceId?: string; userId?: string }): Promise<{ status: number; data?: AuditEvent[]; error?: any }> {
  try {
    const events = await db.listEvents(filters);
    return { status: 200, data: events };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function report(resourceId: string): Promise<{ status: number; data?: any; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for resourceId' }), resourceId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid resource ID' } };
  }
  try {
    const events = await db.listEvents({ resourceId });
    const report = { resourceId, totalEvents: events.length, actions: events.map((e) => e.action) };
    return { status: 200, data: report };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getReassignments(): Promise<{ status: number; data?: AuditEvent[]; error?: any }> {
  try {
    const events = await db.getReassignments();
    return { status: 200, data: events };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getProjectSummary(projectId: string): Promise<{ status: number; data?: any; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for projectId' }), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const summary = await db.getProjectSummary(projectId);
    return { status: 200, data: summary };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}