// src/services/projectService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const projectSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const projectMemberSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
  projectId: z.string().uuid({ message: 'Invalid UUID for projectId' }),
  role: z.enum(['lead', 'member']),
});

type Project = z.infer<typeof projectSchema>;
type ProjectMember = z.infer<typeof projectMemberSchema>;

const db = {
  createProject: async (data: Project) => ({ ...data }),
  addProjectMember: async (data: ProjectMember) => ({ ...data }),
  removeProjectMember: async (userId: string, projectId: string) => true,
};

// Type guard
function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createProject(data: unknown): Promise<{ status: number; data?: Project; error?: { type: string; title: string; status: number; detail: string }> {
  const validation = parse(projectSchema, data);
  if (!isValid(validation)) {
    return {
      status: 400,
      error: {
        type: '/errors/invalid-input',
        title: 'Invalid Input',
        status: 400,
        detail: validation.error?.format()._errors.join(', ') || 'Invalid project data',
      },
    };
  }

  try {
    const project = await db.createProject(validation.data);
    return { status: 201, data: project };
  } catch (error) {
    return {
      status: 500,
      error: {
        type: '/errors/server-error',
        title: 'Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

export async function addProjectMember(data: unknown): Promise<{ status: number; data?: ProjectMember; error?: { type: string; title: string; status: number; detail: string }> {
  const validation = parse(projectMemberSchema, data);
  if (!isValid(validation)) {
    return {
      status: 400,
      error: {
        type: '/errors/invalid-input',
        title: 'Invalid Input',
        status: 400,
        detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data',
      },
    };
  }

  try {
    const member = await db.addProjectMember(validation.data);
    return { status: 201, data: member };
  } catch (error) {
    return {
      status: 500,
      error: {
        type: '/errors/server-error',
        title: 'Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

export async function removeProjectMember(userId: string, projectId: string): Promise<{ status: number; data?: null; error?: { type: string; title: string; status: number; detail: string }> {
  const validation = parse(
    z.object({
      userId: z.string().uuid({ message: 'Invalid UUID for userId' }),
      projectId: z.string().uuid({ message: 'Invalid UUID for projectId' }),
    }),
    { userId, projectId }
  );
  if (!isValid(validation)) {
    return {
      status: 400,
      error: {
        type: '/errors/invalid-input',
        title: 'Invalid Input',
        status: 400,
        detail: validation.error?.format()._errors.join(', ') || 'Invalid user or project ID',
      },
    };
  }

  try {
    const success = await db.removeProjectMember(userId, projectId);
    if (!success) {
      return {
        status: 404,
        error: {
          type: '/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: 'Project membership not found',
        },
      };
    }
    return { status: 204, data: null };
  } catch (error) {
    return {
      status: 500,
      error: {
        type: '/errors/server-error',
        title: 'Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}