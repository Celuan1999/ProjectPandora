// src/api/admin/users/route.ts

import { Request, Response, Router } from 'express';
import { createUser, getUsers } from '../../../services/userService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const result = await createUser(req.body);
  if (result.error) return res.status(result.status).json(result.error);
  
  // Return response in the format expected by frontend
  const response = {
    userId: result.data?.userId,
    orgId: result.data?.company_id || null,
    role: result.data?.role,
    clearance: result.data?.clearance
  };
  
  return res.status(result.status).json(response);
});

router.get('/', async (req: Request, res: Response) => {
  const result = await getUsers();
  if (result.error) return res.status(result.status).json(result.error);
  return res.status(result.status).json({ data: result.data });
});

export default router;