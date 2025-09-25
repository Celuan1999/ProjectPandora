// src/api/admin/users/[userId]/route.ts

import { Request, Response, Router } from 'express';
import { getUserByUserId } from '../../../../services/userService';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      type: '/errors/invalid-input',
      title: 'Invalid Input',
      status: 400,
      detail: 'User ID is required'
    });
  }

  const result = await getUserByUserId(userId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  
  return res.status(result.status).json(result.data);
});

export default router;
