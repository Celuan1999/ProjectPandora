"use strict";
// src/routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orgService_1 = require("./services/orgService");
const teamService_1 = require("./services/teamService");
const fileService_1 = require("./services/fileService");
const p2pService_1 = require("./services/p2pService");
const overrideService_1 = require("./services/overrideService");
const auditService_1 = require("./services/auditService");
const fs_1 = require("fs");
const router = (0, express_1.Router)();
// Organization routes
router.post('/orgs', async (req, res) => {
    const result = await (0, orgService_1.createOrg)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.post('/orgs/:orgId/members', async (req, res) => {
    const { orgId } = req.params;
    const result = await (0, orgService_1.addMember)({ ...req.body, orgId });
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/orgs/:orgId/members/:userId', async (req, res) => {
    const { userId, orgId } = req.params;
    const result = await (0, orgService_1.removeMember)(userId, orgId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
// Team routes
router.post('/teams', async (req, res) => {
    const result = await (0, teamService_1.createTeam)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.post('/teams/:teamId/members', async (req, res) => {
    const { teamId } = req.params;
    const result = await (0, teamService_1.addTeamMember)({ ...req.body, teamId });
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/teams/:teamId/members/:userId', async (req, res) => {
    const { userId, teamId } = req.params;
    const result = await (0, teamService_1.removeTeamMember)(userId, teamId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
// File routes
router.post('/files/upload-intent/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, fileService_1.uploadIntent)(projectId, req.body.name);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.post('/files/upload', async (req, res) => {
    const { filePath, content } = req.body;
    try {
        await fs_1.promises.writeFile(filePath, content || '');
        return res.status(200).json({ status: 'success' });
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
router.post('/files/complete', async (req, res) => {
    const result = await (0, fileService_1.complete)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.get('/files/project/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, fileService_1.listByProject)(projectId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.get('/files/download-intent/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const result = await (0, fileService_1.downloadIntent)(fileId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
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
router.patch('/files/rename', async (req, res) => {
    const result = await (0, fileService_1.rename)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/files/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const result = await (0, fileService_1.deleteFile)(fileId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.patch('/files/clearance', async (req, res) => {
    const result = await (0, fileService_1.changeClearance)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
// P2P routes
router.post('/p2p', async (req, res) => {
    const result = await (0, p2pService_1.createP2P)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.get('/p2p/view-once/:p2pId', async (req, res) => {
    const { p2pId } = req.params;
    const result = await (0, p2pService_1.viewOnce)(p2pId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/p2p/:p2pId', async (req, res) => {
    const { p2pId } = req.params;
    const result = await (0, p2pService_1.cancel)(p2pId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
// Override routes
router.post('/overrides', async (req, res) => {
    const result = await (0, overrideService_1.addOverride)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/overrides/:id', async (req, res) => {
    const { id } = req.params;
    const result = await (0, overrideService_1.removeOverride)(id);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.post('/overrides/expire', async (req, res) => {
    const result = await (0, overrideService_1.expireOverrides)();
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
// Audit routes
router.post('/audit', async (req, res) => {
    const result = await (0, auditService_1.emit)(req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.get('/audit', async (req, res) => {
    const result = await (0, auditService_1.list)(req.query);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.get('/audit/report/:resourceId', async (req, res) => {
    const { resourceId } = req.params;
    const result = await (0, auditService_1.report)(resourceId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
