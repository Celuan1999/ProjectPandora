// src/services/orgService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation'; // Explicit import
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

// Zod schemas
const orgSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const membershipSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer']),
});

type Organization = z.infer<typeof orgSchema>;
type Membership = z.infer<typeof membershipSchema>;

const db = {
  createOrg: async (data: Organization) => ({ ...data }),
  getOrg: async (id: string) => ({ id, name: 'Example Org', createdAt: new Date() }),
  addMember: async (data: Membership) => ({ ...data }),
  removeMember: async (userId: string, orgId: string) => true,
};

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createOrg(data: unknown, res: Response): Promise<void> {
  const validation = parse(orgSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid organization data',
    });
  }

  const orgData = validation.data; // Type-safe
  try {
    const org = await db.createOrg(orgData);
    return json(res, 201, org);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function addMember(data: unknown, res: Response): Promise<void> {
  const validation = parse(membershipSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid membership data',
    });
  }

  const membershipData = validation.data; // Type-safe
  try {
    const membership = await db.addMember(membershipData);
    return json(res, 201, membership);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function removeMember(userId: string, orgId: string, res: Response): Promise<void> {
  const validation = parse(
    z.object({ userId: z.string().uuid(), orgId: z.string().uuid() }),
    { userId, orgId }
  );
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid user or organization ID',
    });
  }

  try {
    const success = await db.removeMember(userId, orgId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Membership not found',
      });
    }
    return json(res, 204, null);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}