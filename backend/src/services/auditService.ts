// src/services/auditService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

const auditEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string().min(1, 'Action is required'),
  resourceId: z.string().uuid(),
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
};

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function emit(data: unknown, res: Response): Promise<void> {
  const validation = parse(auditEventSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid audit event data',
    });
  }

  const eventData = validation.data;
  try {
    const event = await db.emitEvent(eventData);
    return json(res, 201, event);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function list(filters: { resourceId?: string; userId?: string }, res: Response): Promise<void> {
  try {
    const events = await db.listEvents(filters);
    return json(res, 200, events);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function report(resourceId: string, res: Response): Promise<void> {
  const validation = parse(z.object({ resourceId: z.string().uuid() }), { resourceId });
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid resource ID',
    });
  }

  try {
    const events = await db.listEvents({ resourceId });
    const report = {
      resourceId,
      totalEvents: events.length,
      actions: events.map((e) => e.action),
    };
    return json(res, 200, report);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}