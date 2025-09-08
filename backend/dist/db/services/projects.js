"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProject = exports.createProject = void 0;
// backend/src/services/project.ts
const supabaseServer_1 = require("../../lib/supabaseServer");
const logger_1 = require("../../lib/logger");
const enum_1 = require("../../types/enum");
const crypto_1 = require("crypto");
const createProject = async (userCtx, input, requestId) => {
    const project = {
        id: (0, crypto_1.randomUUID)(),
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
    logger_1.logger.info('Creating project', { requestId, userId: userCtx.userId, projectId: project.id });
    const { error } = await supabaseServer_1.supabase.from('projects').insert(project);
    if (error) {
        logger_1.logger.error('Failed to create project', { requestId, userId: userCtx.userId, error: error.message });
        throw new Error(`Failed to create project: ${error.message}`);
    }
    await supabaseServer_1.supabase.from('audit_events').insert({
        event_type: enum_1.AUDIT_EVENTS.PROJECT_CREATED, // Updated: enum access
        org_id: userCtx.orgId,
        user_id: userCtx.userId,
        payload: { projectId: project.id, title: project.title },
    });
    logger_1.logger.info('Project created', { requestId, userId: userCtx.userId, projectId: project.id });
    return project;
};
exports.createProject = createProject;
const getProject = async (userCtx, projectId, requestId) => {
    logger_1.logger.info('Fetching project', { requestId, userId: userCtx.userId, projectId });
    const { data, error } = await supabaseServer_1.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('org_id', userCtx.orgId)
        .single();
    if (error || !data) {
        logger_1.logger.warn('Project not found or unauthorized', { requestId, userId: userCtx.userId, projectId, error: error?.message });
        return null;
    }
    logger_1.logger.info('Project fetched', { requestId, userId: userCtx.userId, projectId });
    return data;
};
exports.getProject = getProject;
