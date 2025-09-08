// src/services/orgService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const orgSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const membershipSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
  orgId: z.string().uuid({ message: 'Invalid UUID for orgId' }),
  role: z.enum(['admin', 'member', 'viewer']),
});

type Organization = z.infer<typeof orgSchema>;
type Membership = z.infer<typeof membershipSchema>;

const db = {
  createOrg: async (data: Organization) => ({ ...data }),
  addMember: async (data: Membership) => ({ ...data }),
  removeMember: async (userId: string, orgId: string) => true,
  getUserOrg: async (userId: string) => ({ id: 'org-uuid', name: 'Test Org', createdAt: new Date() }),
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createOrg(data: unknown): Promise<{ status: number; data?: Organization; error?: any }> {
  const validation = parse(orgSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid org data' } };
  }
  try {
    const org = await db.createOrg(validation.data);
    return { status: 201, data: org };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function addMember(data: unknown): Promise<{ status: number; data?: Membership; error?: any }> {
  const validation = parse(membershipSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid membership data' } };
  }
  try {
    const member = await db.addMember(validation.data);
    return { status: 201, data: member };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeMember(userId: string, orgId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.object({ userId: z.string().uuid({ message: 'Invalid UUID for userId' }), orgId: z.string().uuid({ message: 'Invalid UUID for orgId' }) }), { userId, orgId });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or org ID' } };
  }
  try {
    const success = await db.removeMember(userId, orgId);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Membership not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getUserOrg(userId: string): Promise<{ status: number; data?: Organization; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for userId' }), userId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
  }
  try {
    const org = await db.getUserOrg(userId);
    if (!org) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Organization not found' } };
    }
    return { status: 200, data: org };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}