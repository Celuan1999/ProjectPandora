// src/services/teamService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

const teamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }), // Fixed deprecation
  orgId: z.string().uuid({ message: 'Invalid UUID for orgId' }), // Fixed deprecation
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const teamMemberSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }), // Fixed deprecation
  teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }), // Fixed deprecation
  role: z.enum(['lead', 'member']),
});

type Team = z.infer<typeof teamSchema>;
type TeamMember = z.infer<typeof teamMemberSchema>;

const db = {
  createTeam: async (data: Team) => ({ ...data }),
  addTeamMember: async (data: TeamMember) => ({ ...data }),
  removeTeamMember: async (userId: string, teamId: string) => true,
};

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createTeam(data: unknown, res: Response): Promise<void> {
  const validation = parse(teamSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid team data',
    });
  }

  const teamData = validation.data;
  try {
    const team = await db.createTeam(teamData);
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
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid team member data',
    });
  }

  const memberData = validation.data;
  try {
    const member = await db.addTeamMember(memberData);
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
  const validation = parse(
    z.object({
      userId: z.string().uuid({ message: 'Invalid UUID for userId' }), // Fixed deprecation
      teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }), // Fixed deprecation
    }),
    { userId, teamId }
  );
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid user or team ID',
    });
  }

  try {
    const success = await db.removeTeamMember(userId, teamId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Team membership not found',
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