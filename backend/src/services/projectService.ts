// backend/src/services/projectService.ts
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger';
import { Project } from '../types/models';
import { AUDIT_EVENTS } from '../types/enums';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

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

export const createProject = async (
  userCtx: { userId: string; orgId: string; role: string; clearance: number },
  input: CreateProjectInput
): Promise<Project> => {
  const requestId = randomUUID();
  const { teamId, title, description, budget_amount, budget_currency, deadline, owner_id, workOrders, documentation, prototypeMedia } = input;

  logger.info({ requestId, userId: userCtx.userId }, 'Creating project');
  const project: Project = {
    id: randomUUID(),
    org_id: userCtx.orgId,
    team_id: teamId,
    title,
    description,
    budget_amount,
    budget_currency,
    deadline,
    owner_id,
    workOrders,
    documentation,
    prototypeMedia,
  };

  const { error } = await supabase.from('projects').insert(project);
  if (error) {
    logger.error({ requestId, error: error.message }, 'Failed to create project');
    throw error;
  }

  await supabase.from('audit_events').insert({
    event_type: AUDIT_EVENTS.PROJECT_CREATED,
    org_id: userCtx.orgId,
    user_id: userCtx.userId,
    payload: { projectId: project.id, title },
  });

  logger.info({ requestId, projectId: project.id }, 'Project created');
  return project;
};