"use strict";
// src/api/org/teams/[teamId]/members/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamService_1 = require("../../../services/teamService");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { teamId } = req.params;
    const data = { ...req.body, teamId }; // Include teamId from params
    const result = await (0, teamService_1.addTeamMember)(data);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
