"use strict";
// src/services/projectService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addProjectMember = addProjectMember;
exports.removeProjectMember = removeProjectMember;
exports.listProjects = listProjects;
exports.listFilesByProject = listFilesByProject;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const projectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    teamId: zod_1.z.string().uuid({ message: 'Invalid UUID for teamId' }),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    createdAt: zod_1.z.date().default(() => new Date()),
});
const projectUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
});
const projectMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }),
    projectId: zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }),
    role: zod_1.z.enum(['lead', 'member']),
});
const db = {
    createProject: async (data) => ({ ...data }),
    addProjectMember: async (data) => ({ ...data }),
    removeProjectMember: async (userId, projectId) => true,
    updateProject: async (id, data) => {
        // Mock: Fetch existing project and merge updates
        const existingProject = { id, teamId: 'team-uuid', name: 'Existing Project', createdAt: new Date() }; // Replace with DB fetch
        return { ...existingProject, ...data, id }; // Ensure all required fields
    },
    deleteProject: async (id) => true,
    listProjects: async () => [{ id: 'project-uuid', teamId: 'team-uuid', name: 'Test Project', createdAt: new Date() }],
    listFilesByProject: async (projectId) => [{ id: 'file-uuid', projectId, name: 'Test File', createdAt: new Date() }],
};
function isValid(validation) {
    return validation.success;
}
async function createProject(data) {
    const validation = (0, validation_1.parse)(projectSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project data' } };
    }
    try {
        const project = await db.createProject(validation.data);
        return { status: 201, data: project };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateProject(id, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), data: projectUpdateSchema }), { id, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project update data' } };
    }
    try {
        const project = await db.updateProject(id, validation.data.data);
        const validatedProject = projectSchema.parse(project); // Ensure full Project type
        return { status: 200, data: validatedProject };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteProject(id) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), id);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        const success = await db.deleteProject(id);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project not found' } };
        }
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
        const member = await db.addProjectMember(validation.data);
        return { status: 201, data: member };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeProjectMember(userId, projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }), projectId: zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }) }), { userId, projectId });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or project ID' } };
    }
    try {
        const success = await db.removeProjectMember(userId, projectId);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Project membership not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function listProjects() {
    try {
        const projects = await db.listProjects();
        return { status: 200, data: projects };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function listFilesByProject(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }), projectId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        const files = await db.listFilesByProject(projectId);
        return { status: 200, data: files };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
