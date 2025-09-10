"use strict";
// src/services/projectService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.listProjects = listProjects;
exports.getProject = getProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addProjectMember = addProjectMember;
exports.listProjectMembers = listProjectMembers;
exports.removeProjectMember = removeProjectMember;
exports.getProjectSummary = getProjectSummary;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const projectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    createdAt: zod_1.z.date(),
});
const projectCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
});
const projectMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    projectId: zod_1.z.string().uuid(),
    role: zod_1.z.enum(['admin', 'member', 'viewer']).optional(),
});
function isValid(validation) {
    return validation.success;
}
async function createProject(data) {
    const validation = (0, validation_1.parse)(projectCreateSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project data' } };
    }
    try {
        const { data: project } = await supabase
            .from('projects')
            .insert({ ...validation.data, id: crypto.randomUUID(), createdAt: new Date() })
            .select()
            .single();
        if (!project) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project creation failed' } };
        }
        const validatedProject = projectSchema.parse(project);
        return { status: 201, data: validatedProject };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function listProjects() {
    try {
        const { data: projects } = await supabase.from('projects').select('*');
        const validatedProjects = zod_1.z.array(projectSchema).parse(projects || []);
        return { status: 200, data: validatedProjects };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getProject(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), projectId);
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
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateProject(projectId, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid(), data: zod_1.z.object({ name: zod_1.z.string().min(1).optional() }) }), { id: projectId, data });
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
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteProject(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), projectId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        await supabase.from('projects').delete().eq('id', projectId);
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function addProjectMember(data) {
    const validation = (0, validation_1.parse)(projectMemberSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data' } };
    }
    try {
        const { data: member } = await supabase.from('project_members').insert(validation.data).select().single();
        return { status: 201, data: member };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function listProjectMembers(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), projectId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        const { data: members } = await supabase.from('project_members').select('*').eq('projectId', projectId);
        const validatedMembers = zod_1.z.array(projectMemberSchema).parse(members || []);
        return { status: 200, data: validatedMembers };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeProjectMember(userId, projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ userId: zod_1.z.string().uuid(), projectId: zod_1.z.string().uuid() }), { userId, projectId });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project member data' } };
    }
    try {
        await supabase.from('project_members').delete().eq('userId', userId).eq('projectId', projectId);
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getProjectSummary(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), projectId);
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
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
