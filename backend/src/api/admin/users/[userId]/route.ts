// src/api/admin/users/[userId]/route.ts

import { Request, Response, Router } from 'express';
import { getUser, updateUser, deleteUser } from '../../../../services/userService';

interface UserParams { userId: string; }

const router = Router();

router.get('/', async (req: Request<UserParams>, res: Response) => {
  const { userId } = req.params;
  const result = await getUser(userId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.patch('/', async (req: Request<UserParams>, res: Response) => {
  const { userId } = req.params;
  const result = await updateUser(userId, req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<UserParams>, res: Response) => {
  const { userId } = req.params;
  const result = await deleteUser(userId);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;