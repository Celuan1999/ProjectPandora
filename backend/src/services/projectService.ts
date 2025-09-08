// src/services/projectService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';

const projectSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID for id' }),
  teamId: z.string().uuid({ message: 'Invalid UUID for teamId' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  createdAt: z.date().default(() => new Date()),
});

const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
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
  updateProject: async (id: string, data: Partial<Project>) => {
    // Mock: Fetch existing project and merge updates
    const existingProject = { id, teamId: 'team-uuid', name: 'Existing Project', createdAt: new Date() }; // Replace with DB fetch
    return { ...existingProject, ...data, id }; // Ensure all required fields
  },
  deleteProject: async (id: string) => true,
  listProjects: async () => [{ id: 'project-uuid', teamId: 'team-uuid', name: 'Test Project', createdAt: new Date() }],
  listFilesByProject: async (projectId: string) => [{ id: 'file-uuid', projectId, name: 'Test File', createdAt: new Date() }],
};

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createProject(data: unknown): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(projectSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project data' } };
  }
  try {
    const project = await db.createProject(validation.data);
    return { status: 201, data: project };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateProject(id: string, data: unknown): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid({ message: 'Invalid UUID for id' }), data: projectUpdateSchema }), { id, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project update data' } };
  }
  try {
    const project = await db.updateProject(id, validation.data.data);
    const validatedProject = projectSchema.parse(project); // Ensure full Project type
    return { status: 200, data: validatedProject };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteProject(id: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for id' }), id);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const success = await db.deleteProject(id);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function addProjectMember(data: unknown): Promise<{ status: number; data?: ProjectMember; error?: any }> {
  const validation = parse(projectMemberSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data' } };
  }
  try {
    const member = await db.addProjectMember(validation.data);
    return { status: 201, data: member };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeProjectMember(userId: string, projectId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.object({ userId: z.string().uuid({ message: 'Invalid UUID for userId' }), projectId: z.string().uuid({ message: 'Invalid UUID for projectId' }) }), { userId, projectId });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or project ID' } };
  }
  try {
    const success = await db.removeProjectMember(userId, projectId);
    if (!success) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project membership not found' } };
    }
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function listProjects(): Promise<{ status: number; data?: Project[]; error?: any }> {
  try {
    const projects = await db.listProjects();
    return { status: 200, data: projects };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function listFilesByProject(projectId: string): Promise<{ status: number; data?: any[]; error?: any }> {
  const validation = parse(z.string().uuid({ message: 'Invalid UUID for projectId' }), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const files = await db.listFilesByProject(projectId);
    return { status: 200, data: files };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}