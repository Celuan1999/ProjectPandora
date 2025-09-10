"use strict";
// src/services/userService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.updateUser = updateUser;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['admin', 'member', 'viewer']).optional(),
});
const userCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['admin', 'member', 'viewer']).optional(),
});
function isValid(validation) {
    return validation.success;
}
async function createUser(data) {
    const validation = (0, validation_1.parse)(userCreateSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user data' } };
    }
    try {
        const { data: user } = await supabase.from('users').insert({ ...validation.data, id: crypto.randomUUID() }).select().single();
        if (!user) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User creation failed' } };
        }
        const validatedUser = userSchema.parse(user);
        return { status: 201, data: validatedUser };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getUsers() {
    try {
        const { data: users } = await supabase.from('users').select('*');
        const validatedUsers = zod_1.z.array(userSchema).parse(users || []);
        return { status: 200, data: validatedUsers };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateUser(id, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid(), data: zod_1.z.object({ name: zod_1.z.string().min(1).optional(), email: zod_1.z.string().email().optional(), role: zod_1.z.enum(['admin', 'member', 'viewer']).optional() }) }), { id, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid update data' } };
    }
    try {
        const { data: user } = await supabase.from('users').update(validation.data.data).eq('id', id).select().single();
        if (!user) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
        }
        const validatedUser = userSchema.parse(user);
        return { status: 200, data: validatedUser };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getUser(userId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), userId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
    }
    try {
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
        if (!user) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'User not found' } };
        }
        return { status: 200, data: user };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteUser(userId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), userId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid user ID' } };
    }
    try {
        await supabase.from('users').delete().eq('id', userId);
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
