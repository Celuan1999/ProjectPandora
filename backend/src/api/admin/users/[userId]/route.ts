// src/api/admin/users/[userId]/route.ts

import express from 'express';
import { updateUser, deleteUser } from '../../../../services/userService';

const router = express.Router();

router.patch('/', async (req, res) => {
  const { userId } = req.params;
  const result = await updateUser(userId, req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req, res) => {
  const { userId } = req.params;
  const result = await deleteUser(userId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;