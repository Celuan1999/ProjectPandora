"use strict";
// src/services/userService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: zod_1.z.string().email('Invalid email address'),
    role: zod_1.z.enum(['admin', 'member', 'viewer']).optional(),
});
const userUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    role: zod_1.z.enum(['admin', 'member', 'viewer']).optional(),
});
const db = {
    createUser: async (data) => ({ ...data }),
    updateUser: async (id, data) => ({ id, ...data }),
    deleteUser: async (id) => true,
};
function isValid(validation) {
    return validation.success;
}
async function createUser(data) {
    const validation = (0, validation_1.parse)(userSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user data' } };
    }
    try {
        const user = await db.createUser(validation.data);
        return { status: 201, data: user };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateUser(id, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), data: userUpdateSchema }), { id, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user update data' } };
    }
    try {
        const user = await db.updateUser(id, validation.data.data);
        return { status: 200, data: user };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteUser(id) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), id);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
    }
    try {
        const success = await db.deleteUser(id);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
