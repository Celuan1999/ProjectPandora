// src/services/teamService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const teamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  orgId: z.string().uuid({ message: 'Invalid UUID for orgId' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const teamUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
});

const teamMemberSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
  teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }),
  role: z.enum(['lead', 'member']),
});

type Team = z.infer<typeof teamSchema>;
type TeamMember = z.infer<typeof teamMemberSchema>;

const db = {
  createTeam: async (data: Team) => ({ ...data }),
  addTeamMember: async (data: TeamMember) => ({ ...data }),
  removeTeamMember: async (userId: string, teamId: string) => true,
  updateTeam: async (id: string, data: Partial<Team>) => {
    // Mock: Simulate fetching the existing team and merging updates
    const existingTeam = { id, orgId: 'org-uuid', name: 'Existing Team', createdAt: new Date() }; // Replace with actual DB fetch
    return { ...existingTeam, ...data, id }; // Ensure all required fields are present
  },
  deleteTeam: async (id: string) => true,
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createTeam(data: unknown): Promise<{ status: number; data?: Team; error?: any }> {
  const validation = parse(teamSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team data' } };
  }
  try {
    const team = await db.createTeam(validation.data);
    return { status: 201, data: team };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateTeam(id: string, data: unknown): Promise<{ status: number; data?: Team; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid({ message: 'Invalid UUID for id' }), data: teamUpdateSchema }), { id, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team update data' } };
  }
  try {
    const team = await db.updateTeam(id, validation.data.data);
    // Validate the returned team against teamSchema to ensure type safety
    const validatedTeam = teamSchema.parse(team);
    return { status: 200, data: validatedTeam };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteTeam(id: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for id' }), id);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team ID' } };
  }
  try {
    const success = await db.deleteTeam(id);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Team not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function addTeamMember(data: unknown): Promise<{ status: number; data?: TeamMember; error?: any }> {
  const validation = parse(teamMemberSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team member data' } };
  }
  try {
    const member = await db.addTeamMember(validation.data);
    return { status: 201, data: member };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeTeamMember(userId: string, teamId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.object({ userId: z.string().uuid({ message: 'Invalid UUID for userId' }), teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }) }), { userId, teamId });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or team ID' } };
  }
  try {
    const success = await db.removeTeamMember(userId, teamId);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Team membership not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}