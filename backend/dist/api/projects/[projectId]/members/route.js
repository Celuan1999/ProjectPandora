"use strict";
// src/api/projects/[projectId]/members/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectService_1 = require("../../../../services/projectService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, projectService_1.addProjectMember)({ ...req.body, projectId });
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
router.get('/', async (req, res) => {
    const { projectId } = req.params;
    const result = await (0, projectService_1.listProjectMembers)(projectId);
    if (result.error)
        return res.status(result.status).json(result.error);
    return res.status(result.status).json({ data: result.data });
});
exports.default = router;
