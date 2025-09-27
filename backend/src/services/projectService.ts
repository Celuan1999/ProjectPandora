// src/services/projectService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  description: z.string().nullish(),
  teamId: z.number().nullish(),
  budget_amount: z.number().nullish(),
  budget_currency: z.string().nullish(),
  deadline: z.string().nullish(),
  owner_id: z.number().nullish(),
  updated_at: z.string().nullish(),
  project_type: z.string().nullish(),
  security_level: z.string().nullish()
});

const projectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.number().optional(),
  budget_amount: z.number().optional(),
  budget_currency: z.string().optional(),
  deadline: z.string().optional(),
  owner_id: z.number().optional(),
  project_type: z.string().optional(),
  security_level: z.string().optional()
});

const projectMemberSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
});

type Project = z.infer<typeof projectSchema>;
type ProjectMember = z.infer<typeof projectMemberSchema>;

function isValid<T>(validation: ValidationResult<T>): validation is { success: true; data: T } {
  return validation.success;
}

export async function createProject(data: unknown): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(projectCreateSchema, data);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project data' } };
  }
  try {
    const projectData = {
      ...validation.data,
      id: Math.floor(Math.random() * 1000000), // Generate a random number ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    if (!project || error) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project creation failed' } };
    }
    const validatedProject = projectSchema.parse(project);
    return { status: 201, data: validatedProject };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function listProjects(): Promise<{ status: number; data?: Project[]; error?: any }> {
  try {
    const { data: projects } = await supabase.from('projects').select('*');
    const validatedProjects = z.array(projectSchema).parse(projects || []);
    return { status: 200, data: validatedProjects };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getProject(projectId: number): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(z.number(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
    }
    const validatedProject = projectSchema.parse(project);
    return { status: 200, data: validatedProject };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateProject(projectId: number, data: unknown): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(z.object({ id: z.string().uuid(), data: z.object({ name: z.string().min(1).optional() }) }), { id: projectId, data });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project data' } };
  }
  try {
    const { data: project } = await supabase.from('projects').update(validation.data.data).eq('id', projectId).select().single();
    if (!project) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
    }
    const validatedProject = projectSchema.parse(project);
    return { status: 200, data: validatedProject };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteProject(projectId: number): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.string().uuid(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    await supabase.from('projects').delete().eq('id', projectId);
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
    const { data: member } = await supabase.from('project_members').insert(validation.data).select().single();
    return { status: 201, data: member };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function listProjectMembers(projectId: string): Promise<{ status: number; data?: ProjectMember[]; error?: any }> {
  const validation = parse(z.string().uuid(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const { data: members } = await supabase.from('project_members').select('*').eq('projectId', projectId);
    const validatedMembers = z.array(projectMemberSchema).parse(members || []);
    return { status: 200, data: validatedMembers };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function removeProjectMember(userId: string, projectId: string): Promise<{ status: number; data?: null; error?: any }> {
  const validation = parse(z.object({ userId: z.string().uuid(), projectId: z.string().uuid() }), { userId, projectId });
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data' } };
  }
  try {
    await supabase.from('project_members').delete().eq('userId', userId).eq('projectId', projectId);
    return { status: 204, data: null };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getProjectSummary(projectId: string): Promise<{ status: number; data?: any; error?: any }> {
  const validation = parse(z.string().uuid(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }
  try {
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
    }
    const { data: members } = await supabase.from('project_members').select('userId, role').eq('projectId', projectId);
    const { data: files } = await supabase.from('files').select('id, name, clearance').eq('projectId', projectId);
    const summary = {
      project: projectSchema.parse(project),
      memberCount: members?.length || 0,
      fileCount: files?.length || 0,
    };
    return { status: 200, data: summary };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}