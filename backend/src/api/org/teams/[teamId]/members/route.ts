// src/api/org/teams/[teamId]/members/route.ts

import express, { Request } from 'express';
import { addTeamMember } from '../services/teamService'; // Corrected path

interface TeamParams extends Record<string, string> {
  teamId: string;
}

const router = express.Router();

router.post('/', async (req: Request<TeamParams>, res) => {
  const result = await addTeamMember(req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;