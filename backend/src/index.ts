// src/index.ts

import express from 'express';
import { startP2PCleanupWorker } from './jobs/p2pCleanupWorker';
import { startOverridesExpiryWorker } from './jobs/overridesExpiryWorker';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import orgMeRouter from './api/org/me/route';
import orgTeamsRouter from './api/org/teams/route';
import orgTeamsIdRouter from './api/org/teams/[teamId]/route';
import orgTeamsMembersRouter from './api/org/teams/[teamId]/members/route';
import orgTeamsMembersUserIdRouter from './api/org/teams/[teamId]/members/[userId]/route';
import adminUsersRouter from './api/admin/users/route';
import adminUsersIdRouter from './api/admin/users/[userId]/route';
import projectsRouter from './api/projects/route';
import projectsIdRouter from './api/projects/[projectId]/route';
import projectsMembersRouter from './api/projects/[projectId]/members/route';
import projectsMembersUserIdRouter from './api/projects/[projectId]/members/[userId]/route';
import projectsFilesRouter from './api/projects/[projectId]/files/route';
import filesUploadIntentRouter from './api/files/upload-intent/route';
import filesCompleteRouter from './api/files/complete/route';
import filesIdRouter from './api/files/[fileId]/route';
import filesClearanceRouter from './api/files/[fileId]/clearance/route';
import filesDownloadIntentRouter from './api/files/[fileId]/download-intent/route';
import accessOverridesRouter from './api/access/overrides/route';
import accessOverridesIdRouter from './api/access/overrides/[overrideId]/route';
import p2pRouter from './api/p2p/route';
import p2pIdRouter from './api/p2p/[p2pId]/route';
import auditRouter from './api/audit/route';
import reportsReassignmentsRouter from './api/reports/reassignments/route';
import reportsProjectsSummaryRouter from './api/reports/projects/[projectId]/summary/route';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));

// Mount routers
app.use('/api/organizations/me', orgMeRouter);
app.use('/api/org/teams', orgTeamsRouter);
app.use('/api/org/teams/:teamId', orgTeamsIdRouter);
app.use('/api/org/teams/:teamId/members', orgTeamsMembersRouter);
app.use('/api/org/teams/:teamId/members/:userId', orgTeamsMembersUserIdRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/users/:userId', adminUsersIdRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:projectId', projectsIdRouter);
app.use('/api/projects/:projectId/members', projectsMembersRouter);
app.use('/api/projects/:projectId/members/:userId', projectsMembersUserIdRouter);
app.use('/api/projects/:projectId/files', projectsFilesRouter);
app.use('/api/files/upload-intent', filesUploadIntentRouter);
app.use('/api/files/complete', filesCompleteRouter);
app.use('/api/files/:fileId', filesIdRouter);
app.use('/api/files/:fileId/clearance', filesClearanceRouter);
app.use('/api/files/:fileId/download-intent', filesDownloadIntentRouter);
app.use('/api/access/overrides', accessOverridesRouter);
app.use('/api/access/overrides/:overrideId', accessOverridesIdRouter);
app.use('/api/p2p', p2pRouter);
app.use('/api/p2p/:p2pId', p2pIdRouter);
app.use('/api/audit', auditRouter);
app.use('/api/reports/reassignments', reportsReassignmentsRouter);
app.use('/api/reports/projects/:projectId/summary', reportsProjectsSummaryRouter);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  startP2PCleanupWorker(3600000);
  startOverridesExpiryWorker(3600000);
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message);
  res.status(500).json({
    type: '/errors/server-error',
    title: 'Server Error',
    status: 500,
    detail: err.message,
  });
});