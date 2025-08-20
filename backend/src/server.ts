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

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server running on port ${PORT}`);
});