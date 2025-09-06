// src/index.ts

import express from 'express';
import { startP2PCleanupWorker } from './jobs/p2pCleanupWorker';
import { startOverridesExpiryWorker } from './jobs/overridesExpiryWorker';
import routes from './routes';
import { createLogger, format, transports } from 'winston';
import path from 'path';

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files
app.use('/api', routes); // Mount API routes

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  
  // Start background workers
  startP2PCleanupWorker(3600000); // Run every hour
  startOverridesExpiryWorker(3600000); // Run every hour
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message);
  res.status(500).json({
    type: '/errors/server-error',
    title: 'Server Error',
    status: 500,
    detail: err.message,
  });
});