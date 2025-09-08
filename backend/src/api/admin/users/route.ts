// src/api/admin/users/route.ts

import express from 'express';
import { createUser } from '../../../services/userService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await createUser(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;