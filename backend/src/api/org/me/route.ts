// src/api/organizations/me/route.ts

import express from 'express';
import { getUserOrg } from '../../../services/orgService';

const router = express.Router();

router.get('/', async (req, res) => {
  // Assume userId comes from auth middleware (e.g., req.user.id)
  const userId = 'user-uuid'; // Replace with actual auth logic
  const result = await getUserOrg(userId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;