"use strict";
// src/api/projects/[projectId]/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectService_1 = require("../../../services/projectService");
const router = express_1.default.Router();
router.patch('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, projectService_1.updateProject)(projectId, req.body);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
router.delete('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, projectService_1.deleteProject)(projectId);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
