"use strict";
// src/services/overrideService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOverride = addOverride;
exports.removeOverride = removeOverride;
exports.expireOverrides = expireOverrides;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const overrideSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    userId: zod_1.z.string().uuid({ message: 'Invalid UUID for userId' }),
    resourceId: zod_1.z.string().uuid({ message: 'Invalid UUID for resourceId' }),
    resourceType: zod_1.z.enum(['file', 'project', 'team']),
    permission: zod_1.z.enum(['read', 'write', 'admin']),
    expiresAt: zod_1.z.date().optional(),
});
const db = {
    addOverride: async (data) => ({ ...data }),
    removeOverride: async (id) => true,
    expireOverrides: async () => 0,
};
function isValid(validation) {
    return validation.success;
}
async function addOverride(data) {
    const validation = (0, validation_1.parse)(overrideSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override data' } };
    }
    try {
        const override = await db.addOverride(validation.data);
        return { status: 201, data: override };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function removeOverride(id) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), id);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid override ID' } };
    }
    try {
        const success = await db.removeOverride(id);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Override not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function expireOverrides() {
    try {
        const count = await db.expireOverrides();
        return { status: 200, data: { expired: count } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
