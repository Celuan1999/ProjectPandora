"use strict";
// src/services/orgService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrg = createOrg;
exports.addMember = addMember;
exports.removeMember = removeMember;
exports.getUserOrg = getUserOrg;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const orgSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    createdAt: zod_1.z.date().default(() => new Date()),
});
const membershipSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }),
    orgId: zod_1.z.string().uuid({ message: 'Invalid UUID for orgId' }),
    role: zod_1.z.enum(['admin', 'member', 'viewer']),
});
const db = {
    createOrg: async (data) => ({ ...data }),
    addMember: async (data) => ({ ...data }),
    removeMember: async (userId, orgId) => true,
    getUserOrg: async (userId) => ({ id: 'org-uuid', name: 'Test Org', createdAt: new Date() }),
};
function isValid(validation) {
    return validation.success;
}
async function createOrg(data) {
    const validation = (0, validation_1.parse)(orgSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid org data' } };
    }
    try {
        const org = await db.createOrg(validation.data);
        return { status: 201, data: org };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function addMember(data) {
    const validation = (0, validation_1.parse)(membershipSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid membership data' } };
    }
    try {
        const member = await db.addMember(validation.data);
        return { status: 201, data: member };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeMember(userId, orgId) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }), orgId: zod_1.z.string().uuid({ message: 'Invalid UUID for orgId' }) }), { userId, orgId });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user or org ID' } };
    }
    try {
        const success = await db.removeMember(userId, orgId);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Membership not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getUserOrg(userId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }), userId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
    }
    try {
        const org = await db.getUserOrg(userId);
        if (!org) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Organization not found' } };
        }
        return { status: 200, data: org };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
