// backend/src/services/project.ts
import { supabase } from '../../lib/supabaseServer';
import { logger } from '../../lib/logger';
import { Project } from '../../types/models';
import { AUDIT_EVENTS } from '../../types/enum';
import { randomUUID } from 'crypto';

interface CreateProjectInput {
  teamId: string;
  title: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
  deadline?: string;
  owner_id?: string;
  workOrders?: string[];
  documentation?: string[];
  prototypeMedia?: string[];
}

interface UserContext {
  userId: string;
  orgId: string;
  role: string;
  clearance: number;
}

export const createProject = async (
  userCtx: UserContext,
  input: CreateProjectInput,
  requestId: string
): Promise<Project> => {
  const project: Project = {
    id: randomUUID(),
    org_id: userCtx.orgId,
    team_id: input.teamId,
    title: input.title,
    description: input.description,
    budget_amount: input.budget_amount,
    budget_currency: input.budget_currency,
    deadline: input.deadline,
    owner_id: input.owner_id || userCtx.userId,
    workOrders: input.workOrders,
    documentation: input.documentation,
    prototypeMedia: input.prototypeMedia,
  };

  logger.info('Creating project', { requestId, userId: userCtx.userId, projectId: project.id });
  const { error } = await supabase.from('projects').insert(project);
  if (error) {
    logger.error('Failed to create project', { requestId, userId: userCtx.userId, error: error.message });
    throw new Error(`Failed to create project: ${error.message}`);
  }

  await supabase.from('audit_events').insert({
    event_type: AUDIT_EVENTS.PROJECT_CREATED, // Updated: enum access
    org_id: userCtx.orgId,
    user_id: userCtx.userId,
    payload: { projectId: project.id, title: project.title },
  });

  logger.info('Project created', { requestId, userId: userCtx.userId, projectId: project.id });
  return project;
};

export const getProject = async (
  userCtx: UserContext,
  projectId: string,
  requestId: string
): Promise<Project | null> => {
  logger.info('Fetching project', { requestId, userId: userCtx.userId, projectId });
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('org_id', userCtx.orgId)
    .single();

  if (error || !data) {
    logger.warn('Project not found or unauthorized', { requestId, userId: userCtx.userId, projectId, error: error?.message });
    return null;
  }

  logger.info('Project fetched', { requestId, userId: userCtx.userId, projectId });
  return data as Project;
};