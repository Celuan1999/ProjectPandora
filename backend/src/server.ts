// src/server.ts

import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './lib/logger';
import { startP2PCleanupWorker, startOverridesExpiryWorker } from './lib/workers';
import routes from './routes';
import adminUsersRouter from './api/admin/users/[userId]/route';
import projectsRouter from './api/projects/[projectId]/route';
import overridesRouter from './api/access/overrides/[overrideId]/route';
import filesRouter from './api/files/[fileId]/route';
import fileDownloadIntentRouter from './api/files/[fileId]/download-intent/route';
import p2pRouter from './api/p2p/[p2pId]/route';
import projectFilesRouter from './api/projects/[projectId]/files/route';
import projectMembersRouter from './api/projects/[projectId]/members/route';
import projectMemberRouter from './api/projects/[projectId]/members/[userId]/route';
import projectSummaryRouter from './api/reports/projects/[projectId]/summary/route';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));
app.use('/api', routes);
app.use('/api/admin/users/:userId', adminUsersRouter);
app.use('/api/projects/:projectId', projectsRouter);
app.use('/api/access/overrides/:overrideId', overridesRouter);
app.use('/api/files/:fileId', filesRouter);
app.use('/api/files/:fileId/download-intent', fileDownloadIntentRouter);
app.use('/api/p2p/:p2pId', p2pRouter);
app.use('/api/projects/:projectId/files', projectFilesRouter);
app.use('/api/projects/:projectId/members', projectMembersRouter);
app.use('/api/projects/:projectId/members/:userId', projectMemberRouter);
app.use('/api/reports/projects/:projectId/summary', projectSummaryRouter);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  startP2PCleanupWorker(3600000);
  startOverridesExpiryWorker(3600000);
});