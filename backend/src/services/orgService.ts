// src/services/orgService.ts

import { z } from 'zod';
import { parse } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express'; // Adjust if using another framework

// Zod schemas
const orgSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  createdAt: z.date().default(() => new Date()),
});

const membershipSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer']),
});

type Organization = z.infer<typeof orgSchema>;
type Membership = z.infer<typeof membershipSchema>;

// Mock database (replace with Prisma, TypeORM, etc.)
const db = {
  createOrg: async (data: Organization) => ({ ...data }), // Placeholder
  getOrg: async (id: string) => ({ id, name: 'Example Org', createdAt: new Date() }), // Placeholder
  addMember: async (data: Membership) => ({ ...data }), // Placeholder
  removeMember: async (userId: string, orgId: string) => true, // Placeholder
};

/**
 * Creates a new organization
 */
export async function createOrg(data: unknown, res: Response): Promise<void> {
  const validation = parse(orgSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const org = await db.createOrg(validation.data);
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

/**
 * Adds a member to an organization
 */
export async function addMember(data: unknown, res: Response): Promise<void> {
  const validation = parse(membershipSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const membership = await db.addMember(validation.data);
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

/**
 * Removes a member from an organization
 */
export async function removeMember(userId: string, orgId: string, res: Response): Promise<void> {
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