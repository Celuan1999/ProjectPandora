// src/api/admin/users/route.ts

import { Request, Response, Router } from 'express';
import { createUser, getUsers } from '../../../services/userService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const result = await createUser(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

router.get('/', async (req: Request, res: Response) => {
  const result = await getUsers();
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;