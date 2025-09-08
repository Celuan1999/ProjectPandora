"use strict";
// src/routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orgService_1 = require("./services/orgService");
const teamService_1 = require("./services/teamService");
const fileService_1 = require("./services/fileService");
const p2pService_1 = require("./services/p2pService");
const overrideService_1 = require("./services/overrideService");
const auditService_1 = require("./services/auditService");
const fs_1 = require("fs");
const router = express_1.default.Router();
// Organization routes
router.post('/orgs', (req, res) => (0, orgService_1.createOrg)(req.body, res));
router.post('/orgs/:orgId/members', (req, res) => (0, orgService_1.addMember)(req.body, res));
router.delete('/orgs/:orgId/members/:userId', (req, res) => (0, orgService_1.removeMember)(req.params.userId, req.params.orgId, res));
// Team routes
router.post('/teams', (req, res) => (0, teamService_1.createTeam)(req.body, res));
router.post('/teams/:teamId/members', (req, res) => (0, teamService_1.addTeamMember)(req.body, res));
router.delete('/teams/:teamId/members/:userId', (req, res) => (0, teamService_1.removeTeamMember)(req.params.userId, req.params.teamId, res));
// File routes
router.post('/files/upload-intent/:projectId', (req, res) => (0, fileService_1.uploadIntent)(req.params.projectId, req.body.name, res));
router.post('/files/upload', async (req, res) => {
    const { filePath } = req.body;
    try {
        await fs_1.promises.writeFile(filePath, req.body.content || '');
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
router.post('/files/complete', (req, res) => (0, fileService_1.complete)(req.body, res));
router.get('/files/project/:projectId', (req, res) => (0, fileService_1.listByProject)(req.params.projectId, res));
router.get('/files/download-intent/:fileId', (req, res) => (0, fileService_1.downloadIntent)(req.params.fileId, res));
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
router.patch('/files/rename', (req, res) => (0, fileService_1.rename)(req.body, res));
router.delete('/files/:fileId', (req, res) => (0, fileService_1.deleteFile)(req.params.fileId, res));
router.patch('/files/clearance', (req, res) => (0, fileService_1.changeClearance)(req.body, res));
// P2P routes
router.post('/p2p', (req, res) => (0, p2pService_1.createP2P)(req.body, res));
router.get('/p2p/view-once/:p2pId', (req, res) => (0, p2pService_1.viewOnce)(req.params.p2pId, res));
router.delete('/p2p/:p2pId', (req, res) => (0, p2pService_1.cancel)(req.params.p2pId, res));
// Override routes
router.post('/overrides', (req, res) => (0, overrideService_1.addOverride)(req.body, res));
router.delete('/overrides/:id', (req, res) => (0, overrideService_1.removeOverride)(req.params.id, res));
router.post('/overrides/expire', (req, res) => (0, overrideService_1.expireOverrides)(res));
// Audit routes
router.post('/audit', (req, res) => (0, auditService_1.emit)(req.body, res));
router.get('/audit', (req, res) => (0, auditService_1.list)(req.query, res));
router.get('/audit/report/:resourceId', (req, res) => (0, auditService_1.report)(req.params.resourceId, res));
exports.default = router;
