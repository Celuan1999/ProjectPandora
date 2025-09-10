"use strict";
// src/services/fileService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByProject = listByProject;
exports.rename = rename;
exports.updateFile = updateFile;
exports.changeClearance = changeClearance;
exports.uploadIntent = uploadIntent;
exports.downloadIntent = downloadIntent;
exports.complete = complete;
exports.deleteFile = deleteFile;
exports.getFile = getFile;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const supabase_js_1 = require("@supabase/supabase-js");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const fileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']),
    createdAt: zod_1.z.date(),
});
const fileUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).optional(),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']).optional(),
});
function isValid(validation) {
    return validation.success;
}
async function listByProject(projectId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), projectId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid project ID' } };
    }
    try {
        const { data: files } = await supabase.from('files').select('*').eq('projectId', projectId);
        if (!files) {
            return { status: 200, data: [] };
        }
        const validatedFiles = zod_1.z.array(fileSchema).parse(files);
        return { status: 200, data: validatedFiles };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function rename(data) {
    const validation = (0, validation_1.parse)(fileUpdateSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid rename data' } };
    }
    try {
        const { data: file } = await supabase.from('files').select('*').eq('id', validation.data.id).single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        if (validation.data.name) {
            const oldPath = path_1.default.join('Uploads', file.projectId, file.name);
            const newPath = path_1.default.join('Uploads', file.projectId, validation.data.name);
            await fs_1.promises.rename(oldPath, newPath);
        }
        const { data: updatedFile } = await supabase
            .from('files')
            .update({ name: validation.data.name || file.name })
            .eq('id', validation.data.id)
            .select()
            .single();
        if (!updatedFile) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found after update' } };
        }
        const validatedFile = fileSchema.parse(updatedFile);
        return { status: 200, data: validatedFile };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateFile(id, data) {
    const validation = (0, validation_1.parse)(fileUpdateSchema.omit({ id: true }), data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid update data' } };
    }
    try {
        const { data: file } = await supabase.from('files').select('*').eq('id', id).single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        if (validation.data.name) {
            const oldPath = path_1.default.join('Uploads', file.projectId, file.name);
            const newPath = path_1.default.join('Uploads', file.projectId, validation.data.name);
            await fs_1.promises.rename(oldPath, newPath);
        }
        const { data: updatedFile } = await supabase
            .from('files')
            .update({
            name: validation.data.name || file.name,
            clearance: validation.data.clearance || file.clearance,
        })
            .eq('id', id)
            .select()
            .single();
        if (!updatedFile) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found after update' } };
        }
        const validatedFile = fileSchema.parse(updatedFile);
        return { status: 200, data: validatedFile };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function changeClearance(data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid(), clearance: zod_1.z.enum(['public', 'private', 'restricted']) }), data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid clearance data' } };
    }
    try {
        const { data: file } = await supabase
            .from('files')
            .update({ clearance: validation.data.clearance })
            .eq('id', validation.data.id)
            .select()
            .single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        const validatedFile = fileSchema.parse(file);
        return { status: 200, data: validatedFile };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function uploadIntent(projectId, name) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ projectId: zod_1.z.string().uuid(), name: zod_1.z.string().min(1) }), { projectId, name });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid upload intent data' } };
    }
    try {
        const filePath = path_1.default.join('Uploads', projectId, name);
        await fs_1.promises.mkdir(path_1.default.dirname(filePath), { recursive: true });
        return { status: 200, data: { filePath } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function downloadIntent(fileId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), fileId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
    }
    try {
        const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        const filePath = path_1.default.join('Uploads', file.projectId, file.name);
        await fs_1.promises.access(filePath);
        return { status: 200, data: { filePath } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function complete(data) {
    const validation = (0, validation_1.parse)(fileSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file data' } };
    }
    try {
        const { data: file } = await supabase.from('files').insert(validation.data).select().single();
        return { status: 201, data: file };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteFile(fileId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), fileId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
    }
    try {
        const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        const filePath = path_1.default.join('Uploads', file.projectId, file.name);
        await fs_1.promises.unlink(filePath);
        await supabase.from('files').delete().eq('id', fileId);
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function getFile(fileId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid(), fileId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
    }
    try {
        const { data: file } = await supabase.from('files').select('*').eq('id', fileId).single();
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        const validatedFile = fileSchema.parse(file);
        return { status: 200, data: validatedFile };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
