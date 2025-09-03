// src/services/overrideService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

const overrideSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  resourceId: z.string().uuid(),
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

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function addOverride(data: unknown, res: Response): Promise<void> {
  const validation = parse(overrideSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid override data',
    });
  }

  const overrideData = validation.data; // Type-safe
  try {
    const override = await db.addOverride(overrideData);
    return json(res, 201, override);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ... (removeOverride and expireOverrides unchanged)