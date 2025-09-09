// src/routes.ts

import { Request, Response, Router } from 'express';
import { createOrg, addMember, removeMember } from './services/orgService';
import { createTeam, addTeamMember, removeTeamMember } from './services/teamService';
import { uploadIntent, complete, listByProject, downloadIntent, rename, deleteFile, changeClearance } from './services/fileService';
import { createP2P, viewOnce, cancel } from './services/p2pService';
import { addOverride, removeOverride, expireOverrides } from './services/overrideService';
import { emit, list, report } from './services/auditService';
import { promises as fs } from 'fs';
import path from 'path';

interface OrgParams { orgId: string; }
interface OrgMemberParams { orgId: string; userId: string; }
interface TeamParams { teamId: string; }
interface TeamMemberParams { teamId: string; userId: string; }
interface ProjectParams { projectId: string; }
interface FileParams { fileId: string; }
interface P2PParams { p2pId: string; }
interface OverrideParams { id: string; }
interface AuditParams { resourceId: string; }

const router = Router();

// Organization routes
router.post('/orgs', async (req: Request, res: Response) => {
 const result = await createOrg(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.post('/orgs/:orgId/members', async (req: Request<OrgParams>, res: Response) => {
 const { orgId } = req.params;
 const result = await addMember({ ...req.body, orgId });
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.delete('/orgs/:orgId/members/:userId', async (req: Request<OrgMemberParams>, res: Response) => {
 const { userId, orgId } = req.params;
 const result = await removeMember(userId, orgId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

// Team routes
router.post('/teams', async (req: Request, res: Response) => {
 const result = await createTeam(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.post('/teams/:teamId/members', async (req: Request<TeamParams>, res: Response) => {
 const { teamId } = req.params;
 const result = await addTeamMember({ ...req.body, teamId });
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.delete('/teams/:teamId/members/:userId', async (req: Request<TeamMemberParams>, res: Response) => {
 const { userId, teamId } = req.params;
 const result = await removeTeamMember(userId, teamId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

// File routes
router.post('/files/upload-intent/:projectId', async (req: Request<ProjectParams>, res: Response) => {
 const { projectId } = req.params;
 const result = await uploadIntent(projectId, req.body.name);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.post('/files/upload', async (req: Request, res: Response) => {
 const { filePath, content } = req.body;
 try {
 await fs.writeFile(filePath, content || '');
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

router.post('/files/complete', async (req: Request, res: Response) => {
 const result = await complete(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/files/project/:projectId', async (req: Request<ProjectParams>, res: Response) => {
 const { projectId } = req.params;
 const result = await listByProject(projectId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/files/download-intent/:fileId', async (req: Request<FileParams>, res: Response) => {
 const { fileId } = req.params;
 const result = await downloadIntent(fileId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/files/download', async (req: Request<{}, {}, {}, { filePath: string }>, res: Response) => {
 const { filePath } = req.query;
 try {
 await fs.access(filePath);
 res.sendFile(filePath);
 } catch (error) {
 res.status(404).json({
 type: '/errors/not-found',
 title: 'Not Found',
 status: 404,
 detail: 'File not found',
 });
 }
});

router.patch('/files/rename', async (req: Request, res: Response) => {
 const result = await rename(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.delete('/files/:fileId', async (req: Request<FileParams>, res: Response) => {
 const { fileId } = req.params;
 const result = await deleteFile(fileId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.patch('/files/clearance', async (req: Request, res: Response) => {
 const result = await changeClearance(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

// P2P routes
router.post('/p2p', async (req: Request, res: Response) => {
 const result = await createP2P(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/p2p/view-once/:p2pId', async (req: Request<P2PParams>, res: Response) => {
 const { p2pId } = req.params;
 const result = await viewOnce(p2pId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.delete('/p2p/:p2pId', async (req: Request<P2PParams>, res: Response) => {
 const { p2pId } = req.params;
 const result = await cancel(p2pId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

// Override routes
router.post('/overrides', async (req: Request, res: Response) => {
 const result = await addOverride(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.delete('/overrides/:id', async (req: Request<OverrideParams>, res: Response) => {
 const { id } = req.params;
 const result = await removeOverride(id);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.post('/overrides/expire', async (req: Request, res: Response) => {
 const result = await expireOverrides();
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

// Audit routes
router.post('/audit', async (req: Request, res: Response) => {
 const result = await emit(req.body);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/audit', async (req: Request<{}, {}, {}, { [key: string]: string }>, res: Response) => {
 const result = await list(req.query);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

router.get('/audit/report/:resourceId', async (req: Request<AuditParams>, res: Response) => {
 const { resourceId } = req.params;
 const result = await report(resourceId);
 if (result.error) {
 return res.status(result.status).json(result.error);
 }
 return res.status(result.status).json({ data: result.data });
});

export default router;