"use strict";
// src/routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const p2pService_1 = require("./services/p2pService");
const overrideService_1 = require("./services/overrideService");
const fileService_1 = require("./services/fileService"); // Added import
const router = (0, express_1.Router)();
router.post('/p2p', async (req, res) => {
    const result = await (0, p2pService_1.createP2P)(req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.get('/p2p/:p2pId/view-once', async (req, res) => {
    const result = await (0, p2pService_1.viewOnce)(req.params.p2pId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.post('/access/overrides', async (req, res) => {
    const result = await (0, overrideService_1.addOverride)(req.body);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.delete('/access/overrides/:overrideId', async (req, res) => {
    const result = await (0, overrideService_1.removeOverride)(req.params.overrideId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.post('/files/upload', async (req, res) => {
    const { filePath, content, id, projectId, name, clearance } = req.body;
    try {
        await fs_1.promises.writeFile(filePath, content || '');
        const result = await (0, fileService_1.complete)({ id, projectId, name, clearance: clearance || 'private', createdAt: new Date() });
        if (result.error)
            return res.status(result.status).json(result.error);
        return res.status(200).json({ status: 'success', data: result.data });
    }
    catch (error) {
        return res.status(500).json({
            type: '/errors/server-error',
            title: 'Server Error',
            status: 500,
            detail: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
router.get('/files/download', async (req, res) => {
    const { filePath } = req.query;
    try {
        await fs_1.promises.access(filePath);
        res.sendFile(filePath);
    }
    catch (error) {
        res.status(404).json({
            type: '/errors/not-found',
            title: 'Not Found',
            status: 404,
            detail: 'File not found',
        });
    }
});
exports.default = router;
