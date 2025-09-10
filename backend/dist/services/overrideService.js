"use strict";
// src/services/overrideService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOverride = addOverride;
exports.getOverride = getOverride;
exports.updateOverride = updateOverride;
exports.deleteOverride = deleteOverride;
exports.removeOverride = removeOverride;
exports.expireOverrides = expireOverrides;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const overrideSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    resourceId: zod_1.z.string().uuid(),
    resourceType: zod_1.z.enum(['file', 'project']),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']),
    expiresAt: zod_1.z.date().optional(),
});
const overrideCreateSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    resourceId: zod_1.z.string().uuid(),
    resourceType: zod_1.z.enum(['file', 'project']),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']),
    expiresAt: zod_1.z.date().optional(),
});
function isValid(validation) {
    return validation.success;
}
async function addOverride(data) {
    const validation = (0, validation_1.parse)(overrideCreateSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
    }
    try {
        const { data: override } = await supabase
            .from('overrides')
            .insert({ ...validation.data, id: crypto.randomUUID() })
            .select()
            .single();
        if (!override) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override creation failed' } };
        }
        const validatedOverride = overrideSchema.parse(override);
        return { status: 201, data: validatedOverride };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getOverride(overrideId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), overrideId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
    }
    try {
        const { data: override } = await supabase.from('overrides').select('*').eq('id', overrideId).single();
        if (!override) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
        }
        const validatedOverride = overrideSchema.parse(override);
        return { status: 200, data: validatedOverride };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateOverride(overrideId, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid(), data: zod_1.z.object({ clearance: zod_1.z.enum(['public', 'private', 'restricted']).optional(), expiresAt: zod_1.z.date().optional() }) }), { id: overrideId, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
    }
    try {
        const { data: override } = await supabase.from('overrides').update(validation.data.data).eq('id', overrideId).select().single();
        if (!override) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
        }
        const validatedOverride = overrideSchema.parse(override);
        return { status: 200, data: validatedOverride };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteOverride(overrideId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), overrideId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
    }
    try {
        await supabase.from('overrides').delete().eq('id', overrideId);
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeOverride(overrideId) {
    return deleteOverride(overrideId); // Alias for deleteOverride
}
async function expireOverrides() {
    try {
        const { data: expiredOverrides } = await supabase
            .from('overrides')
            .delete()
            .lte('expiresAt', new Date().toISOString())
            .not('expiresAt', 'is', null)
            .select();
        return { status: 200, data: { expired: expiredOverrides?.length || 0 } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
