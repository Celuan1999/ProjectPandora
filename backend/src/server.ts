// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { router as adminUsersRouter } from './api/admin/users/route';
import { router as projectsRouter } from './api/projects/route';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/admin/users', adminUsersRouter);
app.use('/api/projects', projectsRouter);
//Message needs to be first with the metadata second for Winston logging purposes
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { port: PORT });
});