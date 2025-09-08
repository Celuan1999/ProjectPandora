"use strict";
// src/services/fileService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadIntent = uploadIntent;
exports.complete = complete;
exports.listByProject = listByProject;
exports.downloadIntent = downloadIntent;
exports.rename = rename;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;
exports.changeClearance = changeClearance;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const storage_1 = require("../lib/storage");
const fileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    projectId: zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }),
    name: zod_1.z.string().min(1, 'Name is required').max(255),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']).default('private'),
    createdAt: zod_1.z.date().default(() => new Date()),
});
const renameSchema = zod_1.z.object({
    fileId: zod_1.z.string().uuid({ message: 'Invalid UUID for fileId' }),
    newName: zod_1.z.string().min(1, 'Name is required').max(255),
});
const clearanceSchema = zod_1.z.object({
    fileId: zod_1.z.string().uuid({ message: 'Invalid UUID for fileId' }),
    clearance: zod_1.z.enum(['public', 'private', 'restricted']),
});
const db = {
    createFile: async (data) => ({ ...data }),
    listFilesByProject: async (projectId) => [{ id: 'file-uuid', projectId, name: 'file.txt', clearance: 'private', createdAt: new Date() }],
    updateFile: async (fileId, data) => ({ id: fileId, ...data }),
    deleteFile: async (fileId) => true,
    getFile: async (fileId) => ({ id: fileId, projectId: 'project-uuid', name: 'file.txt', clearance: 'private', createdAt: new Date() }),
};
function isValid(validation) {
    return validation.success;
}
async function uploadIntent(projectId, fileName) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ projectId: zod_1.z.string().uuid({ message: 'Invalid UUID for projectId' }), fileName: zod_1.z.string().min(1) }), { projectId, fileName });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid input' } };
    }
    try {
        const filePath = await (0, storage_1.storeFile)({ projectId, fileName });
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
        const file = await db.createFile(validation.data);
        return { status: 201, data: file };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function listByProject(projectId) {
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
async function downloadIntent(fileId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for fileId' }), fileId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
    }
    try {
        const file = await db.getFile(fileId);
        if (!file) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        const filePath = await (0, storage_1.getFile)({ projectId: file.projectId, fileName: file.name });
        return { status: 200, data: { filePath } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function rename(data) {
    const validation = (0, validation_1.parse)(renameSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid rename data' } };
    }
    try {
        const file = await db.updateFile(validation.data.fileId, { name: validation.data.newName });
        return { status: 200, data: file };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function updateFile(id, data) {
    const validation = (0, validation_1.parse)(zod_1.z.object({ id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }), data: fileSchema.partial() }), { id, data });
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file update data' } };
    }
    try {
        const file = await db.updateFile(id, validation.data.data);
        return { status: 200, data: file };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function deleteFile(fileId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for fileId' }), fileId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid file ID' } };
    }
    try {
        const success = await db.deleteFile(fileId);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'File not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function changeClearance(data) {
    const validation = (0, validation_1.parse)(clearanceSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid clearance data' } };
    }
    try {
        const file = await db.updateFile(validation.data.fileId, { clearance: validation.data.clearance });
        return { status: 200, data: file };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
