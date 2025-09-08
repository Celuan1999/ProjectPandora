// src/api/org/teams/route.ts

import express from 'express';
import { createTeam } from '../../../services/teamService';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await createTeam(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;