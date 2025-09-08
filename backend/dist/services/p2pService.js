"use strict";
// src/services/p2pService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createP2P = createP2P;
exports.viewOnce = viewOnce;
exports.cancel = cancel;
const zod_1 = require("zod");
const validation_1 = require("../lib/validation");
const storage_1 = require("../lib/storage");
const p2pSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID for id' }),
    fileId: zod_1.z.string().uuid({ message: 'Invalid UUID for fileId' }),
    recipientId: zod_1.z.string().uuid({ message: 'Invalid UUID for recipientId' }),
    viewOnce: zod_1.z.boolean().default(false),
    expiresAt: zod_1.z.date().optional(),
});
const db = {
    createP2P: async (data) => ({ ...data }),
    getP2P: async (id) => ({ id, fileId: 'file-uuid', recipientId: 'user-uuid', viewOnce: true, expiresAt: new Date() }),
    cancelP2P: async (id) => true,
    getFile: async (fileId) => ({ id: fileId, projectId: 'project-uuid', name: 'file.txt', clearance: 'private', createdAt: new Date() }),
};
function isValid(validation) {
    return validation.success;
}
async function createP2P(data) {
    const validation = (0, validation_1.parse)(p2pSchema, data);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P data' } };
    }
    try {
        const p2p = await db.createP2P(validation.data);
        return { status: 201, data: p2p };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function viewOnce(p2pId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for p2pId' }), p2pId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P ID' } };
    }
    try {
        const p2p = await db.getP2P(p2pId);
        if (!p2p || !p2p.viewOnce) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'P2P share not found or not view-once' } };
        }
        const file = await db.getFile(p2p.fileId);
        const filePath = await (0, storage_1.getFile)({ projectId: file.projectId, fileName: file.name });
        await db.cancelP2P(p2pId);
        return { status: 200, data: { filePath } };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
async function cancel(p2pId) {
    const validation = (0, validation_1.parse)(zod_1.z.string().uuid({ message: 'Invalid UUID for p2pId' }), p2pId);
    if (!isValid(validation)) {
        return { status: 400, error: { type: '/errors/invalid-input', title: 'Invalid Input', status: 400, detail: validation.error?.format()._errors.join(', ') || 'Invalid P2P ID' } };
    }
    try {
        const success = await db.cancelP2P(p2pId);
        if (!success) {
            return { status: 404, error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'P2P share not found' } };
        }
        return { status: 204, data: null };
    }
    catch (error) {
        return { status: 500, error: { type: '/errors/server-error', title: 'Server Error', status: 500, detail: error instanceof Error ? error.message : 'Unknown error' } };
    }
}
