"use strict";
// src/services/auditService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = emit;
exports.list = list;
exports.report = report;
exports.getReassignments = getReassignments;
exports.getProjectSummary = getProjectSummary;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const auditEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }),
    action: zod_1.z.string().min(1, 'Action is required'),
    resourceId: zod_1.z.string().uuid({ message: 'Invalid UUID for resourceId' }),
    resourceType: zod_1.z.enum(['file', 'project', 'team', 'org']),
    timestamp: zod_1.z.date().default(() => new Date()),
    details: zod_1.z.object({}).optional(),
});
const db = {
    emitEvent: async (data) => ({ ...data }),
    listEvents: async (filters) => [
        { id: 'uuid', userId: 'user-uuid', action: 'view', resourceId: 'resource-uuid', resourceType: 'file', timestamp: new Date() },
    ],
    getReassignments: async () => [{ id: 'uuid', userId: 'user-uuid', action: 'reassign', resourceId: 'resource-uuid', resourceType: 'project', timestamp: new Date() }],
    getProjectSummary: async (projectId) => ({
        projectId,
        totalEvents: 10,
        actions: ['view', 'edit'],
    }),
};
function isValid(validation) {
    return validation.success;
}
async function emit(data) {
    const validation = (0, validation_1.parse)(auditEventSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid audit event data' } };
    }
    try {
        const event = await db.emitEvent(validation.data);
        return { status: 201, data: event };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function list(filters) {
    try {
        const events = await db.listEvents(filters);
        return { status: 200, data: events };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function report(resourceId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for resourceId' }), resourceId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid resource ID' } };
    }
    try {
        const events = await db.listEvents({ resourceId });
        const report = { resourceId, totalEvents: events.length, actions: events.map((e) => e.action) };
        return { status: 200, data: report };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getReassignments() {
    try {
        const events = await db.getReassignments();
        return { status: 200, data: events };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getProjectSummary(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }), projectId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        const summary = await db.getProjectSummary(projectId);
        return { status: 200, data: summary };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
