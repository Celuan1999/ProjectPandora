// src/services/projectService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { json, problemJson } from '../lib/responses';
import { Response } from 'express';

const projectSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  createdAt: z.date().default(() => new Date()),
});

const projectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
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

export async function createProject(data: unknown, res: Response): Promise<void> {
  const validation = parse(projectSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid project data',
    });
  }

  const projectData = validation.data;
  try {
    const project = await db.createProject(projectData);
    return json(res, 201, project);
  } catch (error) {
    return problemJson(res, 500, {
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function addProjectMember(data: unknown, res: Response): Promise<void> {
  const validation = parse(projectMemberSchema, data);
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data',
    });
  }

  const memberData = validation.data;
  try {
    const member = await db.addProjectMember(memberData);
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

export async function removeProjectMember(userId: string, projectId: string, res: Response): Promise<void> {
  const validation = parse(
    z.object({ userId: z.string().uuid(), projectId: z.string().uuid() }),
    { userId, projectId }
  );
  if (!isValid(validation)) {
    return problemJson(res, 400, {
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: validation.error?.format()._errors.join(', ') || 'Invalid user or project ID',
    });
  }

  try {
    const success = await db.removeProjectMember(userId, projectId);
    if (!success) {
      return problemJson(res, 404, {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Project membership not found',
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