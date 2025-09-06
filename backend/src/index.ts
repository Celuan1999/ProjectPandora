// src/index.ts

import express from 'express';
import { startP2PCleanupWorker } from './jobs/p2pCleanupWorker';
import { startOverridesExpiryWorker } from './jobs/overridesExpiryWorker';
import routes from './routes';
import projectRoutes from './api/projects/route';
import { createLogger, format, transports } from 'winston';
import path from 'path';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));
app.use('/api', routes); // Other routes
app.use('/api/projects', projectRoutes); // Mount project routes

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