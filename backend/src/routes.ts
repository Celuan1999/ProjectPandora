// src/routes.ts

import express from 'express';
import { createOrg, addMember, removeMember } from './services/orgService';
import { createTeam, addTeamMember, removeTeamMember } from './services/teamService';
import { uploadIntent, complete, listByProject, downloadIntent, rename, deleteFile, changeClearance } from './services/fileService';
import { createP2P, viewOnce, cancel } from './services/p2pService';
import { addOverride, removeOverride, expireOverrides } from './services/overrideService';
import { emit, list, report } from './services/auditService';
import { promises as fs } from 'fs';
import path from 'path';

const router = express.Router();

// Organization routes
router.post('/orgs', (req, res) => createOrg(req.body, res));
router.post('/orgs/:orgId/members', (req, res) => addMember(req.body, res));
router.delete('/orgs/:orgId/members/:userId', (req, res) => removeMember(req.params.userId, req.params.orgId, res));

// Team routes
router.post('/teams', (req, res) => createTeam(req.body, res));
router.post('/teams/:teamId/members', (req, res) => addTeamMember(req.body, res));
router.delete('/teams/:teamId/members/:userId', (req, res) => removeTeamMember(req.params.userId, req.params.teamId, res));

// File routes
router.post('/files/upload-intent/:projectId', (req, res) => uploadIntent(req.params.projectId, req.body.name, res));
router.post('/files/upload', async (req, res) => {
  const { filePath } = req.body;
  try {
    await fs.writeFile(filePath, req.body.content || '');
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    return res.status(500).json({
      type: '/errors/server-error',
      title: 'Server Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
router.post('/files/complete', (req, res) => complete(req.body, res));
router.get('/files/project/:projectId', (req, res) => listByProject(req.params.projectId, res));
router.get('/files/download-intent/:fileId', (req, res) => downloadIntent(req.params.fileId, res));
router.get('/files/download', async (req, res) => {
  const { filePath } = req.query;
  try {
    await fs.access(filePath as string);
    res.sendFile(filePath as string);
  } catch (error) {
    res.status(404).json({
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'File not found',
    });
  }
});
router.patch('/files/rename', (req, res) => rename(req.body, res));
router.delete('/files/:fileId', (req, res) => deleteFile(req.params.fileId, res));
router.patch('/files/clearance', (req, res) => changeClearance(req.body, res));

// P2P routes
router.post('/p2p', (req, res) => createP2P(req.body, res));
router.get('/p2p/view-once/:p2pId', (req, res) => viewOnce(req.params.p2pId, res));
router.delete('/p2p/:p2pId', (req, res) => cancel(req.params.p2pId, res));

// Override routes
router.post('/overrides', (req, res) => addOverride(req.body, res));
router.delete('/overrides/:id', (req, res) => removeOverride(req.params.id, res));
router.post('/overrides/expire', (req, res) => expireOverrides(res));

// Audit routes
router.post('/audit', (req, res) => emit(req.body, res));
router.get('/audit', (req, res) => list(req.query, res));
router.get('/audit/report/:resourceId', (req, res) => report(req.params.resourceId, res));

export default router;