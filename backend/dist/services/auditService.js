"use strict";
// src/services/auditService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = emit;
exports.list = list;
exports.getReassignments = getReassignments;
exports.report = report;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const auditEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    action: zod_1.z.string(),
    resourceId: zod_1.z.string().uuid(),
    resourceType: zod_1.z.enum(['file', 'project', 'team', 'org']),
    timestamp: zod_1.z.date(),
    details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(), // Fixed z.record
});
function isValid(validation) {
    return validation.success;
}
async function emit(data) {
    const validation = (0, validation_1.parse)(auditEventSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid audit data' } };
    }
    try {
        const { data: event } = await supabase.from('audit_events').insert(validation.data).select().single();
        return { status: 201, data: event };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function list(filters) {
    try {
        let query = supabase.from('audit_events').select('*');
        if (filters.resourceId)
            query = query.eq('resourceId', filters.resourceId);
        if (filters.userId)
            query = query.eq('userId', filters.userId);
        const { data: events } = await query;
        const validatedEvents = zod_1.z.array(auditEventSchema).parse(events || []);
        return { status: 200, data: validatedEvents };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getReassignments() {
    try {
        const { data: events } = await supabase.from('audit_events').select('*').eq('action', 'reassign');
        const validatedEvents = zod_1.z.array(auditEventSchema).parse(events || []);
        return { status: 200, data: validatedEvents };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function report(resourceId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), resourceId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid resource ID' } };
    }
    try {
        const { data: events } = await supabase.from('audit_events').select('*').eq('resourceId', resourceId);
        const validatedEvents = zod_1.z.array(auditEventSchema).parse(events || []);
        return { status: 200, data: validatedEvents };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
