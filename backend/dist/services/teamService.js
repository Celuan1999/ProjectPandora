"use strict";
// src/services/teamService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeam = createTeam;
exports.updateTeam = updateTeam;
exports.deleteTeam = deleteTeam;
exports.addTeamMember = addTeamMember;
exports.removeTeamMember = removeTeamMember;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const teamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    orgId: zod_1.z.string().uuid({ message: 'Invalid UUID for orgId' }),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    createdAt: zod_1.z.date().default(() => new Date()),
});
const teamUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
});
const teamMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }),
    teamId: zod_1.z.string().uuid({ message: 'Invalid UUID for teamId' }),
    role: zod_1.z.enum(['lead', 'member']),
});
const db = {
    createTeam: async (data) => ({ ...data }),
    addTeamMember: async (data) => ({ ...data }),
    removeTeamMember: async (userId, teamId) => true,
    updateTeam: async (id, data) => {
        // Mock: Simulate fetching the existing team and merging updates
        const existingTeam = { id, orgId: 'org-uuid', name: 'Existing Team', createdAt: new Date() }; // Replace with actual DB fetch
        return { ...existingTeam, ...data, id }; // Ensure all required fields are present
    },
    deleteTeam: async (id) => true,
};
function isValid(validation) {
    return validation.success;
}
async function createTeam(data) {
    const validation = (0, validation_1.parse)(teamSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team data' } };
    }
    try {
        const team = await db.createTeam(validation.data);
        return { status: 201, data: team };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateTeam(id, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), data: teamUpdateSchema }), { id, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team update data' } };
    }
    try {
        const team = await db.updateTeam(id, validation.data.data);
        // Validate the returned team against teamSchema to ensure type safety
        const validatedTeam = teamSchema.parse(team);
        return { status: 200, data: validatedTeam };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteTeam(id) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), id);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team ID' } };
    }
    try {
        const success = await db.deleteTeam(id);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Team not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function addTeamMember(data) {
    const validation = (0, validation_1.parse)(teamMemberSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid team member data' } };
    }
    try {
        const member = await db.addTeamMember(validation.data);
        return { status: 201, data: member };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeTeamMember(userId, teamId) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }), teamId: zod_1.z.string().uuid({ message: 'Invalid UUID for teamId' }) }), { userId, teamId });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or team ID' } };
    }
    try {
        const success = await db.removeTeamMember(userId, teamId);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Team membership not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
