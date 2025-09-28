// src/services/projectService.ts

import { z } from 'zod';
import { parse, ValidationResult } from '../lib/validation';
import { createClient } from '@supabase/supabase-js';
import { getUserClearanceSimple } from '../lib/userUtils';

// Security level to clearance number mapping
const SECURITY_LEVEL_MAP: Record<string, number> = {
  'UNCLASSIFIED': 0,
  'CLASSIFIED': 1,
  'SECRET': 2,
  'TOP_SECRET': 3,
  'P2P': 4
};

/**
 * Converts a security level string to a clearance number
 * @param securityLevel - The security level string from the database
 * @returns The corresponding clearance number (0-4)
 */
function getSecurityLevelNumber(securityLevel: string | null): number {
  if (!securityLevel) return 0; // Default to Unclassified if null
  return SECURITY_LEVEL_MAP[securityLevel] ?? 0;
}

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
  security_level: z.string().nullish(),
  image_url: z.string().nullish(),
  image_filename: z.string().nullish()
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

export async function listProjects(userId: string): Promise<{ status: number; data?: Project[]; error?: any }> {
  try {
    // Fetch the user's clearance level and grantedProjects
    const { clearance } = await getUserClearanceSimple(userId);
    
    // Get user's granted projects
    const { data: userData } = await supabase
      .from('users')
      .select('grantedProjects')
      .eq('userId', userId)
      .single();
    
    const grantedProjects = userData?.grantedProjects || [];
    
    // If user clearance is null and no granted projects, return empty array
    if (clearance === null && grantedProjects.length === 0) {
      return { status: 200, data: [] };
    }
    
    // Get all projects
    const { data: projects } = await supabase.from('projects').select('*');
    
    // Filter projects based on user's clearance level OR if project is in grantedProjects
    const accessibleProjects = (projects || []).filter(project => {
      const projectSecurityLevel = getSecurityLevelNumber(project.security_level);
      
      // User can access projects at their clearance level or below
      const hasClearanceAccess = clearance !== null && projectSecurityLevel <= clearance;
      
      // User can access projects that are in their grantedProjects array
      const hasGrantedAccess = grantedProjects.includes(project.id);
      
      return hasClearanceAccess || hasGrantedAccess;
    });
    
    const validatedProjects = z.array(projectSchema).parse(accessibleProjects);
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

export async function listInaccessibleProjects(userId: string): Promise<{ status: number; data?: { id: number; name: string; description: string | null }[]; error?: any }> {
  try {
    // Fetch the user's clearance level
    const { clearance } = await getUserClearanceSimple(userId);
    
    // Get user's granted projects
    const { data: userData } = await supabase
      .from('users')
      .select('grantedProjects')
      .eq('userId', userId)
      .single();
    
    const grantedProjects = userData?.grantedProjects || [];
    
    // If user clearance is null and no granted projects, return all projects (since they have no access to any)
    if (clearance === null && grantedProjects.length === 0) {
      const { data: allProjects } = await supabase.from('projects').select('id, name, description');
      return { status: 200, data: allProjects || [] };
    }
    
    // Get all projects
    const { data: projects } = await supabase.from('projects').select('id, name, description, security_level');
    
    // Filter projects that the user doesn't have access to (above their clearance level AND not in grantedProjects)
    const inaccessibleProjects = (projects || []).filter(project => {
      const projectSecurityLevel = getSecurityLevelNumber(project.security_level);
      
      // User cannot access projects above their clearance level
      const aboveClearanceLevel = clearance !== null && projectSecurityLevel > clearance;
      
      // Exclude projects that are already granted access
      const notGranted = !grantedProjects.includes(project.id);
      
      // Return projects that are above clearance level AND not already granted
      return aboveClearanceLevel && notGranted;
    });
    
    // Return id, name and description
    const filteredProjects = inaccessibleProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description
    }));
    
    return { status: 200, data: filteredProjects };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function grantProjectAccess(userId: string, projectId: number): Promise<{ status: number; data?: any; error?: any }> {
  try {
    // Get current user data to fetch existing grantedProjects array
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('grantedProjects')
      .eq('userId', userId)
      .single();

    if (fetchError || !userData) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
    }

    // Get current grantedProjects array or initialize as empty array
    const currentGrantedProjects = userData.grantedProjects || [];
    
    // Check if projectId is already in the array
    if (currentGrantedProjects.includes(projectId)) {
      return { status: 400, error: { type: '/errors/duplicate', title: 'Duplicate Request', status: 400, detail: 'Project access already granted' } };
    }

    // Add projectId to the array
    const updatedGrantedProjects = [...currentGrantedProjects, projectId];

    // Update the user's grantedProjects array
    const { error: updateError } = await supabase
      .from('users')
      .update({ grantedProjects: updatedGrantedProjects })
      .eq('userId', userId);

    if (updateError) {
      return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: 'Failed to grant project access' } };
    }

    return { status: 200, data: { message: 'Project access granted successfully', projectId } };
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

export async function uploadProjectImage(projectId: number, imageFile: File): Promise<{ status: number; data?: Project; error?: any }> {
  const validation = parse(z.number(), projectId);
  if (!isValid(validation)) {
    return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
  }

  try {
    // Check if project exists
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !existingProject) {
      return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const filename = `project-${projectId}-${timestamp}.${fileExtension}`;
    const filePath = `projectImages/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('projectImages')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { status: 500, error: { type: '/errors/server-error', title: 'Upload Failed', status: 500, detail: `Failed to upload image: ${uploadError.message}` } };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('projectImages')
      .getPublicUrl(filePath);

    // Update project with image information
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        image_url: urlData.publicUrl,
        image_filename: filename,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError || !updatedProject) {
      // If update fails, try to clean up the uploaded file
      await supabase.storage.from('projectImages').remove([filePath]);
      return { status: 500, error: { type: '/errors/server-error', title: 'Update Failed', status: 500, detail: 'Failed to update project with image information' } };
    }

    const validatedProject = projectSchema.parse(updatedProject);
    return { status: 200, data: validatedProject };
  } catch (error) {
    return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
  }
}