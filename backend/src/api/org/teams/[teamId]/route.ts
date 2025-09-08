// src/api/org/teams/[teamId]/route.ts

import express, { Request } from 'express';
import { updateTeam, deleteTeam } from '../../../../services/teamService';

// Define interface for route parameters
interface TeamParams extends Record<string, string> {
  teamId: string;
}

const router = express.Router();

router.patch('/', async (req: Request<TeamParams>, res) => {
  const { teamId } = req.params;
  const result = await updateTeam(teamId, req.body);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

router.delete('/', async (req: Request<TeamParams>, res) => {
  const { teamId } = req.params;
  const result = await deleteTeam(teamId);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  return res.status(result.status).json({ data: result.data });
});

export default router;