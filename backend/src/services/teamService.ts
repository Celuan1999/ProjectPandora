// src/services/teamService.ts

import { z } from 'zod';
import { parse } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

const teamSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  createdAt: z.date().default(() => new Date()),
});

const teamMemberSchema = z.object({
  userId: z.string().uuid(),
  teamId: z.string().uuid(),
  role: z.enum(['lead', 'member']),
});

type Team = z.infer<typeof teamSchema>;
type TeamMember = z.infer<typeof teamMemberSchema>;

const db = {
  createTeam: async (data: Team) => ({ ...data }), // Placeholder
  addTeamMember: async (data: TeamMember) => ({ ...data }), // Placeholder
  removeTeamMember: async (userId: string, teamId: string) => true, // Placeholder
};

export async function createTeam(data: unknown, res: Response): Promise<void> {
  const validation = parse(teamSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const team = await db.createTeam(validation.data);
    return json(res, 201, team);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function addTeamMember(data: unknown, res: Response): Promise<void> {
  const validation = parse(teamMemberSchema, data);
  if (!validation.success) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.message,
    });
  }
  try {
    const member = await db.addTeamMember(validation.data);
    return json(res, 201, member);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function removeTeamMember(userId: string, teamId: string, res: Response): Promise<void> {
  try {
    const success = await db.removeTeamMember(userId, teamId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Team member not found',
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